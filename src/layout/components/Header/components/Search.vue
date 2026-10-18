<template>
  <div class="search-wrap">
    <el-input v-model="searchValue" placeholder="Search">
      <template #prefix>
        <i class="iconfont icon-search"></i>
      </template>
    </el-input>
  </div>
</template>
<script lang="ts" setup name="Search">
const searchValue = ref<string>()
</script>
<style lang="less" scoped>
.search-wrap {
  min-width: 450px;
  &:deep(.el-input) {
    --el-input-height: var(--esp-search-input-height) !important;
    --el-input-bg-color: var(--el-color-primary-light-10);
    --el-input-border-radius: var(--el-border-radius-large);
    .el-input__wrapper {
      padding: 0 12px 0 0 !important;
      box-shadow: none;
      .el-input__prefix {
        .fja();
        width: var(--el-input-height);
        height: var(--el-input-height);
        border-radius: var(--el-input-border-radius);
        background-color: var(--el-color-primary-light-8);
        margin-right: 8px;
        .icon-search {
          font-size: var(--el-font-size-large);
          color: var(--el-color-primary-light-3);
          margin-right: 0;
        }
      }
    }
  }
}
</style>
