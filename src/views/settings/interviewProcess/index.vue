<template>
  <EspMain :title="$t('menu.interviewProcess')">
    <EspTable
      ref="espTable"
      :columns="state.interviewProcessData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="getInterviewProcessList"
      rowKey="id"
      :initParam="initParam"
      :activeTab="ProjectStatusEnum.ACTIVE.toString()"
      :formatTable="initTable"
      :is-front-pagination="false"
    >
      <template #header="">
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
            <i @click="showEdit(row.id)" class="iconfont icon-edit text-primary-gradient"></i>
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
    </EspTable>
  </EspMain>
</template>
<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import { getTableTabs, openNewWindow } from '@/utils'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { ResultEnum } from '@/enums/httpEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
import { INTERVIEW_PROCESS_TABLE } from './data'
import router from '@/router'
import {
  ROUTER_SETTINGS_INTERVIEW_PROCESS_CREATE,
  ROUTER_SETTINGS_INTERVIEW_PROCESS_EDIT
} from '@/router/routerName'
import { WorkLocation } from '@/enums/workLocationEnum'
import InterviewProcess from '@/api/interface/interviewProcess'
import { UserPermissionEnum } from '@/enums/userPermission'
import { getInterviewProcessList, changeRowStatusToInactive } from '@/api/modules/interviewProcess'

const espTable = ref()
const globalStore = useGlobalStore()
// 是否有按钮操作权限
const hasPermission = ref(false)
const { $t } = useLocale()
const tabs = ref<Form.FormSelect[]>(getTableTabs(ProjectStatus))
// 列表表单
interface StateObj {
  interviewProcessData: Table.ColumnProps[]
  id: number
}
const state = reactive<StateObj>({
  interviewProcessData: cloneDeep(INTERVIEW_PROCESS_TABLE),
  id: 0
})
const initParam = ref<Record<string, any>>({status: ProjectStatusEnum.ACTIVE})
onMounted(() => {
  // 有操作权限才显示表格操作栏
  if (globalStore.permissions.includes(UserPermissionEnum.IPTC)) {
    hasPermission.value = true
    state.interviewProcessData[0].isShow = true
  }
})
// 更改状态
const changeStatus = (row: InterviewProcess.DetailInfo) => {
  if (row.id) {
    mittBus.emit(OPEN_DIALOG, {
      title:
        row.status === ProjectStatusEnum.ACTIVE
          ? $t('interviewProcess.inactiveInterviewTitle')
          : $t('interviewProcess.activeInterviewTitle'),
      content:
        row.status === ProjectStatusEnum.ACTIVE
          ? `${$t('message.ques')}${$t('interviewProcess.inactiveInterviewMsg')}`
          : `${$t('message.ques')}${$t('interviewProcess.activeInterviewMsg')}`,
      center: 'center',
      size: 'small',
      confirm: () => messageConfirm(row)
    })
  }
}

// 消息弹窗
const messageConfirm = (row: InterviewProcess.DetailInfo) => {
  const status =
    row.status === ProjectStatusEnum.ACTIVE ? ProjectStatusEnum.INACTIVE : ProjectStatusEnum.ACTIVE
  changeRowStatusToInactive(row.id, status)
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
// 处理work location名称
const initTable = (tables: InterviewProcess.DetailInfo[]) => {
  return tables.map(item => {
    item.work_location =
      WorkLocation?.[item.work_location as number]?.name ?? item.work_location_name
    return item
  })
}
// 打开编辑页面
const showEdit = (id: number) => {
  openNewWindow(`${ROUTER_SETTINGS_INTERVIEW_PROCESS_EDIT}/${id}`)
}
// 打开新增页面
const showCreate = () => {
  router.push({
    path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS_CREATE}`
  })
}
// 刷新表格
const refreshTable = () => {
  espTable.value.refresh(null, true)
}
</script>
<style lang="less" scoped></style>
