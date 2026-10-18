<template>
  <div class="dialog-form-wrap middle-dialog" v-if="dialogVisible">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="$t('cv.moveToPool')"
      :close-on-click-modal="false"
      close-icon="CircleClose"
      @close="closeDialog()"
    >
      <EspForm
        ref="espFormRef"
        v-model="state.baseForm"
        class="info-form-wrap"
        :change-form="changeBaseForm"
      />
      <div v-if="state.showEmailTemplate">
        <EspForm
          ref="templateRef"
          v-model="state.templateForm"
          :changeForm="changeSelectTemplate"
        />
        <el-row :gutter="20" class="email-panel" v-if="state.selectEmailTemplate">
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
      <template #footer>
        <ElButton @click="closeDialog()">{{ $t('button.cancel') }}</ElButton>
        <ElButton class="btn-primary-gradient" @click="confirm" :disabled="!state.canConfirm">
          {{ $t('button.confirm') }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="TalentPoolDialog">
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash'
import { EmailTemplateParamEnum } from '@/enums/emailTemplateParamEnum'
import { useGlobalStore } from '@/store/modules/global'
import { EMAIL_TEMPLATE_FORM, MOVE_TALENT_POOP_FORM } from '../data'
import { getEmailTemplateDetail, getEmailTemplateListByJob } from '@/api/modules/emailTemplate'
import EmailTemplate from '@/api/interface/emailTemplate'
import { getThirtyMinutesTimeRange, getObjectByForms } from '@/utils'
import CV from '@/api/interface/cv'
import { moveToPool } from '@/api/modules/cv'
import moment from 'moment'
import { DATE_FORMAT, TIME_FORMAT } from '@/config'
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
  baseForm: Form.FormItem[]
  templateForm: Form.FormItem[]
  showEmailTemplate: boolean
  selectOptions: any
  userEmailList: UserEmail[]
  selectUserResumeId: number
  emailTemplateList: Form.FormSelect[]
  selectEmailTemplate: number | string
  emailEmptyUserList: string[]
  candidateInfoMap: any
  candidates: Form.FormSelect[]
  canConfirm: boolean
}

interface DialogProps {
  userList: Form.FormSelect[]
}

const { $t } = useLocale()
const espFormRef = ref()
const templateRef = ref()
const quillEditorRefs = ref<any>([])
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(MOVE_TALENT_POOP_FORM),
  templateForm: cloneDeep(EMAIL_TEMPLATE_FORM),
  // emailTemplate 下拉列表
  emailTemplateList: [],
  // 当前选择的email template模版
  selectEmailTemplate: '',
  // 是否通知candidate显示email template模块
  showEmailTemplate: true,
  // 用于富文本编辑框的选项配置项列表
  selectOptions: EmailTemplateParamEnum,
  // 当前选择的员工列表
  userEmailList: [],
  // 当前选择的员工对应的简历id
  selectUserResumeId: 0,
  // 邮箱为空的用户列表
  emailEmptyUserList: [],
  // 缓存员工的基础信息
  candidateInfoMap: {},
  // 页面选择的员工
  candidates: [],
  // 是否可以confrim
  canConfirm: false
})
const emit = defineEmits(['close'])
// dialog框状态
const dialogVisible = ref<boolean>(false)
const globalStore = useGlobalStore()

const changeTab = (value: number) => {
  state.selectUserResumeId = value
}

// 修改默认form表单
const changeBaseForm = (item: Form.FormItem) => {
  if (item.prop === 'send_thanks_letter') {
    state.showEmailTemplate = item.value
    state.canConfirm = !item.value || (item.value && state.emailEmptyUserList.length === 0)
    const index = state.baseForm.findIndex(info => info.prop === 'send_time')
    state.baseForm[index].isHide = !item.value
  }
  // 如果选择的是今天则当前时间之前的时间不可选，选择的是明天及以后则不限制
  if (item.prop === 'send_time') {
    item.disableTime = item?.upToNow ?? false
    const today = moment(new Date()).format(DATE_FORMAT)
    const currentTime = getThirtyMinutesTimeRange()
    const startFullDate = `${today} ${currentTime.startTime}:00`
    const thirtyMinutesAgo = new Date(startFullDate).setMinutes(new Date(startFullDate).getMinutes() - 30)
    item.disableStartTime = item.startDate === today ? moment(thirtyMinutesAgo).format(TIME_FORMAT) : ''
  }
}
// 修改邮件主题
const changeSubject = (item: UserEmail) => {
  item.isSubjectEmpty = !item.subject
}

const setItemRef = (el: HTMLElement, index: number) => {
  if (el) {
    quillEditorRefs.value[index] = el
  }
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
        const sendDateIndex = state.baseForm.findIndex(info => info.prop === 'send_time')
        const data: any = {
          sendDate: state.baseForm[sendDateIndex].value,
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
      state.userEmailList.forEach((data: UserEmail) => {
        data.content = detail.content
        data.subject = detail.subject
        data.isSubjectEmpty = !data.subject
        data.isError = !data.content
        data.parseContent = parseEmailContent(detail.content, data.id)
      })
    })
  }
}

// 更新content
const updateContent = (content: string, index: number) => {
  state.userEmailList[index].isError = content === ''
  state.userEmailList[index].content = content
  state.userEmailList[index].parseContent = parseEmailContent(content, state.userEmailList[index].id)
}

const confirm = () => {
  setTimeout(async() => {
    const isBasicPass = espFormRef.value.validateFrom && (await espFormRef.value.validateFrom())
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
      const candidates: CV.EmailInfo[] = []
      state.userEmailList.forEach((data: UserEmail) => {
        let content = state.showEmailTemplate ? parseEmailContent(data.content, data.id) : ''
        candidates.push({
          resume_id: data.id,
          email_subject: state.showEmailTemplate ? data.subject : '',
          email_content: content
        })
      })
      const formData: CV.MoveTalentPoolInfo = {
        pooled_reason: baseParam.pooled_reason,
        comments: baseParam.comments,
        send_thanks_letter: baseParam.send_thanks_letter,
        resumes: candidates
      }
      if (formData.send_thanks_letter) {
        formData.send_immediately = baseParam.send_immediately
        formData.send_time = baseParam.send_time
      }
      moveToPool(formData).then(res => {
        if (res?.success) {
          ElMessage.success({ message: $t('message.moveSuc') })
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
  const userEmailList: UserEmail[] = []
  const emailEmptyUserList: string[] = []
  userList.forEach(data => {
    candidates.push(data.value)
    candidateMap[data.value] = {...data}
    userEmailList.push({
      id: data.value,
      name: data.label,
      isSubjectEmpty: false,
      isError: false,
      subject: '',
      content: '',
      parseContent: ''
    })
    if (!data.email) {
      emailEmptyUserList.push(data.label)
    }
  })

  state.userEmailList = [...userEmailList]
  state.emailEmptyUserList = [...emailEmptyUserList]
  state.selectUserResumeId = candidates?.[0]
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
  // 点击弹窗的时候重新获取日期限制
  const today = moment(new Date()).format(DATE_FORMAT)
  const currentTime = getThirtyMinutesTimeRange()
  const startFullDate = `${today} ${currentTime.startTime}:00`
  const thirtyMinutesAgo = new Date(startFullDate).setMinutes(new Date(startFullDate).getMinutes() - 30);
  const sendTimeIndex = state.baseForm.findIndex(info => info.prop === 'send_time')
  state.baseForm[sendTimeIndex].startTime = currentTime.startTime
  state.baseForm[sendTimeIndex].disableStartTime = moment(thirtyMinutesAgo).format(TIME_FORMAT)
  state.baseForm[sendTimeIndex].disableStartDate = today
  state.baseForm[sendTimeIndex].value = startFullDate
  state.baseForm[sendTimeIndex].startDate = today

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
    data.value = data.prop === 'send_thanks_letter' ? true : undefined
    const today = moment(new Date()).format(DATE_FORMAT)
    const currentTime = getThirtyMinutesTimeRange()
    const startFullDate = `${today} ${currentTime.startTime}:00`
    if (data.prop === 'send_time') {
      data.startDate = today
      data.startTime = currentTime.startTime
      data.value = startFullDate
      data.isHide = false
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
