<template>
  <div v-if="searchList.length" class="table-search">
    <EspForm ref="espFormRef" :modelValue="searchList" :inline="true" :changeForm="changeForm" />
    <div class="search-operation" v-if="needSearchBtn">
      <el-button type="primary" plain @click="searchTable">
        {{ $t('operate.search') }}
      </el-button>
      <el-button @click="resetSearch">{{ $t('operate.reset') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="EspSearchForm">
const espFormRef = ref()
interface EspSearchFormProps {
  searchList: Form.FormItem[] // 搜索配置列
  searchParam: any // 搜索参数
  search: (params: any, item?: Form.FormItem) => void //搜索方法
  reset: (params?: any) => void // 重置方法
  needSearchBtn?: boolean // 是否展示搜索按钮
}

const props = withDefaults(defineProps<EspSearchFormProps>(), {
  searchList: () => [],
  searchParam: {},
  needSearchBtn: false
})
const params = ref(props.searchParam)
// form表单change事件
const changeForm = (item: Form.FormItem) => {
  params.value[item.prop!] = item.value
  // 搜索条件的清空不触发查询，不然会报错
  if (item.isRequiredParam && !item.value) {
    return
  }
  // }
  // 不显示搜索按钮的情况下，更改后直接回调搜索方法
  if (!props.needSearchBtn) {
    props.search && props.search(params.value, item)
  }
}

// 表格查询
const searchTable = () => {
  props.search && props.search(params.value)
}
// 重置查询条件
const resetSearch = () => {
  espFormRef.value?.resetFields()
  params.value = {}
  props.reset && props.reset()
}
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
