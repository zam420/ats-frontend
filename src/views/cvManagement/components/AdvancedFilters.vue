<template>
  <el-popover :visible="visible" placement="bottom-start" :width="1100" :teleported="false" popper-class="filter-popover">
    <div class="advanced-filter-container">
      <div class="advanced-filter-panel">
        <div class="draw-content">
          <div class="block-warp">
            <div class="block-title">{{ $t('cv.jobPositionInfo') }}</div>
          </div>
          <el-form>
            <el-row :gutter="40">
              <template v-for="item of jobFilterForm" :key="item.prop">
                <el-col :span="item.col ?? 24" v-if="!item.hide">
                  <el-form-item :prop="item.prop" :label="item.label" label-position="top" @click.native.prevent>
                    <FormItem :item="item" :change="changeFormItem" />
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
          </el-form>
        </div>
        <div class="draw-content" v-for="data in cvFilterData" :key="data.groupOrder">
          <div :class="data.groupName ? 'block-warp' : 'block-warp no-top'">
            <div class="block-title" v-if="data.groupName">{{ data.groupName }}</div>
            <el-form>
              <el-row :gutter="40">
                <template v-for="item of data.list" :key="item.prop">
                  <el-col :span="item.col ?? 24" v-if="!item.hide">
                    <div v-if="item.additionalTitle" class="block-title last">{{ item.additionalTitle }}</div>
                    <el-form-item :prop="item.prop" :label="item.label" label-position="top" @click.native.prevent>
                      <FormItem :change="changeFormItem" :item="item" />
                    </el-form-item>
                  </el-col>
                </template>
              </el-row>
            </el-form>
          </div>
        </div>
      </div>
      <div class="footer-panel">
        <div class="clear-panel" @click="clear" >
          <span class="operation-icon">
            <i class="iconfont icon-reset"></i>
          </span>
          <span class="clear-btn">{{ $t('button.clearAllFilters') }}</span>
        </div>
        <div class="search-btn-panel" >
          <div @click="hidePanel">{{ $t('button.cancel') }}</div>
          <div @click="confirmClick">{{ $t('button.search') }}</div>
        </div>
      </div>
    </div>
    <template #reference>
      <el-badge is-dot :class="filterProps.length === 0 ? 'hidden filter-icon' : 'filter-icon'">
        <div class="set-icon filter-icon" @click="visible = true">
          <img src="@/assets/imgs/filter.png" class="filter-icon" />
        </div>
      </el-badge>
    </template>
  </el-popover>
</template>

<script setup lang="ts" name="AdvancedFilters">
import {
  isWorkLocationUnderChina,
  isWorkLocationUnderCzech,
  isWorkLocationUnderIndia,
  isWorkLocationUnderBrazil,
  isWorkLocationUnderJapan,
  WorkLocationEnum
} from '@/enums/workLocationEnum'
import { cloneDeep } from 'lodash'
import { ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { useLocale } from '@/hooks/useLocale'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum';

interface ParamsProps {
  jobFilterList: Form.FormItem[]
  filterList: Form.FormItem[]
}
// 筛选列表
interface FormFilter {
  groupName?: string
  groupOrder?: number
  list: Form.FormItem[]
}
interface SearchOption {
  filterIndex: number
  itemIndex: number
  options: any
}

// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<ParamsProps>(), {
  jobFilterList: () => [],
  filterList: () => []
})
// cv filter数据
const cvFilterData = ref<FormFilter[]>([])
// 缓存一开始的cvfilter数据
const originalCvFilterData = ref<FormFilter[]>([])
const { $t, i18n } = useLocale()
const emit = defineEmits(['confirm'])
const visible = ref<boolean>(false)
// job筛选form
const jobFilterForm = ref<Form.FormItem[]>([])
// 缓存一开始的job筛选数据
const originalJobFilterForm =  ref<Form.FormItem[]>([])
// 当前有做过滤的筛选项prop集合
const filterProps = ref<string[]>([])
// 缓存project最全的下拉数据用于后续的worklocation过滤
const projectList = ref<Form.FormSelect[]>([])

// 修改form表单联动下拉选项
const changeFormItem = (item: Form.FormItem) => {
  // worklocaton和project_status的筛选变化需要过滤对应的project数据
  if (item.prop === 'work_location_ids' || item.prop === 'project_status') {
    changeProjectList();
    const index = jobFilterForm.value?.findIndex(info => info.prop === 'project_id')
    jobFilterForm.value[index].value = []
  }
}

const changeProjectList = () => {
  const index = jobFilterForm.value?.findIndex(info => info.prop === 'project_id')
  const workLocationIndex = jobFilterForm.value?.findIndex(info => info.prop === 'work_location_ids')
  const workLocation = jobFilterForm.value?.[workLocationIndex]?.value ?? []
  const projectStatusIndex = jobFilterForm.value?.findIndex(info => info.prop === 'project_status')
  const projectStatus = jobFilterForm.value?.[projectStatusIndex]?.value ?? []
  if (workLocation?.length === 0 && projectStatus.length === 0) {
    jobFilterForm.value[index].options = cloneDeep(projectList.value)
  } else {
    let list: Form.FormSelect[] = []
    projectList.value?.forEach(data => {
      if (
        (
          (workLocation?.includes(WorkLocationEnum.CHINA) && isWorkLocationUnderChina(data.work_location)) ||
          (workLocation?.includes(WorkLocationEnum.CZECH) && isWorkLocationUnderCzech(data.work_location)) ||
          (workLocation?.includes(WorkLocationEnum.INDIA) && isWorkLocationUnderIndia(data.work_location)) ||
          (workLocation?.includes(WorkLocationEnum.BRAZIL)&& isWorkLocationUnderBrazil(data.work_location)) ||
          (workLocation?.includes(WorkLocationEnum.JAPAN) && isWorkLocationUnderJapan(data.work_location)) ||
          workLocation?.includes(data.work_location) ||
          workLocation.length === 0
        ) && 
        (
          projectStatus.length === 0 || projectStatus?.includes(data.status_value)
        )
      ) {
        list.push(data)
      }
    })
    jobFilterForm.value[index].options = [...list]
  }
}
// 监控传入的job filter form表单更新里面的表单内容
watch(
  () => props.jobFilterList,
  (list: any) => {
    if (list) {
      const propList: string[] = []
      let workLocation: number[] = []
      let projectStatus: number[] = []
      list?.forEach((data: Form.FormItem, index: number) => {
        if (data?.value && data.value?.length > 0) {
          propList.push(data.prop)
        }
        if (data.prop === 'project_id') {
          projectList.value = cloneDeep(data?.options ?? [])
        }
        if (data.prop === 'work_location_ids') {
          workLocation = data?.value ?? []
        }
        if (data.prop === 'project_status') {
          projectStatus = data?.value ?? []
        }
      })
      filterProps.value = [...filterProps.value, ...propList]
      originalJobFilterForm.value = cloneDeep(list)
      jobFilterForm.value = cloneDeep(list)
      // 如果已经保存了worklocaton的筛选则需要过滤对应的project数据
      if (workLocation?.length > 0 || projectStatus?.length > 0) {
        changeProjectList()
      }
    }
  },
  { deep: true, immediate: true }
)

watch(
  (): boolean => visible.value,
  (val: boolean) => {
    if (val) {
      initFilterOptions()
    }
  }
)

// 初始化下拉框
const initFilterOptions = async () => {
  const arrFun: SearchOption[] = []
  cvFilterData.value.forEach((filter: FormFilter, filterIndex: number) => {
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
      const column = cvFilterData.value[item.filterIndex]?.list[item.itemIndex]
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
  originalCvFilterData.value = cloneDeep(cvFilterData.value)
}

// 重置筛选条件
const clear = () => {
  cvFilterData.value.forEach((filter: FormFilter) => {
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
  jobFilterForm.value.forEach((data: Form.FormItem) => {
    data.value = data.prop === 'project_status' ? [ProjectStatusEnum.ACTIVE] : null
  })
}
// 确认查询
const confirmClick = () => {
  const list: any = []
  cvFilterData.value.forEach((filter: FormFilter) => {
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

  let searchParam: any = {}
  const hasFilterKeys: string[] = []
  list?.forEach((item: any) => {
    switch (item?.type) {
      case FormItemTypeEnum.NUMBER_RANGE:
        searchParam[item.minProp] = item.min || item.min === 0 ? Number(item.min) : ''
        searchParam[item.maxProp] = item.max || item.max === 0 ? Number(item.max) : ''
        break
      case FormItemTypeEnum.DATE_RANGE:
      case FormItemTypeEnum.YEAR_RANGE:
        searchParam[item.minProp] = item?.startDate ?? ''
        searchParam[item.maxProp] = item?.endDate ?? ''
        break
      case FormItemTypeEnum.MULTIPLE_SELECT:
        searchParam[item.prop] = item.value?.length !== 0 ? item.value : ''
        break
      default:
        searchParam[item.prop] = item.value || item.value === 0 || item.value === false ? item.value : ''
        break
    }
    if (item.value || item.value === false || item.value === 0) {
      hasFilterKeys.push(item.prop)
    }
    if (item.startDate || item.min || item.min === 0) {
      hasFilterKeys.push(item.minProp)
    }
    if (item.endDate || item.max || item.max === 0) {
      hasFilterKeys.push(item.maxProp)
    }
  })
  const param: any = {}
  const props: string[] = []
  jobFilterForm.value.forEach((data: Form.FormItem) => {
    if (data?.value && data.value?.length > 0) {
      props.push(data.prop)
      param[data.prop] = data?.value ?? []
    }
  })
  filterProps.value = [...filterProps.value, ...hasFilterKeys, ...props]
  // visible.value = false
  // // 通知父组件更新筛选数据
  // emit('confirm', param)
  visible.value = false
  // 通知table父组件重新刷新表格
  emit('confirm', searchParam, param)
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
  const hasFilterKeys: string[] = []
  props.filterList.forEach((data: Form.FormItem) => {
    if (data.groupName) {
      if (!groupMap[data.groupName]) {
        groupMap[data.groupName] = []
      }
      groupMap[data.groupName].push(data)
    }
    if (data.value || data.value === false || data.value === 0) {
      hasFilterKeys.push(data.prop)
    }
    if (data.startDate || data.min || data.min === 0) {
      hasFilterKeys.push(data.minProp)
    }
    if (data.endDate || data.max || data.max === 0) {
      hasFilterKeys.push(data.maxProp)
    }
  })
  console.log(hasFilterKeys)
  filterProps.value = [...filterProps.value, ...hasFilterKeys]
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
  cvFilterData.value = cloneDeep(groupList)
  originalCvFilterData.value = cloneDeep(groupList)
}

const hidePanel = () => {
  visible.value = false
  nextTick(() => {
    cvFilterData.value = cloneDeep(originalCvFilterData.value)
    jobFilterForm.value = cloneDeep(originalJobFilterForm.value)
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && visible.value) {
    confirmClick()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
defineExpose({
  hidePanel
})
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
