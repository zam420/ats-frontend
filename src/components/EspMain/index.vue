<template>
  <div class="main-wrap" :class="customClass ? customClass : ''">
    <div class="header">
      <div class="left">
        <h3>{{ title }}</h3>
        <slot name="left"></slot>
      </div>
      <div class="right">
        <slot name="right"></slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>
<script setup lang="ts" name="EspMain">
interface ParamsProps {
  title: string
  customClass?: string
}
defineProps<ParamsProps>()
</script>
<style lang="less" scoped>
@import 'index.less';
</style>
