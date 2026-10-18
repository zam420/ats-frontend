<template>
  <EspMain :title="$t('menu.testReview')">
    <EspTable
      ref="espTable"
      :columns="state.interviewerTableData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="getTestReviewList"
      rowKey="id"
      :selectable="activeSelected"
      :isFrontPagination="true"
      :refreshCallback="searchCallback"
      :activeTab="activeTab"
      @tabChange="changeTab"
    >
      <template #header="{ ids }" v-if="selectTab !== TestInterviewStatusEnum.SUITABLE && selectTab !== TestInterviewStatusEnum.UNSUITABLE">
        <ElButton
          :icon="CircleCheck"
          :disabled="ids.length === 0"
          @click="feedBackClick(ids, TestInterviewStatusEnum.SUITABLE)"
          class="btn-primary-gradient"
          >{{ $t('interviewer.feedbackFit') }}</ElButton
        >
        <ElButton
          :icon="CircleClose"
          :disabled="ids.length === 0"
          @click="feedBackClick(ids, TestInterviewStatusEnum.UNSUITABLE)"
          class="btn-primary-gradient"
          >{{ $t('interviewer.feedbackUnfit') }}</ElButton
        >
      </template>
      <template #link="scope">
        <a class="link" @click="showDetail(scope.row)">
          {{ scope.row.candidate_name }}
        </a>
      </template>
      <template #report="scope">
          <p class="desc file">
            <el-link @click="openFilePreview(scope?.row?.result_file)" href="javascript:void(0)" type="primary">
              {{ scope?.row?.result_file?.file_name ?? '' }}
            </el-link>
          </p>
        </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-tooltip :content="$t('opt.notSuitable')" placement="top">
          <span
              class="operation-icon"
              :class="{disabled: scope.row.status === TestInterviewStatusEnum.SUITABLE || scope.row.status === TestInterviewStatusEnum.UNSUITABLE}"
            >
            <i @click="feedBackClick([scope.row.id], TestInterviewStatusEnum.UNSUITABLE)" class="el-icon iconfont icon-unfit"></i>
          </span>
        </el-tooltip>
        <el-tooltip :content="$t('opt.suitable')" placement="top">
          <span
            class="operation-icon"
            :class="{disabled: scope.row.status === TestInterviewStatusEnum.SUITABLE || scope.row.status === TestInterviewStatusEnum.UNSUITABLE}"
          >
            <i @click="feedBackClick([scope.row.id], TestInterviewStatusEnum.SUITABLE)" class="el-icon iconfont icon-fit"></i>
          </span>
        </el-tooltip>
      </template>
    </EspTable>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts" name="TestReview">
import { CircleClose, CircleCheck } from '@element-plus/icons-vue'
import { TEST_INTERVIEW_TABLE, TEST_FEEDBACK_FORM } from './data'
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import { getTestReviewList, submitTestFeedback } from '@/api/modules/interviewer'
import { getTableTabs } from '@/utils'
import { TestInterviewStatus, TestInterviewStatusEnum } from '@/enums/testInterviewStatusEnum'
import router from '@/router'
import { ROUTER_CV_MANAGEMENT_DETAIL } from '@/router/routerName'
import mittBus from '@/utils/mittBus'
import { OPEN_FILE_PREVIEW } from '@/config'
import { ResultUploadInfo } from '@/api/interface'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'

const { $t } = useLocale()
const espTable = ref()
const espDialogFormRef = ref()
const route = useRoute()
const pathStatus = route?.query?.status ?? ''
const activeTab = ref<string>(pathStatus as string ?? '')
// 当前选择的tab
const selectTab = ref<number>()
const tabs = ref<Form.FormSelect[]>(getTableTabs(TestInterviewStatus))
// 列表表单
interface StateObj {
  interviewerTableData: Table.ColumnProps[]
  id: number
  result: boolean
}
const state = reactive<StateObj>({
  interviewerTableData: cloneDeep(TEST_INTERVIEW_TABLE),
  id: 0,
  result: true
})

const feedBackClick = (ids: number[], result: number) => {
  const feedbackData = cloneDeep(TEST_FEEDBACK_FORM).map(item => {
    if (item.prop === 'forward_ids') {
      item.value = ids
    } else if (item.prop === 'status') {
      item.value = result
    }
    return item
  })
  let title = result === TestInterviewStatusEnum.UNSUITABLE ? $t('interviewer.testFeedbackUn') : $t('interviewer.testFeedback')
  espDialogFormRef.value &&
    espDialogFormRef.value.acceptParams({
      title: title,
      isView: false,
      apiUrl: submitTestFeedback,
      formData: feedbackData,
      message: $t('message.feedbackSuc'),
      size: 'middle',
      getTableList: refreshTable
    })
}
// 查看详情
const showDetail = (item: any) => {
  const { href } = router.resolve({
    path: `/${ROUTER_CV_MANAGEMENT_DETAIL}/${item.resume_id}`,
    query: {
      exam_forward_id: item.id,
      status: item.status
    }
  })
  window.open(href, '_blank')
}

const activeSelected = (row: any) => {
  return row.status === TestInterviewStatusEnum.PENDING
}

const refreshTable = () => {
  espTable.value.refresh(null, true)
  espTable.value.clearSelection()
}

const openFilePreview = (file: ResultUploadInfo) => {
  mittBus.emit(OPEN_FILE_PREVIEW, file)
}
const changeTab = (value: number) => {
  selectTab.value = Number(value)
  const columns = espTable.value.getTableColumns()
  columns.forEach((col: Table.ColumnProps) => {
    if (col.columnType === TableColumnTypeEnum.SELECTION || col.columnType === TableColumnTypeEnum.OPERATION) {
      col.isShow = Number(value) !== TestInterviewStatusEnum.SUITABLE && Number(value) !== TestInterviewStatusEnum.UNSUITABLE
    }
  })
}
const searchCallback = () => {
  if (activeTab.value) {
    espTable.value.changeTabsData(activeTab.value, false)
  }
}
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
  }
}
</style>
