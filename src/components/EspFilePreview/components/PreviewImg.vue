<template>
  <div class="esp-img-preview-wrap" ref="container" v-if="url">
    <img :src="url" />
  </div>
</template>
<script setup lang="ts" name="PreviewImg">
defineProps<{ url?: string }>()
</script>
<style scoped lang="less">
.esp-img-preview-wrap {
  .fja();
  width: 100%;
  min-height: 90vh;
  img {
    object-fit: cover;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
