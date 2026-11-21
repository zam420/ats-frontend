<template>
  <EspMain :title="$t('title.jobPosition')">
    <template #right>
      <el-popover :visible="filterOpen" placement="bottom-end" width="min(900px, calc(100vw - 32px))"
        :popper-style="{ padding: '20px' }">
        <template #reference>
          <span ref="filterTrigger" class="filter-trigger" @mouseenter="filterOpen = true" @focusin="filterOpen = true" @click="filterOpen = true">
            <el-button :aria-expanded="filterOpen">{{ $t('jobPosition.filter') }}</el-button>
          </span>
        </template>
        <div ref="filterContent">
          <JobSearchFilters class="filter-popover-form" :model-value="searchForm" :fields="jobFields" :show-status="true"
            within-popover @search="searchJobs" @reset="resetSearch" />
        </div>
      </el-popover>
      <EspButton :permission="UserPermissionEnum.JPC" @click="createJob">
        {{ $t('button.create') }}
      </EspButton>
    </template>
    <EspTable
      ref="espTable"
      :request-api="loadJobPositions"
      :columns="JOB_POSITION_TABLE"
      :is-front-pagination="false"
      :is-set-col="false"
      :is-custom-header="true"
      :formatTable="initTable"
      :initParam="{}"
    >
      <template #title="{ row }">
        <router-link class="job-title-link" :to="jobTitleUrl(row)">{{ row.title }}</router-link>
      </template>
      <template #application_count="{ row }">
        <router-link v-if="typeof row.id === 'string' && row.id.trim()" class="job-title-link" :to="{ name: ROUTER_CANDIDATE_PIPELINE, params: { jobId: row.id } }">
          {{ row.application_count }}
        </router-link>
      </template>
      <template #status="{ row }">
        <div class="job-status">
          <span class="status-dot" :class="statusColors[row.status]"></span>
          {{ row.status_name }}
        </div>
      </template>
      <template #operation="{ row }">
        <el-tooltip :content="$t('jobPosition.previewButton')" placement="top">
          <span class="operation-icon">
            <button type="button" class="preview-icon" :aria-label="$t('jobPosition.previewButton')" @click="showPreview(row.id)">
              <el-icon><View /></el-icon>
            </button>
          </span>
        </el-tooltip>
        <el-tooltip v-if="canEdit(row)" :content="$t('opt.edit')" placement="top">
          <span class="operation-icon">
            <i @click="showEdit(row.id)" class="iconfont icon-edit text-primary-gradient"></i>
          </span>
        </el-tooltip>
        <el-tooltip v-if="canEdit(row)" :content="$t('opt.delete')" placement="top">
          <span class="operation-icon">
            <i @click="showDelete(row)" class="iconfont icon-delete text-primary-gradient"></i>
          </span>
        </el-tooltip>
      </template>
    </EspTable>
  </EspMain>
</template>
<script setup lang="ts" name="JobPositionTable">
import { JOB_POSITION_TABLE } from './data'
import JobSearchFilters from './components/JobSearchFilters.vue'
import { ROUTER_JOB_POSITION_CREATE, ROUTER_JOB_POSITION_EDIT, ROUTER_JOB_POSITION_VIEW, ROUTER_JOB_POSITION_LIST_PREVIEW, ROUTER_CANDIDATE_PIPELINE } from '@/router/routerName'
import { View } from '@element-plus/icons-vue'
import { useLocale } from '@/hooks/useLocale'
import { deactivateJobPosition, getJobFieldsData, getJobPositionList } from '@/api/modules/jobPosition'
import JobPosition from '@/api/interface/jobPosition'
import { WorkLocation } from '@/enums/workLocationEnum'
import { UserPermissionEnum } from '@/enums/userPermission'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'

const router = useRouter()
const { $t } = useLocale()
const globalStore = useGlobalStore()

const espTable = ref()
const deleting = ref(false)
const filterOpen = ref(false)
const filterTrigger = ref<HTMLElement>()
const filterContent = ref<HTMLElement>()
const closeFilterOnOutsideClick = (event: MouseEvent) => {
  if (!filterOpen.value || !(event.target instanceof Node)) return
  const popup = filterContent.value?.closest('.el-popover')
  if (!popup?.contains(event.target) && !filterTrigger.value?.contains(event.target)) {
    filterOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', closeFilterOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeFilterOnOutsideClick))
const emptySearch = () => ({
  title: '',
  workLocations: [] as number[],
  employmentTypes: [] as (number | string)[],
  workArrangementTypes: [] as (number | string)[],
  experienceLevelTypes: [] as (number | string)[],
  jobStatuses: [] as number[],
  jobPostedDateType: undefined as number | undefined
})
const searchForm = reactive(emptySearch())
const appliedSearch = ref<ReturnType<typeof emptySearch> | undefined>()

const searchJobs = () => {
  filterOpen.value = false
  const title = searchForm.title.trim()
  appliedSearch.value = {
    title,
    workLocations: [...searchForm.workLocations],
    employmentTypes: [...searchForm.employmentTypes],
    workArrangementTypes: [...searchForm.workArrangementTypes],
    experienceLevelTypes: [...searchForm.experienceLevelTypes],
    jobStatuses: [...searchForm.jobStatuses],
    jobPostedDateType: searchForm.jobPostedDateType
  }
  espTable.value?.search({}, true)
}
const resetSearch = () => {
  Object.assign(searchForm, emptySearch())
  appliedSearch.value = undefined
  espTable.value?.search({}, true)
}

const statusColors: Record<string, string> = {
  0: 'warning',
  1: 'success',
  2: 'default',
  DRAFT: 'warning',
  UNDER_REVIEW: 'warning',
  OPEN: 'success',
  ON_HOLD: 'warning',
  CLOSED: 'default'
}
const canEdit = (row: JobPosition.JobPositionListItem) => {
  const userId = globalStore.userInfo?.id
  return globalStore.permissions.includes(UserPermissionEnum.JPA) ||
    (typeof userId === 'string' && userId.length > 0 && row.owner_id === userId)
}
const jobTitleUrl = (row: JobPosition.JobPositionListItem) => {
  const route = canEdit(row)
    ? ROUTER_JOB_POSITION_EDIT
    : ROUTER_JOB_POSITION_VIEW
  return `/${route}/${encodeURIComponent(row.id)}`
}
let fieldsPromise: Promise<JobPosition.JobFieldsData> | undefined
const jobFields = ref<JobPosition.JobFieldsData>()
const loadJobPositions = async (params: Record<string, unknown>) => {
  if (!fieldsPromise) {
    fieldsPromise = getJobFieldsData().then(res => {
      if (!res.success || !res.result || !Array.isArray(res.result.employment_types) || !Array.isArray(res.result.work_arrangement_types) || !Array.isArray(res.result.experience_level_types) || !Array.isArray(res.result.job_status) || !Array.isArray(res.result.job_posted_date_types)) {
        ElMessage.error($t('jobPosition.fieldsLoadError'))
        throw new Error(res.message || 'Job filter types are missing')
      }
      return res.result
    }).catch(error => {
      fieldsPromise = undefined
      throw error
    })
  }
  const { page_num, page_size, order_by, order } = params
  const query = {
    pageNum: page_num,
    pageSize: page_size,
    ...appliedSearch.value,
    ...(order_by ? { orderBy: order_by, isAsc: order === 1 } : {})
  }
  const [positions, fields] = await Promise.all([getJobPositionList(query), fieldsPromise])
  jobFields.value = fields
  return positions
}

const initTable = (tables: JobPosition.JobPositionListItem[]) => {
  if (tables.some(item => typeof item.id !== 'string' || !item.id.trim())) {
    console.error('Job position response contains a missing or invalid ID')
    ElMessage.error($t('jobPosition.jobsLoadError'))
    throw new Error('Job position response contains a missing or invalid ID')
  }
  return tables.map(item => ({
    ...item,
    status_name: jobFields.value?.job_status.find(status => status.id === item.status)?.name ?? String(item.status),
    employment_type_name: jobFields.value?.employment_types.find(type => type.id === item.employment_type)?.name ?? String(item.employment_type),
    work_arrangement_type_name: jobFields.value?.work_arrangement_types.find(type => type.id === item.work_arrangement_type)?.name ?? String(item.work_arrangement_type),
    experience_level_type_name: item.experience_level_type == null ? '' : jobFields.value?.experience_level_types.find(type => type.id === item.experience_level_type)?.name ?? String(item.experience_level_type),
    work_location: (item.work_location ?? []).map(location => {
      const value = typeof location === 'number' ? location : location.value
      return WorkLocation[value]?.name ?? (typeof location === 'number' ? String(location) : location.name)
    }).join(', ')
  }))
}

// 添加
const createJob = () => {
  router.push({
    path: `/${ROUTER_JOB_POSITION_CREATE}`
  })
}
const showEdit = (id: string | number) => {
  router.push(`/${ROUTER_JOB_POSITION_EDIT}/${encodeURIComponent(id)}`)
}
const showPreview = (id: string) => {
  const href = router.resolve(`/${ROUTER_JOB_POSITION_LIST_PREVIEW}/${encodeURIComponent(id)}`).href
  const page = window.open(href, '_blank')
  if (!page) {
    ElMessage.error($t('jobPosition.previewOpenError'))
    return
  }
  page.opener = null
}
const showDelete = (row: JobPosition.JobPositionListItem) => {
  if (deleting.value) return
  mittBus.emit(OPEN_DIALOG, {
    title: $t('jobPosition.deleteTitle'),
    content: $t('jobPosition.deleteConfirm'),
    center: 'center',
    size: 'small',
    showCancelButton: true,
    cancelButtonText: $t('button.cancel'),
    confirmButtonText: $t('button.confirm'),
    confirm: async () => {
      if (deleting.value) return
      deleting.value = true
      try {
        const res = await deactivateJobPosition(row.id)
        if (!res?.success || res.result !== true) {
          ElMessage.error(res?.message || $t('jobPosition.deleteError'))
          return
        }
        ElMessage.success($t('message.deleteSuc'))
        espTable.value?.refresh(undefined, true)
      } catch (error) {
        console.error('Failed to delete job position', error)
        ElMessage.error($t('jobPosition.deleteError'))
      } finally {
        deleting.value = false
      }
    }
  })
}

</script>
<style lang="less" scoped>
.filter-trigger { margin-right: 12px; }
.filter-popover-form.job-search {
  margin-bottom: 0;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  row-gap: 24px;
}
@media (max-width: 700px) {
  .filter-popover-form.job-search { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
}
.preview-icon {
  appearance: none;
  display: inline-flex;
  align-items: center;
  padding: 0;
  margin-bottom:4px;
  border: none;
  background: none;
  box-shadow: none;
  color: var(--el-color-primary);
  cursor: pointer;
  font-size: 14px;
  vertical-align: middle;
}
.job-title-link {
  color: var(--el-color-primary);
  cursor: pointer;
  &:hover { text-decoration: underline; }
}
.job-status {
  display: inline-flex;
  align-items: center;
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: var(--color-gray3);
    &.success { background-color: var(--el-color-success-light-2); }
    &.warning { background-color: var(--el-color-warning); }
  }
}
</style>
