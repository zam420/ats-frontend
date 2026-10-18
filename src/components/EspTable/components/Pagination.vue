<template>
  <el-pagination
    v-model:currentPage="pagination.page_num"
    v-model:page-size="pagination.page_size"
    :page-sizes="PAGE_SIZES"
    :background="background"
    layout="total, sizes, prev, pager, next, jumper"
    :total="pagination.total_count"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  ></el-pagination>
</template>

<script setup lang="ts" name="EspPagination">
import { PAGE_SIZES } from '@/config'
interface EspPaginationProps {
  pageable: Table.Pageable
  background?: boolean // 分页按钮是否添加背景色
  handleSizeChange: (size: number) => void
  handleCurrentChange: (currentPage: number) => void
}

const props = withDefaults(defineProps<EspPaginationProps>(), {
  background: true
})
const pagination = ref<Table.Pageable>(props.pageable)
</script>

<style lang="less" scoped></style>
