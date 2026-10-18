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
      rowKey="project_id"
      :selectable="activeSelected"
      :isFrontPagination="true"
    >
      <template #header="">
        <!-- <ElButton v-if="hasPermission" @click="inactive(ids)">{{ $t('button.inactive') }}</ElButton> { ids } -->
        <ElButton v-if="hasPermission" @click="showCreate" class="btn-primary-gradient">{{
          $t('button.create')
        }}</ElButton>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <span
          class="operate-base"
          :class="{ 'operate-base-disable': scope.row.status === ProjectStatusEnum.INACTIVE }"
          @click="inactive(scope.row.project_id)"
          >{{ $t('button.inactive') }}</span
        >
      </template>
    </EspTable>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts" name="AdminTable">
import { ADMIN_TABLE, ADMIN_FORM } from './data'
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import {
  getAdminRecruitmentProjectList,
  createAdminRecruitmentProject,
  changeRowStatusToInactive
} from '@/api/modules/adminRecruitmentProject'
import AdminRecruitmentProject from '@/api/interface/adminRecruitmentProject'
import { getTableTabs } from '@/utils'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { ResultEnum } from '@/enums/httpEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'

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
  id: number
}
const state = reactive<StateObj>({
  projectTableData: cloneDeep(ADMIN_TABLE),
  id: 0
})

onMounted(() => {
  console.log('globalStore.permissions: ', globalStore.permissions)
  if (globalStore.permissions.includes('rpe')) {
    hasPermission.value = true
    state.projectTableData[0].isShow = true
  }
})

const inactive = (id: number) => {
  console.log('id: ', id)
  if (id) {
    state.id = id
    mittBus.emit(OPEN_DIALOG, {
      title: $t('admin.adminProjentTitle'),
      content: $t('admin.adminProjentMsg'),
      center: 'center',
      size: 'small',
      confirm: messageConfirm
    })
  }
}

const messageConfirm = () => {
  console.log('id: ', state.id)
  let data: AdminRecruitmentProject.ProjectInactive = { project_id: state.id }
  changeRowStatusToInactive(data)
    .then(res => {
      if (res?.code === ResultEnum.SUCCESS) {
        ElMessage.success({ message: $t('message.inactiveSuc') })
      } else {
        console.log('res?.message: ', res?.message)
        ElMessage.error({ message: res?.message })
      }
      refreshTable()
    })
    .catch(res => {
      console.log('res?.message: ', res)
      // if (isArray(res?.result)) {
      //   let resultArr = res?.result ?? []
      //   resultMesssage(errorMessage(resultArr))
      // }
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

const initListData = (tables: AdminRecruitmentProject.AdminRecruitmentProjectInfo[]) => {
  tables.map(item => {
    let adminArrs = item.admins as AdminRecruitmentProject.ProjectAdmins[]
    item.admins = adminArrs.map(item => item.name).join(', ')
    return item
  })
  return tables
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
      formData: cloneDeep(ADMIN_FORM),
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
