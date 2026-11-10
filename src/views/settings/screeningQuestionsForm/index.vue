<template>
  <EspMain :title="$t('screeningForms.title')">
    <template #right>
      <ElButton v-if="has(SQTSA)" class="btn-light" @click="create(true)">{{ $t('interviewProcess.createTemplate') }}</ElButton>
      <ElButton v-if="has(SQTC)" class="btn-primary-gradient" @click="create(false)">{{ $t('button.create') }}</ElButton>
    </template>
    <EspTable
      ref="table" :columns="columns" :is-set-col="false" :page-search="true" :tabs="tabs"
      :request-api="requestList" row-key="id" :init-param="{ tab: 'owned' }" active-tab="owned"
      status-key="tab" :is-front-pagination="false" @tab-change="onTabChange"
    >
      <template #name="{ row }">
        <router-link class="form-link" :to="formUrl(row)">{{ row.name }}</router-link>
      </template>
      <template #owner_id="{ row }">{{ userNames[row.owner_id] ?? '' }}</template>
      <template #form_type="{ row }">
        {{ $t(planTypeMessageKey(row)) }}
      </template>
      <template #operation="{ row }">
        <template v-if="canEdit(row)">
          <el-tooltip :content="$t('opt.edit')" placement="top">
            <span class="operation-icon"><i class="iconfont icon-edit text-primary-gradient" @click="openEdit(row)" /></span>
          </el-tooltip>
          <el-tooltip v-if="!row.is_system_template && has(SQTE)" :content="$t('opt.delete')" placement="top">
            <span class="operation-icon"><i class="iconfont icon-delete text-primary-gradient" @click="remove(row)" /></span>
          </el-tooltip>
        </template>
      </template>
    </EspTable>
  </EspMain>
</template>

<script setup lang="ts">
import { getScreeningForms, deactivateScreeningForm } from '@/api/modules/screeningQuestionsForm'
import type { ScreeningFormListItem } from '@/api/interface/screeningQuestionsForm'
import { getUserList } from '@/api/modules/common'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { UserPermissionEnum } from '@/enums/userPermission'
import { useGlobalStore } from '@/store/modules/global'
import { useLocale } from '@/hooks/useLocale'
import { planTypeMessageKey } from '@/utils/planType'
import { ROUTER_SETTINGS_SCREENING_FORMS_CREATE, ROUTER_SETTINGS_SCREENING_FORMS_EDIT, ROUTER_SETTINGS_SCREENING_FORMS_VIEW } from '@/router/routerName'

const { SQTC, SQTE, SQTA, SQTSA } = UserPermissionEnum
const { $t } = useLocale()
const store = useGlobalStore()
const router = useRouter()
const table = ref()
const userNames = ref<Record<string, string>>({})
const currentTab = ref('owned')
const has = (permission: UserPermissionEnum) => store.permissions.includes(permission)
const tabs = [
  { label: $t('interviewProcess.owned'), value: 'owned' },
  { label: $t('interviewProcess.shared'), value: 'shared' },
  { label: $t('interviewProcess.systemTemplates'), value: 'templates' },
  { label: $t('screeningForms.all'), value: 'all' }
]
const columns = reactive<Table.ColumnProps[]>([
  { columnType: TableColumnTypeEnum.OPERATION, label: $t('table.operate'), width: 80, fixed: TableColumnFixedEnum.LEFT, isShow: true },
  { prop: 'name', label: $t('screeningForms.name'), filter: false, minWidth: 30 },
  { prop: 'owner_id', label: $t('interviewProcess.owner'), filter: false, sortable: false, minWidth: 20 },
  { prop: 'question_sequence', label: $t('screeningForms.questionSequence'), filter: false, sortable: false, minWidth: 40 },
  { prop: 'form_type', label: $t('interviewProcess.type'), filter: false, sortable: false, isShow: false, minWidth: 20 },
  { prop: 'description', label: $t('interviewProcess.description'), filter: false, minWidth: 50 }
])
const onTabChange = (tab: string) => {
  currentTab.value = tab
  const column = columns.find(item => item.prop === 'form_type')
  if (column) column.isShow = tab === 'all'
}
const requestList = (params: Record<string, any>) => {
  const { tab, page_num, page_size, order_by, order } = params
  return getScreeningForms(tab || 'owned', { pageNum: page_num, pageSize: page_size, orderBy: order_by, isAsc: order == null ? undefined : order === 1 })
}
const canEdit = (row: ScreeningFormListItem) => {
  if (row.is_system_template) return has(SQTSA)
  return has(SQTE) && (has(SQTA) || (!!store.userInfo?.id && store.userInfo.id === row.owner_id))
}
const formUrl = (row: ScreeningFormListItem) =>
  `/${canEdit(row) ? ROUTER_SETTINGS_SCREENING_FORMS_EDIT : ROUTER_SETTINGS_SCREENING_FORMS_VIEW}/${encodeURIComponent(row.id)}`
const openEdit = (row: ScreeningFormListItem) => router.push(formUrl(row))
const create = (template: boolean) => router.push({ path: `/${ROUTER_SETTINGS_SCREENING_FORMS_CREATE}`, query: template ? { template: '1' } : {} })
const remove = async (row: ScreeningFormListItem) => {
  try {
    await ElMessageBox.confirm($t('screeningForms.deleteConfirm'), $t('opt.delete'), { type: 'warning' })
  } catch {
    return
  }
  const result = await deactivateScreeningForm(row.id)
  if (result?.success) {
    ElMessage.success($t('message.deleteSuc'))
    table.value?.refresh(null, true)
  }
}
onMounted(async () => {
  const result = await getUserList(ShareTypeEnum.INTERVIEWER)
  userNames.value = Object.fromEntries((result?.result ?? []).map(user => [user.id, user.name]))
})
</script>
<style lang="less" scoped>
.form-link { color: var(--el-color-primary); &:hover { text-decoration: underline; } }
.btn-light { color: var(--el-color-primary); }
</style>
