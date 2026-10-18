<template>
  <div class="esp-pdf-preview-wrap" ref="container"></div>
</template>
<script setup lang="ts" name="PreviewPdf">
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/config/serviceLoading'
import * as PdfJs from 'pdfjs-dist/legacy/build/pdf.js'
const container = ref<HTMLElement>()
const props = defineProps<{ data: Blob }>()

const initPdf = async () => {
  showFullScreenLoading()
  container.value && (container.value.innerHTML = '')
  PdfJs.GlobalWorkerOptions.workerSrc = await import('pdfjs-dist/build/pdf.worker.entry')
  let url = URL.createObjectURL(new Blob([props.data], { type: 'application/pdf;charset-UTF-8' }))
  const loadingTask = await PdfJs.getDocument({
    url: url!,
    cMapUrl: 'https://mozilla.github.io/pdf.js/web/cmaps/',
    cMapPacked: true,
    useWorkerFetch: true // 确保 worker 线程可以获取资源
  })
  loadingTask.promise
    .then(pdf => {
      setTimeout(() => {
        renderPage(pdf)
      }, 300)
    })
    .catch(() => {
      tryHideFullScreenLoading()
    })
}
const renderPage = async (pdf: PdfJs.PDFDocumentProxy) => {
  const ratio = 3
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1 })
    canvas.width = viewport.width * ratio
    canvas.height = viewport.height * ratio
    page.render({
      canvasContext: ctx!,
      viewport,
      transform: [ratio, 0, 0, ratio, 0, 0]
    })
    container.value && container.value.appendChild(canvas)
  }
  tryHideFullScreenLoading()
}
watch(
  () => props.data,
  () => {
    initPdf()
  },
  { immediate: true }
)
</script>
<style lang="less" scoped>
.esp-pdf-preview-wrap {
  width: 100%;
  &:deep(canvas) {
    width: 100%;
  }
}
</style>
