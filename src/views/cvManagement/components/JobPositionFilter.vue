<template>
  <el-popover :visible="visible" placement="right-start" :width="300" :teleported="false">
    <div class="filter-container" @mousedown.stop>
      <div class="title-panel">
        <div class="filter-title">{{ $t('button.filters') }}</div>
        <div @click="clear" class="clear-btn">{{ $t('button.clearAll') }}</div>
      </div>
      <el-form>
        <el-row :gutter="20">
          <template v-for="item of filterList" :key="item.prop">
            <el-col :span="item.col ?? 24" v-if="!item.hide">
              <el-form-item :prop="item.prop" :label="item.label" label-position="top" @click.native.prevent>
                <FormItem :item="item" :change="changeFormItem" />
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </el-form>
      <div class="footer-panel">
        <el-button @click="visible = false" size="small">{{ $t('button.cancel') }}</el-button>
        <el-button type="primary" @click="confirmClick" size="small">
          {{ $t('button.search') }}</el-button
        >
      </div>
    </div>
    <template #reference>
      <el-badge is-dot :class="jobFilterProps.length === 0 ? 'hidden' : ''">
        <div class="set-icon" @click="visible = true">
          <img src="@/assets/imgs/smallFilter.png" />
        </div>
      </el-badge>
    </template>
  </el-popover>
</template>

<script setup lang="ts" name="JobPositionFilter">
import {
  isWorkLocationUnderChina,
  isWorkLocationUnderCzech,
  isWorkLocationUnderIndia,
  isWorkLocationUnderBrazil,
  isWorkLocationUnderJapan,
  WorkLocationEnum
} from '@/enums/workLocationEnum'
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash'
import { ProjectStatusEnum } from '@/enums/projectStatusEnum'
interface ParamsProps {
  formList: Form.FormItem[]
}

// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<ParamsProps>(), {
  formList: () => []
})
const { $t } = useLocale()
const emit = defineEmits(['confirm'])
const visible = ref<boolean>(false)
// 筛选form
const filterList = ref<Form.FormItem[]>([])
// 当前有做过滤的筛选项prop集合
const jobFilterProps = ref<string[]>([])
// 缓存project最全的下拉数据用于后续的worklocation过滤
const projectList = ref<Form.FormSelect[]>([])
// 重置筛选条件
const clear = () => {
  filterList.value.forEach((data: Form.FormItem) => {
    data.value = null
  })
}

// 确认查询
const confirmClick = () => {
  const param: any = {}
  const list: string[] = []
  filterList.value.forEach((data: Form.FormItem) => {
    if (data?.value && data.value?.length > 0) {
      list.push(data.prop)
      param[data.prop] = data?.value ?? []
    }
  })
  jobFilterProps.value = [...list]
  visible.value = false
  // 通知父组件更新筛选数据
  emit('confirm', param)
}
// 修改form表单联动下拉选项
const changeFormItem = (item: Form.FormItem) => {
  // worklocaton的筛选变化需要过滤对应的project数据
  if (item.prop === 'work_location_ids') {
    const workLocation = item?.value ?? []
    const index = filterList.value?.findIndex(info => info.prop === 'project_id')
    const statusIndex = filterList.value?.findIndex(info => info.prop === 'project_status')
    if (workLocation?.length === 0) {
      filterList.value[index].options = cloneDeep(projectList.value)
    } else {
      let list: Form.FormSelect[] = []
      projectList.value?.forEach(data => {
        if (
          (workLocation?.includes(WorkLocationEnum.CHINA) &&
            isWorkLocationUnderChina(data.work_location)) ||
          (workLocation?.includes(WorkLocationEnum.CZECH) &&
            isWorkLocationUnderCzech(data.work_location)) ||
          (workLocation?.includes(WorkLocationEnum.INDIA) &&
            isWorkLocationUnderIndia(data.work_location)) ||
          (workLocation?.includes(WorkLocationEnum.BRAZIL) &&
            isWorkLocationUnderBrazil(data.work_location)) ||
          (workLocation?.includes(WorkLocationEnum.JAPAN) &&
            isWorkLocationUnderJapan(data.work_location)) ||
          workLocation?.includes(data.work_location)
        ) {
          list.push(data)
        }
      })
      filterList.value[index].options = [...list]
    }
    filterList.value[index].value = []
    filterList.value[statusIndex].value = []
    filterList.value[statusIndex].disabled = false
  } else if (item.prop === 'project_id') {
    const projectId = item?.value ?? []
    const statusIndex = filterList.value?.findIndex(info => info.prop === 'project_status')
    if (projectId?.length === 0) {
      filterList.value[statusIndex].value = []
      filterList.value[statusIndex].disabled = false
    } else {
      filterList.value[statusIndex].value = [ProjectStatusEnum.ACTIVE]
      filterList.value[statusIndex].disabled = true
    }
  }
}

// 监控传入的form表单更新里面的表单内容
watch(
  () => props.formList,
  (list: any) => {
    if (list) {
      const propList: string[] = []
      let projectIndex: number = 0
      let workLocation: number[] = []
      list?.forEach((data: Form.FormItem, index: number) => {
        if (data?.value && data.value?.length > 0) {
          propList.push(data.prop)
        }
        if (data.prop === 'project_id') {
          projectList.value = cloneDeep(data?.options ?? [])
          projectIndex = index
        }
        if (data.prop === 'work_location_ids') {
          workLocation = data?.value ?? []
        }
      })
      jobFilterProps.value = [...propList]
      filterList.value = cloneDeep(list)
      // 如果已经保存了worklocaton的筛选则需要过滤对应的project数据
      if (workLocation?.length > 0) {
        filterList.value[projectIndex].options = projectList.value?.filter(data => {
          return (
            (workLocation?.includes(WorkLocationEnum.CHINA) &&
              isWorkLocationUnderChina(data.work_location)) ||
            (workLocation?.includes(WorkLocationEnum.CZECH) &&
              isWorkLocationUnderCzech(data.work_location)) ||
            (workLocation?.includes(WorkLocationEnum.INDIA) &&
              isWorkLocationUnderIndia(data.work_location)) ||
            (workLocation?.includes(WorkLocationEnum.BRAZIL) &&
              isWorkLocationUnderBrazil(data.work_location)) ||
            (workLocation?.includes(WorkLocationEnum.JAPAN) &&
              isWorkLocationUnderJapan(data.work_location)) ||
            workLocation?.includes(data.work_location)
          )
        })
      }
    }
  },
  { deep: true, immediate: true }
)

const hidePanel = () => {
  visible.value = false
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
