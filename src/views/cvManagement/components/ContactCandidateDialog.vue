<template>
  <div class="dialog-form-wrap middle-dialog" v-if="dialogVisible">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="$t('button.contactCandidate')"
      :close-on-click-modal="false"
      close-icon="CircleClose"
      @close="closeDialog()"
    >
      <EspForm ref="espFormRef" v-model="state.baseForm" class="info-form-wrap" />
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

<script setup lang="ts" name="ContactCandidateDialog">
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash'
import { EmailTemplateParamEnum } from '@/enums/emailTemplateParamEnum'
import { useGlobalStore } from '@/store/modules/global'
import { CONTACT_EMAIL_TEMPLATE_FORM, CONTACT_CANDIDATE_FORM } from '../data'
import { getEmailTemplateDetail, getEmailTemplateListByJob } from '@/api/modules/emailTemplate'
import EmailTemplate from '@/api/interface/emailTemplate'
import { getObjectByForms } from '@/utils'
import CV from '@/api/interface/cv'
import { sendMailToCantidate } from '@/api/modules/cv'
import moment from 'moment'
import { DATE_FORMAT } from '@/config'
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
  baseForm: cloneDeep(CONTACT_CANDIDATE_FORM),
  templateForm: cloneDeep(CONTACT_EMAIL_TEMPLATE_FORM),
  // 当前选择的email template模版
  selectEmailTemplate: '',
  // 是否通知candidate显示email template模块
  showEmailTemplate: true,
  // 用于富文本编辑框的选项配置项列表
  selectOptions: EmailTemplateParamEnum,
  // 邮箱为空的用户列表
  emailEmptyUserList: [],
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
const parseEmailContent = (content: string, userId: number) => {
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
  setTimeout(async () => {
    const isBasicPass = espFormRef.value.validateFrom && (await espFormRef.value.validateFrom())
    const isEmailPass = state.showEmailTemplate
      ? templateRef.value.validateFrom && (await templateRef.value.validateFrom())
      : true
    if (isBasicPass && isEmailPass) {
      if (state.showEmailTemplate && (state.email.isSubjectEmpty || state.email.isError)) {
        ElMessage.error($t('form.requiredError'))
        return
      }
      const baseParam = getObjectByForms(state.baseForm)
      const candidates: CV.ContactCandidate[] = []
      state.candidates.forEach((id: number) => {
        let content = state.showEmailTemplate ? parseEmailContent(state.email.content, id) : ''
        candidates.push({
          candidate_resume_id: id,
          email_subject: state.showEmailTemplate ? state.email.subject : '',
          email_body: content
        })
      })
      const formData: CV.ContactCandidateParam = {
        candidate_mails: [...candidates],
        bcc_users: baseParam?.bcc_users ?? []
      }
      sendMailToCantidate(formData).then(res => {
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
    candidateMap[data.value] = { ...data }
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

// 关闭并清空弹窗数据
const closeDialog = (needCallback?: boolean) => {
  dialogVisible.value = false
  // 清空弹窗数据恢复初始值
  state.baseForm.forEach(data => {
    data.value = undefined
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
