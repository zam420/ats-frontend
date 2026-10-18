<template>
  <div class="collapse-panel">
    <div class="job-title-panel">
      <div class="title">{{ `${$t('cv.appliedPosition')} ${state.applyJob}` }}</div>
    </div>
    <el-collapse v-model="activeNames" class="esp-collapse padding" v-if="state.testScoreList.length > 0">
      <el-collapse-item :name="index + 1" v-for="(item, index) in state.testScoreList" :key="item.id">
        <template #title>
          <div class="opt-panel">
            <el-icon><CaretRight /></el-icon>
            <div class="roundName">{{ `${getSuffix(index + 1)} ${$t('cv.roundTest')}` }}</div>
          </div>
          <div class="detail">
            <div>{{ `${$t('cv.sendBy')} ${item.created_by_name} ${$t('cv.on')} ${item.created_at}` }}</div>
          </div>
        </template>
        <div class="content-panel">
          <EspDetail :data="item.columns">
            <template #status="scope">
              <label>{{ scope.item.label }}:</label>
              <p>{{ ExamStatus?.[scope?.item?.value]?.name ?? ' ' }}</p>
              <span class="cancel-btn" v-if="scope?.item?.value === ExamStatusEnum.SCHEDULED && state.canCancel" @click="cancelExam(item.id)">{{ $t('button.cancel') }}</span>
            </template>
            <template #result="scope">
              <label>{{ scope.item.label }}:</label>
              <p class="desc pdf-row-content" v-if="scope.item.value">
                <el-link :href="scope.item.link" target="_blank" type="primary">{{ scope.item.value }}</el-link>
              </p>
            </template>
          </EspDetail>
        </div>
      </el-collapse-item>
    </el-collapse>
    <template v-else>
      <EspNoData :title="$t('table.noData')" />
    </template>
  </div>
</template>
<script setup lang="ts" name="WrittenTestScore">
import { cancelWrittenExam, getWrittenTestScore } from '@/api/modules/cv'
import { useLocale } from '@/hooks/useLocale'
import { getSuffix } from '@/utils'
import { cloneDeep } from 'lodash'
import { WRITTEN_TEST_SCORE_DETAIL } from '../data'
import CV from '@/api/interface/cv'
import { ExamStatus, ExamStatusEnum } from '@/enums/examStatusEnum'
import { ExamCheatStatus } from '@/enums/examCheatStatusEnum'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
const { $t } = useLocale()
interface TestScore {
  id: number
  created_at: string
  created_by_name: string
  columns: Form.DetailItem[]
}
interface StateProps {
  applyJob: string
  testScoreList: TestScore[]
  candidateResumeId: number
  canCancel: boolean
}
const activeNames = ref<number[]>([1])
const state = reactive<StateProps>({
  applyJob: '',
  testScoreList: [],
  candidateResumeId: 0,
  canCancel: true
})

// 接收父组件传过来的参数
const acceptParams = (resumeId: number, applyJob: string, canCancel: boolean) => {
  state.applyJob = applyJob
  state.candidateResumeId = resumeId
  state.canCancel = canCancel
  refreshExamList()
}

// refresh exam list
const refreshExamList = () => {
  getWrittenTestScore(state.candidateResumeId).then(res => {
    const detailList: CV.TestScore[] = res?.result ?? []
    const testScoreList: TestScore[] = []
    detailList.forEach(detail => {
      const roundData: TestScore = {
        id: detail.id,
        created_at: detail?.created_at ?? '',
        created_by_name: detail?.created_by_name ?? '',
        columns: cloneDeep(WRITTEN_TEST_SCORE_DETAIL)
      }
      roundData.columns.forEach(data => {
        switch(data.prop) {
          case 'status':
            data.value = detail?.status ?? ''
            break
          case 'cheat_status':
            data.value = ExamCheatStatus?.[detail?.cheat_status]?.name ?? ' '
            break
          case 'score':
            data.value = detail?.score || detail?.score === 0 ? `${detail?.score ?? 0}/${detail.paper_score ?? 100}` : ' '
            break
          case 'result_file':
            data.value = detail?.result_file ? detail?.result_file?.file_name?.replace(/\.[^/.]+$/, "") : ' '
            data.link = detail?.result_url ?? ''
            break
          case 'paper_name':
            data.value = detail?.[data.prop as keyof CV.TestScore] ?? ' '
            break
          default:
            data.value = detail?.[data.prop as keyof CV.TestScore] ?? ' '
            break
        }
        
      })
      testScoreList.push(roundData)
    })
    state.testScoreList = [...testScoreList]
  })
}

const cancelExam = (id: number) => {
  mittBus.emit(OPEN_DIALOG, {
    title: $t('cv.cancelWrittenTest'),
    content: `${$t('message.ques')}${$t('button.cancel')}?`,
    center: 'center',
    size: 'small',
    confirm: () => {
      cancelWrittenExam(id).then(res => {
        if (res.success) {
          ElMessage.success($t('message.cancelTestSuc'))
          refreshExamList()
        }
      })
    }
  })
}
defineExpose({
  acceptParams
})
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
