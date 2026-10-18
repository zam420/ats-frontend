<template>
  <ElDialog
    v-model="dialogVisible"
    :title="$t('header.personalData')"
    :width="DIALOG_DEFAULT_WIDTH"
    draggable
  >
    <span>This is profile</span>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="dialogVisible = false">{{ $t('button.cancel') }}</ElButton>
        <ElButton type="primary" @click="dialogVisible = false">{{
          $t('button.confirm')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>
<script setup lang="ts" name="InfoDialog">
import { DIALOG_DEFAULT_WIDTH } from '@/config'

const dialogVisible = ref<boolean>(false)
const openDialog = () => {
  dialogVisible.value = true
}
defineExpose({
  openDialog
})
</script>
<style scoped lang="less"></style>
