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
      <template #header="">
        <!-- <ElButton v-if="hasPermission" @click="inactive(ids)">{{ $t('button.inactive') }}</ElButton> { ids } -->
        <ElButton v-if="hasPermission" @click="showCreate" class="btn-primary-gradient">{{
          $t('button.create')
        }}</ElButton>
      </template>
      <!-- 表格操作 -->
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
      <template #admins="{ row }">
        {{ (row.project_owners ?? []).map((id: string) => ownerNames[id] ?? id).join(', ') }}
      </template>
    </EspTable>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts" name="AdminTable">
import { ADMIN_TABLE, ADMIN_FORM, UPDATE_ADMIN_FORM } from './data'
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import {
  getAdminRecruitmentProjectList,
  createAdminRecruitmentProject,
  updateAdminRecruitmentProject,
  changeRowStatusToInactive
} from '@/api/modules/adminRecruitmentProject'
import AdminRecruitmentProject from '@/api/interface/adminRecruitmentProject'
import { getTableTabs } from '@/utils'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { ResultEnum } from '@/enums/httpEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
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
}
const state = reactive<StateObj>({
  projectTableData: cloneDeep(ADMIN_TABLE),
  id: ''
})

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

// const errorMessage = (resultArr: Record<string, any>[]) => {
//   let listAllData: AdminRecruitmentProject.AdminRecruitmentProjectInfo[] =
//     espTable.value.tableTotalData
//   let contentMassage = ''
//   resultArr.forEach(item => {
//     for (const [key, value] of Object.entries(item)) {
//       console.log('content: ', key)
//       listAllData.forEach(listItem => {
//         if (listItem.project_id === Number(key)) {
//           contentMassage =
//             contentMassage + 'Project Name: ' + listItem.project_name + ' Error: ' + value + '\n'
//         }
//       })
//     }
//   })
//   return contentMassage
// }

// const resultMesssage = (msg: string) => {
//   mittBus.emit(OPEN_DIALOG, {
//     title: $t('admin.projectStatusResult'),
//     showCancelButton: false,
//     content: msg
//   })
// }

const initListData = (tables: any[]) => {
  return tables.map(item => {
    item.project_name = item.name
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
      formData: applyOwnerOptions(cloneDeep(ADMIN_FORM)),
      size: 'small',
      getTableList: refreshTable
    })
}
const showEdit = (row: any) => {
  const formData = applyOwnerOptions(cloneDeep(UPDATE_ADMIN_FORM)).map(item => {
    item.value = row[item.prop as string]
    return item
  })
  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: $t('title.modifyRecruitmentProject'),
      isView: false,
      apiUrl: updateAdminRecruitmentProject,
      formData,
      size: 'small',
      getTableList: refreshTable
    })
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
