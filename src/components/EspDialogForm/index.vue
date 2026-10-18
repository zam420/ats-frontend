<template>
  <div class="dialog-form-wrap" :class="dialogData.size">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="dialogData.title"
      :close-on-click-modal="dialogData.closeOnClickModal"
      close-icon="CircleClose"
    >
      <EspForm
        ref="espFormRef"
        v-model="baseForm"
        class="info-form-wrap"
        :change-form="changeForm"
      />
      <slot></slot>
      <template #footer v-if="!dialogData.isView">
        <ElButton @click="dialogVisible = false">{{ $t('button.cancel') }}</ElButton>
        <ElButton class="btn-primary-gradient" @click="handleSubmit">
          {{ $t('button.confirm') }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="EspDialogForm">
import EspForm from '@/components/EspForm/index.vue'
import { ResultEnum } from '@/enums/httpEnum'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

interface DialogProps {
  title: string
  isView?: boolean
  size?: 'small' | 'middle'
  formData: Form.FormItem[]
  rowData?: Record<string, any>
  closeOnClickModal?: boolean
  apiUrl?: (params: any) => Promise<any>
  getTableList?: () => Promise<any>
  changeForm?: (params: any) => void // 表单改变
  confirm?: (params: any) => void
  message?: string
}

// dialog框状态
const dialogVisible = ref<boolean>(false)
const espFormRef = ref()
const dialogData = ref<DialogProps>({
  isView: false,
  title: '',
  size: 'small',
  closeOnClickModal: false,
  formData: [],
  rowData: {}
})
const baseForm = ref<Form.FormItem[]>([])

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps) => {
  dialogData.value = params
  dialogData.value.closeOnClickModal = params?.closeOnClickModal ?? false
  console.log('dialogData.value.closeOnClickModal', dialogData.value.closeOnClickModal)
  baseForm.value = dialogData.value.formData ?? []
  if (dialogData.value.rowData && Object.keys(dialogData.value.rowData).length) {
    baseForm.value = baseForm.value.map((item: Form.FormItem) => {
      const prop = item.prop as keyof typeof dialogData.value.rowData
      item.value = dialogData.value.rowData?.[prop]
      if (params.isView) {
        item.disabled = true
      }
      return item
    })
  }
  dialogVisible.value = true
}
const changeForm = (item: Form.FormItem) => {
  dialogData.value.changeForm && dialogData.value.changeForm(item)
}

const setObj = (formItemList: Form.FormItem[]) => {
  const dataObj: Record<string, any> = {}
  const keys: string[] = []
  for (const item of formItemList) {
    const { required, prop, value, hide } = item
    if (required && !value && !hide && value !== 0) {
      keys.push(prop as string)
    }
    if (!hide || (prop === 'id' && value) || required) {
      dataObj[prop!] = value ?? ''
    }
  }
  return { keys, data: dataObj }
}

// 提交数据（新增/编辑）
const handleSubmit = async () => {
  espFormRef.value?.validateFrom && espFormRef.value.validateFrom(saveData)
}
const saveData = () => {
  try {
    const formData = setObj(baseForm.value)
    if (dialogData?.value?.confirm) {
      dialogData?.value?.confirm(formData)
    }
    if (!dialogData?.value?.apiUrl) return
    dialogData.value.apiUrl(formData.data).then(res => {
      if (res?.code === ResultEnum.SUCCESS) {
        dialogVisible.value = false
        ElMessage.success({ message: dialogData?.value?.message ?? $t('message.saveSuc') })
        if (dialogData.value.getTableList) {
          dialogData.value.getTableList()
        }
        return
      }
      ElMessage.error({ message: res?.message })
    })
  } catch (error) {
    console.log(error)
  }
}
const changeOptionList = async ({
  prop,
  value,
  params = {},
  isRequest = false
}: {
  prop: string
  value?: any
  params: Record<string, any>
  isRequest?: boolean
}) => {
  const index = baseForm.value.findIndex((item: Form.FormItem) => item.prop === prop)
  if (index !== -1) {
    const form = baseForm.value[index] as Form.FormItem
    if (isRequest) {
      const res = await form.getOptions(params)
      // 使用map方法进行转换
      let newArray = res?.result.map((item: any) => {
        return { value: item.id, label: item.name }
      })
      // 输出转换后的数组
      console.log(newArray)

      form.options = newArray ?? []
    }
    form.value = value
    baseForm.value[index] = form
  }
}
const closeDialog = () => {
  dialogVisible.value = false
}
defineExpose({
  acceptParams,
  closeDialog,
  changeOptionList
})
</script>

<style lang="less" scoped>
@import 'index';
</style>
