<template>
  <div class="interview-content">
    <template  v-if="props.detailData?.status !== ScheduleViewStatusEnum.DRAFT && Object.keys(props.detailData)?.length !== 0 && !state.hasNoRoundData">
      <EspDetail :gutter="32" :data="state.baseForm" label-position="top">
        <template #candidates="row">
          <label class="fontBold">
            {{ row.item.label }}:
          </label>
          <el-tag
            v-for="data in row.item.value"
            :key="data.candidate_resume_id"
            class="no-radius"
            :closable="row.item.value?.length > 1 && (props.detailData?.status === ScheduleViewStatusEnum.SCHEDULED || props.detailData?.status === ScheduleViewStatusEnum.IN_PROGRESS)"
            @close="cancelInterview(data)"
          >
            {{ data.candidate_name }}
          </el-tag>
        </template>
        <template #interviewers="row">
          <label class="fontBold" v-if="row.item.value?.length > 0">
            {{ row.item.label }}:
          </label>
          <div
            v-for="tag in row.item.value"
            :key="tag.id"
            class="email-block"
          >
            <div>
              <div class="userName">{{ tag.name }}</div>
              <div class="email">{{ tag.email }}</div>
            </div>
          </div>
        </template>
      </EspDetail>
      <template v-if="state.showEmailTemplate">
        <el-divider border-style="dashed" />
        <EspDetail :gutter="32" :data="state.templateForm" label-position="top" >
        </EspDetail>
        <el-row :gutter="32" class="email-panel">
          <el-col :span="24" class="el-form-item">
            <label class="el-form-item__label">{{ $t('emailTemplate.emailContent') }}:</label>
            <div class="tab-panel">
              <template v-if="state.candidates.length > 1">
                <div
                  class="tab"
                  v-for="item in state.candidates"
                  :key="item.candidate_resume_id"
                  @click="changeTab(item.candidate_resume_id as number)"
                  :class="{ active: item.candidate_resume_id === state.selectUserResumeId }"
                >
                  {{ item.candidate_name }}
                </div>
              </template>
            </div>
            <template v-for="item in state.candidates" :key="item.candidate_resume_id">
              <div
                v-if="item.candidate_resume_id === state.selectUserResumeId"
                class="email-content"
                :class="{ high: state.candidates.length <= 1 }"
              >
                <EspQuillEditor v-model:content="item.content" :select-options="[]" :readOnly="true" />
              </div>
            </template>
          </el-col>
        </el-row>
      </template>
    </template>
    <div class="noDataPanel" v-else>
      <div class="noData"></div>
    </div>
  </div>
</template>
<script setup lang="ts" name="RoundDetail">
import { cloneDeep } from 'lodash-es'
import { INTERVIEW_EMAIL_TEMPLATE_DETAIL_FORM, INTERVIEW_INFORMATION_DETAIL_FORM } from '../data'
import ScheduleInterview from '@/api/interface/scheduleInterview'
import { ScheduleViewStatusEnum } from '@/enums/scheduleViewEnum'
interface ReactiveParams {
  baseForm: Form.FormItem[]
  templateForm: Form.FormItem[]
  showEmailTemplate: boolean
  selectUserResumeId: number
  emailContent: string
  candidates: ScheduleInterview.Candidate[]
  hasNoRoundData: boolean
}

interface DialogProps {
  detailData: any
}

const props = withDefaults(defineProps<DialogProps>(), {
  detailData: {}
})
const route = useRoute()
// 如果有约过面试则获取面试详情
const detailId = route?.query?.id ?? ''
const emit = defineEmits(['cancel'])
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(INTERVIEW_INFORMATION_DETAIL_FORM),
  templateForm: cloneDeep(INTERVIEW_EMAIL_TEMPLATE_DETAIL_FORM),
  // 是否通知candidate显示email template模块
  showEmailTemplate: true,
  // 当前选择的员工对应的简历id
  selectUserResumeId: 0,
  // 邮件内容
  emailContent: '',
  // 面试的员工
  candidates: [],
  // 详情里没有round数据
  hasNoRoundData: false
})

const changeTab = (value: number) => {
  state.selectUserResumeId = value
}

watch(
  () => props.detailData,
  (data, oldData) => {
    state.hasNoRoundData = Object.keys(data)?.length === 0 && !oldData && detailId ? true : false
    const detailFormData = data ?? {}
    state.candidates = detailFormData?.candidates ?? []
    const userEmailList = detailFormData?.userEmailList ?? []
    const userMap: any = {}
    // 由于后续form修改的时候只缓存了userEmailList的值这里取里面的内容为邮件的最新内容
    userEmailList.forEach((user: any) => {
      userMap[user.id] = user
    })
    state.baseForm.forEach((d: Form.FormItem) => {
      if (d.prop === 'candidates') {
        d.value = detailFormData.candidates && detailFormData.candidates.length > 0 ? detailFormData.candidates : ''
      } else if (d.prop === 'interviewTime') {
        const startDate = detailFormData?.interviewTime?.[0]?.substr(0, detailFormData?.interviewTime?.[0]?.length - 3)
        const endDate = detailFormData?.interviewTime?.[1]?.substr(11, 5)
        d.value = detailFormData?.interviewTime?.[0] ? `${startDate} - ${endDate}` : ''
      } else if (d.prop === 'interviewers') {
        d.value = detailFormData?.interviewerList && detailFormData.interviewerList.length > 0 ? detailFormData.interviewerList : ''
      } else if (d.prop === 'info_candidate') {
        d.value = detailFormData?.[d.prop as keyof ScheduleInterview.InterviewInfo] ?? false
      } else if (d.prop === 'email_bcc') {
        d.value = detailFormData?.email_bcc?.length > 0 ? detailFormData?.email_bcc : ''
      } else {
        d.value = detailFormData?.[d.prop as keyof ScheduleInterview.InterviewInfo] ?? ''
        if (d.prop === 'interview_location') {
          d.switchValue = detailFormData?.['is_online'] ?? false
        }
      }
      if (d.prop === 'info_candidate') {
        state.showEmailTemplate = d.value
      }
      // 草稿状态不显示内容
      if (detailFormData.status === ScheduleViewStatusEnum.DRAFT) {
        d.value = ''
        state.showEmailTemplate = false
      }
    })
    state.selectUserResumeId = state.candidates?.[0]?.candidate_resume_id as number
    state.templateForm.forEach((d: Form.FormItem) => {
      if (d.prop === 'email_template') {
        d.value = detailFormData?.emailTemplate ?? ''
      }
      // 草稿状态不显示内容
      if (detailFormData.status === ScheduleViewStatusEnum.DRAFT) {
        d.value = ''
      }
    })
    state.candidates.forEach(data => {
      const email = userMap?.[data.candidate_resume_id as number]
      data.content = `<h2>${email?.subject}</h2><br>${email?.parseContent}`
    })
  },
  { immediate: true, deep: true }
)

// 取消面试
const cancelInterview = (data: ScheduleInterview.Candidate) => {
  emit('cancel', data)
}

</script>
<style lang="less" scoped>
@import '../index.less';
</style>
