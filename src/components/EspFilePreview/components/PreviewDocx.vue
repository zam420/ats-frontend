<template>
  <div class="esp-docx-preview-wrap" ref="container"></div>
</template>
<script setup lang="ts" name="PreviewDocx">
import { useWord } from '@/hooks/useWord'

const props = defineProps<{ data?: Blob }>()

const container = ref<HTMLElement>()

const { convertToHtml } = useWord()
const initDocx = async () => {
  const html: string = await convertToHtml(props.data!)
  container.value && (container.value.innerHTML = html)
}
watch(
  () => props.data,
  () => {
    initDocx()
  },
  { immediate: true }
)
</script>
<style lang="less" scoped>
.esp-docx-preview-wrap {
  background-color: var(--el-color-white);

  &:deep(.word-content-wrap) {
    padding: 8em;

    table {
      max-width: 100%;
    }

    &>table {
      margin: 0 auto;
    }

    p {
      line-height: 1.525;
    }
  }
}
</style>
