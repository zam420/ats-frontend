<template>
  <EspMain :title="$t('title.jobPosition')">
    <template #right>
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
      :formatTable="initTable"
      :initParam="{}"
      :tabs="tabs"
      :show-tab-counts="false"
    >
      <template #tabs>
        <el-tabs model-value="all">
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.value"
            :label="tab.label"
            :name="tab.value"
            :disabled="tab.value !== 'all'"
          />
        </el-tabs>
      </template>
      <template #title="{ row }">
        <router-link class="job-title-link" :to="jobTitleUrl(row)">{{ row.title }}</router-link>
      </template>
      <template #status="{ row }">
        <div class="job-status">
          <span class="status-dot" :class="statusColors[row.status]"></span>
          {{ row.status }}
        </div>
      </template>
      <template #operation="{ row }">
        <el-tooltip v-if="canEdit(row)" :content="$t('opt.edit')" placement="top">
          <span class="operation-icon">
            <i @click="showEdit(row.id)" class="iconfont icon-edit text-primary-gradient"></i>
          </span>
        </el-tooltip>
        <!-- <el-tooltip :content="$t('opt.delete')" placement="top">
          <span class="operation-icon disabled">
            <i @click="showDelete(row.id)" class="iconfont icon-delete text-primary-gradient"></i>
          </span>
        </el-tooltip> -->
      </template>
    </EspTable>
  </EspMain>
</template>
<script setup lang="ts" name="JobPositionTable">
import { JOB_POSITION_TABLE } from './data'
import { ROUTER_JOB_POSITION_CREATE, ROUTER_JOB_POSITION_EDIT, ROUTER_JOB_POSITION_VIEW } from '@/router/routerName'
import { useLocale } from '@/hooks/useLocale'
import { getJobFieldsData, getJobPositionList } from '@/api/modules/jobPosition'
import JobPosition from '@/api/interface/jobPosition'
import { WorkLocation } from '@/enums/workLocationEnum'
import { UserPermissionEnum } from '@/enums/userPermission'
import { useGlobalStore } from '@/store/modules/global'

const router = useRouter()
const { $t } = useLocale()
const globalStore = useGlobalStore()

const espTable = ref()
// const curId = ref<number>()

const tabs = ref<Form.FormSelect[]>([
  { label: 'All', value: 'all' },
  { label: $t('jobStatusEnum.draft'), value: 'DRAFT' },
  { label: $t('jobStatusEnum.underReview'), value: 'UNDER_REVIEW' },
  { label: $t('jobStatusEnum.open'), value: 'OPEN' },
  { label: $t('jobStatusEnum.onHold'), value: 'ON_HOLD' },
  { label: $t('jobStatusEnum.closed'), value: 'CLOSED' }
])
const statusColors: Record<string, string> = {
  DRAFT: 'warning',
  UNDER_REVIEW: 'warning',
  OPEN: 'success',
  ON_HOLD: 'warning',
  CLOSED: 'default'
}
const canEdit = (row: JobPosition.JobPositionListItem) => {
  const userId = globalStore.userInfo?.id
  return typeof userId === 'string' && userId.length > 0 && row.owner_id === userId
}
const jobTitleUrl = (row: JobPosition.JobPositionListItem) => {
  const route = canEdit(row) ? ROUTER_JOB_POSITION_EDIT : ROUTER_JOB_POSITION_VIEW
  return `/${route}/${encodeURIComponent(row.id)}`
}
let fieldsPromise: Promise<JobPosition.JobFieldsData> | undefined
let jobFields: JobPosition.JobFieldsData
const loadJobPositions = async (params: Record<string, unknown>) => {
  if (!fieldsPromise) {
    fieldsPromise = getJobFieldsData().then(res => {
      if (!res.success || !res.result || !Array.isArray(res.result.employment_types) || !Array.isArray(res.result.work_arrangement_types)) {
        ElMessage.error($t('jobPosition.fieldsLoadError'))
        throw new Error(res.message || 'Job employment and work arrangement types are missing')
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
    ...(order_by ? { orderBy: order_by, isAsc: order === 1 } : {})
  }
  const [positions, fields] = await Promise.all([getJobPositionList(query), fieldsPromise])
  jobFields = fields
  return positions
}

const initTable = (tables: JobPosition.JobPositionListItem[]) => {
  return tables.map(item => ({
    ...item,
    employment_type_name: jobFields.employment_types.find(type => type.id === item.employment_type)?.name ?? String(item.employment_type),
    work_arrangement_type_name: jobFields.work_arrangement_types.find(type => type.id === item.work_arrangement_type)?.name ?? String(item.work_arrangement_type),
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
// const showDelete = (id: number) => {
//   curId.value = id
//   mittBus.emit(OPEN_DIALOG, {
//     title: $t('message.tips'),
//     content: $t('message.deleteQues'),
//     center: 'center',
//     size: 'small',
//     confirm: deleteInfo
//   })
// }
// const deleteInfo = () => {
//   deleteJobPosition(curId.value as number).then(res => {
//     if (res?.success) {
//       ElMessage.success({ message: $t('message.deleteSuc') })
//       espTable.value && espTable.value.changeSearch(null, null, true)
//       return
//     }
//     ElMessage.error({ message: res?.message })
//   })
// }

</script>
<style lang="less" scoped>
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
