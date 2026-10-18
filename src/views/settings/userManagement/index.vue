<template>
  <EspMain :title="$t('title.userManagement')">
    <EspTable
      ref="espTable"
      :columns="state.userTableData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="getUserManagementList"
      :initParam="initParam"
      :formatTable="initListData"
      :selectable="activeSelected"
      :isFrontPagination="true"
    >
      <template #header>
        <ElButton @click="showCreate" class="btn-primary-gradient">{{
          $t('button.create')
        }}</ElButton>
      </template>
      <!-- 表格操作 -->
      <!-- <template #operation="scope">
        <span
          class="operate-base"
          :class="{ 'operate-base-disable': scope.row.status === ProjectStatusEnum.INACTIVE }"
          @click="inactive(scope.row.id, scope.row.status)"
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
              @click="inactive(row.id, row.status)"
              class="iconfont text-primary-gradient"
              :class="row.status === ProjectStatusEnum.ACTIVE ? 'icon-inactive' : 'icon-active'"
            ></i>
          </span>
        </el-tooltip>
      </template>
    </EspTable>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts" name="UserManagement">
import { USERLIST_TABLE, USER_FORM, CREATE_USER_FORM, rolesList } from './data'
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import { getUserManagementList } from '@/api/modules/common'
import { getTableTabs } from '@/utils'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
import User from '@/api/interface/user'
import { changeUserStatus, createUserManagement } from '@/api/modules/user'
import { ResultEnum } from '@/enums/httpEnum'
import { UserRoleSource } from '@/enums/userRoleEnum'

// 是否有按钮操作权限
const hasPermission = ref(false)
const { $t } = useLocale()
const espTable = ref()
const espDialogFormRef = ref()
const globalStore = useGlobalStore()
const initParam = ref<Record<string, any>>({ type: 0 })

const tabs = ref<Form.FormSelect[]>(getTableTabs(ProjectStatus))
// 列表表单
interface StateObj {
  userTableData: Table.ColumnProps[]
  id: number
  status: number
}
const state = reactive<StateObj>({
  userTableData: cloneDeep(USERLIST_TABLE),
  id: 0,
  status: 0
})

onMounted(() => {
  console.log('globalStore.permissions: ', globalStore.permissions)
  if (globalStore.permissions.includes('rpe')) {
    hasPermission.value = true
    state.userTableData[0].isShow = true
  }
})

const inactive = (id: number, status: number) => {
  console.log('id: ', id)
  if (id) {
    state.id = id
    state.status = status === 0 ? 1 : 0
    mittBus.emit(OPEN_DIALOG, {
      title: $t('userManagement.userManagementTitle'),
      content: $t('userManagement.userManagementMsg'),
      center: 'center',
      size: 'small',
      confirm: messageConfirm
    })
  }
}

const messageConfirm = () => {
  console.log('id: ', state.id)
  let data: User.UserInactive = { id: state.id, status: state.status }
  changeUserStatus(data)
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
    })
}

const initListData = (tables: User.UserInfo[]) => {
  tables.map(item => {
    let adminArrs = item.roles ?? []
    const names: string[] = []
    adminArrs.forEach(item => {
      if (UserRoleSource[item].value === item) {
        names.push(UserRoleSource[item].name)
      }
    })
    item.roles = names
    return item
  })
  return tables
}
const activeSelected = (row: any) => {
  return row.status === 0
}
// 打开编辑页面
const showEdit = (row: User.UserInfo) => {
  console.log('row: ', row)
  const rowObj = cloneDeep(row)
  const roles = cloneDeep(rowObj.roles) as string[]
  const roleArr: number[] = []
  rolesList.forEach(role => {
    if (roles.includes(role.label)) {
      roleArr.push(role.value)
    }
  })
  rowObj.roles = roleArr

  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: $t('title.createUser'),
      isView: false,
      apiUrl: createUserManagement,
      formData: cloneDeep(USER_FORM),
      rowData: rowObj,
      size: 'small',
      getTableList: refreshTable
    })
}

const showCreate = () => {
  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: $t('title.createUser'),
      isView: false,
      apiUrl: createUserManagement,
      formData: cloneDeep(CREATE_USER_FORM),
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
