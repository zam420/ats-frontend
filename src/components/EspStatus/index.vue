<template>
  <div class="esp-status-wrap" :class="{ 'font-bold': isFontBold }">
    <span class="round" :class="type">
      <slot></slot>
    </span>
  </div>
</template>
<script setup lang="ts" name="EspStatus">
interface ParamsProps {
  isFontBold?: boolean
  type?: 'success' | 'warning' | 'danger' | 'default' | 'primary' | 'black'
}
withDefaults(defineProps<ParamsProps>(), {
  isFontBold: true,
  type: 'default'
})
</script>
<style lang="less" scoped>
.esp-status-wrap {
  .fja();
  &.font-bold {
    font-family: var(--font-family-bold);
    color: var(--color-gray1);
  }
  .round {
    .fja();
    line-height: 1;
    border-radius: var(--el-border-radius-round);
    background-color: var(--color-gray3);
    color: var(--el-color-white);
    padding: 0.4em 0.8em;
    &.success {
      background-color: var(--el-color-success-light-2);
    }
    &.warning {
      background-color: var(--el-color-warning);
    }
    &.danger {
      background-color: var(--el-color-danger);
    }
    &.primary {
      background-color: var(--el-color-primary);
    }
    &.black {
      background-color: var(--color-gray);
    }
  }
}
</style>
