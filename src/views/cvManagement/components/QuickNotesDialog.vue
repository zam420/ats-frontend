<template>
  <div class="dialog-form-wrap middle-dialog" v-if="dialogVisible">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="state.title"
      :close-on-click-modal="false"
      close-icon="CircleClose"
      @close="closeDialog()"
    >
      <NotesEditor ref="nodesEditorRef" :resumeId="state.id" :showFooter="false" :resumeIds="state.ids" @confirm="closeDialog(true)" />
      <template #footer>
        <ElButton @click="closeDialog()">{{ $t('button.cancel') }}</ElButton>
        <ElButton class="btn-primary-gradient" @click="confirm">
          {{ $t('button.confirm') }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="QuickNotesDialog">
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash'
import { QUICK_NOTES_FORM } from '../data'

interface ReactiveParams {
  id?: number
  ids?: number[]
  title: string
  baseForm: Form.FormItem[]
}

interface DialogProps {
  id?: number
  ids?: number[]
  candidate?: string
  notes?: string
}

const { $t } = useLocale()

const state = reactive<ReactiveParams>({
  id: 0,
  title: '',
  ids: [],
  baseForm: cloneDeep(QUICK_NOTES_FORM)
})
const emit = defineEmits(['close'])
// dialog框状态
const dialogVisible = ref<boolean>(false)
const nodesEditorRef = ref()

const confirm = async () => {
  nodesEditorRef.value.confirmClick()
}

// 接收父组件传过来的参数
const acceptParams = async (params: DialogProps) => {
  state.title = params.candidate ? `${$t('cv.quickNotesTitle')} ${$t('cv.for')} [${params.candidate}]` : `${$t('cv.quickNotesTitle')}`
  state.id = params.id
  state.ids = params?.ids ?? []
  dialogVisible.value = true
}

// 关闭并清空弹窗数据
const closeDialog = (needCallback?: boolean) => {
  nodesEditorRef.value.clearData()
  dialogVisible.value = false
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
