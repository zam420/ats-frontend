<template>
  <EspMain :title="$t('menu.myInterview')">
    <EspTable
      ref="espTable"
      :columns="state.interviewerTableData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="getMyInterviewList"
      rowKey="id"
      :tab-need-fresh="true"
      :isFrontPagination="true"
      statusKey="time_type"
      :initParam="initParam"
      :formatTable="initTable"
    >
      <template #link="scope">
        <a class="link" @click="showDetail(scope.row)">
          {{ scope.row.candidate_name }}
        </a>
      </template>
      <template #status="scope">
        <div class="status-warp">
          <div
            class="status"
            :class="MyInterviewStatus[scope.row.status]?.status ?? ''"
          ></div>
          <!-- 这里需要获取detail id如果有的话则显示详情，因为目前没有所以随便先拿个字段来写逻辑 -->
          <a class="link" v-if="scope.row.status === MyInterviewStatusEnum.EVALUATED" @click="jumpToDetailPage(scope.row)">
          {{ MyInterviewStatus[scope.row.status]?.name ?? '' }}
          </a>
          <span v-else>
            {{ MyInterviewStatus[scope.row.status]?.name ?? '' }}
          </span>
        </div>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-tooltip :content="$t('opt.edit')" placement="top">
          <span
            class="operation-icon"
            :class="scope.row.read_only ? 'disabled' : ''"
          >
            <i @click="editFeedBack(scope.row)" class="el-icon iconfont icon-create_edit text-primary-gradient"></i>
          </span>
        </el-tooltip>
      </template>
    </EspTable>
  </EspMain>
</template>
<script setup lang="ts" name="MyInterview">
import { INTERVIEWER_TABLE, TAB_LIST } from './data'
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import { getMyInterviewList } from '@/api/modules/myInterview'
import router from '@/router'
import { ROUTER_CV_MANAGEMENT_DETAIL, ROUTER_INTERVIEWER_MY_REVIEW_CREATE, ROUTER_INTERVIEWER_MY_REVIEW_DETAIL, ROUTER_INTERVIEWER_MY_REVIEW_EDIT } from '@/router/routerName'
import { InterviewMode, MyInterviewStatus, MyInterviewStatusEnum } from '@/enums/myInterviewStatusEnum'
import { useInterviewStore } from '@/store/modules/interview'
import MyInterview from '@/api/interface/myInterview'
import { InterviewSession } from '@/enums/interviewSessionEnum'
import { WorkLocationEnum } from '@/enums/workLocationEnum'

const { $t } = useLocale()
const espTable = ref()
const interviewStore = useInterviewStore()
const tabs = ref<Form.FormSelect[]>(cloneDeep(TAB_LIST))
const initParam = ref<Record<string, any>>({time_type: tabs.value?.[0]?.value})
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

const editFeedBack = async (data: MyInterview.InterviewInfo) => {
  const positionLocations = data?.applying_position_locations?.map(d => d.value)
  const isIndiaPosition = positionLocations.includes(WorkLocationEnum.INDIA) || positionLocations.includes(WorkLocationEnum.INDIA_PUNE)
  await interviewStore.setInterviewInfo({
    interviewMode: data.interview_mode,
    interviewTime: data.interview_time,
    interviewers: data.interviewerNames,
    interviewType: data.round_type,
    interviewRoundId: data.round_id,
    candidateResumeId: data.candidate_resume_id,
    readOnly: data.read_only,
    isIndiaPosition: isIndiaPosition,
    candidateName: data.candidate_name
  })
  if (data.status === MyInterviewStatusEnum.EVALUATED && data.feedback_id) {
    const { href } = router.resolve({
      path: `/${ROUTER_INTERVIEWER_MY_REVIEW_EDIT}/${data.feedback_id}`
    })
    window.open(href, '_blank')
    return
  }
  router.push({
    path: `/${ROUTER_INTERVIEWER_MY_REVIEW_CREATE}`
  })
}

const jumpToDetailPage = async (data: MyInterview.InterviewInfo) => {
  if (data.feedback_id) {
    const positionLocations = data?.applying_position_locations?.map(d => d.value)
    const isIndiaPosition = positionLocations.includes(WorkLocationEnum.INDIA) || positionLocations.includes(WorkLocationEnum.INDIA_PUNE)
    await interviewStore.setInterviewInfo({
      interviewMode: data.interview_mode,
      interviewTime: data.interview_time,
      interviewers: data.interviewerNames,
      interviewType: data.round_type,
      interviewRoundId: data.round_id,
      candidateResumeId: data.candidate_resume_id,
      readOnly: data.read_only,
      isIndiaPosition: isIndiaPosition,
      candidateName: data.candidate_name
    })
    const { href } = router.resolve({
      path: `/${ROUTER_INTERVIEWER_MY_REVIEW_DETAIL}/${data.feedback_id}`
    })
    window.open(href, '_blank')
  }
}

const initTable = (tables: MyInterview.InterviewInfo[]) => {
  return tables?.map(item => {
    item.interview_time = `${item.interview_time_from?.substring(0, 16)} - ${item.interview_time_to?.substring(11, 16)}`
    item.interview_mode = item?.is_online === InterviewMode.ONLINE ? $t('interviewer.online') : $t('interviewer.faceToFace')
    item.interviewerNames = item.interviewers?.map(info => info.name)?.join(', ') ?? ''
    item.interview_type = InterviewSession?.[item.round_type]?.name ?? ''
    return item
  })
}

// 查看详情
const showDetail = (item: any) => {
  const { href } = router.resolve({
    path: `/${ROUTER_CV_MANAGEMENT_DETAIL}/${item.candidate_resume_id}`,
    query: {
      isView: 'true'
    }
  })
  window.open(href, '_blank')
}

nextTick(() => {})
</script>
<style lang="less" scoped></style>
