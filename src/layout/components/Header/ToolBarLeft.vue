<template>
  <div class="tool-bar-lf">
    <Search />
  </div>
</template>
<script setup lang="ts" name="ToolBarLeft">
import Search from './components/Search.vue'
</script>
<style scoped lang="less">
.tool-bar-lf {
  .fja();
  overflow: hidden;
  white-space: nowrap;
}
</style>
