<template>
  <div class="table-wrap">
    <!-- 查询表单 -->
    <SearchForm
      v-show="isShowSearch"
      :search="searchTable"
      :reset="reset"
      :search-param="searchParam"
      :search-list="showSearchList"
      :need-search-btn="needSearchBtn"
      :page-search="pageSearch"
    />
    <div class="table-main">
      <slot
        v-if="isCustomHeader"
        name="tabHeader"
        :ids="selectedListIds"
        :is-selected="isSelected"
        :list="selectedList"
      ></slot>
      <!-- 表格头部 操作按钮 -->
      <div class="table-header" v-else>
        <div class="header-tab">
          <slot name="tabs">
            <template v-if="tableTabs?.length">
              <el-tabs v-model="activeTab" @tab-change="handleTabClick">
                <template :key="item.value" v-for="item in tableTabs">
                  <el-tab-pane
                    :label="item.count ? `${item.label} (${item.count})` : item.label"
                    :name="item.value"
                  ></el-tab-pane>
                </template>
              </el-tabs>
            </template>
          </slot>
        </div>
        <div class="header-btn">
          <div v-if="isSetCol && !hideColButton" class="set-icon" @click="openColSetting">
            <img src="@/assets/imgs/set.png" /> {{ $t('button.fields') }}
          </div>
          <div v-if="needFilter" class="set-icon" @click="openFilterPanel">
            <img src="@/assets/imgs/filter.png" /> {{ $t('button.filters') }}
          </div>
          <slot
            name="header"
            :ids="selectedListIds"
            :is-selected="isSelected"
            :list="selectedList"
          ></slot>
        </div>
      </div>
      <div :class="showLeftFilter ? 'table-panel table-main' : 'table-main'">
        <slot
          v-if="showLeftFilter"
          name="leftFilter"
          :ids="selectedListIds"
          :is-selected="isSelected"
          :list="selectedList"
        ></slot>
        <div :class="showLeftFilter ? 'panel-right table-main' : 'table-main'">
          <!-- 表格主体 -->
          <el-table
            ref="tableRef"
            :stripe="stripe"
            :data="tableData"
            :row-key="rowKey"
            :border="border"
            :tree-props="{ children: childrenName }"
            style="min-width: 100%"
            @selection-change="selectionChange"
            @sort-change="sortTable"
          >
            <template
              v-for="item of tableColumns"
              :key="`${item.prop}-${item?.index ?? ''}-${item?.required}-${item?.type}-${
                globalStore.isRefresh
              }`"
            >
              <el-table-column
                v-if="item.columnType === TableColumnTypeEnum.INDEX"
                :width="item.width"
                :label="item.label"
                :fixed="item.fixed"
              >
                <template #default="scope">
                  {{
                    pagination
                      ? (pageable.page_num - 1) * pageable.page_size + scope.$index + 1
                      : scope.$index + 1
                  }}
                </template>
              </el-table-column>
              <!-- sales || index -->
              <el-table-column
                v-if="item.columnType === TableColumnTypeEnum.SELECTION && item.isShow"
                :type="item.columnType"
                :reserve-selection="item.columnType === TableColumnTypeEnum.SELECTION"
                :label="item.label"
                :selectable="selectable"
                :width="item.width"
                :fixed="item.fixed"
              >
              </el-table-column>
              <!-- operation（操作单元格） -->
              <el-table-column
                v-if="item.columnType === TableColumnTypeEnum.OPERATION && item.isShow"
                v-slot="scope"
                :label="item.label"
                :width="item.width"
                :fixed="item.fixed"
              >
                <slot :name="item.columnType" :row="scope.row" :index="scope.$index"></slot>
              </el-table-column>
              <!-- expand（展开查看详情，请使用作用域插槽） -->
              <el-table-column
                v-if="item.columnType === TableColumnTypeEnum.EXPAND"
                v-slot="scope"
                :type="item.columnType"
                :label="item.label"
                :width="item.width"
                :fixed="item.fixed"
              >
                <slot :name="item.columnType" :row="scope.row"></slot>
              </el-table-column>
              <!-- other -->
              <el-table-column
                v-if="!item.columnType && item.prop && item.isShow"
                :prop="item.prop"
                :label="item.label"
                :width="item.minWidth ? undefined : item.width ? item.width : getStrWidth(item)"
                :min-width="item.minWidth"
                :sortable="item.sortable === false ? item.sortable : (item.sortable !== true && tableTotalData.length > 0 ? 'custom' : false)"
                :sort-orders="['descending', 'ascending']"
                :show-overflow-tooltip="!item.edit && !item.hideTooltip"
                :resizable="true"
                :fixed="item.fixed"
                :sort-by="item?.key"
                :class-name="item?.class ?? ''"
              >
                <!-- 自定义 header -->
                <template #header="{ column, $index }">
                  {{ column.label }}
                  <span v-if="item.required" class="asterisk">*</span>
                  <span v-if="item.filter !== false" @click.stop>
                    <el-popover
                      ref="espPopoverRef"
                      @hide="getCurFilterValue(item)"
                      popper-class="table-filter-wrap"
                      :hide-after="0"
                      transition="-"
                      placement="bottom"
                      trigger="click"
                    >
                      <template #reference>
                        <span
                          class="caret-wrapper filter-icon"
                          :class="{ active: !isEmpty(searchParam[item.prop]) }"
                        >
                          <i class="iconfont icon-search"></i>
                        </span>
                      </template>
                      <template #default>
                        <ColForm
                          v-model="item.filterValue"
                          :index="$index"
                          :teleported="false"
                          @change="changeTableForm"
                          :item="item"
                          @keyup.enter="filterTable(item)"
                        />
                        <div class="footer">
                          <el-button @click="resetFilterTable(item)">
                            {{ $t('button.reset') }}
                          </el-button>
                          <el-button @click="filterTable(item)" type="primary">
                            {{ $t('button.search') }}
                          </el-button>
                        </div>
                      </template>
                    </el-popover>
                  </span>
                </template>
                <!-- 自定义配置每一列 slot（使用作用域插槽） -->
                <template #default="scope">
                  <slot :name="item.slotName" v-if="item.slotName" :row="scope.row"></slot>
                  <slot :name="item.prop" :row="scope.row" v-else>
                    <!-- 图片(自带预览) -->
                    <template v-if="item.image">
                      <el-image
                        :src="scope.row[item.prop]"
                        :preview-src-list="[scope.row[item.prop]]"
                        fit="cover"
                        class="table-image"
                        preview-teleported
                      />
                    </template>
                    <!-- 状态 -->
                    <template v-else-if="item?.status">
                      <div class="status-warp">
                        <div
                          class="status"
                          :class="item.status?.[scope.row[item.prop]]?.status ?? ''"
                        ></div>
                        {{ item.status?.[scope.row[item.prop]]?.name ?? '' }}
                      </div>
                    </template>
                    <template v-else-if="item?.link">
                      <div class="link-wrap">
                        <a class="link" @click="showDetail(item.link, scope.row?.[rowKey])">
                          {{ defaultFormat(scope.row, item, scope.row[item.prop]) }}
                        </a>
                        <template v-if="item?.countKey">
                          <span
                            class="count"
                            v-if="scope.row[item?.countKey] && scope.row[item?.countKey] > 1"
                            >{{ scope.row[item?.countKey] }}</span
                          >
                        </template>
                      </div>
                    </template>
                    <template v-else-if="item?.tag">
                      <div class="cell-tag">
                        <template :key="info" v-for="info in scope.row[item.prop]">
                          <el-tag>{{ info }}</el-tag>
                        </template>
                      </div>
                    </template>
                    <!-- 文字（自带格式化内容） -->
                    <template v-else>
                      <span>
                        {{ defaultFormat(scope.row, item, scope.row[item.prop]) }}
                      </span>
                    </template>
                  </slot>
                </template>
              </el-table-column>
            </template>
            <template #empty>
              <div class="table-empty">
                <img src="@/assets/imgs/notData.png" alt="notData" />
                <div>{{ $t('table.noData') }}</div>
              </div>
            </template>
          </el-table>
          <div class="table-footer">
            <slot name="footer" :ids="selectedListIds" :is-selected="isSelected"></slot>
          </div>
          <!-- 分页 -->
          <Pagination
            v-if="pagination"
            :pageable="pageable"
            :handle-size-change="handleSizeChange"
            :handle-current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    <!-- 列设置 -->
    <ColSetting
      v-if="isSetCol"
      :stripe="stripe"
      ref="colRef"
      :table-ref="tableRef"
      :col-setting="colSetting"
      :tableKey="tableKey"
      @confirm="getTableColumn(true)"
    />
    <!-- 表格筛选 -->
    <ColFilter
      v-if="needFilter"
      ref="colFilterRef"
      :filter-list="filterList"
      @confirm="setFilterData"
    />
  </div>
</template>
<script setup lang="ts" name="EspTable">
import { cloneDeep } from 'lodash-es'
import { useTable } from '@/hooks/useTable'
import { useSelection } from '@/hooks/useSelection'
import { defaultFormat, isEmpty } from '@/utils'
import SearchForm from './components/SearchForm.vue'
import Pagination from './components/Pagination.vue'
import ColSetting from './components/ColSetting.vue'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { ElButton, ElTable } from 'element-plus'
import ColForm from './components/ColForm.vue'
import { getTableHeader } from '@/api/modules/common'
import { ResultData, TableHeaders } from '@/api/interface'
import { FONT_FAMILY, FONT_SIZE, LARGE_WIDTH } from '@/config'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { useGlobalStore } from '@/store/modules/global'
import { isArray, isString } from '@/utils/is'
const router = useRouter()
// 表格 DOM 元素
const tableRef = ref<InstanceType<typeof ElTable>>()
const espPopoverRef = ref<any[]>()

interface EspTableProps {
  columns: Table.ColumnProps[] // 列配置项
  searchList?: Form.FormItem[] // 搜索配置
  requestApi?: (params: any) => Promise<any> // 请求表格数据的api
  formatTable?: (tableData: any) => any
  selectable?: (row: any) => boolean // 仅对 type=selection 的列有效，类型为 Function，Function 的返回值用来决定这一行的 CheckBox 是否可以勾选
  pagination?: boolean // 是否需要分页组件 ==> 非必传（默认为true）
  isFrontPagination?: boolean // 是否需要前端分页 ==> (默认 false)
  initParam?: any // 初始化请求参数 ==> 非必传（默认为{}）
  border?: boolean // 表格是否显示边框 ==> 非必传（默认为true）
  stripe?: boolean // 是否带斑马纹表格 ==> 非必传（默认为false）
  isSetCol?: boolean // 是否显示设置列按钮 ==> 非必传（默认为true）
  childrenName?: string // 当数据存在 children 时，指定 children key 名字 ==> 非必传（默认为"children"）
  tableKey?: string
  needSearchBtn?: boolean // 是否显示搜索按钮
  pageSearch?: boolean // 是否进页面就查询
  changeForm?: (params: any) => void // 表格可编辑时表单的改变事件
  changeSetCol?: () => void // 更改 colSetting 回调
  showSearch?: boolean // 是否显示搜索
  tableHeaderMap?: any // 缓存获取过的
  tabs?: Form.FormSelect[]
  rowKey?: string
  statusKey?: string
  isCustomHeader?: boolean // 是否是自定义表格顶部
  tabNeedFresh?: boolean // 切换tab是否需要刷新
  needFilter?: boolean // 是否需要筛选
  filterList?: Form.FormItem[] // 筛选配置
  showLeftFilter?: boolean // 是否显示左边筛选栏
  hideColButton?: boolean // 是否显示默认自定义列按钮-区分于isSetCol这里是是否展示默认的
  refreshCallback?: any // 刷新数据回调方法
  activeTab?: string // 顶部选中的tab
}

interface ConfigMap {
  [key: string]: TableHeaders
}

// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<EspTableProps>(), {
  columns: () => [],
  searchList: () => [],
  pagination: true,
  isFrontPagination: false,
  initParam: {},
  border: false,
  stripe: true,
  isSetCol: true,
  childrenName: 'children',
  tableKey: '',
  needSearchBtn: false,
  pageSearch: true,
  needTab: false,
  showSearch: true,
  rowKey: 'id',
  statusKey: 'status',
  isCustomHeader: false,
  tabNeedFresh: false,
  activeTab: ''
})

// 表格筛选
const colFilterRef = ref()
// 筛选数据
const filterData = ref()

const showSearchList = ref<Form.FormItem[]>(props.searchList.filter(item => !item.hide))
// 是否显示搜索模块
const isShowSearch = ref<boolean>(props?.showSearch ?? true)
const activeTab = ref<string>((props?.activeTab ? props.activeTab : (props?.tabs?.[0]?.value ?? '')) as string)
// 表格多选 Hooks
const { selectionChange, selectedListIds, isSelected, selectedList } = useSelection(props.rowKey)

// 表格操作 Hooks
const {
  tableData,
  tableTotalData,
  pageable,
  searchParam,
  initTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
  sortTable,
  tableTabs,
  changeTabsData
} = useTable(
  props.requestApi,
  props.initParam,
  props.pagination,
  props.isFrontPagination,
  props.pageSearch,
  props.formatTable,
  props.tabs,
  props.statusKey,
  props.tabNeedFresh,
  props.refreshCallback
)
const emit = defineEmits(['search', 'changeSetCol', 'filterChange', 'tabChange'])
// 回调搜索方法到父组件
const searchTable = (item?: Form.FormItem) => {
  // 刷新数据
  refreshData(item)
  // 回调父组件
  emit('search')
}

const globalStore = useGlobalStore()

// 表格列配置项处理（添加 isShow 属性，控制显示/隐藏）
const tableColumns = ref<Table.ColumnProps[]>()
const colSetting = ref<Table.ColumnProps[]>()
const tableConfigMaps = ref<ConfigMap>({})

// 获取自定义表头
const getTableColumn = async (isSetColumn?: boolean) => {
  let maps: any = {}
  if (props.tableKey && (isSetColumn || !tableConfigMaps.value[props.tableKey])) {
    const result: ResultData = await getTableHeader(props.tableKey)
    const data: TableHeaders[] = result?.result?.fields ?? []
    data.forEach((d: TableHeaders) => {
      maps[d.field as string] = d
    })
    tableConfigMaps.value[props.tableKey] = { ...maps }
  } else {
    maps = tableConfigMaps.value?.[props.tableKey] ?? {}
  }
  // 更新 table column 的字段顺序&是否显示
  tableColumns.value = cloneDeep(props.columns)
    // .filter(item => item.isShow !== false)
    .map((item: Table.ColumnProps, index: number) => {
      // 默认配置了 isShow 为 false 的字段不随 colSetting 变化而变化
      if (item.isShow === undefined || item.isShow === true) {
        item.isShow = maps?.[item.prop as string]?.display ?? true
      }
      // 配置固定显示
      if (item.isFixedShow) {
        item.show = true
      }
      item.index = maps?.[item.prop as string]?.sort ?? -1
      if (Object.keys(props.initParam).length) {
        const prop = item.prop as string
        item.filterValue = props.initParam?.[prop] ?? ''
      }
      return item
    })
  tableColumns.value.sort((a: Table.ColumnProps, b: Table.ColumnProps) => {
    return (a.index as number) - (b.index as number)
  })
  // 设置自定义表头数据
  colSetting.value = tableColumns.value.filter((item: Table.ColumnProps) => {
    return (
      item.columnType !== TableColumnTypeEnum.SELECTION &&
      item.columnType !== TableColumnTypeEnum.EXPAND &&
      item.columnType !== TableColumnTypeEnum.OPERATION &&
      item.columnType !== TableColumnTypeEnum.INDEX
    )
  })
  emit('changeSetCol')
}
// 表格列过滤
const filterTable = (item: Table.ColumnProps) => {
  hidePopover()
  const { prop, filterValue, key } = item
  searchParam.value[prop!] = filterValue
  if (key) {
    if (isString(key)) {
      searchParam.value[key!] = filterValue
    } else if (isArray(key)) {
      for (const str of key) {
        searchParam.value[str!] = filterValue
      }
    }
  }
  item.showFilter = false
  search(searchParam.value)
}

const hidePopover = () => {
  espPopoverRef.value && espPopoverRef.value.forEach(item => {
    item.hide()
  })
}
// 重置表格列过滤
const resetFilterTable = (item: Table.ColumnProps) => {
  hidePopover()
  const { prop, key } = item
  if (!isEmpty(searchParam.value[prop!])) {
    delete searchParam.value[prop!]
  }
  if (key) {
    if (isString(key)) {
      delete searchParam.value[key!]
    } else if (isArray(key)) {
      for (const str of key) {
        delete searchParam.value[str!]
      }
    }
  }
  item.showFilter = false
  search(searchParam.value)
}
// 获取当前表格列的过滤值
const getCurFilterValue = (item: Table.ColumnProps) => {
  item.filterValue = searchParam.value[item.prop!]
}
// 监听传入的 colums 变化及时更新表格列类型
watch(
  (): Partial<Table.ColumnProps>[] => props.columns,
  () => {
    getTableColumn()
  },
  { deep: true, immediate: true }
)

// * 列设置
const colRef = ref()

// 打开 colSetting
const openColSetting = () => {
  colRef.value.openColSetting()
}

// 打开表格筛选panel
const openFilterPanel = () => {
  colFilterRef.value.open()
}
// 清空筛选
const clearFilter = () => {
  if (colFilterRef.value) {
    colFilterRef.value.clear()
  }
}
// 设置筛选数据
const setFilterData = (data: any) => {
  let paramObj: any = {}
  data?.forEach((item: any) => {
    switch (item?.type) {
      case FormItemTypeEnum.NUMBER_RANGE:
        paramObj[item.minProp] = item.min || item.min === 0 ? Number(item.min) : ''
        paramObj[item.maxProp] = item.max || item.max === 0 ? Number(item.max) : ''
        break
      case FormItemTypeEnum.DATE_RANGE:
      case FormItemTypeEnum.YEAR_RANGE:
        paramObj[item.minProp] = item?.startDate ?? ''
        paramObj[item.maxProp] = item?.endDate ?? ''
        break
      case FormItemTypeEnum.MULTIPLE_SELECT:
        paramObj[item.prop] = item.value?.length !== 0 ? item.value : ''
        break
      default:
        paramObj[item.prop] = item.value || item.value === 0 || item.value === false ? item.value : ''
        break
    }
  })
  filterData.value = {...paramObj}
  refreshData()
  emit('filterChange', filterData.value)
}
// 动态计算每个列单元格的宽度
const getStrWidth = (item: any) => {
  const fontSize = document.body.clientWidth >= LARGE_WIDTH ? FONT_SIZE.default : FONT_SIZE.small
  const canvas = document.createElement('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  // 设置字体样式
  context.font = `normal ${fontSize} ${FONT_FAMILY}` // 字体一定要写，不能只写一个字体大小，不启用
  const dimension = context.measureText(item.label)
  let width = dimension.width + 64
  if (item.isPaddingLeft) {
    width += 28
  }
  return width < 100 ? '100' : width
}
const initTable = (list: any) => {
  // const lists = props.pagination ? { dataList: list } : list
  initTableList(list)
}
// 清除表格选中
const clearSelection = () => {
  tableRef.value?.clearSelection()
}
// 刷新表格视图
const refreshTableView = () => {
  tableRef.value?.doLayout()
}
// 获取当前选中的行
const getSelectionRows = () => {
  return tableRef.value?.getSelectionRows()
}

const getTableRef = () => {
  return tableRef.value
}

const changeTableForm = (item: any) => {
  props.changeForm && props.changeForm(item)
}
// 获取已经处理过的用于表格展示的tablecolumn
const getTableColumns = () => {
  return tableColumns.value
}

const handleTabClick = () => {
  changeTabsData(activeTab.value, props.tabNeedFresh)
  emit('tabChange', activeTab.value)
}
// 重新获取数据刷新
const refreshData = (newItem?: Form.FormItem, refreshApi: boolean = false) => {
  let paramObj: any = {}
  if (filterData.value) {
    paramObj = { ...searchParam.value, ...filterData.value }
  }
  props.searchList.forEach((item: Form.FormItem) => {
    let value = item.value
    if (newItem?.prop === item.prop && newItem?.value) {
      value = newItem.value
    }
    if (item.minProp || item.minProp === 0 || item.maxProp || item.maxProp === 0) {
      paramObj[item.minProp as string] = value?.[0] ?? ''
      paramObj[item.maxProp as string] = value?.[1] ?? ''
    } else {
      if (
        (item.type !== FormItemTypeEnum.MULTIPLE_SELECT &&
          (value || value === 0 || item.value === false)) ||
        (item.type === FormItemTypeEnum.MULTIPLE_SELECT && value && Object.keys(value)?.length > 0)
      ) {
        paramObj[item.prop as string] = value
      }
    }
  })
  search(paramObj, refreshApi)
}
const showDetail = (url: string, id: number | string) => {
  const { href } = router.resolve({
    path: `${url}/${id}`
  })
  window.open(href, '_blank')
}

const changeSearch = (
  params: any,
  initTabParam: Record<string, any> = {},
  refreshApi: boolean = false
) => {
  search({ ...searchParam.value, ...params }, refreshApi, initTabParam)
}

const listeningTable = useDebounceFn(() => {
  const screenWidth = document.body.clientWidth
  if (screenWidth >= LARGE_WIDTH && globalStore.isRefresh === 'sm') {
    globalStore.setIsRefresh('lg')
    getTableColumns()
  }
  if (screenWidth < LARGE_WIDTH && globalStore.isRefresh === 'lg') {
    globalStore.setIsRefresh('sm')
    getTableColumns()
  }
})
window.addEventListener('resize', listeningTable, false)
onBeforeUnmount(() => {
  window.removeEventListener('resize', listeningTable)
})
// 暴露给父组件的参数和方法
defineExpose({
  searchParam,
  refresh: refreshData,
  tableTotalData,
  selection: { selectedListIds, isSelected, list: selectedList },
  initTable,
  clearSelection,
  refreshTableView,
  getSelectionRows,
  getTableRef,
  getTableColumns,
  search,
  changeSearch,
  openColSetting,
  openFilterPanel,
  clearFilter,
  filterData,
  changeTabsData
})
</script>
<style lang="less" scoped>
@import 'index';
</style>
