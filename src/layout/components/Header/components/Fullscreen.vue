<template>
  <div class="fullscreen">
    <i
      class="iconfont tool-bar-icon"
      :class="isFullscreen ? 'icon-suoxiao' : 'icon-fangda'"
      @click="toggle"
    ></i>
  </div>
</template>
<script setup lang="ts" name="Fullscreen">
const { toggle, isFullscreen } = useFullscreen()
</script>
