<template>
  <div class="dialog-form-wrap" v-if="dialogVisible" :class="dialogData.size">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="dialogData.title"
      close-icon="CircleClose"
    >
      <slot>
        <p :class="dialogData.center" class="content" v-html="dialogData.content"></p>
      </slot>
      <template #footer>
        <ElButton v-if="dialogData.showCancelButton" @click="closeDialog">
          {{ dialogData.cancelButtonText }}
        </ElButton>
        <ElButton class="btn-primary-gradient" @click="confirm">
          {{ dialogData.confirmButtonText }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="EspDialogForm">
import { OPEN_DIALOG } from '@/config'
import { useLocale } from '@/hooks/useLocale'
import mittBus from '@/utils/mittBus'

interface DialogProps {
  title: string
  content: string
  type?: '' | 'success' | 'danger' | 'warning' | 'error'
  size?: 'small' | 'middle'
  center?: 'left' | 'center' | 'right'
  showCancelButton?: boolean
  cancelButtonText?: string
  confirmButtonText?: string
  confirm?: () => void
}

const { $t } = useLocale()

// dialog框状态
const dialogVisible = ref<boolean>(false)

const defaultValue: DialogProps = {
  title: '',
  size: 'middle',
  content: '',
  type: '',
  center: 'left',
  cancelButtonText: $t('button.cancel'),
  confirmButtonText: $t('button.confirm'),
  showCancelButton: true
}

const dialogData = ref<DialogProps>({
  ...defaultValue
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps) => {
  dialogData.value = { ...defaultValue, ...params }
}

const confirm = () => {
  closeDialog()
  if (dialogData.value.confirm) {
    dialogData.value.confirm()
    return
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}
mittBus.on(OPEN_DIALOG, params => {
  dialogData.value = { ...dialogData.value, ...(params as DialogProps) }
  dialogVisible.value = true
})
defineExpose({
  acceptParams,
  closeDialog
})
</script>

<style lang="less" scoped>
@import 'index';
</style>
