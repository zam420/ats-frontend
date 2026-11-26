<template>
  <div v-loading="loading">
    <template v-if="evaluations">
      <p v-if="!evaluations.initialized">{{ $t('candidatePipeline.noEvaluations') }}</p>
      <template v-else>
        <p>{{ $t('candidatePipeline.overallResult') }}: {{ evaluations.decision === null ? $t('candidatePipeline.pending') : decisionLabel(evaluations.decision) }}</p>
        <div v-if="editable && evaluations.can_decide && !currentRound" class="controls">
          <el-select v-model="decision" :placeholder="$t('candidatePipeline.selectResult')" :disabled="saving">
            <el-option :label="decisionLabel(0)" :value="0" /><el-option :label="decisionLabel(1)" :value="1" />
          </el-select>
          <el-popconfirm :title="$t('candidatePipeline.confirmDecision')" @confirm="saveDecision">
            <template #reference><el-button type="primary" :disabled="decision === null || saving">{{ $t('candidatePipeline.decideResult') }}</el-button></template>
          </el-popconfirm>
        </div>
        <section v-for="round in evaluations.rounds" :key="round.id" class="round">
          <h2>{{ round.name }} <small v-if="currentRound?.id === round.id">{{ $t('candidatePipeline.currentRound') }}</small></h2>
          <p v-if="round.description">{{ round.description }}</p>
          <p>{{ statusLabel(round.status) }}<span v-if="round.result !== null"> · {{ $t('candidatePipeline.result') }}: {{ resultLabel(round.result) }}</span></p>
          <p v-if="round.scheduled_at">{{ $t('candidatePipeline.scheduleTime') }}: {{ new Date(round.scheduled_at).toLocaleString() }}</p>
          <p>{{ $t('candidatePipeline.interviewer') }}: {{ interviewerNames(round.interviewers) }}</p>
          <div class="controls">
            <el-button v-if="editable && currentRound?.id === round.id" :disabled="saving" @click="openSchedule(round)">{{ $t('candidatePipeline.schedule') }}</el-button>
            <el-button v-if="editable && round.status !== 4" :disabled="saving" @click="openInterviewers(round)">{{ $t('candidatePipeline.changeInterviewers') }}</el-button>
            <el-tooltip :content="$t('candidatePipeline.feedbackLater')"><span><el-button disabled>{{ $t('candidatePipeline.viewFeedback') }}</el-button></span></el-tooltip>
          </div>
          <div v-if="editable && currentRound?.id === round.id" class="controls">
            <el-select v-model="status" :placeholder="$t('candidatePipeline.updateStatus')" :disabled="saving">
              <el-option v-for="value in [0, 2, 3]" :key="value" :label="statusLabel(value)" :value="value" />
            </el-select>
            <el-button :disabled="status === null || saving" @click="saveStatus(round.id)">{{ $t('candidatePipeline.updateStatus') }}</el-button>
          </div>
          <div v-if="editable && currentRound?.id === round.id" class="controls">
            <el-select v-model="result" :placeholder="$t('candidatePipeline.selectResult')" :disabled="saving">
              <el-option v-for="value in [0, 3, 4, 1, 2]" :key="value" :label="resultLabel(value)" :value="value" />
            </el-select>
            <el-popconfirm :title="$t('candidatePipeline.confirmRoundResult')" @confirm="saveResult(round.id)">
              <template #reference><el-button type="primary" :disabled="result === null || saving">{{ $t('candidatePipeline.recordResult') }}</el-button></template>
            </el-popconfirm>
          </div>
        </section>
        <el-button v-if="editable" :disabled="saving" @click="openAdd">{{ $t('candidatePipeline.addRound') }}</el-button>
      </template>
    </template>
    <div v-else-if="loadFailed">
      <p>{{ $t('candidatePipeline.evaluationLoadError') }}</p>
      <el-button :disabled="loading" @click="load">{{ $t('candidatePipeline.retryEvaluations') }}</el-button>
    </div>
    <el-dialog v-model="dialogOpen" :title="$t(dialogTitle)" width="min(500px, 90vw)"
      :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <el-form label-position="top" :disabled="saving" @submit.prevent="submitDialog">
        <template v-if="dialogMode === 'add'">
          <el-form-item :label="$t('candidatePipeline.roundName')" required><el-input v-model="form.name" maxlength="30" /></el-form-item>
          <el-form-item :label="$t('candidatePipeline.roundDescription')"><el-input v-model="form.description" maxlength="100" type="textarea" /></el-form-item>
          <el-form-item :label="$t('candidatePipeline.roundType')" required>
            <el-select v-model="form.roundType">
              <el-option v-for="(key, index) in roundTypes" :key="key" :label="$t(`candidatePipeline.${key}`)" :value="index" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item v-if="dialogMode === 'schedule'" :label="$t('candidatePipeline.scheduleTime')" required>
          <el-date-picker v-model="form.scheduledAt" type="datetime" />
        </el-form-item>
        <el-form-item :label="$t('candidatePipeline.interviewer')">
          <el-select v-model="form.interviewers" multiple filterable>
            <el-option v-for="user in evaluations?.interviewers ?? []" :key="user.id" :value="user.id" :label="`${user.name} (${user.email})`" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialogOpen = false">{{ $t('button.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="submitDialog">{{ $t('button.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  getCandidateEvaluations, scheduleEvaluation, changeEvaluationInterviewers, changeEvaluationStatus,
  recordEvaluationResult, addEvaluationRound, decideEvaluations
} from '@/api/modules/candidatePipeline'
import type { CandidateEvaluations, EvaluationRoundResult } from '@/api/modules/candidatePipeline'
import type { ResultData } from '@/api/interface'
import { useLocale } from '@/hooks/useLocale'
import { evaluationRoundResultKeys } from '../evaluationProgress'

type Round = CandidateEvaluations['rounds'][number]
type Result = EvaluationRoundResult
type Status = 0 | 2 | 3
const props = defineProps<{ jobId: string; candidateId: string }>()
const { $t } = useLocale()
const evaluations = ref<CandidateEvaluations>()
const loading = ref(false)
const loadFailed = ref(false)
const saving = ref(false)
const currentRound = computed(() => evaluations.value?.rounds.find(round => round.status !== 4))
const editable = computed(() => evaluations.value?.can_manage && evaluations.value.decision === null)
const status = ref<Status | null>(null)
const result = ref<Result | null>(null)
const decision = ref<0 | 1 | null>(null)
const dialogOpen = ref(false)
const dialogMode = ref<'schedule' | 'interviewers' | 'add'>('add')
const selectedRound = ref<string>()
const form = reactive<{ name: string; description: string; roundType: 0 | 1 | 2 | 3; scheduledAt: Date | null; interviewers: string[] }>({
  name: '', description: '', roundType: 3, scheduledAt: null, interviewers: []
})
const roundTypes = ['roundTypeHr', 'roundTypeFunctional', 'roundTypeExecutive', 'roundTypeCustom']
const dialogTitle = computed(() => `candidatePipeline.${dialogMode.value === 'add' ? 'addRound' : dialogMode.value === 'schedule' ? 'schedule' : 'changeInterviewers'}`)
const statusLabel = (value: number) => $t(`candidatePipeline.${['pending', 'scheduled', 'inProgress', 'awaitingFeedback', 'completed'][value]}`)
const decisionLabel = (value: number) => $t(`candidatePipeline.${['passed', 'failed'][value]}`)
const resultLabel = (value: number) => $t(`candidatePipeline.${evaluationRoundResultKeys[value]}`)
const interviewerNames = (ids: string[] | null) => ids?.length
  ? ids.map(id => evaluations.value?.interviewers.find(user => user.id === id)?.name || id).join(', ')
  : $t('candidatePipeline.noInterviewers')
let disposed = false

const load = async () => {
  loading.value = true
  loadFailed.value = false
  try {
    const response = await getCandidateEvaluations(props.jobId, props.candidateId)
    if (!response.success || !response.result || !Array.isArray(response.result.rounds)
      || !Array.isArray(response.result.interviewers) || typeof response.result.can_manage !== 'boolean'
      || typeof response.result.can_decide !== 'boolean' || typeof response.result.initialized !== 'boolean'
      || (response.result.decision !== null && response.result.decision !== 0 && response.result.decision !== 1)
      || response.result.interviewers.some(user => typeof user.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string')
      || response.result.rounds.some(round => typeof round.id !== 'string' || !Number.isInteger(round.order)
        || !Number.isInteger(round.status) || round.status < 0 || round.status > 4
        || (round.result !== null && (!Number.isInteger(round.result) || round.result < 0 || round.result > 4))
        || ((round.status === 4) !== (round.result !== null))
        || (round.scheduled_at !== null && Number.isNaN(new Date(round.scheduled_at).getTime()))
        || (round.interviewers !== null && (!Array.isArray(round.interviewers)
          || round.interviewers.some(id => typeof id !== 'string'))))) {
      throw new Error('Invalid evaluations')
    }
    if (!disposed) {
      response.result.rounds.sort((a, b) => a.order - b.order)
      evaluations.value = response.result
    }
  } catch (error) {
    if (!disposed) {
      evaluations.value = undefined
      loadFailed.value = true
      console.error('Failed to load evaluations', error)
      ElMessage.error($t('candidatePipeline.evaluationLoadError'))
    }
  } finally {
    if (!disposed) loading.value = false
  }
}
onMounted(load)
onBeforeUnmount(() => { disposed = true })

const mutate = async (action: () => Promise<ResultData<boolean>>) => {
  if (saving.value) return
  saving.value = true
  try {
    const response = await action()
    if (!response.success || response.result !== true) throw new Error('Evaluation update was not accepted')
    if (!disposed) {
      dialogOpen.value = false
      status.value = null
      result.value = null
      decision.value = null
      ElMessage.success($t('candidatePipeline.evaluationSaved'))
      await load()
    }
  } catch (error) {
    if (!disposed) {
      console.error('Failed to update evaluations', error)
      ElMessage.error($t('candidatePipeline.evaluationSaveError'))
      await load()
    }
  } finally {
    if (!disposed) saving.value = false
  }
}
const openSchedule = (round: Round) => {
  dialogMode.value = 'schedule'
  selectedRound.value = round.id
  form.scheduledAt = round.scheduled_at ? new Date(round.scheduled_at) : null
  form.interviewers = [...(round.interviewers ?? [])]
  dialogOpen.value = true
}
const openInterviewers = (round: Round) => {
  dialogMode.value = 'interviewers'
  selectedRound.value = round.id
  form.interviewers = [...(round.interviewers ?? [])]
  dialogOpen.value = true
}
const openAdd = () => {
  dialogMode.value = 'add'
  form.name = ''
  form.description = ''
  form.roundType = 3
  form.interviewers = []
  dialogOpen.value = true
}
const submitDialog = () => {
  if (dialogMode.value === 'add') {
    if (!form.name.trim()) { ElMessage.error($t('candidatePipeline.requiredEvaluationFields')); return }
    void mutate(() => addEvaluationRound(props.jobId, props.candidateId, {
      name: form.name.trim(), description: form.description.trim() || null,
      round_type: form.roundType, interviewers: form.interviewers
    }))
  } else if (dialogMode.value === 'schedule') {
    if (!selectedRound.value || !form.scheduledAt || Number.isNaN(form.scheduledAt.getTime())) {
      ElMessage.error($t('candidatePipeline.requiredEvaluationFields')); return
    }
    const roundId = selectedRound.value
    const scheduledAt = form.scheduledAt.toISOString()
    void mutate(() => scheduleEvaluation(props.jobId, props.candidateId, roundId, scheduledAt, form.interviewers))
  } else if (selectedRound.value) {
    const roundId = selectedRound.value
    void mutate(() => changeEvaluationInterviewers(props.jobId, props.candidateId, roundId, form.interviewers))
  }
}
const saveStatus = (roundId: string) => {
  const value = status.value
  if (value !== null) void mutate(() => changeEvaluationStatus(props.jobId, props.candidateId, roundId, value))
}
const saveResult = (roundId: string) => {
  const value = result.value
  if (value !== null) void mutate(() => recordEvaluationResult(props.jobId, props.candidateId, roundId, value))
}
const saveDecision = () => {
  const value = decision.value
  if (value !== null) void mutate(() => decideEvaluations(props.jobId, props.candidateId, value))
}
</script>

<style lang="less" scoped>
h2 { font-size: 16px; }
small { color: var(--color-gray); font-weight: normal; }
.round { margin: 16px 0; padding: 14px; border: 1px solid #e3edf7; border-radius: 6px; }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 10px 0; }
.controls :deep(.el-button + .el-button) { margin-left: 0; }
</style>
