<template>
  <div class="not-container">
    <img src="@/assets/svgs/500.svg" class="not-img" alt="500" />
    <div class="not-detail">
      <h2>500</h2>
      <h4>{{ $t('errorPage.500') }}️</h4>
      <el-button type="primary" @click="router.replace(`/${globalStore.defaultUrl}`)">
        {{ $t('button.backHome') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="500">
import { useGlobalStore } from '@/store/modules/global'
const globalStore = useGlobalStore()
const router = useRouter()
</script>

<style scoped lang="less">
@import 'index';
</style>
