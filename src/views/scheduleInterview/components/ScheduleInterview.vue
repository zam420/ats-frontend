<template>
  <EspMain :title="state.title">
    <el-row :gutter="20" class="view-content">
      <el-col :span="6" v-if="interviewType === ScheduleViewEnum.ONE_BY_ONE">
        <div class="step-panel">
          <div class="title-panel">
            <div class="title">{{ $t('menu.interviewProcess') }}</div>
          </div>
          <div class="filter" v-if="!detailId">
            <el-select
              v-model="state.selectInterviewProcess"
              filterable
              @change="changeInterviewProcess"
            >
              <el-option
                v-for="option in state.interviewProcessList"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="content">
            <div 
              class="step"
              v-for="(item, index) in state.sessionStepList"
              :key="item.id"
              :class="{ active: item.id === state.selectSessionStep }"
              @click="changeStep(item)"
            >
              <div class="left-border"></div>
              <div class="step-content">
                <div class="opt-panel">
                  <div class="opt-title">{{ `${$t('interviewProcess.step')} ${index + 1}` }}</div>
                  <div class="completed" v-if="item.receivedFeedback"></div>
                </div>
                <div class="step-title">{{ item.label }}</div>
                <div>{{ item.subLabel }}</div>
              </div>
              <!-- <div class="step-tag">{{ `${$t('interviewProcess.step')} ${index + 1}` }}</div> -->
            </div>
          </div>
          <div class="footer" v-if="canAddRound">
            <div class="set-icon" @click="openDialog">
              <img src="@/assets/imgs/set.png" /> {{ $t('interviewProcess.modifyInterview') }}
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="interviewType === ScheduleViewEnum.ONE_BY_ONE ? 18 : 24">
        <div class="step-panel">
          <div class="title-panel">
            <div class="title">{{ $t('scheduleInterview.interviewInformation') }}</div>
            <div v-if="state.selectSessionStepType !== InterviewSessionEnum.VIDEO &&
              state.selectSessionStepType !== InterviewSessionEnum.ONLINE
              ">
              <template v-if="isDetail || state.stepInterviewMap?.[state.selectSessionStep as number]?.status === ScheduleViewStatusEnum.AWAITING_FEEDBACK || Object.keys(state.stepInterviewMap)?.length === 0">
                <!-- 面试进程中或者面试没开始都可以修改 -->
                <i class="iconfont icon-unfit text-primary-gradient" @click="cancelScheduleInterview()" v-if="state.stepInterviewMap?.[state.selectSessionStep as number]?.cancelable"></i>
                <i class="iconfont icon-edit text-primary-gradient" @click="changeToEdit" v-if="state.stepInterviewMap?.[state.selectSessionStep as number]?.modifiable"></i>
              </template>
              <template v-else>
                <ElButton @click="goBack(false, true)">{{ $t('button.cancel') }}</ElButton>
                <ElButton @click="send" class="btn-primary-gradient">{{
                  $t('button.send')
                }}</ElButton>
              </template>
            </div>
          </div>
          <div class="content noBottom" v-if="state.selectSessionStepType !== InterviewSessionEnum.VIDEO && state.selectSessionStepType !== InterviewSessionEnum.ONLINE">
            <RoundDetail 
              v-if="isDetail || state.stepInterviewMap?.[state.selectSessionStep as number]?.status === ScheduleViewStatusEnum.AWAITING_FEEDBACK || state.hasNoRoundData"
              :detailData="state.stepInterviewMap?.[state.selectSessionStep as number] ?? {}"
              @cancel="cancelScheduleInterview"
            ></RoundDetail>
            <template v-else>
              <EspForm ref="interviewRef" v-model="state.baseForm" :changeForm="changeForm" :refreshForm="refreshForm" />
              <div v-if="state.showEmailTemplate">
                <EspForm
                  ref="templateRef"
                  v-model="state.templateForm"
                  :changeForm="changeSelectTemplate"
                />
                <el-row :gutter="20" class="email-panel" v-if="state.selectEmailTemplate !== ''">
                  <el-col :span="24" class="el-form-item is-required asterisk-right">
                    <label class="el-form-item__label">{{ $t('emailTemplate.emailContent') }}</label>
                    <div class="tab-panel">
                      <template v-if="state.userEmailList.length > 1">
                        <div
                          class="tab"
                          v-for="item in state.userEmailList"
                          :key="item.id"
                          @click="changeTab(item.id)"
                          :class="{ active: item.id === state.selectUserResumeId }"
                        >
                          {{ item.name }}
                        </div>
                      </template>
                    </div>
                    <template v-for="(item, index) in state.userEmailList" :key="item.id">
                      <div
                        v-if="item.id === state.selectUserResumeId"
                        class="email-content"
                        :class="{ high: state.userEmailList.length <= 1 }"
                      >
                        <el-input 
                          v-model="item.subject"
                          @change="changeSubject(item)"
                          :class="{ error: item.isSubjectEmpty }"
                        ></el-input>
                        <EspQuillEditor
                          :ref="(el: HTMLElement) => { setItemRef(el, index) }"
                          :hideLabel="true"
                          :class="{ error: item.isError }" 
                          v-model:content="item.content"
                          :select-options="state.selectOptions" 
                          :parseContent="item.parseContent"
                          :canPreview="true"
                          :updateCallback="(data: any) => {
                              updateContent(data, index)
                            }
                          "
                          />
                      </div>
                    </template>
                  </el-col>
                </el-row>
              </div>
            </template>
          </div>
          <div class="content noBottom" v-else></div>
        </div>
      </el-col>
    </el-row>
    <InterviewProcessDialog
      v-if="state.showProcessDialog" 
      :visible="state.showProcessDialog"
      :interviewId="state.interviewId"
      :templateId="state.selectInterviewProcess"
      :interviewType="interviewType"
      :jobId="jobId"
      :selectUserResumeId="state.selectUserResumeId"
      :processList="state.sessionStepList"
      @close="closeProcessDialog"
      ></InterviewProcessDialog>
  </EspMain>
</template>
<script setup lang="ts" name="ScheduleInterview">
import { cloneDeep } from 'lodash-es'
import { INTERVIEW_EMAIL_TEMPLATE_FORM, INTERVIEW_INFORMATION_FORM } from '../data'
import {
  enumItem2arr,
  generateUUID,
  getObjectByForms,
  getTimeRange
} from '@/utils'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_CV_MANAGEMENT } from '@/router/routerName'
import { getInterviewProcessDetail } from '@/api/modules/interviewProcess'
import InterviewProcess from '@/api/interface/interviewProcess'
import { InterviewSession, InterviewSessionEnum } from '@/enums/interviewSessionEnum'
import { getInterviewProcessTemplate } from '@/api/modules/cv'
import { EmailTemplateParamEnum } from '@/enums/emailTemplateParamEnum'
import { useCVStore } from '@/store/modules/cv'
import { getEmailTemplateDetail, getEmailTemplateListByJob } from '@/api/modules/emailTemplate'
import EmailTemplate from '@/api/interface/emailTemplate'
import { cancelSchedule, changeScheduleInterviewStep, getScheduleInterviewDetail, sendScheduleInterview, getGroupCandidates, submitInterviewInBulk, getCandidatesData } from '@/api/modules/scheduleInterview'
import ScheduleInterview from '@/api/interface/scheduleInterview'
import InterviewProcessDialog from './InterviewProcessDialog.vue'
import moment from 'moment'
import { DATE_FORMAT, OPEN_DIALOG } from '@/config'
import { useGlobalStore } from '@/store/modules/global'
import { ScheduleViewEnum, ScheduleViewStatusEnum } from '@/enums/scheduleViewEnum'
import RoundDetail from './RoundDetail.vue'
import mittBus from '@/utils/mittBus'
const globalStore = useGlobalStore()
interface UserEmail {
  id: number
  name: string
  isSubjectEmpty: boolean
  isError: boolean
  subject: string
  content: string
  parseContent: string
}
interface ReactiveParams {
  title: string
  baseForm: Form.FormItem[]
  templateForm: Form.FormItem[]
  processList: InterviewProcess.RoundParam[]
  interviewerList: Form.FormSelect[]
  sessionStepList: Form.FormSelect[]
  interviewProcessList: Form.FormSelect[]
  selectSessionStep?: number
  selectSessionStepType: number
  selectInterviewProcess: number | undefined
  showEmailTemplate: boolean
  selectOptions: any
  userEmailList: UserEmail[]
  cacheUserEmailList: UserEmail[]
  selectUserResumeId: number
  emailTemplateList: Form.FormSelect[]
  selectEmailTemplate: number | string
  showProcessDialog: boolean
  interviewId?: number
  stepInterviewMap: any
  emailEmptyUserList: string[]
  candidateInfoMap: any
  candidates: Form.FormSelect[]
  candidateOptions: Form.FormSelect[]
  emailDetail: any
  cloneInterviewData: any
  jobPosition: string
  hasNoRoundData: boolean
}
const router = useRouter()
const { $t } = useLocale()
const route = useRoute()
const cvStore = useCVStore()
const interviewRef = ref()
const templateRef = ref()
const quillEditorRefs = ref<any>([])
const state = reactive<ReactiveParams>({
  title: '',
  baseForm: cloneDeep(INTERVIEW_INFORMATION_FORM),
  templateForm: cloneDeep(INTERVIEW_EMAIL_TEMPLATE_FORM),
  processList: [],
  interviewerList: [],
  // 面试流程list
  sessionStepList: [],
  // interview process模版下拉列表
  interviewProcessList: [],
  // 当前选择的interview process模版
  selectInterviewProcess: undefined,
  selectSessionStepType: InterviewSessionEnum.PROFESSIONAL,
  // emailTemplate 下拉列表
  emailTemplateList: [],
  // 当前选择的email template模版
  selectEmailTemplate: '',
  // 是否通知candidate显示email template模块
  showEmailTemplate: true,
  // 用于富文本编辑框的选项配置项列表
  selectOptions: EmailTemplateParamEnum,
  // 当前发起面试选择的员工列表
  userEmailList: [],
  cacheUserEmailList: [],
  // 当前选择的员工对应的简历id
  selectUserResumeId: 0,
  // 是否打开interview process设置弹窗
  showProcessDialog: false,
  // schedule interview id
  interviewId: undefined,
  // 缓存步骤id与interview的对应关系
  stepInterviewMap: {},
  // 邮箱为空的用户列表
  emailEmptyUserList: [],
  // 缓存员工的基础信息
  candidateInfoMap: {},
  // 页面选择的员工
  candidates: [],
  // 群面可以新增的员工列表
  candidateOptions: [],
  // 选择的email template数据
  emailDetail: {},
  // 缓存编辑前的旧数据
  cloneInterviewData: {},
  // 申请的职位名称
  jobPosition: '',
  // 保存后端的详情里没有round数据
  hasNoRoundData: false
})
const interviewType = ref<number>(Number(route.params?.type))
const jobId = ref<number>(Number(route.params?.jobId))
const selectedCandidateIds = ref<number[]>([])
// 如果有约过面试则获取面试详情
const detailId = route?.query?.id ?? ''
// 有面试详情且是通过链接进入的话是看详情，如果是通过schedule interview按钮进去则还是显示编辑页面，数据回显
const isDetail = ref<boolean>(route?.query?.isDetail === 'true')
const canAddRound = ref<boolean>(true)
// 解析邮件内容
const parseEmailContent = (content: string, userId: number, meetingUrl?: string, isPreview?: boolean) => {
  const html = new DOMParser().parseFromString(content, 'text/html')
  const dom = html.querySelector('body')
  if (dom) {
    const domSpans = dom.querySelectorAll('.ql-esp-select') ?? []
    for (let i = 0; i < domSpans.length; i++) {
      const domSpan: any = domSpans[i]
      const key = domSpan.dataset.value
      if (
        ['interviewTime', 'interviewLocation', 'sendDate', 'userName', 'interviewers'].includes(key)
      ) {
        const formData = getObjectByForms(state.baseForm)
        const interviewersIndex = state.baseForm.findIndex(info => info.prop === 'interviewers')
        const interviewerIds: number[] = formData?.interviewers ?? []
        const interviewerNames =
          state.baseForm[interviewersIndex]?.options
            ?.filter(data => interviewerIds.includes(data.value))
            ?.map(info => info.name) ?? []
        const interviewData: any = {
          interviewTime: state.stepInterviewMap?.[state.selectSessionStep as number]?.interviewTime
            ? `${(state.stepInterviewMap?.[state.selectSessionStep as number]?.interviewTime[0] as string).slice(0, -3)}`
            : '',
          interviewLocation: formData?.interview_location ?? '',
          sendDate: moment(new Date()).format(DATE_FORMAT),
          userName: globalStore.userInfo?.name ?? '',
          interviewers: interviewerNames.join(', ')
        }

        domSpan.innerText = interviewData?.[key] ? interviewData?.[key] : domSpan.innerText
      } else if (key === 'onlineInterviewLink') {
        let teamsMeetingUrl = state.stepInterviewMap?.[state.selectSessionStep as number]?.teams_meeting_url ?? ''
        if (meetingUrl) {
          teamsMeetingUrl = meetingUrl
        }
        // 如果当前是预览，且onlineinterviewlink有值将其替换成a标签
        if (isPreview && teamsMeetingUrl) {
          const aTag = document.createElement('a');
          aTag.setAttribute('href', teamsMeetingUrl)
          aTag.setAttribute('target', '_blank')
          aTag.textContent = teamsMeetingUrl
          domSpan.innerText = ''
          domSpan.appendChild(aTag);
        } else {
          domSpan.innerText = teamsMeetingUrl ? teamsMeetingUrl : domSpan.innerText
        }
      } else {
        domSpan.innerText = state.candidateInfoMap?.[userId]?.[key]
          ? state.candidateInfoMap?.[userId]?.[key]
          : domSpan.innerText
      }
    }
  }
  return (dom as HTMLBodyElement).innerHTML
}

// 发送邮件
const send = () => {
  if (state.interviewId && state.stepInterviewMap?.[state.selectSessionStep as number]?.status !== ScheduleViewStatusEnum.DRAFT) {
    ElMessageBox.confirm($t('message.sendTip'), $t('message.tips'), {
      confirmButtonText: $t('button.confirm'),
      cancelButtonText: $t('button.cancel'),
      type: 'warning'
    })
    .then(() => {
      save()
    })
    return
  }
  save()
}
// 保存并发送
const save = () => {
  setTimeout(async() => {
    const isBasicPass = interviewRef.value.validateFrom && (await interviewRef.value.validateFrom())
    const isEmailPass = state.showEmailTemplate
      ? templateRef.value.validateFrom && (await templateRef.value.validateFrom())
      : true
    if (isBasicPass && isEmailPass) {
      const validateSubject: boolean[] = []
      const validateQuill: boolean[] = []
      state.userEmailList.forEach(data => {
        validateSubject.push(data.isSubjectEmpty)
        validateQuill.push(data.isError)
      })
      const isSubjectPass = validateSubject.every(item => item === false)
      const isQuillPass = validateQuill.every(item => item === false)
      if (state.showEmailTemplate && (!isQuillPass || !isSubjectPass)) {
        ElMessage.error($t('form.requiredError'))
        return
      }
      const baseParam = getObjectByForms(state.baseForm)
      if (baseParam?.interviewTime[1]) {
        const interviewTime = new Date(baseParam?.interviewTime[1]?.replace(" ", "T"))
        const today = new Date()
        if (interviewTime < today) {
          ElMessageBox.confirm($t('message.interviewTimeLimitTip'), $t('message.tips'), {
            confirmButtonText: $t('button.confirm'),
            cancelButtonText: $t('button.cancel'),
            type: 'warning'
          })
          .then(() => {
            continueSchedule(baseParam)
          })
          return
        }
      }
      continueSchedule(baseParam)
    }
  }, 300)
}

const continueSchedule = async (baseParam: any) => {
  const templateParam = getObjectByForms(state.templateForm)
  const sessionStep = state.sessionStepList.find(info => info.id === state.selectSessionStep)
  const order = state.sessionStepList.findIndex(info => info.id === state.selectSessionStep)
  // 由于是否在线这个选项是通过interview address里的switchValue判断,因此这里需要找一下
  const interviewAddress = state.baseForm.find(info => info.prop === 'interview_location')
  const formData: ScheduleInterview.InterviewInfo = {
    interview_template: state.selectInterviewProcess,
    type: interviewType.value,
    target_job: jobId.value,
    interviewers: baseParam.interviewers,
    info_candidate: baseParam.info_candidate,
    info_interviewer: baseParam?.info_interviewer ?? false,
    round_type: state.selectSessionStepType,
    time_from: baseParam.interviewTime[0],
    time_to: baseParam.interviewTime[1],
    order: order === -1 ? 0 : order,
    is_online: interviewAddress?.switchValue ?? false,
    interview_location: baseParam.interview_location
  }
  // 只有当当前info_candidate是开着的时候才传绑定的template id
  if (state.showEmailTemplate) {
    formData.email_template = templateParam.email_template
  }
  // id是number类型是后端返回的id，发送时需要传；id是string类型的是前端自动生成的不需要传
  if (sessionStep?.id && typeof sessionStep?.id === 'number') {
    formData.round_id = sessionStep?.id
  }
  const candidates: ScheduleInterview.Candidate[] = []
  state.userEmailList.forEach((data: UserEmail) => {
    let content = state.showEmailTemplate ? parseEmailContent(data.content, data.id) : ''
    data.parseContent = content
    candidates.push({
      candidate_resume_id: data.id,
      email_body: content,
      email_subject: state.showEmailTemplate ? data.subject : '',
      email_bcc: baseParam?.email_bcc ?? []
    })
  })
  if (interviewType.value === ScheduleViewEnum.ONE_BY_ONE) {
    formData.candidate = candidates?.[0] ?? null
  } else {
    formData.candidates = candidates
  }
  // 如果保存过数据再send需要传id
  if (state.interviewId) {
    formData.id = state.interviewId
  }
  if (state.emailEmptyUserList.length > 0 && state.showEmailTemplate) {
    ElMessage.error(
      $t('message.emptyEmailLimit', {
        name: state.emailEmptyUserList.join(' & ')
      })
    )
    return
  }
  // 单面的时候需要将面试左侧的面试流程保存，但是群面只有一轮技术面试不用
  if (interviewType.value === ScheduleViewEnum.ONE_BY_ONE) {
    // 为将step数据在发送时传入后端详情的时候可以看数据，send前调用setup先设置step数据
    const roundSetting: ScheduleInterview.RoundSetting[] = []
    state.sessionStepList.forEach((data: Form.FormSelect, index) => {
      const info: ScheduleInterview.RoundSetting = {
        round_type: data.value,
        round_order: index
      }
      if (data.id && typeof data.id === 'number') {
        info.round_id = data.id
      }
      roundSetting.push(info)
    })
    const param: ScheduleInterview.StepParam = {
      candidate_resume_id: state.selectUserResumeId,
      interview_type: interviewType.value,
      target_job: jobId.value,
      round_settings: [...roundSetting],
      interview_template: state.selectInterviewProcess as number
    }
    if (state.interviewId) {
      param.interview_id = state.interviewId
    }
    const res = await changeScheduleInterviewStep(param)
    const id = res?.result?.interview_id
    const rounds = res?.result?.rounds?.sort(
      (a: ScheduleInterview.RoundSetting, b: ScheduleInterview.RoundSetting) => {
        return (a.order as number) - (b.order as number)
      }
    )
    // 这个时候send需要传id
    formData.id = id
    state.sessionStepList.forEach((data, index) => {
      const roundId = rounds?.[index]?.round_id
      if (state.selectSessionStep === data.id) {
        formData.round_id = roundId
        state.selectSessionStep = roundId
      } 
      data.id = roundId
    })
  }
  const action = interviewType.value === ScheduleViewEnum.ONE_BY_ONE ? sendScheduleInterview(formData) : submitInterviewInBulk(formData)
  action.then(async res => {
    if (res?.success) {
      if (state.interviewId) {
        const result = await getScheduleInterviewDetail(Number(state.interviewId))
        const interviewData = result?.result
        interviewData?.rounds?.forEach(round => {
          if (state.stepInterviewMap?.[round?.round_id as number]){
            state.stepInterviewMap[round?.round_id as number].teams_meeting_url = round.teams_meeting_url
            state.stepInterviewMap[round?.round_id as number].interviewerList = round.interviewers
          }
        })
        state.userEmailList.forEach((data: UserEmail) => {
          data.parseContent = parseEmailContent(data.content, data.id) ?? ''
        })
      }
      // 发送成功后手动将状态缓存数据改为schedule，用于detail页面的操作因为进入detail页面目前不刷新
      if (state.stepInterviewMap[state.selectSessionStep as number]) {
        state.stepInterviewMap[state.selectSessionStep as number].status = ScheduleViewStatusEnum.SCHEDULED
        state.stepInterviewMap[state.selectSessionStep as number].userEmailList = state.userEmailList
      }
      state.sessionStepList.forEach(data => {
        if (data.id === state.selectSessionStep){
          data.status = ScheduleViewStatusEnum.SCHEDULED
        }
      })
      ElMessage.success({ message: $t('message.sendSuc') })
      goBack()
    }
  })
}
// 返回列表页面
const goBack = (isCancelInterview?: boolean, isCanelOpt?: boolean) => {
  if (isCanelOpt) {
    state.stepInterviewMap = cloneDeep(state.cloneInterviewData)
    const sessionStep: any = state.sessionStepList?.find(info => info.id === state.selectSessionStep!)
    setFormData(sessionStep)  
  }
  if (route?.query?.isDetail === 'true' && !isCancelInterview) {
    isDetail.value = true
    return
  }
  router.replace({
    path: `/${ROUTER_CV_MANAGEMENT}`
  })
}
// 更新content
const updateContent = (content: string, index: number) => {
  state.userEmailList[index].isError = content === ''
  state.userEmailList[index].content = content
  state.userEmailList[index].parseContent = parseEmailContent(content, state.userEmailList[index].id, '', true)
  // 由于富文本编辑器的content是需要手动更新的这里将缓存操作的content也更新一下
  if (state.selectSessionStep && state.stepInterviewMap?.[state.selectSessionStep]) {
    state.stepInterviewMap[state.selectSessionStep as number].userEmailList = cloneDeep(state.userEmailList)
  }
}
const setItemRef = (el: HTMLElement, index: number) => {
  if (el) {
    quillEditorRefs.value[index] = el
  }
}

const changeTab = (value: number) => {
  state.selectUserResumeId = value
}
onMounted(async () => {
  const jobId = Number(route.params?.jobId as string)
  const isOneByOne = interviewType.value === ScheduleViewEnum.ONE_BY_ONE
  const selectedCandidate = cloneDeep(cvStore?.selectedCandidate ?? [])
  const userResumeIds: number[] = selectedCandidate?.map(info => info.value) ?? []
  const candidateInfoMap: any = {}
  // 获取cv列表选择的员工列表数据设置页面信息
  const index = state.baseForm.findIndex(info => info.prop === 'candidates')
  const userEmailList: UserEmail[] = []
  const emailEmptyUserList: string[] = []
  const selectCandidate: Form.FormSelect[] = []
  const jobPosition = selectedCandidate?.[0]?.applying_position_title ?? ''
  state.jobPosition = jobPosition
  // 如果是群面则可以获取候选人下拉数据
  if (!isOneByOne) {
    const candidatesResult = await getGroupCandidates(jobId)
    const list = candidatesResult?.result ?? []
    const selectList: Form.FormSelect[] = []
    list.forEach(user => {
      // 缓存员工数据主要用于邮件动态字段替换
      user.phone_number = user?.candidate_phone ?? ''
      user.applied_at = user?.candidate_applied_at ?? ''
      user.applying_position_title = state.jobPosition
      user.name = user?.candidate_name ?? ''
      user.email = user?.candidate_email ?? ''
      const userSelect: Form.FormSelect = {label: user.candidate_name as string, value: user.candidate_resume_id as number, ...user}
      if (!user.email && userResumeIds?.includes(user.candidate_resume_id as number)) {
        emailEmptyUserList.push(user.name)
      }
      if (userResumeIds?.includes(user.candidate_resume_id as number)) {
        userSelect.disabled = true
        selectCandidate.push(userSelect)
        userEmailList.push({
          id: user.candidate_resume_id!,
          name: user.name,
          isSubjectEmpty: false,
          isError: false,
          subject: '',
          content: '',
          parseContent: ''
        })
      }
      candidateInfoMap[user.candidate_resume_id as number] = user
      selectList.push(userSelect)
    })
    state.candidateOptions = [...selectList]
    state.baseForm[index].options = [...state.candidateOptions]
    state.candidates = cloneDeep(selectCandidate)
  } else {
    const candidateResult = await getCandidatesData(userResumeIds)
    const candidateData = candidateResult?.result ?? []
    candidateData.forEach(data => {
      data.disabled = true
      data.candidate_resume_id = data.id
      data.candidate_name = data.name
      data.candidate_phone = data.phone_number
      data.candidate_applied_at = data.applied_at
      data.value = data.id
      data.label = data.name
      const userData: Form.FormSelect = {label: data.label as string, value: data.value as number, ...data}
      if (!data.email) {
        emailEmptyUserList.push(data.name)
      }
      candidateInfoMap[data.id] = data
      selectCandidate.push(userData)
      userEmailList.push({
        id: data.id,
        name: data.name,
        isSubjectEmpty: false,
        isError: false,
        subject: '',
        content: '',
        parseContent: ''
      })
    })
    state.baseForm[index].options = [...selectCandidate]
    state.candidates = cloneDeep(selectCandidate)
  }

  // 单面的时候员工不可以修改，群面可以，但是只能增加不能删除
  if (isOneByOne) {
    state.baseForm[index].disabled = true
  }
  if (isDetail.value) {
    state.title = isOneByOne ? $t('scheduleInterview.oneToOneInterviewFor', {
      jobPosition: jobPosition
    }) : $t('scheduleInterview.groupInterviewFor', {
      jobPosition: jobPosition
    })
  } else {
    state.title = isOneByOne ? $t('scheduleInterview.oneToOneInterview') : $t('scheduleInterview.groupInterview')
  }

  state.emailEmptyUserList = [...emailEmptyUserList]
  state.candidateInfoMap = { ...candidateInfoMap }
  state.baseForm[index].value = [...userResumeIds]
  if (state.emailEmptyUserList.length > 0) {
    state.baseForm[index].isFound = true
    state.baseForm[index].showBtn = true
    state.baseForm[index].text = $t('message.emptyEmailLimit', {
      name: state.emailEmptyUserList.join(' & ')
    })
  }
  interviewRef.value?.changeFormModel(
    {
      prop: state.baseForm[index]?.prop,
      value: state.baseForm[index]?.value
    },
    true
  )
  state.userEmailList = [...userEmailList]
  state.cacheUserEmailList = cloneDeep(userEmailList)
  state.selectUserResumeId = userResumeIds?.[0] ?? 0
  selectedCandidateIds.value = [...userResumeIds]

  // 获取email template下拉的值
  const emailTemplateResult = await getEmailTemplateListByJob(jobId)
  const emailTemplateOptions: Form.FormSelect[] = []
  emailTemplateResult?.result?.forEach((email: EmailTemplate.EmailInfo) => {
    emailTemplateOptions.push({
      label: email.name,
      value: email.id,
      ...email
    })
  })
  const emailTemplateIndex = state.templateForm.findIndex(info => info.prop === 'email_template')
  state.templateForm[emailTemplateIndex].options = [...emailTemplateOptions]
  state.emailTemplateList = [...emailTemplateOptions]
  // 单面可以选模版修改面试环节，群面不行只能是技术面试
  if (isOneByOne) {
    // 获取interview process template下拉值
    const templateResult = await getInterviewProcessTemplate(jobId)
    const interviewProcessList = templateResult?.result ?? []
    if (interviewProcessList.length > 0) {
      state.selectInterviewProcess = interviewProcessList?.[0]?.id as unknown as number
      state.interviewProcessList = interviewProcessList.map(data => {
        return { label: data.name, value: data.id }
      })
    }
  }
  if (detailId) {
    initData()
    return
  }
  //  群面只有技术面试不需要获取interview process template数据
  if (!isOneByOne) {
    state.selectSessionStep = InterviewSessionEnum.PROFESSIONAL
    return
  }
  // 获取interview process详情拿到步骤数据
  getInterviewProcessRounds()
})

const refreshForm = async () => {
  const candidateResult = await getCandidatesData(selectedCandidateIds.value)
  const candidateData = candidateResult?.result ?? []
  const candidateInfoMap: any = {}
  const selectCandidate: Form.FormSelect[] = []
  const emailEmptyUserList: string[] = []
  candidateData.forEach(data => {
    data.disabled = true
    data.candidate_resume_id = data.id
    data.candidate_name = data.name
    data.candidate_phone = data.phone_number
    data.candidate_applied_at = data.applied_at
    data.value = data.id
    data.label = data.name
    const userData: Form.FormSelect = {label: data.label as string, value: data.value as number, ...data}
    if (!data.email) {
      emailEmptyUserList.push(data.name)
    }
    candidateInfoMap[data.id] = data
    selectCandidate.push(userData)
  })
  state.emailEmptyUserList = [...emailEmptyUserList]
  const index = state.baseForm.findIndex(data => data.prop === 'candidates')
  if (state.emailEmptyUserList.length > 0) {
    state.baseForm[index].isFound = true
    state.baseForm[index].showBtn = true
    state.baseForm[index].text = $t('message.emptyEmailLimit', {
      name: state.emailEmptyUserList.join(' & ')
    })
  } else {
    state.baseForm[index].isFound = false
    state.baseForm[index].showBtn = false
    state.baseForm[index].text = ''
  }
  state.baseForm[index].options?.forEach(data => {
    data.email = candidateInfoMap?.[data.value]?.email ?? ''
  })
  state.candidates = [...selectCandidate]
  state.candidateInfoMap = { ...candidateInfoMap }
  state.stepInterviewMap[state.selectSessionStep!].candidates = [...selectCandidate]
}

// 获取interview process详情拿到步骤数据
const getInterviewProcessRounds = async () => {
  // 面试流程绑定的面试官数据
  let interviewers = []
  // 如果有绑定的interview process template,则需要获取选中的interview process template对应的step数据
  if (state.selectInterviewProcess) {
    const interviewResult = await getInterviewProcessDetail(state.selectInterviewProcess)
    const sessionStepLists = interviewResult?.result?.rounds ?? []
    if (sessionStepLists.length > 0) {
      const sessionStepList: Form.FormSelect[] = []
      sessionStepLists.forEach(data => {
        sessionStepList.push({
          id: generateUUID(),
          label: InterviewSession?.[data.round_type]?.name,
          subLabel: InterviewSession?.[data.round_type]?.subLabel,
          value: data.round_type,
          interviewers: data?.interviewers?.map(info => info.email),
          status: ScheduleViewStatusEnum.DRAFT
        })
      })
      state.sessionStepList = [...sessionStepList]
    }
  } else {
    const interviewSessionList = enumItem2arr(InterviewSession)
    interviewSessionList.forEach(info => {
      info.id = generateUUID()
      info.status = ScheduleViewStatusEnum.DRAFT
    })
    state.sessionStepList = [...interviewSessionList]
  }
  // 默认选中专业面试，如果没有专业面试，则选中第一个面试
  let dataIndex = state.sessionStepList?.findIndex(info => info.value === InterviewSessionEnum.PROFESSIONAL)
  if (dataIndex === -1) {
    dataIndex = 0
  }
  state.selectSessionStep = state.sessionStepList?.[dataIndex]?.id
  state.selectSessionStepType = state.sessionStepList?.[dataIndex]?.value
  interviewers = state.sessionStepList?.[dataIndex]?.interviewers ?? []
  state.sessionStepList.forEach(data => {
    if (data.id && !state.stepInterviewMap[data.id]) {
      state.stepInterviewMap[data.id] = {}
    }
    // 缓存基础数据
    state.stepInterviewMap[data.id].candidates = cloneDeep(state.candidates)
    state.stepInterviewMap[data.id].interviewers = data?.interviewers ?? []
    state.stepInterviewMap[data.id].userEmailList = cloneDeep(state.userEmailList)
  })
  // 如果当前选中的interview process模版中选中的流程已经有绑定过interviewers，则在右边的form表单里自动带出数据
  if (interviewers.length > 0) {
    const interviewerIndex = state.baseForm.findIndex(info => info.prop === 'interviewers')
    state.baseForm[interviewerIndex].value = [...interviewers]
    interviewRef.value?.changeFormModel(
      {
        prop: state.baseForm[interviewerIndex].prop,
        value: state.baseForm[interviewerIndex].value
      },
      true
    )
  }
}
// 获取详情数据
const initData = () => {
  getScheduleInterviewDetail(Number(detailId)).then(async (res) => {
    const result = res?.result
    const rounds = result?.rounds ?? []
    state.hasNoRoundData = rounds.length === 0
    const map: any = {}
    const list: Form.FormSelect[] = []
    let dataIndex: number = 0
    state.interviewId = result?.interview_id
    canAddRound.value = result?.interview_mgmt_enable ?? false
    // 每个员工缓存的phone，applied_at这些用于替换动态字段的数据对于同一个员工id来说都是一样的，不管是哪一个round，所以这里缓存的时候不需要考虑不同round
    const candidateInfoMap: any = {}
    rounds.forEach((roundData: ScheduleInterview.InterviewInfo, index: number) => {
      const interviewerIds: string[] = roundData?.interviewers?.map(info => info.email) ?? []
      const userEmailList: UserEmail[] = []
      let emailCCList: string[] = []
      roundData?.candidates?.forEach((data: ScheduleInterview.Candidate) => {
        data.label = data.candidate_name
        data.value = data.candidate_resume_id
        data.disabled = true
        if (roundData.teams_meeting_url && data.email_body) {
          data.email_body = parseEmailContent(data.email_body!, data.candidate_resume_id!, roundData.teams_meeting_url)
        }
        userEmailList.push({
          id: data.candidate_resume_id as number,
          name: data.candidate_name as string,
          isSubjectEmpty: false,
          isError: false,
          subject: data.email_subject as string,
          content: data.email_body as string,
          parseContent: data.email_body as string
        })
        // 缓存员工数据主要用于邮件动态字段替换
        data.phone_number = data?.candidate_phone ?? ''
        data.applied_at = data?.candidate_applied_at ?? ''
        data.applying_position_title = result?.target_job_title ?? ''
        data.name = data?.candidate_name ?? ''
        data.email = data?.candidate_email ?? ''
        candidateInfoMap[data.candidate_resume_id as number] = cloneDeep(data)
        if (data.email_bcc) {
          emailCCList = data.email_bcc
        }
      })

      // 如果是未发送过邮件的数据默认这两项的值
      if (roundData.status === ScheduleViewStatusEnum.DRAFT) {
        roundData.info_candidate = true
        roundData.info_interviewer = false
      }
      list.push({
        id: roundData.round_id,
        label: InterviewSession?.[roundData.round_type as number]?.name,
        subLabel: InterviewSession?.[roundData.round_type as number]?.subLabel,
        value: roundData.round_type,
        interviewers: interviewerIds,
        status: roundData.status,
        receivedFeedback: roundData.feedback_received,
        modifiable: roundData.modifiable,
        cancelable: roundData.cancelable
      })
      // 默认选中专业面试
      if (roundData.round_type === InterviewSessionEnum.PROFESSIONAL) {
        dataIndex = index
      }
      // 如果有SCHEDULED的面试，查看详情时默认选中已发送的interview round数据
      if (roundData.status === ScheduleViewStatusEnum.SCHEDULED) {
        dataIndex = index
      }
      map[roundData.round_id as number] = {
        ...roundData,
        interviewerList: roundData.interviewers,
        interviewers: interviewerIds,
        interviewTime: roundData.from_time ? [roundData.from_time, roundData.to_time] : null,
        emailTemplate: state.emailTemplateList?.find(info => info.value === roundData.email_template)?.label ?? '',
        email_bcc: emailCCList,
        userEmailList: cloneDeep(userEmailList)
      }
    })
    state.candidateInfoMap = {...state.candidateInfoMap, ...candidateInfoMap}
    state.sessionStepList = [...list]
    const sessionStep = state.sessionStepList?.[dataIndex] ?? {}
    state.selectSessionStep = sessionStep?.id
    // 群面只有专业面试
    state.selectSessionStepType = interviewType.value === ScheduleViewEnum.ONE_BY_ONE ? sessionStep?.value : InterviewSessionEnum.PROFESSIONAL
    state.stepInterviewMap = { ...map }
    state.selectInterviewProcess = result?.interview_template
    const index = state.baseForm.findIndex(info => info.prop === 'candidates')
    const candidate_resume_ids = result?.candidate_resume_id?.map(data => data.candidate_resume_id)
    const candidatesOption = map?.[sessionStep?.id]?.candidates ?? []
    selectedCandidateIds.value = map?.[sessionStep?.id]?.candidates?.map((info: ScheduleInterview.Candidate) => info.candidate_resume_id) ?? candidate_resume_ids
    if (result?.rounds && result?.rounds?.length > 0) {
      state.cacheUserEmailList = cloneDeep(map?.[sessionStep?.id]?.userEmailList ?? [])
    }
    // 为了防止用户不是从列表带出来数据打开详情页面而是直接用路径打开，带出的candidates在前面赋值options的时候并没有剔除存在重新数据，这里再剔除一遍
    const newCandidatesOptions = state.candidateOptions?.filter(obj => !selectedCandidateIds.value.includes(obj.value))
    const options = [...candidatesOption, ...newCandidatesOptions]
    if (options.length > 0) {
      state.baseForm[index].options = [...candidatesOption, ...newCandidatesOptions]
    } 
    state.selectUserResumeId = selectedCandidateIds.value?.[0] ?? candidate_resume_ids?.[0]
    // 更新title
    state.title = interviewType.value === ScheduleViewEnum.ONE_BY_ONE ? $t('scheduleInterview.oneToOneInterviewFor', {
      jobPosition: result?.target_job_title
    }) : $t('scheduleInterview.groupInterviewFor', {
      jobPosition: result?.target_job_title
    })
    setFormData(sessionStep)  
    // 群面需要获取之前绑定的email template对应的内容用户后面新增员工时的默认内容，单面不用，群面默认只有一轮技术面试
    const email_template_value = rounds?.[0]?.email_template ?? ''
    if (email_template_value && interviewType.value === ScheduleViewEnum.GROUP) {
      const emailResult = await getEmailTemplateDetail(email_template_value)
      const detail = emailResult.result as EmailTemplate.DetailInfo
      state.emailDetail = detail ?? {}
    }
  })
}

const changeForm = (item: Form.FormItem) => {
  // 更新缓存字段里对应的值
  if (state.selectSessionStep && !state.stepInterviewMap?.[state.selectSessionStep as number]) {
    state.stepInterviewMap[state.selectSessionStep] = {}
  }
  // 只有群面可以修改candidates，而群面不能更改步骤和流程因此这里不需要更新缓存的数据
  if (item.prop === 'candidates') {
    const filterOptions = item.options?.filter((obj: Form.FormSelect) => {
      return item.value.includes(obj.value)
    })
    const existResumeIds = state.userEmailList?.map(info => info.id)
    const userEmailList: UserEmail[] = []
    const emailEmptyUserList: string[] = []
    const candidates: any = []
    filterOptions?.forEach((data: Form.FormSelect) => {
      const index = existResumeIds?.indexOf(data.value)
      let userEmail: any = {}
      userEmail = index !== -1 ? cloneDeep(state.userEmailList?.[index] ?? {}) : {
        id: data.value,
        name: data.label,
        isSubjectEmpty: false,
        isError: false,
        subject: state.emailDetail?.subject ?? '',
        content: state.emailDetail?.content ?? '',
        parseContent: state.emailDetail?.content ? parseEmailContent(state.emailDetail.content, data.value) : ''
      }
      data.applying_position_title = state.jobPosition
      candidates.push(data)
      if (!state.candidateInfoMap?.[data.value]) {
        state.candidateInfoMap[data.value] = data
      }
      userEmailList.push(userEmail)
      if (!data.email) {
        emailEmptyUserList.push(data.label)
      }
    })
    state.userEmailList = [...userEmailList]
    state.emailEmptyUserList = [...emailEmptyUserList]
    selectedCandidateIds.value = item.value
    // 如果当前选中的员工被删除了，则默认选中第一个员工
    if (!item.value?.includes(state.selectUserResumeId)) {
      state.selectUserResumeId = item.value?.[0]
    }
    if (state.emailEmptyUserList.length > 0) {
      item.isFound = true
      item.showBtn = true
      item.text = $t('message.emptyEmailLimit', {
        name: state.emailEmptyUserList.join(' & ')
      })
    } else {
      item.isFound = false
      item.showBtn = false
      item.text = ''
    }
    state.stepInterviewMap[state.selectSessionStep!].userEmailList = [...userEmailList]
    state.stepInterviewMap[state.selectSessionStep!].candidates = [...candidates]
    return
  }
  if (item.prop === 'info_candidate') {
    state.showEmailTemplate = item.value
  }
  // 这里更新interviewerList的值供详情页面更新使用
  if (item.prop === 'interviewers') {
    const interviewerList: any = []
    item.options?.forEach((data: Form.FormSelect) => {
      if (item.value.includes(data.email)) {
        interviewerList.push(data)
      }
    })
    state.stepInterviewMap[state.selectSessionStep as number].interviewerList = [...interviewerList]
  }

  // 切换is online按钮
  if (item.prop === 'interview_location') {
    item.required = item.switchValue ? false : true
    if (item.switchValue === true) {
      interviewRef.value.clearValidate(item.prop)
    }
  }
  state.stepInterviewMap[state.selectSessionStep as number][item.prop] = item.value
  if (item.switchValue === true || item.switchValue === false) {
    state.stepInterviewMap[state.selectSessionStep as number]['is_online'] = item.switchValue
  }
}

// 修改选择的email template模版
const changeSelectTemplate = (item: Form.FormItem) => {
  if (state.selectSessionStep && !state.stepInterviewMap?.[state.selectSessionStep as number]) {
    state.stepInterviewMap[state.selectSessionStep] = {}
  }
  if (item.prop === 'email_template') {
    state.selectEmailTemplate = item.value
    nextTick(async () => {
      const result = await getEmailTemplateDetail(item.value)
      const detail = result.result as EmailTemplate.DetailInfo
      state.emailDetail = detail ?? {}
      state.userEmailList.forEach((data: UserEmail) => {
        data.content = detail.content
        data.subject = detail.subject
        data.isSubjectEmpty = !data.subject
        data.isError = !data.content
        data.parseContent = parseEmailContent(detail.content, data.id)
      })
      // 更新对应缓存数据里的值
      state.stepInterviewMap[state.selectSessionStep as number].userEmailList = cloneDeep(state.userEmailList)
      state.stepInterviewMap[state.selectSessionStep as number].emailTemplate = state.emailTemplateList?.find(info => info.value === item.value)?.label ?? ''
    })
  }
  state.stepInterviewMap[state.selectSessionStep as number][item.prop] = item.value
  const formData = getObjectByForms(state.baseForm)
  if (formData.interviewTime) {
    state.stepInterviewMap[state.selectSessionStep as number]['interviewTime'] = formData.interviewTime
  }
}
// 修改选中的interview process模版
const changeInterviewProcess = () => {
  getInterviewProcessRounds()
}
// 修改邮件主题
const changeSubject = (item: UserEmail) => {
  item.isSubjectEmpty = !item.subject

  // 更新对应缓存数据里的值
  if (state.selectSessionStep && state.stepInterviewMap?.[state.selectSessionStep]) {
    state.stepInterviewMap[state.selectSessionStep as number].userEmailList = cloneDeep(state.userEmailList)
  }
}

// 设置form表单数据
const setFormData = (data: Form.FormSelect) => {
  // 获取之前可能已经编辑的数据
  const stepInterview = state.stepInterviewMap?.[data.id] ?? {}
  state.baseForm.forEach((d: Form.FormItem) => {
    // 目前绑定的候选人不可以修改，因此直接获取页面默认
    if (d.prop === 'candidates') {
      d.value = data.status === ScheduleViewStatusEnum.SCHEDULED || data.status === ScheduleViewStatusEnum.IN_PROGRESS ? stepInterview?.candidates?.map((info: ScheduleInterview.Candidate) => info.candidate_resume_id) : selectedCandidateIds.value
    } else if (d.prop === 'interviewTime') {
      d.value = stepInterview?.[d.prop as keyof ScheduleInterview.InterviewInfo] ?? undefined
      // 根据当前选择的时间回显数据，如果没有选择过则显示默认时间，时间格式：yyyy-mm-dd hh:mm:ss
      d.startDate = d.value ? d.value[0].substr(0, 10) : '' // 格式: yyyy-mm-dd
      d.endDate = d.value ? d.value[1].substr(0, 10) : '' // 格式: yyyy-mm-dd
      d.startTime = d.value ? d.value[0].substr(11, 5) : '' // 格式: hh:mm
      d.endTime = d.value ? d.value[1].substr(11, 5) : '' // 格式: hh:mm
      d.timeRange = d.value ? getTimeRange(d.value[0], d.value[1]) : ''
    } else if (d.prop === 'info_interviewer' || d.prop === 'info_candidate') {
      // 如果是新增页面的tab切换，默认选中；如果是已提交的数据回显的话如果没有值则不选中
      const defalutValue = data.status === ScheduleViewStatusEnum.SCHEDULED || data.status === ScheduleViewStatusEnum.IN_PROGRESS ? false : true
      d.value = stepInterview?.[d.prop as keyof ScheduleInterview.InterviewInfo] ?? defalutValue
    } else {
      d.value = stepInterview?.[d.prop as keyof ScheduleInterview.InterviewInfo] ?? ''
      if (d.prop === 'interview_location') {
        d.switchValue = stepInterview?.['is_online'] ?? false
      }
    }
    if (d.prop === 'info_candidate') {
      state.showEmailTemplate = d.value
    }
    interviewRef.value?.changeFormModel(
      {
        prop: d.prop,
        value: d.value
      },
      true
    )
  })
  state.templateForm.forEach((d: Form.FormItem) => {
    if (d.prop) {
      d.value = stepInterview?.[d.prop as keyof ScheduleInterview.InterviewInfo] ?? ''
    }
    templateRef.value?.changeFormModel(
      {
        prop: d.prop,
        value: d.value
      },
      true
    )
  })
  state.selectEmailTemplate = stepInterview?.['email_template'] ?? ''
  state.userEmailList = cloneDeep(stepInterview?.['userEmailList'] ?? state.cacheUserEmailList)
  interviewRef.value?.clearValidate()
  templateRef.value?.clearValidate()
}

// 修改选择的面试流程step
const changeStep = (data: Form.FormSelect) => {
  state.selectSessionStep = data.id
  state.selectSessionStepType = data.value
  // 设置form表单数据
  setFormData(data)
}
// 打开interview process调整step弹窗
const openDialog = () => {
  state.showProcessDialog = true
}
// 关闭
const closeProcessDialog = (id?: number, processList?: Form.FormSelect[]) => {
  state.showProcessDialog = false
  // 如果有返回保存的id则需要缓存起来 保存过里面的顺序再保存或者send的时候需要传id
  if (id) {
    state.interviewId = id
  }
  if (processList && processList?.length > 0) {
    state.sessionStepList = cloneDeep(processList)
    // 默认选中最后一个面试
    let dataIndex = state.sessionStepList?.length - 1
    const sessionStep = state.sessionStepList?.[dataIndex] ?? {}
    state.selectSessionStep = sessionStep?.id
    state.selectSessionStepType = sessionStep?.value
    state.sessionStepList?.forEach(data => {
      // 更新缓存字段里对应的值
      if (state.selectSessionStep && !state.stepInterviewMap?.[data.id]) {
        state.stepInterviewMap[data.id] = {}
      }
      state.stepInterviewMap[data.id].candidates = cloneDeep(state.candidates)
      state.stepInterviewMap[data.id].info_candidate = true
      state.stepInterviewMap[data.id].status = data.status
      state.stepInterviewMap[data.id].cancelable = data?.cancelable ?? false
      state.stepInterviewMap[data.id].modifiable = data?.modifiable ?? false
    })
    state.cloneInterviewData = cloneDeep(state.stepInterviewMap)
    // 设置form表单数据
    setFormData(sessionStep)
  }
}

// 取消预约的面试
const cancelScheduleInterview = (data?: any) => {
  const detailFormData = state.stepInterviewMap?.[state.selectSessionStep as number] ?? []
  const interviewDate = detailFormData?.interviewTime?.[0]?.substr(0, 10)
  const startTime = detailFormData?.interviewTime?.[0]?.substr(11, 5)
  const endTime = detailFormData?.interviewTime?.[1]?.substr(11, 5)
  const interviewTime = detailFormData?.interviewTime?.[0] ? `${startTime}-${endTime}` : ''
  const candidates = detailFormData?.candidates?.map((info: any) => info.candidate_name)?.join(', ')
  const interviewType = InterviewSession?.[state.selectSessionStepType]?.name
  mittBus.emit(OPEN_DIALOG, {
    title: $t('scheduleInterview.cancelInterview'),
    content: $t('message.cancelInterview', {
      candidates: data ? data.candidate_name : candidates,
      interviewType: interviewType,
      interviewTime: interviewTime,
      interviewDate: interviewDate
    }),
    center: 'center',
    size: 'small',
    confirm: () => {
      const param: ScheduleInterview.CancelParam = {
        interview_id: state.interviewId as number,
        round_id: state.selectSessionStep as number
      }
      if (data && data.candidate_resume_id) {
        param.candidate_resume_id = data.candidate_resume_id
      }
      cancelSchedule(param).then(res => {
        if (res.result) {
          ElMessage.success({ message: $t('message.cancelSuc') })
          goBack(true)
        }
      })
    }
  })
}

// 进入编辑状态
const changeToEdit = () => {
  isDetail.value = false
  state.cloneInterviewData = cloneDeep(state.stepInterviewMap)
}
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
