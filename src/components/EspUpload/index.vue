<template>
  <div class="dialog-upload-wrap">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="dialogData.title"
      close-icon="CircleClose"
    >
      <div @click="downloadTemplate" class="sub-title" v-if="dialogData.subTitle">
        <i class="iconfont icon-download"></i>
        <span class="title">{{ dialogData.subTitle }}</span>
      </div>
      <el-upload
        v-model:file-list="fileList"
        ref="uploadRef"
        class="upload-demo"
        drag
        :limit="dialogData.fileNum"
        :multiple="dialogData.fileNum && dialogData.fileNum > 1"
        :on-exceed="handleExceed"
        :accept="getAccept(dialogData.accept!)"
        :on-change="handChange"
        :auto-upload="false"
      >
        <div class="el-upload__text">{{ $t('dialog.dragFile') }}</div>
        <div class="el-upload__format">
          {{
            $t('dialog.supportFormat', {
              accept: dialogData.accept
            })
          }}
        </div>
        <div class="el-upload__size">
          {{
            $t('dialog.maxFile', {
              fileNum: dialogData.fileNum,
              fileSize: dialogData.fileSize
            })
          }}
        </div>
        <div v-if="dialogData.showBtn" class="el-upload__button" @click.stop>
          <el-button
            @click="confirmToUpload"
            :disabled="fileList.length === 0"
            class="btn-primary-gradient"
          >
            {{ dialogData.btnText }}
          </el-button>
        </div>
      </el-upload>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="EspDialogForm">
import { cloneDeep } from 'lodash-es'
import { genFileId } from 'element-plus'
import type {
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadFile,
  UploadFiles
} from 'element-plus'
import { useLocale } from '@/hooks/useLocale'
import { getAssetsFile } from '@/utils'

const { $t } = useLocale()

interface DialogProps {
  title: string
  subTitle?: string
  templateUrl?: string
  templateName?: string
  fileNum?: number
  fileSize?: number
  accept?: string
  btnText?: string
  key?: string
  showBtn?: boolean
  confirm?: (params: FormData) => void
  changeFile?: (params: UploadFile) => void
}

const defaultData: DialogProps = {
  title: '',
  subTitle: '',
  fileNum: 1,
  fileSize: 10,
  accept: 'XLSX',
  showBtn: true,
  btnText: $t('button.confirmToUpload'),
  key: 'file'
}

const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadFiles>([])

// dialog框状态
const dialogVisible = ref<boolean>(false)
const dialogData = ref<DialogProps>(cloneDeep(defaultData))

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps) => {
  fileList.value = []
  dialogData.value = { ...defaultData, ...params }
  dialogVisible.value = true
}

const handleExceed: UploadProps['onExceed'] = files => {
  if (dialogData.value?.fileNum === 1) {
    uploadRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadRef.value!.handleStart(file)
  }
}

const getAccept = (accept: string) => {
  const accepts: string[] = accept?.toLowerCase()?.split('/') ?? []
  return accepts.map(item => `.${item}`).join(',')
}

const handChange: UploadProps['onChange'] = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log(uploadFile)
  console.log(uploadFiles)
  if (dialogData.value.changeFile) {
    closeDialog()
    dialogData.value.changeFile(uploadFile)
    return
  }
}

const downloadTemplate = () => {
  if (dialogData.value?.templateUrl) {
    const dataFile = document.createElement('a')
    dataFile.href = getAssetsFile(dialogData.value.templateUrl)
    dataFile.download = dialogData.value.templateName ?? ''
    dataFile.click()
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}
const confirmToUpload = () => {
  const formData = new FormData()
  const key = dialogData.value.key!
  if (fileList.value?.length) {
    for (let i = 0; i < fileList.value.length; i++) {
      const raw = fileList.value[i]?.raw as UploadRawFile
      formData.append(key, raw)
    }
    dialogData.value.confirm && dialogData.value.confirm(formData)
  }
}
defineExpose({
  acceptParams,
  closeDialog
})
</script>

<style lang="less" scoped>
@import 'index';
</style>
