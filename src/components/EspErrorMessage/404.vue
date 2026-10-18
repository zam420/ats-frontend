<template>
  <div class="not-container">
    <img src="@/assets/svgs/404.svg" class="not-img" alt="404" />
    <div class="not-detail">
      <h2>404</h2>
      <h4>{{ $t('errorPage.404') }}</h4>
      <el-button type="primary" @click="router.replace(`/${globalStore.defaultUrl}`)">
        {{ $t('button.backHome') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="404">
import { useGlobalStore } from '@/store/modules/global'
const globalStore = useGlobalStore()
const router = useRouter()
</script>

<style scoped lang="less">
@import 'index';
</style>
