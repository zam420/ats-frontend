<template>
  <div class="dialog-form-wrap small-dialog button-dialog" v-if="dialogVisible">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="$t('title.buttonSetting')"
      :close-on-click-modal="false"
      close-icon="CircleClose"
      @close="closeDialog()"
    >
      <div class="tip">{{ $t('cv.buttonSettingTip') }}</div>
      <div class="button-panel" ref="buttonRef">
        <div class="button-drag" v-for="(item, index) in state.buttonList" :key="item.value" :class="{gray: item?.sort > 3}">
          <div>{{ item.label }}</div>
          <i class="iconfont icon-drag"></i>
        </div>
      </div>
      <template #footer>
        <ElButton @click="closeDialog()">{{ $t('button.cancel') }}</ElButton>
        <ElButton class="btn-primary-gradient" @click="confirm">
          {{ $t('button.confirm') }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="ButtonSettingDialog">
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash'
import { ButtonConfig } from '@/api/interface'
import { saveTableButtonConfig } from '@/api/modules/common'
import Sortable from 'sortablejs'
interface ReactiveParams {
  table: string
  state: string | number
  buttonList: Form.FormSelect[]
}

interface DialogProps {
  table: string
  state: string | number
  buttons: Form.FormSelect[]
}

const { $t } = useLocale()
const state = reactive<ReactiveParams>({
  table: '',
  state: '',
  buttonList: []
})
const emit = defineEmits(['close'])
const buttonRef = ref()
// dialog框状态
const dialogVisible = ref<boolean>(false)
const confirm = async () => {
  const formData: ButtonConfig = {
    table: state.table,
	  state: state.state?.toString(),
    buttons: []
  }
  state.buttonList.forEach(data => {
    formData.buttons.push({
      button_id: data.value?.toString(),
      sort: data.sort
    })
  })
  saveTableButtonConfig(formData).then(async res => {
    if (res?.success) {
      ElMessage.success({ message: $t('message.updateSuc') })
      // 关闭弹窗
      closeDialog(true)
    }
  })
}

// 接收父组件传过来的参数
const acceptParams = async (params: DialogProps) => {
  state.state = params.state
  state.table = params.table
  state.buttonList = cloneDeep(params.buttons)
  dialogVisible.value = true
  nextTick(() => {
    const tbody = buttonRef.value
    // 初始化行拖拽
    if (tbody && !Sortable.get(tbody)) {
      Sortable.create(tbody, {
        handle: '.button-drag', // 按住按钮进行拖拽
        ghostClass: 'blue-background-class',
        onEnd(evt: Sortable.SortableEvent) {
          const newIndex = evt.newIndex as number
          const oldIndex = evt.oldIndex as number
          const currRow = state.buttonList?.splice(oldIndex, 1)[0]
          state.buttonList?.splice(newIndex, 0, currRow)
          state.buttonList.forEach((item, index) => {
            item.sort = index + 1
          })
        }
      })
    }
  })
}

// 关闭并清空弹窗数据
const closeDialog = (needCallback?: boolean) => {
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
