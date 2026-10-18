<template>
  <div class="tool-bar-ri">
    <div class="header-icon">
      <!-- <AssemblySize id="assemblySize" /> -->
      <Language id="language" />
      <Notification id="message" />
      <!-- <Fullscreen id="fullscreen" /> -->
    </div>
    <Avatar />
  </div>
</template>
<script setup lang="ts" name="ToolBarRight">
// import AssemblySize from './components/AssemblySize.vue'
import Avatar from './components/Avatar.vue'
// import Fullscreen from './components/Fullscreen.vue'
import Language from './components/Language.vue'
import Notification from './components/Notification.vue'
</script>
<style scoped lang="less">
.tool-bar-ri {
  .fja();
  .header-icon {
    .fja();
    & > * {
      margin-left: 22px;
    }
  }
  .username {
    margin: 0 20px;
    font-size: var(--el-font-size-base);
  }
}
</style>
