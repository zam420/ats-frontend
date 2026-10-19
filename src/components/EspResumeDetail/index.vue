<template>
  <div class="esp-resume-detail-wrap">
    <UserInfo
      :user-info="detailData?.userInfo"
      :duplications="duplications ?? []"
      :hide-duplication="forwardId || examForwardId ? true : false"
      :check-dup="duplicationClick"
    >
      <template #right>
        <template v-if="forwardId || examForwardId">
          <EspIcon
            v-if="activeTab === 'one'"
            :permission="UserPermissionEnum.CRFS"
            @click="showPdf"
            class="icon-previewPDF"
          />
        </template>
        <template v-else>
          <EspIcon
            v-if="
              CandidateStatusEnum.DRAFT === detailData.cvInfo?.status && detailData.isShowDelete
            "
            :permission="UserPermissionEnum.CRD"
            @click="showDelete"
            class="icon-delete"
          />
          <EspIcon
            v-if="activeTab === 'one'"
            :permission="UserPermissionEnum.CRM"
            @click="showPdf"
            class="icon-previewPDF"
          />
          <EspIcon
            v-if="detailData?.isShowEdit && !isView && activeTab === 'one'"
            :permission="UserPermissionEnum.CRE"
            @click="showEdit"
            class="icon-edit"
          />
        </template>
        <!-- <i @click="duplicationClick" class="iconfont icon-edit text-primary-gradient"></i> -->
      </template>
    </UserInfo>
    <el-tabs v-model="activeTab" @tab-change="handleChange">
      <el-tab-pane :label="$t('button.resumeAttachment')" name="seven" v-if="file && fileType !== 'doc'">
        <ResumeAttachment :file="file" />
      </el-tab-pane>
      <el-tab-pane :label="$t('tabs.applicationDetail')" name="one">
        <ApplicationDetail
          v-if="detailData.applicationDetailList?.length"
          :data="detailData.applicationDetailList"
          :file="file"
          :file-type="fileType"
        />
        <div class="notes-panel">
          <el-divider class="note-border" />
          <div class="title">
            {{ $t('cv.notes') }}
            <span class="num">{{ notes.length }}</span>
          </div>
          <div class="content" v-for="(item, index) in notes" :key="index">
            <div class="header">
              <div class="info">
                <div class="round-user">{{ item.initial }}</div>
                <div class="name">{{ item.commentator_name }}</div>
                <div class="time">{{ item.comment_at }}</div>
              </div>
              <div class="info-opt">
                <el-tooltip :disabled="!item.isShowTooltip" placement="top">
                  <template #content>
                    <div class="tooltip-content">
                      <div class="title">{{ $t('cv.notifiedUsers') }}</div>
                      <div v-for="user in item.share_to" :key="user.id" class="info">
                        <div class="round">{{ getFirstLetterUpperCase(user.name) }}</div>
                        <div>{{ user.name }}</div>
                      </div>
                    </div>
                  </template>
                  <div class="notice">
                    <i class="iconfont icon-notification"></i>
                    <span>{{ item.notiText }}</span>
                  </div>
                </el-tooltip>
                <i class="iconfont icon-simple-delete pdf-not-show" v-if="item.canOpt && !props.hideAddNotes" @click="deleteNotes(item, index)"></i>
              </div>
            </div>
            <div class="detail">
              <template v-if="item.comment?.startsWith(LIEPIN_URL) || item.comment?.startsWith(LIEPIN_LPT_URL)">
                <template :key="link" v-for="link of getLinks(item.comment)">
                  <p>
                    <el-link :href="link" type="primary" target="_blank">{{ $t('button.checkContactInfoInLiePin') }}</el-link>
                  </p>
                </template>
              </template>
              <span v-else>{{ item.comment }}</span>
            </div>
          </div>
          <div class="opt-panel" v-if="!props.hideAddNotes && isHasPermission(UserPermissionEnum.CRE)">
            <el-link class="pdf-not-show" :underline="false" type="primary" @click="addNotes" v-if="!isShowNoteEditor">
              <i class="iconfont icon-comment text-primary-gradient"></i>
              {{ $t('cv.addNotes') }}
            </el-link>
            <NotesEditor v-else :resumeId="detailData.id" @cancel="isShowNoteEditor = false" @confirm="refreshNotes" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('tabs.allApplications')" name="two">
        <AllApplicationTimeline ref="allApplicationTimelineRef" />
      </el-tab-pane>
      <el-tab-pane :label="$t('tabs.writtenTestScore')" name="six">
        <WrittenTestScore ref="writtenTestScoreRef" />
      </el-tab-pane>
      <el-tab-pane :label="$t('tabs.feedbacks')" name="three" v-if="detailData?.cvInfo?.has_access_to_itv_feedback || detailData?.cvInfo?.has_access_to_test_feedback || detailData?.cvInfo?.has_access_to_screening_feedback">
        <InterviewFeedback ref="interviewFeedbackRef" />
      </el-tab-pane>
      <el-tab-pane :label="$t('tabs.historicalOperations')" name="four" v-if="detailData?.cvInfo?.has_access_to">
        <HistoricalOperations ref="historicalOperationsRef" />
      </el-tab-pane>
      <el-tab-pane :label="$t('tabs.emailRecords')" name="five" v-if="detailData?.cvInfo?.has_access_to">
        <EmailRecords ref="emailRecordsRef" />
      </el-tab-pane>
    </el-tabs>
    <EspDuplication ref="espDuplicationRef" />
    <EspDialogForm ref="espDialogFormRef" />
  </div>
</template>
<script setup lang="ts" name="EspResumeDetail">
import { DetailUserInfo, ResultData, ResultUploadInfo } from '@/api/interface'
import UserInfo from './components/UserInfo.vue'
import CV from '@/api/interface/cv'
import { LIEPIN_URL, LIEPIN_LPT_URL, OPEN_BLOB_PREVIEW, OPEN_DIALOG } from '@/config'
import { CandidateStatusEnum } from '@/enums/candidateStatusEnum'
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/config/serviceLoading'
import mittBus from '@/utils/mittBus'
import { usePDF } from '@/hooks/usePDF'
import { useLocale } from '@/hooks/useLocale'
import ApplicationDetail from './components/ApplicationDetail.vue'
import InterviewFeedback from './components/InterviewFeedback.vue'
import HistoricalOperations from './components/HistoricalOperations.vue'
import ResumeAttachment from './components/ResumeAttachment.vue'
import EmailRecords from './components/EmailRecords.vue'
import WrittenTestScore from './components/WrittenTestScore.vue'
import NotesEditor from './components/NotesEditor.vue'
import { ApplicationInfo } from './interface'
import { UserPermissionEnum } from '@/enums/userPermission'
import { InterviewerStatusEnum } from '@/enums/interviewerEnum'
import { FEEDBACK_FORM } from '@/views/interviewer/resumeReview/data'
import { cloneDeep } from 'lodash-es'
import { ROUTER_INTERVIEWER, ROUTER_INTERVIEWER_TEST_REVIEW } from '@/router/routerName'
import { postInterviewerFeedbackForward, submitTestFeedback } from '@/api/modules/interviewer'
import { getFirstLetterUpperCase, isHasPermission, getLinks } from '@/utils'
import { useGlobalStore } from '@/store/modules/global'
import { deleteComment } from '@/api/modules/cv'
import { UserRoleEnum } from '@/enums/userRoleEnum'
import { TEST_FEEDBACK_FORM } from '@/views/interviewer/testReview/data'
import { TestInterviewStatusEnum } from '@/enums/testInterviewStatusEnum'
const globalStore = useGlobalStore()
interface DetailProps {
  id?: number
  cvInfo?: CV.CVDetail
  userInfo?: DetailUserInfo
  applicationDetailList: ApplicationInfo[]
  url?: string
  detailUrl?: string
  isShowEdit?: boolean
  isShowDelete?: boolean
  editDetail?: () => void
  deleteDetail?: (id: number) => Promise<ResultData<any>>
  initData?: () => void
}
interface ParamProps {
  hideAddNotes?: boolean
}
const { htmlToPDF } = usePDF()
const { $t } = useLocale()
const router = useRouter()
const route = useRoute()
const activeTab = ref('one')

const espDuplicationRef = ref()
const allApplicationTimelineRef = ref()
const interviewFeedbackRef = ref()
const historicalOperationsRef = ref()
const emailRecordsRef = ref()
const writtenTestScoreRef = ref()
const file = ref<ResultUploadInfo>()

const duplications = ref<CV.DuplicationInfo[]>([])
const props = withDefaults(defineProps<ParamProps>(), {
  hideAddNotes: false
})
const defaultValue: DetailProps = {
  isShowEdit: false,
  isShowDelete: false,
  applicationDetailList: []
}
// feedback相关
const forwardId = route?.query?.forward_id ?? ''
const examForwardId = route?.query?.exam_forward_id ?? ''
const isView = route?.query?.isView === 'true' ? true : false
const espDialogFormRef = ref()
const isShowNoteEditor = ref<boolean>(false)
const detailData = ref<DetailProps>({
  ...defaultValue
})
const notes = ref<CV.Notes[]>([])
const fileType = ref<string>('')
const getResumeFile = () => {
  const originalResume = (detailData.value.cvInfo?.original_resume ?? []) as ResultUploadInfo[]
  originalResume.sort((a, b) => (a.uid > b.uid ? -1 : 1))
  file.value = originalResume?.[0]
  const fileName = originalResume?.[0]?.file_name ?? ''
  const lastIndex = fileName?.lastIndexOf('.') ?? 0
  fileType.value = fileName?.substring(lastIndex + 1)?.toLowerCase()
  activeTab.value = file.value && fileType.value !== 'doc' ? 'seven' : 'one'
}

// 接收父组件传过来的参数
const acceptParams = (params: DetailProps) => {
  detailData.value = { ...defaultValue, ...params }
  detailData.value.id = detailData.value.cvInfo!.id
  const duplicationList = params?.cvInfo?.duplications ?? []
  duplications.value = duplicationList.filter(item => item.deleted !== true)
  notes.value = detailData?.value?.cvInfo?.notes?.reverse() ?? []
  notes.value?.forEach((data: CV.Notes) => {
    supplyNotes(data)
  })
  getResumeFile()
}

const showDelete = () => {
  mittBus.emit(OPEN_DIALOG, {
    title: $t('message.tips'),
    content: $t('message.deleteQues'),
    center: 'center',
    confirm: deleteInfo
  })
}
const deleteInfo = () => {
  detailData.value.deleteDetail &&
    detailData.value.deleteDetail(detailData.value.id as number).then(res => {
      if (res?.success) {
        ElMessage.success({ message: $t('message.deleteSuc') })
        router.replace({
          path: `/${detailData.value?.url}`
        })
        return
      }
      ElMessage.error({ message: res?.message })
    })
}

const duplicationClick = () => {
  espDuplicationRef.value &&
    espDuplicationRef.value.acceptParams({
      data: duplications.value,
      srcResumeId: detailData.value?.id,
      candidateId: detailData.value?.cvInfo?.candidate_id,
      checkoutAtDate: detailData.value?.cvInfo?.duplication_checked_at,
      refreshData: detailData.value?.initData
    })
}

const showPdf = async () => {
  showFullScreenLoading()
  const blob = await htmlToPDF(document.querySelector('.cv-detail-wrap') as HTMLElement)
  let educationHistories: CV.EducationHistories[] =
    detailData.value.cvInfo?.education_histories ?? []
  let university = educationHistories.find(item => item?.up_to_now)?.university ?? ''
  if (!university && educationHistories?.length) {
    educationHistories = educationHistories.sort((a, b) => (a.date_to > b.date_to ? -1 : 1))
    university = educationHistories[0]?.university ?? ''
  }
  mittBus.emit(OPEN_BLOB_PREVIEW, {
    blob,
    file_name: `${detailData.value.cvInfo?.name}_${detailData.value.cvInfo?.applying_position_title}_${university}.pdf`
  })
  tryHideFullScreenLoading()
}

const showEdit = () => {
  detailData.value.editDetail && detailData.value.editDetail()
}

const handleChange = () => {
  switch(activeTab.value) {
    case 'two':
      allApplicationTimelineRef.value &&
        allApplicationTimelineRef.value.acceptParams(
          detailData.value.cvInfo!.candidate_id,
          detailData.value.cvInfo!.id,
          detailData.value?.detailUrl
        )
      break
    case 'three':
      interviewFeedbackRef.value &&
        interviewFeedbackRef.value.acceptParams(
          detailData.value.cvInfo!.id,
          detailData.value.cvInfo?.applying_position,
          detailData.value.cvInfo?.applying_position_title,
          detailData.value.cvInfo?.name,
          detailData.value.cvInfo?.status,
          detailData.value.cvInfo?.has_access_to_itv_feedback,
          detailData.value.cvInfo?.has_access_to_test_feedback,
          detailData.value.cvInfo?.has_access_to_screening_feedback,
        )
      break
    case 'four':
      historicalOperationsRef.value &&
        historicalOperationsRef.value.acceptParams(
          detailData.value.cvInfo!.id
        )
      break
    case 'five':
      emailRecordsRef.value &&
        emailRecordsRef.value.acceptParams(
          detailData.value.cvInfo!.id
        )
      break
    case 'six':
      writtenTestScoreRef.value &&
        writtenTestScoreRef.value.acceptParams(
          detailData.value.cvInfo!.id,
          detailData.value.cvInfo?.applying_position_title,
          detailData.value.cvInfo?.has_access_to
        )
      break
    default:
      break
  }
}

// 反馈结果
const feedBack = (result: number) => {
  const feedbackData = cloneDeep(FEEDBACK_FORM).map(item => {
    if (item.prop === 'resume_forward_ids') {
      item.value = [forwardId]
    } else if (item.prop === 'feedback') {
      item.value = result
    }
    return item
  })
  let title = $t('interviewer.resumeFeedback')
  if (result === InterviewerStatusEnum.HOLD) {
    title = $t('interviewer.resumeFeedbackHold')
  }
  if (result === InterviewerStatusEnum.UNSUITABLE) {
    title = $t('interviewer.resumeFeedbackUn')
  }
  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: title,
      isView: false,
      apiUrl: postInterviewerFeedbackForward,
      formData: feedbackData,
      size: 'middle',
      getTableList: () => {
        router.replace({
          path: `/${ROUTER_INTERVIEWER}`
        })
      }
    })
}


// 笔试反馈结果
const testFeedBack = (result: number) => {
  const feedbackData = cloneDeep(TEST_FEEDBACK_FORM).map(item => {
    if (item.prop === 'forward_ids') {
      item.value = [Number(examForwardId)]
    } else if (item.prop === 'status') {
      item.value = result
    }
    return item
  })
  let title = result === TestInterviewStatusEnum.UNSUITABLE ? $t('interviewer.testFeedbackUn') : $t('interviewer.testFeedback')
  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: title,
      isView: false,
      apiUrl: submitTestFeedback,
      formData: feedbackData,
      size: 'middle',
      message: $t('message.feedbackSuc'),
      getTableList: () => {
        router.replace({
          path: `/${ROUTER_INTERVIEWER_TEST_REVIEW}`
        })
      }
    })
}

const addNotes = () => {
  isShowNoteEditor.value = true
}

const deleteNotes = (data: CV.Notes, index: number) => {
  mittBus.emit(OPEN_DIALOG, {
    title: $t('message.tips'),
    content: $t('message.deleteQues'),
    center: 'center',
    size: 'small',
    confirm: () => {
      const id = data.comment_id ? data.comment_id : detailData.value.cvInfo!.id
      const id_type = data.comment_id ? 0 : 1
      deleteComment({ id, id_type }).then(res => {
        if (res?.success) {
          ElMessage.success({ message: $t('message.deleteSuc') })
          notes.value.splice(index, 1)
          return
        }
        ElMessage.error({ message: res?.message })
      })
    }
  })
}

// 补充notes内容
const supplyNotes = (data: CV.Notes) => {
  data.commentator_name = data?.commentator_id ? data.commentator_name : $t('cv.system')
  data.notiText = data?.share_to?.length === 0 ? $t('cv.private') : data?.share_to?.length?.toString()
  data.canOpt = data?.commentator_id === globalStore?.userInfo?.id || globalStore?.roles?.includes(UserRoleEnum.SA) || globalStore?.roles?.includes(UserRoleEnum.HRA)
  data.initial = getFirstLetterUpperCase(data.commentator_name)
  if (data?.share_to?.length === 1 && data?.share_to?.[0]?.id === -1) {
    data.notiText = $t('cv.public')
  }
  data.isShowTooltip = data.notiText !== $t('cv.public') && data.notiText !== $t('cv.private')
}

const refreshNotes = (data: CV.Notes) => {
  isShowNoteEditor.value = false
  supplyNotes(data)
  notes.value.unshift(data)
}
defineExpose({
  acceptParams,
  feedBack,
  testFeedBack
})
</script>
<style scoped lang="less">
@import 'index.less';
</style>