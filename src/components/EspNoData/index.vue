<template>
  <div class="no-data">
    <img :src="getAssetsFile(src)" alt="notData" />
    <div v-if="title">{{ title }}</div>
  </div>
</template>
<script setup lang="ts" name="NoData">
import { getAssetsFile } from '@/utils'
interface DataProps {
  src?: string
  title: string
}
withDefaults(defineProps<DataProps>(), {
  src: 'imgs/notData.png',
  title: ''
})
</script>
<style scoped lang="less">
.no-data {
  .fja();
  flex-direction: column;
  height: 120px;
  line-height: 45px;
}
</style>
