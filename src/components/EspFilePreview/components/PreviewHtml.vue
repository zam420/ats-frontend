<template>
  <div class="esp-html-preview-wrap" ref="container"></div>
</template>
<script setup lang="ts" name="PreviewDocx">
import { blobToString } from '@/utils'

const props = defineProps<{ data?: Blob }>()

const container = ref<HTMLElement>()

const initHtml = async () => {
  const html: string = await blobToString(props.data!)
  container.value && (container.value.innerHTML = html)
}

watch(
  () => props.data,
  () => {
    initHtml()
  },
  { immediate: true }
)
</script>
<style>
.esp-html-preview-wrap {
  width: auto;
  background-color: var(--el-color-white);
}
</style>
