<template>
  <EspMain :title="$t('menu.resumeReview')">
    <EspTable
      ref="espTable"
      :columns="state.interviewerTableData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="getInterviewerResumeList"
      rowKey="id"
      :selectable="activeSelected"
      :isFrontPagination="true"
      :activeTab="activeTab"
      :refreshCallback="searchCallback"
      @tabChange="changeTab"
    >
      <template #header="{ ids }" v-if="selectTab !== InterviewerStatusEnum.SUITABLE && selectTab !== InterviewerStatusEnum.UNSUITABLE">
        <ElButton
          :icon="CircleCheck"
          :disabled="ids.length === 0"
          @click="feedBackClick(ids, InterviewerStatusEnum.SUITABLE)"
          class="btn-primary-gradient"
          >{{ $t('interviewer.feedbackFit') }}</ElButton
        >
        <ElButton
          :icon="CircleClose"
          :disabled="ids.length === 0"
          @click="feedBackClick(ids, InterviewerStatusEnum.UNSUITABLE)"
          class="btn-primary-gradient"
          >{{ $t('interviewer.feedbackUnfit') }}</ElButton
        >
        <ElButton
          :icon="Remove"
          :disabled="ids.length === 0"
          @click="feedBackClick(ids, InterviewerStatusEnum.HOLD)"
          :class="{ 'btn-primary-gradient': false, 'btn-primary': true, 'btn-light': true }"
          >{{ $t('interviewer.hold') }}</ElButton
        >
      </template>
      <template #link="scope">
        <a class="link" @click="showDetail(scope.row)">
          {{ scope.row.candidate_name }}
        </a>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-tooltip :content="$t('opt.notSuitable')" placement="top">
          <span
              class="operation-icon"
              :class="{disabled: scope.row.status === InterviewerStatusEnum.SUITABLE || scope.row.status === InterviewerStatusEnum.UNSUITABLE}"
            >
            <i @click="feedBackClick([scope.row.id], InterviewerStatusEnum.UNSUITABLE)" class="el-icon iconfont icon-unfit"></i>
          </span>
        </el-tooltip>
        <el-tooltip :content="$t('opt.hold')" placement="top">
          <span
            class="operation-icon"
            :class="{disabled: scope.row.status === InterviewerStatusEnum.SUITABLE || scope.row.status === InterviewerStatusEnum.UNSUITABLE}"
          >
            <i
              @click="feedBackClick([scope.row.id], InterviewerStatusEnum.HOLD)"
              class="el-icon iconfont icon-keep-view"
            ></i>
          </span>
        </el-tooltip>
        <el-tooltip :content="$t('opt.suitable')" placement="top">
          <span
            class="operation-icon"
            :class="{disabled: scope.row.status === InterviewerStatusEnum.SUITABLE || scope.row.status === InterviewerStatusEnum.UNSUITABLE}"
          >
            <i @click="feedBackClick([scope.row.id], InterviewerStatusEnum.SUITABLE)" class="el-icon iconfont icon-fit"></i>
          </span>
        </el-tooltip>
      </template>
    </EspTable>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts" name="ResumeReview">
import { CircleClose, CircleCheck, Remove } from '@element-plus/icons-vue'
import { INTERVIEWER_TABLE, FEEDBACK_FORM } from './data'
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import { getInterviewerResumeList, postInterviewerFeedbackForward } from '@/api/modules/interviewer'
import { getTableTabs } from '@/utils'
import { InterviewerStatus, InterviewerStatusEnum } from '@/enums/interviewerEnum'
import router from '@/router'
import { ROUTER_CV_MANAGEMENT_DETAIL } from '@/router/routerName'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'

// 是否有按钮操作权限
// const hasPermission = ref(false)
const { $t } = useLocale()
const espTable = ref()
const espDialogFormRef = ref()
const route = useRoute()
const pathStatus = route?.query?.status ?? ''
const activeTab = ref<string>(pathStatus as string ?? '')
// 当前选择的tab
const selectTab = ref<number>()
const tabs = ref<Form.FormSelect[]>(getTableTabs(InterviewerStatus))
// 列表表单
interface StateObj {
  interviewerTableData: Table.ColumnProps[]
  id: number
  result: boolean
}
const state = reactive<StateObj>({
  interviewerTableData: cloneDeep(INTERVIEWER_TABLE),
  id: 0,
  result: true
})

const feedBackClick = (ids: number[], result: number) => {
  const feedbackData = cloneDeep(FEEDBACK_FORM).map(item => {
    if (item.prop === 'resume_forward_ids') {
      item.value = ids
    } else if (item.prop === 'feedback') {
      item.value = result
    }
    return item
  })
  let title = $t('interviewer.resumeFeedback')
  if (result === InterviewerStatusEnum.HOLD) {
    title = $t('interviewer.resumeFeedbackHold')
  }
  if (result === InterviewerStatusEnum.UNSUITABLE) {
    title = $t('interviewer.resumeFeedbackUn')
  }
  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: title,
      isView: false,
      apiUrl: postInterviewerFeedbackForward,
      formData: feedbackData,
      message: $t('message.feedbackSuc'),
      size: 'middle',
      getTableList: refreshTable
    })
}
// 查看详情
const showDetail = (item: any) => {
  const { href } = router.resolve({
    path: `/${ROUTER_CV_MANAGEMENT_DETAIL}/${item.candidate_resume_id}`,
    query: {
      forward_id: item.id,
      status: item.status
    }
  })
  window.open(href, '_blank')
}

const activeSelected = (row: any) => {
  return row.status === InterviewerStatusEnum.PENDING || row.status === InterviewerStatusEnum.HOLD
}

const refreshTable = () => {
  espTable.value.refresh(null, true)
  espTable.value.clearSelection()
}

const changeTab = (value: number) => {
  selectTab.value = Number(value)
  const columns = espTable.value.getTableColumns()
  columns.forEach((col: Table.ColumnProps) => {
    if (col.columnType === TableColumnTypeEnum.SELECTION || col.columnType === TableColumnTypeEnum.OPERATION) {
      col.isShow = Number(value) !== InterviewerStatusEnum.SUITABLE && Number(value) !== InterviewerStatusEnum.UNSUITABLE
    }
  })
}

const searchCallback = () => {
  if (activeTab.value) {
    espTable.value.changeTabsData(activeTab.value, false)
  }
}
nextTick(() => {})
</script>
<style lang="less" scoped>
&:deep(.el-dialog__body) {
  text-align: center;
}

.operation-icon {
  &.disabled {
    .iconfont {
      .bg-gradient(var(--color-gray3), var(--color-gray3)) !important;
      background-clip: text !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
  .iconfont {
    font-size: 1.4rem;
    cursor: pointer;
    height: 1.6rem;
    width: 1.5rem;
    &.icon-fit {
      .bg-gradient(var(--el-color-success-light-3), var(--el-color-success-light-2));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    &.icon-unfit {
      .bg-gradient(var(--el-color-danger-light-2), var(--el-color-danger-light-1));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    &.icon-keep-view {
      .bg-gradient(var(--el-color-warning-light-2), var(--el-color-warning));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}
</style>
