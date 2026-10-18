<template>
  <!--筛选设置-->
  <el-drawer
    :title="$t('opt.filters')"
    class="filter-draw"
    v-model="drawerVisible"
    :size="size"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template #header>
      <span>{{ $t('opt.filters') }}</span>
      <div @click="clear" class="clear-btn">{{ $t('button.clearAll') }}</div>
    </template>
    <div class="draw-content">
      <div
        :class="data.groupName ? 'block-warp' : 'block-warp no-top'"
        v-for="data in filterData"
        :key="data.groupOrder"
      >
        <div class="block-title" v-if="data.groupName">{{ data.groupName }}</div>
        <el-form>
          <el-row :gutter="20">
            <template v-for="item of data.list" :key="item.prop">
              <el-col :span="item.col ?? 24" v-if="!item.hide">
                <el-form-item :prop="item.prop" :label="item.label" label-position="top">
                  <FormItem :change="changeFormItem" :item="item" />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </el-form>
      </div>
    </div>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">{{ $t('button.cancel') }}</el-button>
        <el-button type="primary" @click="confirmClick"> {{ $t('button.search') }}</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="ColFilter">
import { cloneDeep } from 'lodash-unified'
import { useLocale } from '@/hooks/useLocale'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
const { $t, i18n } = useLocale()
interface ColFilterProps {
  filterList: Form.FormItem[]
  size?: number
}
const props = withDefaults(defineProps<ColFilterProps>(), {
  filterList: () => [],
  size: 500
})

interface SearchOption {
  filterIndex: number
  itemIndex: number
  options: any
}

// 筛选列表
interface FormFilter {
  groupName?: string
  groupOrder?: number
  list: Form.FormItem[]
}
const drawerVisible = ref<boolean>(false)
const filterData = ref<FormFilter[]>([])
const emit = defineEmits(['confirm'])

watch(
  (): boolean => drawerVisible.value,
  (val: boolean) => {
    if (val) {
      initFilterOptions()
    }
  }
)

// 初始化下拉框
const initFilterOptions = async () => {
  const arrFun: SearchOption[] = []
  filterData.value.forEach((filter: FormFilter, filterIndex: number) => {
    filter?.list.forEach((item: Form.FormItem, index: number) => {
      if (item.getOptions) {
        arrFun.push({ filterIndex: filterIndex, options: item.getOptions(), itemIndex: index })
      }
    })
  })
  const results = await Promise.all(Object.values(arrFun))
  for (const item of results) {
    item.options.then((result: any) => {
      let list = result?.result ?? []
      const column = filterData.value[item.filterIndex]?.list[item.itemIndex]
      column.options = list.map((item: any) => {
        let label: string = ''
        const obj = { ...item } as Form.FormSelect
        if (typeof item === 'string') {
          obj.label = item
          obj.value = item
        } else {
          const optionNames =
            i18n.global.locale.value === 'en' && column.optionSecondName
              ? column.optionSecondName
              : column.optionName
          if (Array.isArray(optionNames)) {
            for (const key of optionNames) {
              label = `${label} ${item[key]}`
            }
          } else {
            label = item[optionNames!]
          }
          obj.label = label
          obj.value = item[column.optionKey!]
        }
        return obj
      })
    })
  }
}

// 关闭drawer
const cancelClick = () => {
  drawerVisible.value = false
}

// 打开筛选panel
const open = (): void => {
  drawerVisible.value = true
}
// 表单回调函数
const changeFormItem = () => {}

// 重置筛选条件
const clear = () => {
  filterData.value.forEach((filter: FormFilter) => {
    filter?.list.forEach(data => {
      if (data?.type === FormItemTypeEnum.NUMBER_RANGE) {
        // 数字范围清空最大最小值
        data.min = undefined
        data.max = undefined
      } else if (data?.type === FormItemTypeEnum.DATE_RANGE || data?.type === FormItemTypeEnum.YEAR_RANGE) {
        // 日期范围清空数据的同时清空日期限制
        data.startDate = undefined
        data.endDate = undefined
        data.disableStartDate = undefined
        data.disableEndDate = undefined
        data.value = null
      } else {
        data.value = null
      }
    })
  })
}
// 确认查询
const confirmClick = () => {
  const list: any = []
  filterData.value.forEach((filter: FormFilter) => {
    filter?.list.forEach((data: Form.FormItem) => {
      list.push({
        prop: data.prop,
        value: data.value,
        type: data.type,
        min: data.min,
        max: data.max,
        minProp: data.minProp,
        maxProp: data.maxProp,
        startDate: data.startDate,
        endDate: data.endDate
      })
    })
  })
  drawerVisible.value = false
  // 通知table父组件重新刷新表格
  emit('confirm', list)
}

watch(
  () => props.filterList,
  val => {
    if (val) {
      setFilterData()
    }
  },
  { deep: true }
)

const setFilterData = () => {
  const groupMap: any = {}
  const groupList: any = []
  props.filterList.forEach((data: Form.FormItem) => {
    if (data.groupName) {
      if (!groupMap[data.groupName]) {
        groupMap[data.groupName] = []
      }
      groupMap[data.groupName].push(data)
    }
  })
  for (let group in groupMap) {
    groupList.push({
      groupName: group,
      groupOrder: groupMap[group][0].groupOrder,
      list: groupMap[group]
    })
  }
  // 如果没有group数据，则默认全部归为一个group
  if (groupList.length === 0) {
    groupList.push({
      groupName: '',
      groupOrder: 1,
      list: props.filterList
    })
  }
  groupList.sort((a: any, b: any) => {
    return a.groupOrder - b.groupOrder
  })
  filterData.value = cloneDeep(groupList)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && drawerVisible.value) {
    confirmClick()
  }
}

onMounted(() => {
  setFilterData()
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
defineExpose({
  open,
  clear
})
</script>

<style lang="less" scoped>
@import '../index';
</style>
