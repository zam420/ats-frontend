<template>
  <div class="dialog-form-wrap middle-dialog" v-if="dialogVisible">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="$t('button.sendWrittenTest')"
      :close-on-click-modal="false"
      close-icon="CircleClose"
      @close="closeDialog()"
    >
      <EspForm
        ref="espFormRef"
        v-model="state.baseForm"
        class="info-form-wrap"
        :changeForm="changeBaseForm"
      />
      <div v-if="state.showEmailTemplate">
        <EspForm
          ref="templateRef"
          v-model="state.templateForm"
          :changeForm="changeSelectTemplate"
        />
        <el-row :gutter="20" class="email-panel" v-if="state.selectEmailTemplate">
          <el-col :span="24" class="el-form-item is-required asterisk-right">
            <div class="email-content high">
              <el-input 
                v-model="state.email.subject"
                @change="changeSubject()"
                :class="{ error: state.email.isSubjectEmpty }"
              ></el-input>
              <EspQuillEditor
                :hideLabel="true"
                :class="{ error: state.email.isError }" 
                v-model:content="state.email.content"
                :select-options="state.selectOptions" 
                :parseContent="state.email.parseContent"
                :updateCallback="(data: any) => { updateContent(data) }"
                />
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <ElButton @click="closeDialog()">{{ $t('button.cancel') }}</ElButton>
        <ElButton class="btn-primary-gradient" @click="confirm" :disabled="!state.canConfirm">
          {{ $t('button.confirm') }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="SendWrittenTest">
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash'
import { EmailTemplateParamEnum } from '@/enums/emailTemplateParamEnum'
import { useGlobalStore } from '@/store/modules/global'
import { EMAIL_TEMPLATE_FORM, SEND_WRITTEN_TEST_FORM } from '../data'
import { getEmailTemplateDetail, getEmailTemplateListByJob } from '@/api/modules/emailTemplate'
import EmailTemplate from '@/api/interface/emailTemplate'
import { getThirtyMinutesTimeRange } from '@/utils'
import CV from '@/api/interface/cv'
import { getTestPapper, sendWrittenTest } from '@/api/modules/cv'
import moment from 'moment'
import { DATE_FORMAT, TIME_FORMAT } from '@/config'
interface UserEmail {
  isSubjectEmpty: boolean
  isError: boolean
  subject: string
  content: string
  parseContent: string
}

interface ReactiveParams {
  baseForm: Form.FormItem[]
  templateForm: Form.FormItem[]
  showEmailTemplate: boolean
  selectOptions: any
  selectEmailTemplate: number | string
  emailEmptyUserList: string[]
  paperMap: any
  candidateInfoMap: any
  candidates: number[]
  canConfirm: boolean
  email: UserEmail
}

interface DialogProps {
  userList: Form.FormSelect[]
}

const { $t } = useLocale()
const espFormRef = ref()
const templateRef = ref()
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(SEND_WRITTEN_TEST_FORM),
  templateForm: cloneDeep(EMAIL_TEMPLATE_FORM),
  // 当前选择的email template模版
  selectEmailTemplate: '',
  // 是否通知candidate显示email template模块
  showEmailTemplate: true,
  // 用于富文本编辑框的选项配置项列表
  selectOptions: EmailTemplateParamEnum,
  // 邮箱为空的用户列表
  emailEmptyUserList: [],
  // 缓存paper的信息，用于替换邮件
  paperMap: {},
  // 缓存员工的基础信息
  candidateInfoMap: {},
  // 页面选择的员工
  candidates: [],
  // 是否可以confrim
  canConfirm: false,
  // 发送的邮件体
  email: {
    isSubjectEmpty: false,
    isError: false,
    subject: '',
    content: '',
    parseContent: ''
  }
})
const emit = defineEmits(['close'])
// dialog框状态
const dialogVisible = ref<boolean>(false)
const globalStore = useGlobalStore()

// 修改邮件主题
const changeSubject = () => {
  state.email.isSubjectEmpty = state.email.subject === ''
}

// 解析邮件内容
const parseEmailContent = (content: string, userId: number, paperId: number) => {
  const html = new DOMParser().parseFromString(content, 'text/html')
  const dom = html.querySelector('body')
  if (dom) {
    const domSpans = dom.querySelectorAll('.ql-esp-select') ?? []
    for (let i = 0; i < domSpans.length; i++) {
      const domSpan: any = domSpans[i]
      const key = domSpan.dataset.value
      if (['sendDate', 'userName'].includes(key)) {
        const data: any = {
          sendDate: moment(new Date()).format(DATE_FORMAT),
          userName: globalStore.userInfo?.name ?? ''
        }
        domSpan.innerText = data?.[key] ? data?.[key] : domSpan.innerText
      } else if (key === 'writtenTestTime') {
        const paper = state.paperMap?.[paperId] ?? {}
        const writtenTestTime = paper.begin_time ? `${paper.begin_time} ~ ${paper.end_time}` : ''
        domSpan.innerText = writtenTestTime ?? domSpan.innerText
      } else {
        domSpan.innerText = state.candidateInfoMap?.[userId]?.[key]
          ? state.candidateInfoMap?.[userId]?.[key]
          : domSpan.innerText
      }
    }
  }
  return (dom as HTMLBodyElement).innerHTML
}

// 修改选择的email template模版
const changeSelectTemplate = (item: Form.FormItem) => {
  if (item.prop === 'email_template') {
    state.selectEmailTemplate = item.value
    nextTick(async () => {
      const result = await getEmailTemplateDetail(item.value)
      const detail = result.result as EmailTemplate.DetailInfo
      state.email.content = detail.content
      state.email.subject = detail.subject
      state.email.isSubjectEmpty = state.email.subject === ''
      state.email.isError = state.email.content === ''
    })
  }
}

// 更新content
const updateContent = (content: string) => {
  state.email.isError = content === ''
  state.email.content = content
}

const confirm = () => {
  setTimeout(async() => {
    const isBasicPass = espFormRef.value.validateFrom && (await espFormRef.value.validateFrom())
    const isEmailPass = state.showEmailTemplate
      ? templateRef.value.validateFrom && (await templateRef.value.validateFrom())
      : true
    if (isBasicPass && isEmailPass) {
      if (state.showEmailTemplate && (state.email.isSubjectEmpty || state.email.isError)) {
        ElMessage.error($t('form.requiredError'))
        return
      }
      const paper = state.baseForm.find(data => data.prop === 'paper_id')
      const paper_id = paper?.value
      const paper_name = state.paperMap?.[paper?.value!]?.paper_name ?? ''
      const candidates: CV.EmailInfo[] = []
      state.candidates.forEach((id: number) => {
        let content = state.showEmailTemplate ? parseEmailContent(state.email.content, id, paper_id) : ''
        candidates.push({
          resume_id: id,
          email_content: content
        })
      })
      const formData: CV.WrittenTest = {
        paper_id: paper_id,
        paper_name: paper_name,
        begin_time: state.paperMap?.[paper?.value!]?.begin_time ?? '',
        end_time: state.paperMap?.[paper?.value!]?.end_time ?? '',
        email_subject: state.email.subject ?? '',
        email_resumes: candidates
      }
      sendWrittenTest(formData).then(res => {
        if (res?.success) {
          ElMessage.success({ message: $t('message.sendSuc') })
          // 关闭弹窗
          closeDialog(true)
        }
      })
    }
  }, 300)
}

// 接收父组件传过来的参数
const acceptParams = async (params: DialogProps) => {
  const userList = params?.userList ?? []
  const candidates: number[] = []
  const candidateMap: any = {}
  const emailEmptyUserList: string[] = []
  userList.forEach(data => {
    candidates.push(data.value)
    candidateMap[data.value] = {...data}
    if (!data.email) {
      emailEmptyUserList.push(data.label)
    }
  })
  state.candidates = [...candidates]
  state.emailEmptyUserList = [...emailEmptyUserList]
  state.canConfirm = state.emailEmptyUserList.length === 0
  const resumesIdIndex = state.baseForm.findIndex(info => info.prop === 'resumes_ids')
  if (emailEmptyUserList.length > 0) {
    state.baseForm[resumesIdIndex].isFound = true
    state.baseForm[resumesIdIndex].text = $t('message.emptyEmailLimit', {
      name: emailEmptyUserList.join(' & ')
    })
  } else {
    state.baseForm[resumesIdIndex].isFound = false
    state.baseForm[resumesIdIndex].text = ''
  }
  state.baseForm[resumesIdIndex].options = [...userList]
  state.baseForm[resumesIdIndex].value = [...candidates]
  state.candidateInfoMap = { ...candidateMap }
  // 获取test paper下拉的值
  const result = await getTestPapper()
  const data = result?.result ?? []
  const options: Form.FormSelect[] = []
  const paperMap: any = {}
  data.forEach(paper => {
    options.push({
      label: paper?.paper_name ?? '',
      value: paper.paper_id
    })
    paperMap[paper.paper_id!] = paper
  })
  const paperIndex = state.baseForm.findIndex(info => info.prop === 'paper_id')
  state.baseForm[paperIndex].options = [...options]
  state.paperMap = { ...paperMap }
  const job_id: number[] = userList?.map(data => data.applying_position)
  const jobIds = [...new Set(job_id)]
  // 获取email template下拉的值
  const emailTemplateResult = await getEmailTemplateListByJob(jobIds)
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
  dialogVisible.value = true
}

// change base form 
const changeBaseForm = (item: Form.FormItem) => {
  if (item.prop === 'writtenTestPaper') {
    const paper = item?.options?.find(data => data.paper_id === item.value)
    // 如果试卷不是长期有效则清空时间并限制下列的时间选择
    if (!paper?.forever) {
      const today = moment(new Date()).format(DATE_FORMAT)
      const index = state.baseForm.findIndex(info => info.prop === 'testTime')
      let startDate = paper?.begin_time?.substr(0, 10)
      let endDate = paper?.end_time?.substr(0, 10)
      // 获取到的是离试卷配置的开始结束时间最近的整点时间(30分钟为一个整点),格式为时:分
      const beginTime = getThirtyMinutesTimeRange(paper?.begin_time)?.startTime
      let endTime = getThirtyMinutesTimeRange(paper?.end_time)?.startTime
      // 如果试卷的结束时间是00:00:00则限制时间范围只能选到当前时间的前一天,time选择器不限制
      if (paper?.end_time?.substr(11, 5) === '00:00') {
        endDate = moment(new Date(paper?.end_time)?.getTime() - (24 * 60 * 60 * 1000)).format(DATE_FORMAT)
        endTime = ''
      }
      // 如果试卷的开始时间在今天之前，限制从今天开始
      if (startDate < today) {
        startDate = today
      }
      const startFullDate = `${startDate} ${beginTime}:00`
      // 由于time下拉框设置最小值后，当前值不可以选，这里往前推30分钟，保证当前值是可选的
      const startTimethirtyMinutesAgo = new Date(startFullDate).setMinutes(new Date(startFullDate).getMinutes() - 30);
      // 可选的最大时间范围的开始时间和结束时间
      state.baseForm[index].disableStartTimeDate = startDate
      state.baseForm[index].disableEndTimeDate = endDate
      // 可根据选择时间变化的开始/结束时间互相限制
      state.baseForm[index].disableStartDate = startDate
      state.baseForm[index].disableEndDate = endDate
      // 可选的最大时间范围的时分的时间限制
      state.baseForm[index].disableStartTime = moment(startTimethirtyMinutesAgo).format(TIME_FORMAT)
      state.baseForm[index].disableEndTime = endTime
      // 清空已选择的数据
      state.baseForm[index].startDate = ''
      state.baseForm[index].endDate = ''
      state.baseForm[index].startTime = ''
      state.baseForm[index].endTime = ''
      state.baseForm[index].value = undefined
      state.baseForm[index].timeRange = ''
    }
  }
}

// 关闭并清空弹窗数据
const closeDialog = (needCallback?: boolean) => {
  dialogVisible.value = false
  // 清空弹窗数据恢复初始值
  state.baseForm.forEach(data => {
    data.value = undefined
    if (data.prop === 'testTime') {
      data.startDate = ''
      data.endDate = ''
      data.startTime = ''
      data.endTime = ''
      data.timeRange = ''
    }
  })
  state.templateForm.forEach(data => {
    data.value = undefined
  })
  state.showEmailTemplate = true
  state.selectEmailTemplate = ''
  if (needCallback) {
    emit('close')
  }
}
defineExpose({
  acceptParams
})
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
