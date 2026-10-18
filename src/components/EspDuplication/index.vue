<template>
  <div class="dialog-form-wrap middle">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="dialogData.title"
      :close-on-click-modal="false"
      close-icon="CircleClose"
    >
      <div class="checked-at-date">
        {{ $t('cv.checkedAtDate') }} {{ dialogData.checkoutAtDate }}
      </div>
      <el-collapse v-model="activeName" accordion @change="handleCollapseChange">
        <el-collapse-item
          :title="`${$t('form.candidateName')} ${item.candidate_name}`"
          :name="index"
          :key="item.candidate_id"
          v-for="(item, index) in duplicationData"
        >
          <template #title="">
            <el-radio-group @click.stop v-model="radio" class="ml-4">
              <el-radio
                :label="item.candidate_id"
                :disabled="item.candidate_id === dialogData.candidateId"
                @click.prevent="candidateItemClick(item.candidate_id)"
                >{{ $t('form.candidateName') }} {{ item.candidate_name }} ({{
                  item.resumes.length
                }})</el-radio
              >
            </el-radio-group>
          </template>
          <el-checkbox-group v-model="checkedResumes" @change="handleCheckedResumesChange">
            <el-checkbox
              class="content-data"
              :key="resumesItem.resume_id"
              :label="resumesItem.resume_id"
              v-for="(resumesItem, resumesIndex) in item.resumes"
            >
              <template #default="">
                <div class="first first-select">
                  {{ resumesIndex + 1 }}
                </div>
                <div class="job-name">
                  <span @click.stop.prevent="showResumeDetail(resumesItem.resume_id)">
                    {{ resumesItem.job_position_name }}
                  </span>
                </div>
                <div class="date">{{ resumesItem.applied_at }}</div>
                <el-tooltip>
                  <template #content>
                    <div class="match-rate">
                      <div class="match-rate-title">
                        <div class="match-rate-first">{{ $t('form.duplicationCheckFirst') }}</div>
                        <div class="match-rate-second">{{ $t('form.duplicationCheckSecond') }}</div>
                      </div>
                      <div
                        class="remind-base"
                        :key="checkItem.title"
                        v-for="checkItem in resumesItem.checkData"
                      >
                        <div>{{ checkItem.title }}</div>
                        <div>{{ checkItem.matchRate }}</div>
                      </div>
                    </div>
                  </template>
                  <div class="duplication-data">{{ resumesItem.match_rate }}%</div>
                </el-tooltip>
                <div class="end">duplication</div>
                <div class="select"></div>
              </template>
            </el-checkbox>
          </el-checkbox-group>
        </el-collapse-item>
      </el-collapse>

      <slot></slot>
      <template #footer>
        <el-popconfirm
          hide-icon
          class="recognize-aame-person"
          :teleported="false"
          :cancel-button-text="$t('button.cancel')"
          :confirm-button-text="$t('button.confirm')"
          :title="$t('cv.recognizeSamePersonMessage', { name: candidateName })"
          @confirm="messageConfirm"
        >
          <template #reference>
            <ElButton
              class="btn-primary-gradient"
              @click="recognizeAsSamePerson"
              :disabled="isRecognizeAsSamePerson"
              >{{ $t('button.recognizeAsSamePerson') }}</ElButton
            >
          </template>
        </el-popconfirm>

        <el-popconfirm
          hide-icon
          class="recognize-aame-person"
          :teleported="false"
          :cancel-button-text="$t('button.cancel')"
          :confirm-button-text="$t('button.confirm')"
          :title="$t('cv.overwriteMessage')"
          @confirm="overwriteConfirm"
        >
          <template #reference>
            <ElButton class="btn-primary-gradient" @click="overwrite" :disabled="isOverwrite">
              {{ $t('button.overwrite') }}
            </ElButton>
          </template>
        </el-popconfirm>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="EspDuplication">
import { useLocale } from '@/hooks/useLocale'
import { ref } from 'vue'
import CV from '@/api/interface/cv'
import { coverDuplicateResumes } from '@/api/modules/cv'
import { ROUTER_CV_MANAGEMENT, ROUTER_CV_MANAGEMENT_DETAIL } from '@/router/routerName'

const { $t } = useLocale()
const router = useRouter()

interface DialogProps {
  title: string
  api?: (id: string | number) => Promise<any>
  data?: CV.DuplicationInfo[]
  srcResumeId: string | number
  candidateId: string | number
  checkoutAtDate: string
  refreshData?: () => void
}

const radio = ref()
const activeName = ref(0)
const checkedResumes = ref()
const duplicationData = ref()
const isRecognizeAsSamePerson = ref<boolean>(true)
const isOverwrite = ref<boolean>(true)
const candidateName = ref<string>('')
// dialog框状态
const dialogVisible = ref<boolean>(false)
const dialogData = ref<DialogProps>({
  title: $t('title.duplicationResumes'),
  data: [],
  srcResumeId: '',
  candidateId: '',
  checkoutAtDate: ''
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps) => {
  console.log('params', params)
  clearData()
  dialogData.value = { ...dialogData.value, ...params }
  dialogData.value.srcResumeId = params?.srcResumeId
  dialogData.value.candidateId = params?.candidateId
  dialogData.value.checkoutAtDate = params?.checkoutAtDate
  console.log('dialogData.value.candidateId: ', dialogData.value.candidateId)
  if (params.data) {
    initDuplicationData(params.data)
    return
  }
  duplicationResult()
}
const duplicationResult = () => {
  if (dialogData.value.api) {
    dialogData.value.api(dialogData.value.srcResumeId).then(res => {
      console.log('res: ', res)
      initDuplicationData((res.result ?? []) as CV.DuplicationInfo[])
    })
  }
}

const initDuplicationData = (list: CV.DuplicationInfo[]) => {
  list = list?.map(item => {
    const resumesArr = (item.resumes ?? []) as CV.ResumesInfo[]
    item.resumes = resumesArr.map(resumesItem => {
      let checkDataArr = [] as CV.checkDataInfo[]
      if (resumesItem.full_match) {
        if (resumesItem.phone_number_match_rate) {
          checkDataArr.push({
            title: $t('cv.phoneNumber'),
            matchRate: resumesItem.phone_number_match_rate + '%'
          })
        }
        if (resumesItem.email_match_rate) {
          checkDataArr.push({
            title: $t('cv.emailAddress'),
            matchRate: resumesItem.email_match_rate + '%'
          })
        }
        console.log('checkDataArr full_match', checkDataArr)
        resumesItem['checkData'] = checkDataArr
      } else {
        if (resumesItem.candidate_name_match_rate) {
          checkDataArr.push({
            title: $t('cv.fullName'),
            matchRate: resumesItem.candidate_name_match_rate + '%'
          })
        }
        if (resumesItem.university_name_match_rate) {
          checkDataArr.push({
            title: $t('cv.universityName'),
            matchRate: resumesItem.university_name_match_rate + '%'
          })
        }
        if (resumesItem.university_from_match_rate) {
          checkDataArr.push({
            title: $t('cv.universityStartYear'),
            matchRate: resumesItem.university_from_match_rate + '%'
          })
        }
        if (resumesItem.university_to_match_rate) {
          checkDataArr.push({
            title: $t('cv.universityEndYear'),
            matchRate: resumesItem.university_to_match_rate + '%'
          })
        }
        if (resumesItem.company_name_match_rate) {
          checkDataArr.push({
            title: $t('cv.companyName'),
            matchRate: resumesItem.company_name_match_rate + '%'
          })
        }
        if (resumesItem.company_from_match_rate) {
          checkDataArr.push({
            title: $t('cv.companyStartYearMonth'),
            matchRate: resumesItem.company_from_match_rate + '%'
          })
        }
        if (resumesItem.company_to_match_rate) {
          checkDataArr.push({
            title: $t('cv.companyEndYearMonth'),
            matchRate: resumesItem.company_to_match_rate + '%'
          })
        }
        console.log('checkDataArr full_match0', checkDataArr)
        resumesItem['checkData'] = checkDataArr
      }
      console.log('checkDataArr resumesItem', resumesItem)
      return resumesItem
    })
    return item
  })
  duplicationData.value = list
  if (list.length > 0) {
    dialogVisible.value = true
  } else {
    ElMessage.warning({
      message: $t('message.duplicateNotFound')
    })
  }
}
const handleCollapseChange = (val: string) => {
  console.log('val: ', val)
  checkedResumes.value = []
  isOverwrite.value = checkedResumes.value.length ? false : true
}
const handleCheckedResumesChange = (value: string[]) => {
  console.log('value: ', value)
  isOverwrite.value = value.length ? false : true
}

const candidateItemClick = (candidateId: number | string) => {
  if (candidateId === dialogData.value.candidateId) {
    return
  }
  candidateId === radio.value ? (radio.value = '') : (radio.value = candidateId)
  console.log('handleCheckedCandidateChange: ', radio.value)
  isRecognizeAsSamePerson.value = radio.value ? false : true
}

// 选择同一个人
const recognizeAsSamePerson = () => {
  duplicationData.value.map((item: any) => {
    if (item.candidate_id === radio.value) {
      candidateName.value = item.candidate_name
    }
  })
}

const messageConfirm = () => {
  const contentResumesData = {} as CV.coverDuplicateResumesInfo
  contentResumesData['src_resume_id'] = dialogData.value.srcResumeId
  contentResumesData['dst_candidate_id'] = radio.value
  coverDuplicateResumes(contentResumesData).then(res => {
    if (res?.success) {
      ElMessage.success($t('message.recognizeSuc'))
      dialogData.value.refreshData && dialogData.value.refreshData()
      closeDialog()
    }
  })
}
// 覆盖简历
const overwrite = () => {}

const overwriteConfirm = () => {
  const contentResumesData = {} as CV.coverDuplicateResumesInfo
  contentResumesData['src_resume_id'] = dialogData.value.srcResumeId
  contentResumesData['dst_resume_ids'] = checkedResumes.value
  coverDuplicateResumes(contentResumesData).then(res => {
    if (res?.success) {
      ElMessage.success($t('message.overwriteSuc'))
      router.replace({
        path: `/${ROUTER_CV_MANAGEMENT}`
      })
      closeDialog()
    }
  })
}

const closeDialog = () => {
  dialogVisible.value = false
  clearData()
}
const clearData = () => {
  checkedResumes.value = []
  isOverwrite.value = checkedResumes.value.length ? false : true
  radio.value = ''
  isRecognizeAsSamePerson.value = radio.value ? false : true
}
const showResumeDetail = (id: number) => {
  const { href } = router.resolve({
    path: `/${ROUTER_CV_MANAGEMENT_DETAIL}/${id}`
  })
  window.open(href, '_blank')
}
defineExpose({
  acceptParams,
  closeDialog
})
</script>

<style lang="less" scoped>
@import 'index';
</style>
