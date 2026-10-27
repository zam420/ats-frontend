<template>
  <EspMain :title="$t('menu.interviewProcess')">
    <EspTable
      ref="espTable"
      :columns="state.interviewProcessData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="requestList"
      rowKey="id"
      :initParam="initParam"
      :activeTab="TAB_OWNED"
      statusKey="tab"
      :is-front-pagination="false"
      @tab-change="onTabChange"
    >
      <template #header="">
        <ElButton v-if="hasPermission" @click="showCreate" class="btn-primary-gradient">{{
          $t('button.create')
        }}</ElButton>
        <ElButton v-if="hasIptsa()" @click="showCreateTemplate">{{
          $t('interviewProcess.createTemplate')
        }}</ElButton>
      </template>
      <template #owner_id="{ row }">
        {{ userNames[row.owner_id] ?? '' }}
      </template>
      <!-- 表格操作 -->
      <template #operation="{ row }">
        <template v-if="canOperate(row)">
          <el-tooltip :content="$t('opt.edit')" placement="top">
            <span class="operation-icon">
              <i @click="showEdit(row.id)" class="iconfont icon-edit text-primary-gradient"></i>
            </span>
          </el-tooltip>
          <el-tooltip :content="$t('opt.delete')" placement="top">
            <span class="operation-icon">
              <i @click="showDelete(row)" class="iconfont icon-delete text-primary-gradient"></i>
            </span>
          </el-tooltip>
        </template>
      </template>
    </EspTable>
  </EspMain>
</template>
<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import { getTableTabs, openNewWindow } from '@/utils'
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
import InterviewProcess from '@/api/interface/interviewProcess'
import { UserPermissionEnum } from '@/enums/userPermission'
import {
  getInterviewProcessList,
  getOwnedInterviewProcessList,
  getSharedInterviewProcessList,
  getTemplateInterviewProcessList,
  deleteInterviewProcess
} from '@/api/modules/interviewProcess'
import { getUserList } from '@/api/modules/common'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'

const TAB_OWNED = 'owned'
const TAB_SHARED = 'shared'
const TAB_TEMPLATES = 'templates'
const TAB_ALL = 'all_plans'

const espTable = ref()
const globalStore = useGlobalStore()
// 是否有按钮操作权限
const hasPermission = ref(false)
const { $t } = useLocale()
const tabs = ref<Form.FormSelect[]>([
  { label: $t('interviewProcess.owned'), value: TAB_OWNED, count: 0 },
  { label: $t('interviewProcess.shared'), value: TAB_SHARED, count: 0 },
  { label: $t('interviewProcess.systemTemplates'), value: TAB_TEMPLATES, count: 0 },
  { label: $t('interviewProcess.allPlans'), value: TAB_ALL, count: 0 }
])
const currentTab = ref<string>(TAB_OWNED)
const onTabChange = (tab: string) => {
  currentTab.value = tab
}
// 列表表单
interface StateObj {
  interviewProcessData: Table.ColumnProps[]
  id: number
}
const state = reactive<StateObj>({
  interviewProcessData: cloneDeep(INTERVIEW_PROCESS_TABLE),
  id: 0
})
const initParam = ref<Record<string, any>>({ tab: TAB_OWNED })

// The selected tab decides which backend API is called; the tab key itself is not sent
const requestList = (params: Record<string, any>) => {
  const { tab, ...query } = params
  if (tab === TAB_SHARED) return getSharedInterviewProcessList(query)
  if (tab === TAB_TEMPLATES) return getTemplateInterviewProcessList(query)
  if (tab === TAB_ALL) return getInterviewProcessList(query)
  return getOwnedInterviewProcessList(query)
}

// owner public id -> name, and the signed-in user's public id (matched by email)
const userNames = ref<Record<string, string>>({})
const currentUserId = ref<string>('')
const loadUsers = async () => {
  const res = await getUserList(ShareTypeEnum.INTERVIEWER)
  const map: Record<string, string> = {}
  const email = (globalStore.userInfo?.email ?? globalStore.email ?? '').toLowerCase()
  res?.result?.forEach((u: any) => {
    map[String(u.id)] = u.name
    if (email && u.email?.toLowerCase() === email) currentUserId.value = String(u.id)
  })
  userNames.value = map
}

const hasIpta = () => globalStore.permissions.includes(UserPermissionEnum.IPTA)
const hasIptsa = () => globalStore.permissions.includes(UserPermissionEnum.IPTSA)

// Whether the edit/delete icons are shown for a row, depending on the tab
const canOperate = (row: InterviewProcess.ListInfo) => {
  if (row.is_system_template && !hasIptsa()) return false
  switch (currentTab.value) {
    case TAB_SHARED:
      return hasIpta()
    case TAB_TEMPLATES:
      return hasIptsa()
    case TAB_ALL:
      if (!hasIpta() && row.owner_id !== currentUserId.value) return false
      return true
    default:
      return true
  }
}
onMounted(() => {
  loadUsers()
  // 有操作权限才显示表格操作栏
  if (
    globalStore.permissions.includes(UserPermissionEnum.IPTC) ||
    hasIpta() ||
    hasIptsa()
  ) {
    hasPermission.value = globalStore.permissions.includes(UserPermissionEnum.IPTC)
    state.interviewProcessData[0].isShow = true
  }
})
// 删除
const showDelete = (row: InterviewProcess.ListInfo) => {
  if (row.id) {
    mittBus.emit(OPEN_DIALOG, {
      title: $t('interviewProcess.deleteInterviewTitle'),
      content: `${$t('message.ques')}${$t('interviewProcess.deleteInterviewMsg')}`,
      center: 'center',
      size: 'small',
      confirm: () => messageConfirm(row)
    })
  }
}

// 消息弹窗
const messageConfirm = (row: InterviewProcess.ListInfo) => {
  deleteInterviewProcess(row.id)
    .then(res => {
      if (res?.code === ResultEnum.SUCCESS) {
        ElMessage.success({ message: $t('message.deleteSuc') })
      } else {
        ElMessage.error({ message: res?.message })
      }
      refreshTable()
    })
    .catch(res => {
      console.log('res?.message: ', res)
    })
}
// 打开编辑页面; shared and system template records open read-only
const showEdit = (id: number) => {
  const readonly = currentTab.value === TAB_SHARED || currentTab.value === TAB_TEMPLATES
  openNewWindow(`${ROUTER_SETTINGS_INTERVIEW_PROCESS_EDIT}/${id}${readonly ? '?readonly=1' : ''}`)
}
// 打开新增页面
const showCreateTemplate = () => {
  router.push({
    path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS_CREATE}`,
    query: { template: '1' }
  })
}

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
