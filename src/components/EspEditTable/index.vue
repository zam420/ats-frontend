<template>
  <div class="esp-edit-table esp-detail-wrap" v-if="tableColumns.length > 0">
    <div class="table-row" v-for="item in tableColumns" :key="item.prop" :class="item?.class ?? ''" v-show="!item.isHide">
      <template v-if="item.isTitle">
        <div class="cell no-border">
          <div>{{ `${item.label}: ${item?.value ?? ''}` }}</div>
          <div class="text-right" v-if="item.text">
            {{ `${item?.textLabel ? `${item?.textLabel}: ` : ''}${item?.text ?? ''}` }}
          </div>
        </div>
      </template>
      <template v-else-if="item.span === 2">
        <div class="cell">
          <div class="cell-label">
            {{ item.label }}
            <span v-if="item.required && item.type !== FormItemTypeEnum.TEXT" class="asterisk">*</span>
            <div class="remark" v-if="item.remark">{{ item.remark }}</div>
          </div>
        </div>
        <div class="cell" :class="{error: item.isError, [item?.class as string]: item.class }">
          <FormItem
            :change="changeFormItem"
            :item="item"
          />
        </div>
      </template>
      <template v-else-if="item.span === 3">
        <div class="cell">
          <div class="cell-label">{{ item.label }}<span v-if="item.required && item.type !== FormItemTypeEnum.TEXT" class="asterisk">*</span></div>
        </div>
        <div class="cell">
          <div v-for="child in item.columns" :key="child.prop" class="row">
            <div class="cell-label">{{ child.label }}</div>
            <div class="cell-content" :class="{error: child.isError }">
              <FormItem
                :change="changeFormItem"
                :item="child"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts" name="EspEditTable">
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash'
const { $t } = useLocale()

interface EspEditTableProps {
  columns: EditTable.TableColumns[] // 列配置项
  changeForm?: (params: any) => void // 表格可编辑时表单的改变事件
}

// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<EspEditTableProps>(), {
  columns: () => []
})

const tableColumns = ref<EditTable.TableColumns[]>([])
// 监听传入的 colums 变化及时更新表格列类型
watch(
  (): Partial<Table.ColumnProps>[] => props.columns,
  () => {
    tableColumns.value = cloneDeep(props.columns)
  },
  { deep: true, immediate: true }
)
// 表单改变事件
const changeFormItem = (item: Form.FormItem) => {
  // 更新字段校验状态
  tableColumns.value?.forEach(data => {
    if (data.prop === item.prop && (item.value || item.value === 0 || item.value === false)) {
      data.isError = false
    }
    if (data.columns) {
      data.columns?.forEach(child => {
        if (child.prop === item.prop && (item.value || item.value === 0 || item.value === false)) {
          child.isError = false
        }
      })
    }
  })
  props.changeForm && props.changeForm(item)
}

const validateTable = () => {
  let hasError = false
  tableColumns.value?.forEach(data => {
    data.isError = data.required && (!data.value && data.value !== 0) && !data.columns
    if (data.isError) {
      hasError = true
    }
    if (data.columns) {
      data.columns?.forEach(child => {
        child.isError = (child.required || data.required) && (!child.value && child.value !== 0)
        if (child.isError) {
          hasError = true
        }
      })
    }
  })
  if (hasError) {
    ElMessage.error($t('form.requiredError'))
  }
  // 只要存在必填字段为空的校验就不过
  return !hasError
}

const getTableData = () => {
  return tableColumns.value
}

// 暴露给父组件的参数和方法
defineExpose({
  validateTable,
  getTableData
})
</script>
<style lang="less" scoped>
@import 'index.less';
</style>

