<template>
  <EspMain :title="title">
    <template #right>
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
    </template>
    <EspForm ref="templateRef" v-model="state.baseForm" />
    <EspQuillEditor
      ref="quillEditorRef"
      :class="{ error: state.isError }"
      v-model:content="state.content"
      :select-options="state.selectOptions"
    />
  </EspMain>
</template>
<script setup lang="ts" name="EmailTemplateForm">
import { cloneDeep } from 'lodash-es'
import { EMAIL_FORM } from '../data'
import { getObjectByForms } from '@/utils'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_SETTINGS_EMAIL_TEMPLATE } from '@/router/routerName'
import { EmailTemplateParamEnum } from '@/enums/emailTemplateParamEnum'
import EmailTemplate from '@/api/interface/emailTemplate'
import { saveEmailTemplate, getEmailTemplateDetail } from '@/api/modules/emailTemplate'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'

interface ParamsProps {
  title: string // 标题
  id?: number // 数据ID
  isEdit: boolean // 是否编辑
}

interface ReactiveParams {
  baseForm: Form.FormItem[]
  isError: boolean
  selectOptions: any
  content: string
}
const router = useRouter()
const { $t } = useLocale()

const templateRef = ref()
const quillEditorRef = ref()

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false
})
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(EMAIL_FORM),
  isError: false,
  selectOptions: EmailTemplateParamEnum,
  content: ''
})

const save = async () => {
  const isBasicPass = templateRef.value.validateFrom && (await templateRef.value.validateFrom())
  const validateQuill = quillEditorRef.value && quillEditorRef.value.validate()
  if (isBasicPass && validateQuill) {
    const baseForm = getObjectByForms(state.baseForm)
    const formData: Record<string, any> = { ...baseForm }
    if (props.isEdit) {
      formData.id = props.id
    }
    formData.content = quillEditorRef.value.getContent()
    saveEmailTemplate(formData as EmailTemplate.EmailInfo).then(res => {
      if (res?.success) {
        ElMessage.success({ message: $t('message.saveSuc') })
        goBack()
        return
      }
      ElMessage.error({ message: res?.message })
    })
  }
}

const goBack = () => {
  if (router?.options?.history?.state?.back) {
    router.go(-1)
    return
  }
  router.replace({
    path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE}`
  })
}

const initData = () => {
  if (props.id) {
    getEmailTemplateDetail(props.id).then(res => {
      const result = (res.result ?? {}) as EmailTemplate.DetailInfo
      state.baseForm.map((item: Form.FormItem) => {
        let prop = item.prop as keyof EmailTemplate.DetailInfo
        item.value = result?.[prop]
        if (item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT) {
          item.defaultExpendKeys = item?.value ?? []
        }
        templateRef.value &&
          templateRef.value.changeFormModel({
            prop: item.prop,
            value: item.value
          })
        return item
      })
      state.content = result?.content ?? ''
    })
  }
}
nextTick(() => {
  if (props.isEdit) {
    setTimeout(() => {
      initData()
    }, 100)
    return
  }
})
</script>
