<template>
  <template :key="item.title" v-for="(item, index) of list">
    <EspDetail
      :title="item.title"
      :data="item.data"
      :label-position="item?.labelPosition"
      :is-small="item?.isSmall"
    >
      <template #title v-if="index === 0 && file && fileType === 'doc'">
        <el-link class="pdf-not-show" @click="openFilePreview" :underline="false" type="primary">
          <i class="iconfont icon-link"></i>
          {{ $t('button.resumeAttachment') }}
        </el-link>
      </template>
    </EspDetail>
  </template>
</template>
<script setup lang="ts" name="ApplicationDetail">
import { ResultUploadInfo } from '@/api/interface'
import { OPEN_FILE_PREVIEW } from '@/config';
import mittBus from '@/utils/mittBus';
import { ApplicationInfo } from '../interface'

interface ParamsProps {
  data: ApplicationInfo[]
  file?: ResultUploadInfo
  fileType: string
}
const props = defineProps<ParamsProps>()

const list = ref<ApplicationInfo[]>([])

const getFilterData = () => {
  return props.data.filter(item => item?.data?.length)
}
const openFilePreview = () => {
  mittBus.emit(OPEN_FILE_PREVIEW, props.file)
}
watch(
  () => props.data,
  () => {
    list.value = getFilterData()
  },
  { immediate: true, deep: true }
)
</script>
