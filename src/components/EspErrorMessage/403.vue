<template>
  <div class="not-container">
    <img src="@/assets/svgs/403.svg" class="not-img" alt="403" />
    <div class="not-detail">
      <h2>403</h2>
      <h4>{{ $t('errorPage.403') }}️</h4>
      <!-- <el-button type="primary" @click="router.replace(`/${globalStore.defaultUrl}`)">
        {{ $t('button.backHome') }}
      </el-button> -->
    </div>
  </div>
</template>

<script setup lang="ts" name="403">
</script>

<style scoped lang="less">
@import 'index';
</style>
