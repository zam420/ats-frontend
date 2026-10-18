<template>
  <div class="collapse-panel feedback-panel">
    <el-collapse v-model="activeJobs" class="esp-collapse padding long job-collapse" v-if="state.applyJobList.length > 0">
      <el-collapse-item :name="jobItem.value" v-for="(jobItem, jobIndex) in state.applyJobList" :key="jobItem.value" class="job-item">
        <template #title>
          <div class="pdf-title">
            <el-icon class="pdf-not-show"><CaretRight /></el-icon>
            <span>{{ `${$t('cv.appliedPosition')} ${jobItem.label}` }}</span>
          </div>
        </template>
        <div class="feedback-content-panel" v-if="state.canShowScheduleInterview">
          <div class="job-title-panel pdf-not-show">
            <div class="title">{{ $t('interviewer.interviewFeedback') }}</div>
            <div v-if="(state.interviewMap?.[jobItem.value] ?? []).length > 0" class="pdf-not-show">
              <i class="iconfont text-primary-gradient icon-download-2" @click="download(false, jobItem.value, jobIndex)"></i>
              <i class="iconfont text-primary-gradient icon-print" @click="download(true, jobItem.value, jobIndex)"></i>
            </div>
          </div>
          <el-collapse v-model="activeNames" class="esp-collapse padding long interview-collapse" v-if="(state.interviewMap?.[jobItem.value] ?? []).length > 0">
            <el-collapse-item :name="item.feedBackId" v-for="(item, index) in (state.interviewMap?.[jobItem.value] ?? [])" :key="item.interviewId" class="feedback-item">
              <template #title>
                <div class="opt-panel">
                  <el-icon><CaretRight /></el-icon>
                  <div class="roundName">{{ `${getSuffix(index + 1)} ${$t('cv.roundInterview')}` }}</div>
                  <div class="type">{{ InterviewSession?.[item.interviewType as number]?.name }}</div>
                  <div class="status" :class="FeedbackResult?.[item.result as number]?.status"></div>
                </div>
                <div class="detail">
                  <div>{{ item?.isOnline ? $t('interviewer.online') : $t('interviewer.faceToFace') }}</div>
                  <div>|</div>
                  <div>{{ `${$t('emailTemplate.interviewTime')}: ${item?.interviewTime ?? ''}` }}</div>
                  <div>|</div>
                  <div>{{ `${$t('cv.operator')}: ${item?.operator ?? ''}` }}</div>
                  <template v-if="activeNames?.includes(item.feedBackId as number) && state.canFeedBack">
                    <span class="operation-icon pdf-not-show" v-if="!item?.isEdit" @click.stop="changeToEditMode(item, true, jobItem.value)">
                      <i class="iconfont icon-edit text-primary-gradient"></i>
                    </span>
                    <div class="btn-panel pdf-not-show" v-else>
                      <ElButton @click.stop="changeToEditMode(item, false, jobItem.value)">{{ $t('button.cancel') }}</ElButton>
                      <ElButton class="btn-primary-gradient" @click.stop="save(index, item)">{{ $t('button.save') }}</ElButton>
                    </div>
                  </template>
                </div>
              </template>
              <EspEditTable :columns="item.columns" :ref="(el: HTMLElement) => { setItemRef(el, index) }" />
            </el-collapse-item>
          </el-collapse>
          <template v-else>
            <EspNoData :title="$t('table.noData')" />
          </template>
        </div>
        <el-divider class="feedback-border pdf-not-show" />
        <div class="feedback-content-panel pdf-not-show" v-if="state.canShowTestFeedback">
          <div class="job-title-panel pdf-not-show">
            <div class="title">{{ $t('cv.testFeedback') }}</div>
          </div>
          <div class="content" v-if="(state.testFeedback?.[jobItem.value] ?? []).length > 0">
            <div class="block" v-for="item in (state.testFeedback?.[jobItem.value] ?? [])" :key="item.feedback_user_id">
              <div :class="`round-user status${item.feedback_status}`">{{ getFirstLetterUpperCase(item.feedback_user_name) }}</div>
              <div class="panel">
                <div :class="`status${item.feedback_status}`">{{ TestInterviewStatus?.[item.feedback_status]?.name ?? '' }}</div>
                <el-row :gutter="40">
                  <el-col :span="8">
                    <span>{{ $t('emailTemplate.interviewer') }}: </span>
                    <span>{{ item.feedback_user_name }}</span>
                  </el-col>
                  <el-col :span="8">
                    <span>{{ $t('interviewer.evaluationTime') }}: </span>
                    <span>{{ item.feedback_time }}</span>
                  </el-col>
                </el-row>
                <el-row :gutter="40">
                  <el-col :span="24">{{ item.feedback_notes }}</el-col>
                </el-row>
              </div>
            </div>
          </div>
          <template v-else>
            <EspNoData :title="$t('table.noData')" />
          </template>
        </div>
        <el-divider class="feedback-border pdf-not-show" />
        <div class="feedback-content-panel pdf-not-show screen-feedback" v-if="state.canShowScreenFeedback">
          <div class="job-title-panel">
            <div class="title">{{ $t('cv.screeningFeedback') }}</div>
          </div>
          <div class="content" v-if="(state.screenFeedback?.[jobItem.value] ?? []).length > 0">
            <div class="block" v-for="item in (state.screenFeedback?.[jobItem.value] ?? [])" :key="item.feedback_user_id">
              <div :class="`round-user status${item.status}`">{{ getFirstLetterUpperCase(item.feedback_user_name) }}</div>
              <div class="panel">
                <div :class="`status${item.status}`">{{ InterviewerStatus?.[item.status]?.name ?? '' }}</div>
                <el-row :gutter="40">
                  <el-col :span="8">
                    <span>{{ $t('emailTemplate.interviewer') }}: </span>
                    <span>{{ item.feedback_user_name }}</span>
                  </el-col>
                  <el-col :span="8">
                    <span>{{ $t('interviewer.evaluationTime') }}: </span>
                    <span>{{ item.feedback_at }}</span>
                  </el-col>
                </el-row>
                <el-row :gutter="40">
                  <el-col :span="24">{{ item.notes }}</el-col>
                </el-row>
              </div>
            </div>
          </div>
          <template v-else>
            <EspNoData :title="$t('table.noData')" />
          </template>
        </div>
      </el-collapse-item>
    </el-collapse>
    <!--这里加一个v-if是因为url为空时iframe默认获取了系统页面之前的内容会导致其他页面的接口调用多次，这里限制只有打印之后才有这个iframe-->
    <iframe
      v-if="url"
      ref="previewRef"
      class="esp-file-preview-iframe"
      style="width: 100%; height: 100vh; display: none;"
      :src="`${url}#toolbar=0`"
    ></iframe>
  </div>
</template>
<script setup lang="ts" name="InterviewFeedback">
import MyInterview from '@/api/interface/myInterview'
import { getInterviewFeedbacks, getScreenFeedbacks, getTestFeedbacks } from '@/api/modules/cv'
import { submitInterviewFeedback } from '@/api/modules/myInterview'
import { FILE_BLOB_DOWNLOAD } from '@/config'
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/config/serviceLoading'
import { AbilityEvaluation } from '@/enums/abilityEvaluationEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { InterviewSessionEnum, InterviewSession } from '@/enums/interviewSessionEnum'
import { InterviewMode, FeedbackResult } from '@/enums/myInterviewStatusEnum'
import { useLocale } from '@/hooks/useLocale'
import { usePDF } from '@/hooks/usePDF'
import { getObjectURL, isEmpty, getSuffix, getFirstLetterUpperCase } from '@/utils'
import mittBus from '@/utils/mittBus'
import { HR_INTERVIEW_FEEDBACK_TABLE, INDIA_INTERVIEW_FEEDBACK_TABLE, PROFESSIONAL_CEO_INTERVIEW_FEEDBACK_TABLE } from '@/views/interviewer/myInterview/data'
import { cloneDeep } from 'lodash'
import { CandidateStatusEnum } from '@/enums/candidateStatusEnum'
import { FeedBackTypeEnum } from '@/enums/feedBackTypeEnum'
import { OverallTechRating } from '@/enums/overallTechRatingEnum'
import { TestInterviewStatus } from '@/enums/testInterviewStatusEnum'
import { InterviewerStatus } from '@/enums/interviewerEnum'
import { isString } from '@/utils/is'
import CV from '@/api/interface/cv'
const { $t } = useLocale()
interface Interview {
  isOnline?: boolean
  interviewTime?: string
  interviewType?: number
  interviewId?: number
  result?: number
  feedBackId?: number
  isEdit: boolean
  columns: EditTable.TableColumns[]
  operator?: string
}

interface StateProps {
  candidateName: string
  applyJob: string
  applyJobId: number
  canFeedBack: boolean
  canShowScheduleInterview: boolean
  canShowTestFeedback: boolean
  canShowScreenFeedback: boolean
  interviewMap?: Record<number, Interview[]>
  testFeedback?: Record<number, CV.TestFeedback[]>
  screenFeedback?: Record<number, CV.ScreenFeedback[]>
  candidateResumeId: number
  applyJobList: Form.FormSelect[]
}
const url = ref<string>('')
const previewRef = ref<HTMLIFrameElement>()
const activeNames = ref<number[]>([])
const activeJobs = ref<number[]>([])
const state = reactive<StateProps>({
  candidateName: '',
  applyJob: '',
  applyJobId: 0,
  canFeedBack: true,
  canShowScheduleInterview: true,
  canShowTestFeedback: true,
  canShowScreenFeedback: true,
  interviewMap: {},
  testFeedback: {},
  screenFeedback: {},
  candidateResumeId: 0,
  applyJobList: []
})
const tableRefs = ref<any>([])
const { htmlToPDF } = usePDF()
const setItemRef = (el: HTMLElement, index: number) => {
  if (el) {
    tableRefs.value[index] = el
  }
}
// 接收父组件传过来的参数
const acceptParams = async (resumeId: number, applyJobId: number, applyJob: string, candidateName: string, status: number, canShowScheduleInterview: boolean, canShowTestFeedback: boolean, canShowScreenFeedback: boolean) => {
  state.canFeedBack = status !== CandidateStatusEnum.OFFER_MANAGEMENT && status !== CandidateStatusEnum.ONBOARD && canShowScheduleInterview
  state.canShowScheduleInterview = canShowScheduleInterview
  state.canShowTestFeedback = canShowTestFeedback
  state.canShowScreenFeedback = canShowScreenFeedback
  state.applyJob = applyJob
  state.applyJobId = applyJobId
  state.candidateName = candidateName
  state.candidateResumeId = resumeId
  const interviewFeedbacks = canShowScheduleInterview ? await getInterviewFeedbacks(resumeId) : { result: [] }
  // 获取test feedback的数据
  const testFeedbacks = canShowTestFeedback ? await getTestFeedbacks(resumeId) : { result: [] }
  // 获取Screen feedback的数据
  const screenFeedbacks = canShowScreenFeedback ? await getScreenFeedbacks(resumeId) : { result: [] }
  // 处理feedback数据
  dealFeedbackDatas(interviewFeedbacks?.result ?? [], testFeedbacks?.result ?? [], screenFeedbacks?.result ?? [])
}

const dealFeedbackDatas = (interviewFeedbackList: MyInterview.DetailInfo[], testFeedbackList: CV.TestFeedback[], screenFeedbackList: CV.ScreenFeedback[]) => {
  const interviewMap: Record<number, Interview[]> = {}
  const applyJobList: Form.FormSelect[] = []
  const applyJobIdList: number[] = []
  // 处理interviewFeedback数据
  interviewFeedbackList.forEach((detail, index) => {
    const roundData: Interview = {
      isOnline: detail?.is_online === InterviewMode.ONLINE,
      interviewTime: `${detail.interview_time_from?.substring(0, 16)} - ${detail.interview_time_to?.substring(11, 16)}`,
      interviewType: detail?.round_type,
      interviewId: detail?.interview_round_id,
      result: detail?.interview_result,
      feedBackId: detail?.feedback_id,
      operator: detail?.operator_name ?? '',
      isEdit: false,
      columns: detail.round_type === InterviewSessionEnum.HR ? cloneDeep(HR_INTERVIEW_FEEDBACK_TABLE) : cloneDeep(PROFESSIONAL_CEO_INTERVIEW_FEEDBACK_TABLE)
    }
    if (index === 0) {
      activeNames.value.push(detail?.feedback_id as number)
    }
    if (!interviewMap?.[detail?.job_id as number]) {
      interviewMap[detail?.job_id as number] = []
    }
    if (!applyJobIdList.includes(detail.job_id as number)) {
      applyJobIdList.push(detail.job_id as number)
      applyJobList.push({
        value: detail?.job_id,
        label: detail?.job_title ?? ''
      })
    }
    if (detail.feedback_type === FeedBackTypeEnum.INDIAN) {
      roundData.columns = cloneDeep(INDIA_INTERVIEW_FEEDBACK_TABLE)
    }
    roundData.columns.forEach(data => {
      data.type = FormItemTypeEnum.TEXT
      switch(data.prop) {
        case 'interviewer':
          data.value = detail?.interviewers?.map(info => info.name)?.join(', ') ?? ''
          data.text = detail?.updated_at ?? ''
          break
        case 'interview_result':
          data.value = detail?.[data.prop] ?? ''
          data.text = FeedbackResult?.[data.value]?.name
          data.class = FeedbackResult?.[data.value]?.status
          data.sort = detail.feedback_type === FeedBackTypeEnum.INDIAN ? 1 : 10
          break
        case 'overall_tech_rating':
          data.value = detail?.[data.prop] ?? ''
          data.text = OverallTechRating?.[data.value!]?.name
          data.class = ''
          data.sort = detail.feedback_type === FeedBackTypeEnum.INDIAN ? 2 : 10
          break
        default:
          data.value = detail?.[data.prop as keyof MyInterview.DetailInfo] as string | number ?? ''
          data.text = data.value
          data.class = ''
          data.isHide = data.value === '' && !data.columns
          break
      }
      if (data.text && isString(data.text) && data.text?.includes('\n')) {
        data.text = data.text.split('\n')
      }
      if (data.columns) {
        data.columns.forEach(col => {
          col.value = detail?.[col.prop as keyof MyInterview.DetailInfo] as string | number ?? ''
          col.text = AbilityEvaluation?.[col.value]?.name
          col.type = FormItemTypeEnum.TEXT
        })
      }
    })
    if (detail.feedback_type === FeedBackTypeEnum.INDIAN) {
      roundData.columns.sort((a, b) => a.sort! - b.sort!)
    }
    interviewMap[detail.job_id as number].push(roundData)
  })
  state.interviewMap = {...interviewMap}
  const testFeedBackMap: Record<number, CV.TestFeedback[]> = {}
  // 处理testFeedback数据
  testFeedbackList.forEach(data => {
    if (!applyJobIdList.includes(data.job_id as number)) {
      applyJobIdList.push(data.job_id as number)
      applyJobList.push({
        value: data?.job_id,
        label: data?.job_title ?? ''
      })
    }
    if(!testFeedBackMap[data.job_id as number]) {
      testFeedBackMap[data.job_id as number] = []
    }
    testFeedBackMap[data.job_id as number].push(data)
  })
  state.testFeedback = {...testFeedBackMap}
  const screenFeedBackMap: Record<number, CV.ScreenFeedback[]> = {}
  // 处理screenFeedback数据
  screenFeedbackList.forEach(data => {
    if (!applyJobIdList.includes(data.job_id as number)) {
      applyJobIdList.push(data.job_id as number)
      applyJobList.push({
        value: data?.job_id,
        label: data?.job_title ?? ''
      })
    }
    if(!screenFeedBackMap[data.job_id as number]) {
      screenFeedBackMap[data.job_id as number] = []
    }
    screenFeedBackMap[data.job_id as number].push(data)
  })
  state.screenFeedback = {...screenFeedBackMap}
  state.applyJobList = applyJobList.length > 0 ? [...applyJobList] : [{label: state.applyJob, value: state.applyJobId}]
  activeJobs.value = state.applyJobList?.[0]?.value ? [state.applyJobList?.[0]?.value] : []
  if (applyJobList.length === 0) {
    state.interviewMap = {[state.applyJob]: []}
    state.testFeedback = {[state.applyJob]: []}
    state.screenFeedback = {[state.applyJob]: []}
  }
}

const changeToEditMode = (item: any, isEdit: boolean, applyJob: number) => {
  item.isEdit = isEdit
  state.interviewMap?.[applyJob]?.forEach((interview: any) => {
    if (interview.interviewId === item.interviewId) {
      interview?.columns?.forEach((data: any) => {
        if (!isEdit) {
          data.type = FormItemTypeEnum.TEXT
        }
        data.isHide = !isEdit && data.value === '' && !data.columns && data.prop !== 'interviewer'
        switch(data.prop) {
          case 'interview_result':
          case 'overall_tech_rating':
            data.type = isEdit ? FormItemTypeEnum.RADIO : FormItemTypeEnum.TEXT
            break
          default:
            data.type = isEdit ? FormItemTypeEnum.TEXTAREA : FormItemTypeEnum.TEXT
            break
        }
        if (data.columns) {
          data.columns.forEach((col: any) => {
            col.type = isEdit ? FormItemTypeEnum.SELECT : FormItemTypeEnum.TEXT
          })
        }
      })
    }
  })
}

// 从form重获取值
const getObjectByForms = (forms: EditTable.TableColumns[]) => {
  const obj: Record<string, any> = {} as Record<string, any>
  forms.forEach((item: EditTable.TableColumns) => {
    if (item.isParam) {
      const prop = item.prop as string
      if ((item.value || item.value === 0) && !isEmpty(item.prop)) {
        obj[prop] = item.value
      }
    }
    item?.columns?.forEach((col: EditTable.TableColumns) => {
      if (col.isParam) {
        const prop = col.prop as string
        if ((col.value || col.value === 0) && !isEmpty(col.prop)) {
          obj[prop] = col.value
        }
      }
    })
  })
  return obj
}
// 保存
const save = (index: number, item: Interview) => {
  const validate = tableRefs.value[index]?.validateTable()
  if (validate) {
    const param: MyInterview.DetailInfo = getObjectByForms(tableRefs.value[index]?.getTableData())
    param.interview_round_id = item.interviewId
    param.candidate_resume_id = state.candidateResumeId
    param.feedback_id = item.feedBackId
    submitInterviewFeedback(param).then(res => {
      if (res?.success) {
        ElMessage.success({ message: $t('message.saveSuc') })
        // 恢复非编辑状态，并且重新设置表格的值
        item.isEdit = false
        item.result = param?.interview_result
        item.columns.forEach(data => {
          data.type = FormItemTypeEnum.TEXT
          switch(data.prop) {
            case 'interviewer':
            data.text = res?.result?.updated_at ?? ''
            break
            case 'interview_result':
              data.value = param?.[data.prop] ?? ''
              data.text = FeedbackResult?.[data.value]?.name
              data.class = FeedbackResult?.[data.value]?.status
              break
            case 'overall_tech_rating':
              data.value = param?.[data.prop] ?? ''
              data.text = OverallTechRating?.[data.value!]?.name
            break
            default:
              data.value = param?.[data.prop as keyof MyInterview.DetailInfo] as string | number ?? ''
              data.text = data.value
              data.isHide = data.value === '' && !data.columns
              break
          }
          if (data.text && isString(data.text) && data.text?.includes('\n')) {
            data.text = data.text.split('\n')
          }
          if (data.columns) {
            data.columns.forEach(col => {
              col.value = param?.[col.prop as keyof MyInterview.DetailInfo] as string | number ?? ''
              col.text = AbilityEvaluation?.[col.value!]?.name
              col.type = FormItemTypeEnum.TEXT
            })
          }
        })
      }
    })
  }
}

const download = (isPrint: boolean, applyJob: number, jobIndex: number) => {
  const noEditData = state.interviewMap?.[applyJob]?.every(obj => !obj.isEdit)
  if (!noEditData) {
    ElMessage.warning({ message: $t('message.downLimit') })
    return
  }
  const actives: number[] = []
  state.interviewMap?.[applyJob]?.forEach((data) => {
    actives.push(data.feedBackId as number)
  })
  activeNames.value = [...actives]
  showFullScreenLoading()
  setTimeout(async () => {
    const htmlDom = document.querySelector(`.job-collapse .job-item:nth-child(${jobIndex + 1})`)
    // 复制一个dom元素修改样式不影响原来的dom节点
    const clonedElement = htmlDom?.cloneNode(true) as HTMLElement
    const blob = await htmlToPDF(clonedElement) as Blob
    if (isPrint) {
      url.value = getObjectURL(blob)
      setTimeout(() => {
        previewRef.value && previewRef.value.contentWindow?.print()
        tryHideFullScreenLoading()
      }, 1000)
    } else {
      mittBus.emit(FILE_BLOB_DOWNLOAD, {
        blob,
        file_name: `${state.candidateName}_${state.applyJob}_${$t('tabs.interviewFeedback')}.pdf`
      })
      tryHideFullScreenLoading()
    }
  }, 2000)
}

defineExpose({
  acceptParams
})
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
