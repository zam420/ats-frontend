<template>
  <div class="esp-file-preview-wrap preview-panel">
    <div class="keep-right">
      <i class="iconfont text-primary-gradient icon-download-2" @click="download"></i>
      <i class="iconfont text-primary-gradient icon-print" @click="print"></i>
    </div>
    <ElScrollbar>
      <div id="esp-file-preview-content" class="esp-file-preview-content">
        <template v-if="fileType === 'pdf'">
          <PreviewPdf :data="data" />
        </template>
        <template v-else-if="fileType === 'docx'">
          <PreviewDocx :data="data" />
        </template>
        <template v-else-if="fileType === 'html'">
          <iframe
            style="width: 94%; height: 100vh"
            :src="`${url}#toolbar=0`"
          ></iframe>
        </template>
        <template v-else-if="fileType === 'email'">
          <PreviewHtml :data="data" />
        </template>
        <template v-else-if="isImg()">
          <PreviewImg :url="url" />
        </template>
        <iframe
          v-if="url"
          ref="filePreviewRef"
          class="esp-file-preview-iframe"
          style="width: 100%; height: 100vh; display: none;"
          :src="`${url}#toolbar=0`"
        ></iframe>
      </div>
    </ElScrollbar>
  </div>
</template>
<script setup lang="ts" name="ResumeAttachment">
import { downloadFile } from '@/api/modules/common'
import { ResultData, ResultUploadInfo } from '@/api/interface'
import { useLocale } from '@/hooks/useLocale'
import { ElScrollbar } from 'element-plus'
import { getObjectURL, stringToBlob } from '@/utils'
import { useWord } from '@/hooks/useWord'

interface ParamsProps {
  file: ResultUploadInfo
}
const props = defineProps<ParamsProps>()

const { $t } = useLocale()
const { convertToHtml } = useWord()
const fileType = ref<string>()
const data = ref<Blob>()
const url = ref<string>()
const filePreviewRef = ref<HTMLIFrameElement>()

const previewData = ref<ResultUploadInfo>({
  uid: 0,
  file_name: ''
})

const getFileInfo = async (file: ResultUploadInfo) => {
  previewData.value = { ...file }
  downloadFile(file.uid as number).then(async res => {
    if (res instanceof Blob) {
      data.value = res as Blob
      if (data.value?.type === 'application/json') {
        ElMessage.error({ message: $t('message.notExistFile') })
        return
      }
      const name = file?.file_name
      const lastIndex = name?.lastIndexOf('.') ?? 0
      fileType.value = name?.substring(lastIndex + 1)?.toLowerCase()
      if (fileType.value === 'doc') {
        download()
        return
      }
      getIframeSrc(data.value)
      return
    }
    const msg = res as ResultData
    ElMessage.error({ message: msg?.message ?? $t('message.notExistFile') })
  })
}

watch(
  (): ResultUploadInfo => props.file,
  async (file: ResultUploadInfo) => {
    if (file) {
      getFileInfo(file as ResultUploadInfo)
    }
  },
  { immediate: true, deep: true }
)

const isImg = () => {
  return fileType.value === 'jpeg' || fileType.value === 'jpg' || fileType.value === 'png'
}
const print = () => {
  filePreviewRef.value && filePreviewRef.value.contentWindow?.print()
}

const getIframeSrc = async (data: Blob) => {
  if (fileType.value === 'docx') {
    const html = await convertToHtml(data)
    url.value = getObjectURL(stringToBlob(html))
    return
  }
  url.value = getObjectURL(data)
}
const download = () => {
  let fileUrl = URL.createObjectURL(data.value as Blob)
  const a = document.createElement('a')
  a.href = fileUrl
  a.download = previewData.value.file_name
  a.click()
  URL.revokeObjectURL(fileUrl)
}

</script>
<style lang="less" scoped>
@import '../index.less';
</style>
