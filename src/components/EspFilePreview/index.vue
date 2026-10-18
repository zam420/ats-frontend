<template>
  <div class="dialog-file-preview-wrap">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <template #header>
        <div class="file-preview-header">
          <div class="left">{{ dialogData.file_name }}</div>
          <div class="middle"></div>
          <div class="right">
            <i @click="download" class="el-icon iconfont icon-download-2" v-if="fileType !== 'email'"></i>
            <i @click="print" class="el-icon iconfont icon-print" v-if="fileType !== 'email'"></i>
            <i @click="close" class="el-icon iconfont icon-close"></i>
          </div>
        </div>
      </template>
      <div class="esp-file-preview-wrap" v-if="data">
        <ElScrollbar>
          <div id="esp-file-preview-content" class="esp-file-preview-content" :class="{'email-content': fileType === 'email'}">
            <template v-if="fileType === 'pdf'">
              <PreviewPdf :data="data" />
            </template>
            <template v-else-if="fileType === 'docx'">
              <PreviewDocx :data="data" />
            </template>
            <template v-else-if="fileType === 'html'">
              <iframe
                style="width: 100%; height: 100vh"
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
              ref="filePreviewRef"
              class="esp-file-preview-iframe"
              style="width: 100%; height: 100vh"
              :src="`${url}#toolbar=0`"
            ></iframe>
          </div>
        </ElScrollbar>
      </div>
    </ElDialog>
  </div>
</template>
<script setup lang="ts" name="EspFilePreview">
import { downloadFile } from '@/api/modules/common'
import mittBus from '@/utils/mittBus'
import { ResultData, ResultUploadInfo } from '@/api/interface'
import { useLocale } from '@/hooks/useLocale'
import { ElScrollbar } from 'element-plus'
import { getObjectURL, stringToBlob } from '@/utils'
import { useWord } from '@/hooks/useWord'
import { OPEN_BLOB_PREVIEW, OPEN_EMAIL_PREVIEW, OPEN_FILE_PREVIEW, FILE_BLOB_DOWNLOAD } from '@/config'

const { $t } = useLocale()
const { convertToHtml } = useWord()
const fileType = ref<string>()
const data = ref<Blob>()
const url = ref<string>()
const dialogVisible = ref<boolean>(false)
const filePreviewRef = ref<HTMLIFrameElement>()

const dialogData = ref<ResultUploadInfo>({
  uid: 0,
  file_name: ''
})

mittBus.on(OPEN_FILE_PREVIEW, file => {
  getFileInfo(file as ResultUploadInfo)
})
mittBus.on(OPEN_BLOB_PREVIEW, data => {
  getBlobInfo(data)
})

// 直接下载文档
mittBus.on(FILE_BLOB_DOWNLOAD, data => {
  getBlobInfo(data, true)
  download()
})

mittBus.on(OPEN_EMAIL_PREVIEW, data => {
  getEmailInfo(data)
})
const getFileInfo = async (file: ResultUploadInfo) => {
  dialogData.value = { ...file }
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
      dialogVisible.value = true
      if (fileType.value === 'doc') {
        download()
        close()
        return
      }
      getIframeSrc(data.value)
      return
    }
    const msg = res as ResultData
    ElMessage.error({ message: msg?.message ?? $t('message.notExistFile') })
  })
}
const getBlobInfo = (file: any, hideDialog?: boolean) => {
  data.value = file.blob as Blob
  const name = file?.file_name
  dialogData.value.file_name = name
  const lastIndex = name?.lastIndexOf('.') ?? 0
  fileType.value = name?.substring(lastIndex + 1)?.toLowerCase()
  dialogVisible.value = hideDialog ? false : true
  if (fileType.value === 'doc') {
    download()
    close()
    return
  }
  getIframeSrc(data.value)
}
const isImg = () => {
  return fileType.value === 'jpeg' || fileType.value === 'jpg' || fileType.value === 'png'
}
const print = () => {
  filePreviewRef.value && filePreviewRef.value.contentWindow?.print()
}

const getEmailInfo = (file: any) => {
  data.value = file.blob as Blob
  const name = file?.file_name
  dialogData.value.file_name = name
  fileType.value = 'email'
  dialogVisible.value = true
  url.value = getObjectURL(data.value)
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
  a.download = dialogData.value.file_name
  a.click()
  URL.revokeObjectURL(fileUrl)
}
const close = () => {
  dialogVisible.value = false
}
</script>
<style lang="less" scoped>
@import 'index.less';
</style>
