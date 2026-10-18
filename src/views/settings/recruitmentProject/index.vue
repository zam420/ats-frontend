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
          :content="$t('opt.inActive')"
          placement="top"
        >
          <span class="operation-icon" :class="row.status === ProjectStatusEnum.ACTIVE ? '' : 'disabled'">
            <i
              @click="inactive(row.project_id)"
              class="iconfont text-primary-gradient icon-inactive"
            ></i>
          </span>
        </el-tooltip>
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
  listData: AdminRecruitmentProject.AdminRecruitmentProjectInfo[]
}
const state = reactive<StateObj>({
  projectTableData: cloneDeep(PROJECT_TABLE),
  id: 0,
  listData: []
})

onMounted(() => {
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
      project_id: item.project_id
    }
  })
  window.open(href, '_blank')
}

const inactive = (id: number) => {
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
  let data: AdminRecruitmentProject.ProjectInactive = { project_id: state.id }
  changeRowStatusToInactive(data)
    .then(res => {
      if (res?.code === ResultEnum.SUCCESS) {
        ElMessage.success({ message: $t('message.inactiveSuc') })
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
const showEdit = async (row: AdminRecruitmentProject.AdminRecruitmentProjectInfo) => {
  const formData = cloneDeep(UPDATE_PROJECT_FORM).map(item => {
    const prop = item.prop as keyof AdminRecruitmentProject.AdminRecruitmentProjectInfo
    if (prop === 'admins') {
      const adminsArr = row[prop] as AdminRecruitmentProject.ProjectAdmins[]
      item.value = adminsArr.map(adminItem => adminItem.id)
    } else if (prop === 'interview_process_templates') {
      const adminsArr = row[prop] as AdminRecruitmentProject.ProjectAdmins[]
      item.value = adminsArr.map(adminItem => adminItem.id)
    } else if (prop === 'name') {
      item.value = row.project_name
    } else {
      item.value = row[prop]
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
      apiUrl: createAdminRecruitmentProject,
      formData: formData,
      size: 'small',
      getTableList: refreshTable
    })
}

const initListData = (tables: AdminRecruitmentProject.AdminRecruitmentProjectInfo[]) => {
  state.listData = tables
  tables.map(item => {
    let adminArrs = item.admins as AdminRecruitmentProject.ProjectAdmins[]
    let interview_process_templates_arrs =
      item.interview_process_templates as AdminRecruitmentProject.ProjectAdmins[]
    item.adminString = adminArrs.map(item => item.name).join(', ')
    item.interview_process_templates_string = interview_process_templates_arrs
      .map(item => item.name)
      .join(', ')
    item.work_location_name = WorkLocation?.[item.work_location]?.name ?? item.name
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
      formData: cloneDeep(PROJECT_FORM),
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
