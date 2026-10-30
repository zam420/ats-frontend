<template>
  <EspMain :title="$t('menu.recruitmentPipeline')">
    <EspTable
      ref="espTable"
      :columns="state.pipelineData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="requestList"
      rowKey="id"
      :initParam="initParam"
      :activeTab="defaultTab"
      statusKey="tab"
      :is-front-pagination="false"
      @tab-change="onTabChange"
    >
      <template #header="">
        <ElButton v-if="hasRptsa()" class="btn-light" @click="showCreateTemplate">{{
          $t('interviewProcess.createTemplate')
        }}</ElButton>
        <ElButton v-if="hasRptc()" @click="showCreate" class="btn-primary-gradient">{{
          $t('button.create')
        }}</ElButton>
      </template>
      <template #owner_id="{ row }">
        {{ userNames[row.owner_id] ?? '' }}
      </template>
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
import { openNewWindow } from '@/utils'
import { ResultEnum } from '@/enums/httpEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
import { RECRUITMENT_PIPELINE_TABLE } from './data'
import router from '@/router'
import {
  ROUTER_SETTINGS_RECRUITMENT_PIPELINE_CREATE,
  ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT
} from '@/router/routerName'
import RecruitmentPipeline from '@/api/interface/recruitmentPipeline'
import { UserPermissionEnum } from '@/enums/userPermission'
import {
  getRecruitmentPipelineList,
  getOwnedRecruitmentPipelineList,
  getSharedRecruitmentPipelineList,
  getTemplateRecruitmentPipelineList,
  deleteRecruitmentPipeline
} from '@/api/modules/recruitmentPipeline'
import { getUserList } from '@/api/modules/common'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'

const TAB_OWNED = 'owned'
const TAB_SHARED = 'shared'
const TAB_TEMPLATES = 'templates'
const TAB_ALL = 'all_plans'

const espTable = ref()
const globalStore = useGlobalStore()
const { $t } = useLocale()

const hasRpta = () => globalStore.permissions.includes(UserPermissionEnum.RPTA)
const hasRptsa = () => globalStore.permissions.includes(UserPermissionEnum.RPTSA)
const hasRptc = () => globalStore.permissions.includes(UserPermissionEnum.RPTC)

// Without the create permission nothing can be owned, so the Owned tab is hidden and Shared is the default
const defaultTab = hasRptc() ? TAB_OWNED : TAB_SHARED
const tabs = ref<Form.FormSelect[]>(
  [
    { label: $t('interviewProcess.owned'), value: TAB_OWNED, count: 0 },
    { label: $t('interviewProcess.shared'), value: TAB_SHARED, count: 0 },
    { label: $t('interviewProcess.systemTemplates'), value: TAB_TEMPLATES, count: 0 },
    { label: $t('interviewProcess.allPlans'), value: TAB_ALL, count: 0 }
  ].filter(tab => tab.value !== TAB_OWNED || hasRptc())
)
const currentTab = ref<string>(defaultTab)
const onTabChange = (tab: string) => {
  currentTab.value = tab
}
interface StateObj {
  pipelineData: Table.ColumnProps[]
}
const state = reactive<StateObj>({
  pipelineData: cloneDeep(RECRUITMENT_PIPELINE_TABLE)
})
const initParam = ref<Record<string, any>>({ tab: defaultTab })

// The selected tab decides which backend API is called; the tab key itself is not sent
const requestList = (params: Record<string, any>) => {
  const { tab, ...query } = params
  if (tab === TAB_SHARED) return getSharedRecruitmentPipelineList(query)
  if (tab === TAB_TEMPLATES) return getTemplateRecruitmentPipelineList(query)
  if (tab === TAB_ALL) return getRecruitmentPipelineList(query)
  return getOwnedRecruitmentPipelineList(query)
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

// Whether the edit/delete icons are shown for a row, depending on the tab
const canOperate = (row: RecruitmentPipeline.ListInfo) => {
  if (row.is_system_template && !hasRptsa()) return false
  switch (currentTab.value) {
    case TAB_SHARED:
      return hasRpta()
    case TAB_TEMPLATES:
      return hasRptsa()
    case TAB_ALL:
      if (!hasRpta() && row.owner_id !== currentUserId.value) return false
      return true
    default:
      return true
  }
}
onMounted(() => {
  loadUsers()
  if (hasRptc() || hasRpta() || hasRptsa()) {
    state.pipelineData[0].isShow = true
  }
})
const showDelete = (row: RecruitmentPipeline.ListInfo) => {
  if (row.id) {
    mittBus.emit(OPEN_DIALOG, {
      title: $t('recruitmentPipeline.deletePipelineTitle'),
      content: `${$t('message.ques')}${$t('recruitmentPipeline.deletePipelineMsg')}`,
      center: 'center',
      size: 'small',
      confirm: () => messageConfirm(row)
    })
  }
}

const messageConfirm = (row: RecruitmentPipeline.ListInfo) => {
  deleteRecruitmentPipeline(row.id)
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
// Shared and system template records open read-only
const showEdit = (id: number) => {
  const readonly = currentTab.value === TAB_SHARED || currentTab.value === TAB_TEMPLATES
  openNewWindow(
    `${ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT}/${id}${readonly ? '?readonly=1' : ''}`
  )
}
const showCreateTemplate = () => {
  router.push({
    path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE_CREATE}`,
    query: { template: '1' }
  })
}
const showCreate = () => {
  router.push({
    path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE_CREATE}`
  })
}
const refreshTable = () => {
  espTable.value.refresh(null, true)
}
</script>
<style lang="less" scoped>
.btn-light {
  color: var(--el-color-primary);
}
</style>
