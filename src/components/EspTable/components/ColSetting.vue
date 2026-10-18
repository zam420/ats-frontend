<template>
  <!--列显隐设置-->
  <el-drawer
    :title="$t('table.setCol')"
    v-model="drawerVisible"
    :size="size"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="cancelClick"
  >
    <div class="draw-content">
      <el-table :stripe="stripe" :data="tableData" row-key="prop" ref="dragTable">
        <el-table-column prop="label" :label="$t('table.colName')" :width="width" v-slot="scope">
          <span>{{ scope.row.label }}</span>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('table.colStatus')"
          :width="optWidth"
          v-slot="scope"
        >
          <el-switch v-model="scope.row.isShow" :disabled="scope.row.isFixedShow" />
        </el-table-column>
        <el-table-column width="50" v-slot="scope">
          <div class="move-icon" :class="{ disabled: scope.row.isFixedShow }">
            <i class="iconfont icon-sort"></i>
          </div>
        </el-table-column>
        <template #empty>
          <div class="table-empty">
            <img src="@/assets/imgs/notData.png" alt="notData" />
            <div>{{ $t('table.noData') }}</div>
          </div>
        </template>
      </el-table>
    </div>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">{{ $t('button.cancel') }}</el-button>
        <el-button class="btn-primary-gradient" type="primary" @click="confirmClick">
          {{ $t('button.confirm') }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="ColSetting">
import { ResultData, TableHeadersParam, TableHeaders } from '@/api/interface'
import { ElTable } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import Sortable from 'sortablejs'
import { setTableHeader } from '@/api/modules/common'
import { ElMessage } from 'element-plus'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()
interface ColSettingProps {
  colSetting: Partial<Table.ColumnProps>[]
  tableRef?: InstanceType<typeof ElTable>
  size?: number
  width?: number
  optWidth?: number
  stripe?: boolean
  tableKey?: string
}
const props = withDefaults(defineProps<ColSettingProps>(), {
  colSetting: () => [],
  size: 500,
  width: 200,
  optWidth: 100,
  stripe: false,
  tableKey: ''
})
const dragTable = ref()
const drawerVisible = ref<boolean>(false)
const tableData = ref<Table.ColumnProps[]>(cloneDeep(props.colSetting))
const origTableData = ref<Table.ColumnProps[]>(cloneDeep(props.colSetting))
const emit = defineEmits(['confirm'])
watch(
  (): Partial<Table.ColumnProps>[] => props.colSetting,
  (val: Partial<Table.ColumnProps>[]) => {
    tableData.value = cloneDeep(val)
    origTableData.value = cloneDeep(val)
  },
  { deep: true, immediate: true }
)
// 打开设置
const openColSetting = (): void => {
  drawerVisible.value = true
  nextTick(() => {
    const tbody = dragTable.value.$el.querySelector('.el-table__body tbody')
    // 初始化行拖拽
    if (!Sortable.get(tbody)) {
      Sortable.create(tbody, {
        handle: '.move-icon', // 按住按钮进行拖拽
        ghostClass: 'blue-background-class',
        onEnd(evt: Sortable.SortableEvent) {
          const newIndex = evt.newIndex as number
          const oldIndex = evt.oldIndex as number
          const currRow = tableData.value?.splice(oldIndex, 1)[0]
          tableData.value?.splice(newIndex, 0, currRow)
        }
      })
    }
  })
}

// 关闭drawer
const cancelClick = () => {
  drawerVisible.value = false
  // 取消的时候将更改数据还原成未更改
  tableData.value = cloneDeep(origTableData.value)
}

// 确认设置自定义表头
const confirmClick = () => {
  const list: TableHeaders[] = []
  let num = 0
  tableData.value.forEach((data: Table.ColumnProps, index: number) => {
    list.push({
      display: data.isShow,
      field: data.prop,
      sort: index
    })
    if (data.isShow) {
      num++
    }
  })
  if (num < 3) {
    ElMessage.warning($t('tips.limitCol'))
    return
  }
  const param: TableHeadersParam = {
    fields: [...list],
    table: props.tableKey
  }
  setTableHeader(param).then((result: ResultData) => {
    if (result.success) {
      drawerVisible.value = false
      // 通知table父组件重新获取表头数据
      emit('confirm')
    }
  })
}
onMounted(() => {
  // 解决 Firefox 拖拽打开新窗口的问题
  document.body.ondrop = event => {
    event.stopPropagation()
    event.preventDefault()
  }
})
defineExpose({
  openColSetting
})
</script>

<style lang="less" scoped>
@import '../index';
</style>
