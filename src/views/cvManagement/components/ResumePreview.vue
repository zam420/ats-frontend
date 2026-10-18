<template>
  <div class="resume-preview-wrap">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      class="el-dialog-large"
      v-model="dialogVisible"
      :close-on-click-modal="false"
      :title="dialogData.title"
      close-icon="CircleClose"
    >
      <div class="resume-preview-content-wrap">
        <div
          class="resume-preview-content"
          :class="{ scroll: fileType === 'html' || fileType === 'docx' }"
        >
          <template v-if="data">
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
          </template>
          <template v-if="fileType === 'doc'">
            <div class="no-support-doc">{{ $t('message.noSupportedDoc') }}</div>
          </template>
        </div>
      </div>
      <div class="resume-preview-form-wrap">
        <EspForm ref="baseFormRef" v-model="baseForm" />
        <div class="resume-preview-form-item attachment-name">
          <label class="attachment-name">{{ $t('cv.attachmentName') }}:</label>
          <p>{{ fileName }}</p>
        </div>
        <div class="resume-preview-form-item">
          <label>{{ $t('cv.attachmentSize') }}:</label>
          <p>{{ fileSize }} KB</p>
        </div>
        <div class="resume-preview-form-item">
          <label>{{ $t('cv.attachmentFormat') }}:</label>
          <p>{{ fileType }}</p>
        </div>
        <div class="resume-preview-form-button">
          <el-upload
            class="upload-resume-btn"
            ref="uploadRef"
            :limit="1"
            :on-exceed="handleExceed"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handChange"
          >
            <template #trigger>
              <ElButton>{{ $t('button.reselect') }}</ElButton>
            </template>
          </el-upload>
          <ElButton @click="uploadResume" class="btn-primary-gradient">
            {{ $t('button.confirm') }}
          </ElButton>
        </div>
      </div>
    </ElDialog>
  </div>
</template>
<script lang="ts" setup name="ResumePreview">
import { useLocale } from '@/hooks/useLocale'
import { fileToBlob, getObjectURL } from '@/utils'
import { UploadFile, UploadProps, UploadRawFile, genFileId } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { RESUME_UPLOAD_FORM } from '../data'
import { uploadCV } from '@/api/modules/cv'
import router from '@/router'
import { ROUTER_CV_MANAGEMENT_CREATE } from '@/router/routerName'
import { getObjectByForms } from '@/utils'
import { useCVStore } from '@/store/modules/cv'
import { CVState } from '@/store/interface'
import CV from '@/api/interface/cv'

const { $t } = useLocale()

interface DialogProps {
  title: string
  file?: UploadFile
  confirm?: (params: FormData) => void
}

// dialog框状态
const dialogVisible = ref<boolean>(false)
const uploadRef = ref()
const baseFormRef = ref()
const fileType = ref<string>()
const fileName = ref<string>()
const fileSize = ref<number>()
const data = ref<Blob | string>('')
const url = ref<string>()
const cvStore = useCVStore()
const baseForm = ref<Form.FormItem[]>(cloneDeep(RESUME_UPLOAD_FORM))
const dialogData = ref<DialogProps>({
  title: $t('dialog.resumePreview')
})

const getFileInfo = async () => {
  const file: UploadFile = dialogData.value.file!
  const name = file?.name
  const lastIndex = name?.lastIndexOf('.') ?? 0
  fileType.value = name?.substring(lastIndex + 1)?.toLowerCase()
  fileName.value = name?.substring(0, lastIndex)
  const size = file?.size ?? 0
  fileSize.value = parseFloat((size / 1024).toFixed(2))
  data.value = (await fileToBlob(file!)) as Blob
  if (fileType.value === 'html') {
    url.value = getObjectURL(data.value)
  }
}

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps) => {
  dialogData.value = { ...params }
  dialogVisible.value = true
  getFileInfo()
}

const handleExceed: UploadProps['onExceed'] = files => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

const handChange: UploadProps['onChange'] = (uploadFile: UploadFile) => {
  dialogData.value.file = uploadFile
  getFileInfo()
}

const uploadResume = () => {
  baseFormRef.value && baseFormRef.value.validateFrom(startUpload)
}
const startUpload = () => {
  const formData = new FormData()
  const raw = dialogData.value.file?.raw as UploadRawFile
  formData.append('original_resumes', raw)
  const formObj = getObjectByForms(baseForm.value) as CVState
  const recruitment_source = formObj.recruitment_source as number
  formData.append('recruitment_source', recruitment_source?.toString())
  uploadCV(formData).then(res => {
    if (res.success) {
      formObj.original_resume = res?.result?.original_resume ?? []
      formObj.pdf_details = (res?.result?.pdf_details ?? {}) as CV.CVDetail
      formObj.pdf_details.original_resume = res?.result?.original_resume ?? []
      formObj.pdf_details.recruitment_source = recruitment_source
      formObj.pdf_details.applying_position = formObj.applying_position as number
      const jobPosition = baseForm.value.find(
        item => item.prop === 'applying_position'
      ) as Form.FormItem
      if (jobPosition && jobPosition?.options?.length) {
        const curOption = jobPosition.options.find(item => item.value === formObj.applying_position)
        formObj.curOption = curOption
      }
      cvStore.setCVInfo(formObj)
      router.push({
        path: `/${ROUTER_CV_MANAGEMENT_CREATE}`
      })
      return
    }
    ElMessage.error({ message: res?.message })
  })
}

defineExpose({
  acceptParams
})
</script>
<style lang="less" scoped>
.resume-preview-wrap {
  --esp-dialog-left-width: 70%;
  &:deep(.el-dialog) {
    overflow: hidden;
    .el-dialog__header {
      padding-left: 0;
      padding-right: 0;
    }
    .el-dialog__title {
      display: block;
      text-align: center;
      width: var(--esp-dialog-left-width);
    }
    .el-dialog__headerbtn {
      z-index: 10;
    }
    .el-dialog__body {
      display: flex;
      padding: 0;
    }
  }
  .resume-preview-content-wrap {
    width: var(--esp-dialog-left-width);
    padding: 1.5em 2.5em 2.5em;
  }
  .resume-preview-content {
    max-height: 70vh;
    min-height: 70vh;
    height: 70vh;
    overflow: auto;
    box-shadow: 0 0 4px var(--color-gray4);
    border: 1px solid var(--color-gray4);
    .no-support-doc {
      height: 100%;
      width: 100%;
      .fja();
    }
    &:deep(.vue-office-pdf) {
      width: 100%;
      max-height: 70vh;
      canvas {
        width: 100% !important;
        height: auto !important;
      }
      .vue-office-pdf-wrapper {
        background: transparent !important;
      }
    }
    &:deep(.vue-html-preview) {
      table {
        max-width: 100%;
      }
    }
    &:deep(.word-content-wrap) {
      table {
        max-width: 100%;
        td {
          font-size: var(--el-font-size-base);
        }
      }
    }
    &.scroll {
      overflow: auto;
    }
  }
  .resume-preview-form-wrap {
    position: relative;
    flex: 1;
    background-color: var(--color-gray6);
    padding: 0.8em 2.5em;
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4.5em;
      transform: translateY(-100%);
      background-color: var(--color-gray6);
    }
    .resume-preview-form-item {
      margin-top: 1.5em;
      .fja(flex-start);
      &.attachment-name {
        flex-direction: column;
        align-items: flex-start;
        p {
          margin-top: 0.2em;
          padding-left: 1em;
        }
      }
      label {
        position: relative;
        .fja(flex-start);
        white-space: nowrap;
        margin-right: 0.3em;
        &:before {
          content: '';
          display: inline-block;
          width: 0.6em;
          height: 0.6em;
          .bg-gradient();
          margin-right: 0.5em;
          border-radius: var(--el-border-radius-round);
        }
      }
    }
  }
  .resume-preview-form-button {
    margin-top: 2em;
    .fja(flex-start);
    &:deep(.upload-resume-btn) {
      width: calc(50% - 6px);
      margin-right: 12px;
      .el-upload {
        width: 100%;
      }
    }
    &:deep(.el-button) {
      flex: 1;
    }
  }
}
</style>
