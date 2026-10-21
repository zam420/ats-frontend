<template>
  <EspMain :title="$t('title.recruitmentProject')">
    <EspTable
      ref="espTable"
      :columns="state.projectTableData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="getAdminRecruitmentProjectList"
      :formatTable="initListData"
      rowKey="id"
      :initParam="initParam"
      :activeTab="ProjectStatusEnum.ACTIVE.toString()"
      :selectable="activeSelected"
      :isFrontPagination="false"
    >
      <template #header>
        <!-- <ElButton v-if="hasPermission" @click="inactive(ids)">{{ $t('button.inactive') }}</ElButton> { ids } -->
        <ElButton v-if="hasPermission" @click="showCreate" class="btn-primary-gradient">{{
          $t('button.create')
        }}</ElButton>
      </template>
      <!-- 表格操作 -->
      <!-- <template #operation="scope">
        <span
          class="operate-base"
          :class="{ 'operate-base-disable': scope.row.status === ProjectStatusEnum.INACTIVE }"
          @click="inactive(scope.row.project_id)"
          >{{ $t('button.inactive') }}</span
        >
      </template> -->
      <template #operation="{ row }">
        <el-tooltip :content="$t('opt.edit')" placement="top">
          <span
            class="operation-icon"
            :class="row.status === ProjectStatusEnum.ACTIVE ? '' : 'disabled'"
          >
            <i @click="showEdit(row)" class="iconfont icon-edit text-primary-gradient"></i>
          </span>
        </el-tooltip>
        <el-tooltip
          :content="row.status === ProjectStatusEnum.ACTIVE ? $t('opt.inActive') : $t('opt.active')"
          placement="top"
        >
          <span class="operation-icon">
            <i
              @click="changeStatus(row)"
              class="iconfont text-primary-gradient"
              :class="row.status === ProjectStatusEnum.ACTIVE ? 'icon-inactive' : 'icon-active'"
            ></i>
          </span>
        </el-tooltip>
      </template>
      <template #adminString="{ row }">
        {{ (row.project_owners ?? []).map((id: string) => ownerNames[id] ?? id).join(', ') }}
      </template>
      <template #project_name="scope">
        <span class="operate-base" @click="pushJobPosition(scope.row)">{{
          scope.row.project_name
        }}</span>
      </template>
    </EspTable>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts" name="RecruitmentProject">
import { PROJECT_TABLE, PROJECT_FORM, UPDATE_PROJECT_FORM } from './data'
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import {
  getAdminRecruitmentProjectList,
  createAdminRecruitmentProject,
  updateAdminRecruitmentProject,
  changeRowStatusToInactive,
  getInterviewProcessTemplates
} from '@/api/modules/adminRecruitmentProject'
import AdminRecruitmentProject from '@/api/interface/adminRecruitmentProject'
import { getTableTabs } from '@/utils'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { ResultEnum } from '@/enums/httpEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
import router from '@/router'
import { ROUTER_JOB_POSITION } from '@/router/routerName'
import { WorkLocation } from '@/enums/workLocationEnum'
import { getUserListByRole } from '@/api/modules/user'

// 是否有按钮操作权限
const hasPermission = ref(false)
const { $t } = useLocale()
const espTable = ref()
const espDialogFormRef = ref()
const globalStore = useGlobalStore()

const tabs = ref<Form.FormSelect[]>(getTableTabs(ProjectStatus))
// 列表表单
interface StateObj {
  projectTableData: Table.ColumnProps[]
  id: string
  listData: any[]
}
const state = reactive<StateObj>({
  projectTableData: cloneDeep(PROJECT_TABLE),
  id: '',
  listData: []
})

// owner id -> name, used to display project owners in the table
const ownerNames = ref<Record<string, string>>({})
const ownerOptions = ref<{ value: string; label: string }[]>([])
const loadOwnerNames = async () => {
  const res = await getUserListByRole({ role: 'proa,rec' })
  const list: any[] = res?.result ?? []
  const map: Record<string, string> = {}
  list.forEach((u: any) => (map[String(u.id)] = u.name))
  ownerNames.value = map
  ownerOptions.value = list.map((u: any) => ({ value: u.id, label: u.name }))
}
// dialogs reuse the owners loaded on page load instead of requesting them again
const applyOwnerOptions = (formData: Form.FormItem[]) => {
  formData.forEach(item => {
    if (item.prop === 'project_owners') {
      item.isTepRequest = false
      item.options = ownerOptions.value
    }
  })
  return formData
}

onMounted(() => {
  loadOwnerNames()
  if (globalStore.permissions.includes('rpe')) {
    hasPermission.value = true
    state.projectTableData[0].isShow = true
  }
})

// 跳转到Job Position
const pushJobPosition = (item: any) => {
  const { href } = router.resolve({
    path: `/${ROUTER_JOB_POSITION}`,
    query: {
      project_id: item.id
    }
  })
  window.open(href, '_blank')
}

const initParam = ref<Record<string, any>>({ status: ProjectStatusEnum.ACTIVE })

const changeStatus = (row: any) => {
  if (!row.id) return
  const isActive = row.status === ProjectStatusEnum.ACTIVE
  mittBus.emit(OPEN_DIALOG, {
    title: isActive ? $t('admin.adminProjentTitle') : $t('admin.activateProjectTitle'),
    content: isActive ? $t('admin.adminProjentMsg') : $t('admin.activateProjectMsg'),
    center: 'center',
    size: 'small',
    confirm: () => messageConfirm(row)
  })
}

const messageConfirm = (row: any) => {
  const status =
    row.status === ProjectStatusEnum.ACTIVE ? ProjectStatusEnum.INACTIVE : ProjectStatusEnum.ACTIVE
  changeRowStatusToInactive(String(row.id), status)
    .then(res => {
      if (res?.code === ResultEnum.SUCCESS) {
        ElMessage.success({
          message:
            status === ProjectStatusEnum.ACTIVE
              ? $t('message.activeSuc')
              : $t('message.inactiveSuc')
        })
      } else {
        ElMessage.error({ message: res?.message })
      }
      refreshTable()
    })
    .catch(res => {
      console.log('res?.message: ', res)
    })
}


// 打开编辑页面
const showEdit = async (row: any) => {
  const formData = applyOwnerOptions(cloneDeep(UPDATE_PROJECT_FORM)).map(item => {
    if (item.prop === 'project_owners') {
      item.value = row.project_owners ?? []
    } else if (item.prop === 'interview_process_templates') {
      item.value = row.interview_process_templates ?? []
    } else {
      item.value = row[item.prop as string]
    }
    return item
  })
  const index = formData.findIndex(item => item.prop === 'interview_process_templates')
  const template = formData[index]
  await getInterviewProcessTemplates({ work_location: row.work_location }).then(res => {
    const list = res?.result ?? []
    template.options = list.map(item => {
      return { value: item.id, label: item.name }
    })
  })
  formData[index] = template
  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: $t('title.modifyRecruitmentProject'),
      isView: false,
      apiUrl: updateAdminRecruitmentProject,
      formData: formData,
      size: 'small',
      getTableList: refreshTable
    })
}

const initListData = (tables: any[]) => {
  state.listData = tables
  return tables.map(item => {
    const owners: string[] = item.project_owners ?? []
    item.project_name = item.name
    item.work_location_name = WorkLocation?.[item.work_location]?.name ?? ''
    return item
  })
}
const activeSelected = (row: any) => {
  return row.status === 0
}
const showCreate = () => {
  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: $t('title.createRecruitmentProject'),
      isView: false,
      apiUrl: createAdminRecruitmentProject,
      formData: applyOwnerOptions(cloneDeep(PROJECT_FORM)),
      size: 'small',
      getTableList: refreshTable,
      changeForm: projectChangeForm
    })
}
const projectChangeForm = (params: any) => {
  if (params.prop === 'work_location') {
    espDialogFormRef.value &&
      espDialogFormRef.value.changeOptionList({
        prop: 'interview_process_templates',
        params: { work_location: params.value },
        isRequest: true
      })
  }
}
const refreshTable = () => {
  espTable.value.refresh(null, true)
  espTable.value.clearSelection()
}
nextTick(() => {})
</script>
<style lang="less" scoped>
.operate-base {
  font-size: var(--el-font-size-base);
  font-weight: bold;
  color: var(--el-color-primary);
  line-height: 19px;
  cursor: pointer;
}
.operate-base:hover {
  color: var(--el-color-primary-light-2);
}
.operate-base-disable {
  color: var(--color-gray3);
  pointer-events: none;
}
&:deep(.el-dialog__body) {
  text-align: center;
}
</style>
