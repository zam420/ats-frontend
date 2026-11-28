<template>
  <div v-loading="loading">
    <template v-if="evaluations">
      <p v-if="!evaluations.initialized">{{ $t('candidatePipeline.noEvaluations') }}</p>
      <template v-else>
        <div class="progress-header">
          <h2>{{ $t('candidatePipeline.evaluationProgress') }}</h2>
          <el-progress class="progress-bar" :stroke-width="6" :percentage="evaluationPercentage(progress)" :color="evaluationColor(progress)">
            <span>{{ progress.completed_rounds }}/{{ progress.total_rounds }}</span>
          </el-progress>
          <el-button v-if="editable" :disabled="saving" @click="openAdd">{{ $t('candidatePipeline.addRound') }}</el-button>
        </div>
        <div v-if="editable && evaluations.can_decide && !currentRound" class="controls">
          <el-select v-model="decision" :placeholder="$t('candidatePipeline.selectResult')" :disabled="saving">
            <el-option :label="decisionLabel(0)" :value="0" /><el-option :label="decisionLabel(1)" :value="1" />
          </el-select>
          <el-popconfirm :title="$t('candidatePipeline.confirmDecision')" @confirm="saveDecision">
            <template #reference><el-button type="primary" :disabled="decision === null || saving">{{ $t('candidatePipeline.decideResult') }}</el-button></template>
          </el-popconfirm>
        </div>
        <section v-for="round in evaluations.rounds" :key="round.id" class="round">
          <div class="round-header">
            <div class="round-header-details">
              <div class="round-title">
                <h2>{{ round.name }} <small v-if="currentRound?.id === round.id">{{ $t('candidatePipeline.currentRound') }}</small></h2>
                <span v-if="round.result !== null" class="result-tag" :class="{ 'light-result': round.result >= 2 }" :style="{ backgroundColor: evaluationResultColor(round.result) }">{{ resultLabel(round.result) }}</span>
              </div>
              <p>
                <span class="round-status-label">{{ statusLabel(round.status) }}</span><template v-if="statusDate(round)">:</template>
                <span v-if="statusDate(round)" class="date-with-icon">
                  <el-icon v-if="round.status === 1"><Calendar /></el-icon> {{ formatStatusDate(round) }}
                </span>
                <span v-if="round.status === 1 && round.duration_minutes" class="duration"><el-icon><Timer /></el-icon> {{ $t('candidatePipeline.durationMinutes', { count: round.duration_minutes }) }}</span>
              </p>
              <p v-if="round.status > 1 && round.scheduled_at">{{ $t('candidatePipeline.interviewedAt') }}: {{ formatDate(round.scheduled_at) }}
                <span v-if="round.duration_minutes" class="duration"><el-icon><Timer /></el-icon> {{ $t('candidatePipeline.durationMinutes', { count: round.duration_minutes }) }}</span>
              </p>
            </div>
            <div class="controls">
              <el-button v-if="editable && currentRound?.id === round.id && (round.status === 0 || round.status === 1)" :disabled="saving" @click="openInterviewers(round)">{{ $t('candidatePipeline.changeInterviewers') }}</el-button>
              <el-button v-if="editable && currentRound?.id === round.id" :disabled="saving" @click="openSchedule(round)">{{ $t('candidatePipeline.schedule') }}</el-button>
            </div>
          </div>
          <div>
            <div class="interviwer-header">{{ $t('candidatePipeline.interviewer') }}</div>
            <div v-if="!round.interviewers?.length">{{ $t('candidatePipeline.noInterviewers') }}</div>
            <div v-for="item in interviewerRows(round)" :key="item.id" class="interviewer-row">
              <span class="interviewer-name">{{ interviewerName(item.id) }}</span>
              <div class="interviewer-status" :class="{ 'feedback-submitted': round.status > 1 && item.feedback }">
                <span class="status-text">
                  <el-icon><CircleCheck v-if="round.status > 1 && item.feedback" /><Clock v-else /></el-icon>
                  {{ round.status <= 1 ? $t('candidatePipeline.pending') : item.feedback ? $t('candidatePipeline.feedbackSubmitted') : $t('candidatePipeline.feedbackPending') }}
                </span>
                <small v-if="round.status > 1 && item.feedback?.submitted_at">{{ formatDate(item.feedback.submitted_at) }}</small>
              </div>
              <div class="feedback-action">
                <el-link v-if="round.status > 1 && item.feedback" href="#" type="primary" :underline="false" :disabled="feedbackLoading" @click.prevent="openFeedback(round, item.id)">{{ $t('candidatePipeline.viewFeedback') }}</el-link>
                <el-button v-else-if="round.status === 3 && round.can_enter_feedback && item.id === evaluations.current_user_id" class="btn-primary-gradient" size="small" :disabled="saving || feedbackLoading" @click="openFeedback(round)">{{ $t('candidatePipeline.submitFeedback') }}</el-button>
              </div>
              <span v-if="round.status > 1 && item.feedback && item.feedback.result !== null" class="result-tag" :class="{ 'light-result': item.feedback.result >= 2 }" :style="{ backgroundColor: evaluationResultColor(item.feedback.result) }">{{ resultLabel(item.feedback.result) }}</span>
            </div>
          </div>
          <div v-if="editable && currentRound?.id === round.id" class="controls">
            <el-select v-model="status" :placeholder="$t('candidatePipeline.updateStatus')" :disabled="saving">
              <el-option v-for="value in [0, 2, 3]" :key="value" :label="statusLabel(value)" :value="value" />
            </el-select>
            <el-button :disabled="status === null || saving" @click="saveStatus(round.id)">{{ $t('candidatePipeline.updateStatus') }}</el-button>
          </div>
        </section>
      </template>
    </template>
    <div v-else-if="loadFailed">
      <p>{{ $t('candidatePipeline.evaluationLoadError') }}</p>
      <el-button :disabled="loading" @click="load">{{ $t('candidatePipeline.retryEvaluations') }}</el-button>
    </div>
    <el-dialog v-model="feedbackOpen" align-center :title="$t('candidatePipeline.feedbackTitle', { name: feedbackRoundName })" width="min(560px, 90vw)"
      :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <dl v-if="feedbackReadOnly" v-loading="feedbackLoading" class="feedback-view">
        <dt>{{ $t('candidatePipeline.feedbackResult') }}</dt>
        <dd><span v-if="feedback.result !== null" class="result-tag" :class="{ 'light-result': feedback.result >= 2 }" :style="{ backgroundColor: evaluationResultColor(feedback.result) }">{{ resultLabel(feedback.result) }}</span>
        </dd>
        <dt>{{ $t('candidatePipeline.feedbackOverall') }}</dt><dd>{{ feedback.overall_feedback || '-' }}</dd>
        <dt>{{ $t('candidatePipeline.feedbackStrengths') }}</dt><dd>{{ feedback.strengths || '-' }}</dd>
        <dt>{{ $t('candidatePipeline.feedbackAreasForImprovement') }}</dt><dd>{{ feedback.areas_for_improvement || '-' }}</dd>
      </dl>
      <el-form v-else v-loading="feedbackLoading" label-position="top" :disabled="saving">
        <el-form-item :label="$t('candidatePipeline.feedbackResult')" required>
          <el-radio-group v-model="feedback.result">
            <el-radio v-for="value in [0, 3, 4, 1]" :key="value" :label="value">{{ resultLabel(value) }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('candidatePipeline.feedbackOverall')">
          <el-input v-model="feedback.overall_feedback" type="textarea" :rows="5" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('candidatePipeline.feedbackStrengths')">
          <el-input v-model="feedback.strengths" type="textarea" :rows="5" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('candidatePipeline.feedbackAreasForImprovement')">
          <el-input v-model="feedback.areas_for_improvement" type="textarea" :rows="5" maxlength="1000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="feedbackOpen = false">{{ $t('button.cancel') }}</el-button>
        <el-button v-if="!feedbackReadOnly" :disabled="saving || feedbackLoading" @click="submitFeedback(false)">{{ $t('candidatePipeline.saveDraft') }}</el-button>
        <el-button v-if="!feedbackReadOnly" type="primary" :loading="saving" :disabled="feedbackLoading" @click="submitFeedback(true)">{{ $t('candidatePipeline.submitFeedback') }}</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="dialogOpen" :title="$t(dialogTitle)" width="min(500px, 90vw)"
      :close-on-click-modal="!saving" :close-on-press-escape="!saving" :show-close="!saving">
      <el-form label-position="top" :disabled="saving" @submit.prevent="submitDialog">
        <template v-if="dialogMode === 'add'">
          <el-form-item :label="$t('candidatePipeline.roundName')" required><el-input v-model="form.name" maxlength="30" /></el-form-item>
          <el-form-item :label="$t('candidatePipeline.roundDescription')"><el-input v-model="form.description" maxlength="100" type="textarea" /></el-form-item>
          <el-form-item :label="$t('candidatePipeline.roundType')" required>
            <el-select v-model="form.roundType" class="full-width">
              <el-option v-for="(key, index) in roundTypes" :key="key" :label="$t(`candidatePipeline.${key}`)" :value="index" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item v-if="dialogMode === 'schedule'" :label="$t('candidatePipeline.scheduleTime')" required>
          <el-date-picker v-model="form.scheduledAt" type="datetime" />
        </el-form-item>
        <el-form-item v-if="dialogMode === 'schedule'" :label="$t('candidatePipeline.interviewDuration')" required>
          <el-input-number v-model="form.durationMinutes" :min="1" :precision="0" />
        </el-form-item>
        <el-form-item v-if="dialogMode !== 'schedule'" :label="$t('candidatePipeline.interviewer')">
          <el-select v-model="form.interviewers" class="interviewer-select full-width" multiple collapse-tags :max-collapse-tags="2" collapse-tags-tooltip filterable clearable @mouseover="showFullTagText">
            <el-option v-for="user in evaluations?.interviewers ?? []" :key="user.id" :value="user.id" :label="`${user.name} (${user.email})`" class="form-select-li">
              <el-checkbox :value="form.interviewers.includes(user.id)" style="pointer-events: none"><span class="title">{{ user.name }}</span><span>{{ user.email }}</span></el-checkbox>
            </el-option>
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
import { Calendar, CircleCheck, Clock, Timer } from '@element-plus/icons-vue'
import {
  getCandidateEvaluations, scheduleEvaluation, changeEvaluationInterviewers, changeEvaluationStatus,
  addEvaluationRound, decideEvaluations, getEvaluationFeedback, getSubmittedEvaluationFeedback, saveEvaluationFeedback
} from '@/api/modules/candidatePipeline'
import type { CandidateEvaluations, EvaluationRoundResult } from '@/api/modules/candidatePipeline'
import type { ResultData } from '@/api/interface'
import { useLocale } from '@/hooks/useLocale'
import { evaluationRoundResultKeys, evaluationColor, evaluationPercentage, evaluationResultColor } from '../evaluationProgress'

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
const decision = ref<0 | 1 | null>(null)
const dialogOpen = ref(false)
const feedbackOpen = ref(false)
const feedbackLoading = ref(false)
const feedbackReadOnly = ref(false)
const feedbackRoundId = ref('')
const feedbackRoundName = ref('')
const feedback = reactive<{ result: Result | null; overall_feedback: string; strengths: string; areas_for_improvement: string }>({
  result: null, overall_feedback: '', strengths: '', areas_for_improvement: ''
})
const dialogMode = ref<'schedule' | 'interviewers' | 'add'>('add')
const selectedRound = ref<string>()
const form = reactive<{ name: string; description: string; roundType: 0 | 1 | 2 | 3; scheduledAt: Date | null; durationMinutes: number | undefined; interviewers: string[] }>({
  name: '', description: '', roundType: 3, scheduledAt: null, durationMinutes: undefined, interviewers: []
})
const roundTypes = ['roundTypeHr', 'roundTypeFunctional', 'roundTypeExecutive', 'roundTypeCustom']
const dialogTitle = computed(() => `candidatePipeline.${dialogMode.value === 'add' ? 'addRound' : dialogMode.value === 'schedule' ? 'schedule' : 'changeInterviewers'}`)
const statusLabel = (value: number) => $t(`candidatePipeline.${['pending', 'scheduled', 'inProgress', 'awaitingFeedback', 'completed'][value]}`)
const decisionLabel = (value: number) => $t(`candidatePipeline.${['passed', 'failed'][value]}`)
const resultLabel = (value: number) => $t(`candidatePipeline.${evaluationRoundResultKeys[value]}`)
const interviewerName = (id: string) => evaluations.value?.interviewers.find(user => user.id === id)?.name || id
const interviewerRows = (round: Round) => (round.interviewers ?? []).map(id => ({
  id, feedback: round.submitted_feedback.find(item => item.interviewer_id === id)
}))
const formatDate = (date: string) => new Date(date).toLocaleString()
const statusDate = (round: Round) => round.status === 1 ? round.scheduled_at : round.status > 1 ? round.status_changed_at : null
const formatStatusDate = (round: Round) => {
  const date = statusDate(round)
  return date ? formatDate(date) : ''
}
const showFullTagText = (event: MouseEvent) => {
  const element = (event.target as HTMLElement).closest('.el-select__tags-text') as HTMLElement | null
  if (element && !element.title) element.title = element.textContent?.trim() ?? ''
}
const progress = computed(() => {
  const rounds = evaluations.value?.rounds ?? []
  return {
    total_rounds: rounds.length,
    completed_rounds: rounds.filter(round => round.status === 4).length,
    strong_yes: rounds.filter(round => round.result === 0).length,
    strong_no: rounds.filter(round => round.result === 1).length,
    yes: rounds.filter(round => round.result === 3).length,
    no: rounds.filter(round => round.result === 4).length
  }
})
let disposed = false

const load = async () => {
  loading.value = true
  loadFailed.value = false
  try {
    const response = await getCandidateEvaluations(props.jobId, props.candidateId)
    if (!response.success || !response.result || !Array.isArray(response.result.rounds)
      || !Array.isArray(response.result.interviewers) || typeof response.result.can_manage !== 'boolean'
      || typeof response.result.current_user_id !== 'string'
      || typeof response.result.can_decide !== 'boolean' || typeof response.result.initialized !== 'boolean'
      || (response.result.decision !== null && response.result.decision !== 0 && response.result.decision !== 1)
      || response.result.interviewers.some(user => typeof user.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string')
      || response.result.rounds.some(round => typeof round.id !== 'string' || !Number.isInteger(round.order)
        || !Number.isInteger(round.status) || round.status < 0 || round.status > 4
        || typeof round.can_enter_feedback !== 'boolean'
        || !Array.isArray(round.submitted_interviewers) || round.submitted_interviewers.some(id => typeof id !== 'string')
        || !Array.isArray(round.submitted_feedback) || round.submitted_feedback.some(item =>
          typeof item.interviewer_id !== 'string'
          || (item.result !== null && (!Number.isInteger(item.result) || item.result < 0 || item.result > 4))
          || (item.submitted_at !== null && (typeof item.submitted_at !== 'string' || Number.isNaN(new Date(item.submitted_at).getTime()))))
        || (round.duration_minutes !== null && (!Number.isInteger(round.duration_minutes) || round.duration_minutes <= 0))
        || (round.status_changed_at !== null && Number.isNaN(new Date(round.status_changed_at).getTime()))
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
const openFeedback = async (round: Round, interviewerId?: string) => {
  if (feedbackLoading.value) return
  feedbackRoundId.value = round.id
  feedbackRoundName.value = round.name
  feedbackReadOnly.value = interviewerId !== undefined
  Object.assign(feedback, { result: null, overall_feedback: '', strengths: '', areas_for_improvement: '' })
  feedbackOpen.value = true
  feedbackLoading.value = true
  try {
    const response = interviewerId
      ? await getSubmittedEvaluationFeedback(props.jobId, props.candidateId, round.id, interviewerId)
      : await getEvaluationFeedback(props.jobId, props.candidateId, round.id)
    if (!response.success || !response.result) throw new Error('Invalid feedback')
    if (interviewerId && !response.result.submitted) throw new Error('Feedback has not been submitted')
    if (!disposed && feedbackRoundId.value === round.id) {
      const saved = response.result
      Object.assign(feedback, { result: saved.result, overall_feedback: saved.overall_feedback ?? '',
        strengths: saved.strengths ?? '', areas_for_improvement: saved.areas_for_improvement ?? '' })
    }
  } catch (error) {
    if (!disposed) {
      feedbackOpen.value = false
      console.error('Failed to load feedback', error)
      ElMessage.error($t('candidatePipeline.feedbackLoadError'))
      await load()
    }
  } finally {
    if (!disposed) feedbackLoading.value = false
  }
}
const submitFeedback = async (submit: boolean) => {
  if (saving.value || feedbackLoading.value || !feedbackRoundId.value) return
  if (submit && feedback.result === null) { ElMessage.error($t('candidatePipeline.feedbackResultRequired')); return }
  saving.value = true
  try {
    const response = await saveEvaluationFeedback(props.jobId, props.candidateId, feedbackRoundId.value, {
      result: feedback.result, overall_feedback: feedback.overall_feedback.trim() || null,
      strengths: feedback.strengths.trim() || null, areas_for_improvement: feedback.areas_for_improvement.trim() || null
    }, submit)
    if (!response.success || response.result !== true) throw new Error('Feedback was not accepted')
    if (!disposed) {
      if (submit) feedbackOpen.value = false
      ElMessage.success($t(submit ? 'candidatePipeline.feedbackSubmitted' : 'candidatePipeline.feedbackDraftSaved'))
      if (submit) await load()
    }
  } catch (error) {
    if (!disposed) {
      console.error('Failed to save feedback', error)
      ElMessage.error($t('candidatePipeline.feedbackSaveError'))
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
  form.durationMinutes = round.duration_minutes ?? undefined
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
    if (!selectedRound.value || !form.scheduledAt || Number.isNaN(form.scheduledAt.getTime())
      || !form.durationMinutes || !Number.isInteger(form.durationMinutes) || form.durationMinutes < 1) {
      ElMessage.error($t('candidatePipeline.requiredEvaluationFields')); return
    }
    const roundId = selectedRound.value
    const scheduledAt = form.scheduledAt.toISOString()
    const duration = form.durationMinutes
    void mutate(() => scheduleEvaluation(props.jobId, props.candidateId, roundId, scheduledAt, duration))
  } else if (selectedRound.value) {
    const roundId = selectedRound.value
    void mutate(() => changeEvaluationInterviewers(props.jobId, props.candidateId, roundId, form.interviewers))
  }
}
const saveStatus = (roundId: string) => {
  const value = status.value
  if (value !== null) void mutate(() => changeEvaluationStatus(props.jobId, props.candidateId, roundId, value))
}
const saveDecision = () => {
  const value = decision.value
  if (value !== null) void mutate(() => decideEvaluations(props.jobId, props.candidateId, value))
}
</script>

<style lang="less" scoped>
@import '@/styles/interviewer-select.less';
h2 { font-size: 16px; }
small { color: var(--color-gray); font-weight: normal; }
.round { margin: 16px 0; padding: 14px; border: 1px solid #e3edf7; border-radius: 6px; }
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0px 0; }
.controls :deep(.el-button + .el-button) { margin-left: 0; }
.progress-header { display: flex; align-items: center; gap: 76px; flex-wrap: wrap; }
.round-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.round-header-details { min-width: 0; }
.round-title { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; }
.progress-header h2, .round-header h2 { margin: 0; }
.progress-bar { flex: 1; min-width: 60px; }
.round-header .controls { margin-left: auto; }
.round-status-label { font-weight: 600; }
.interviwer-header { font-weight: 600; margin-top: 16px; }
.interviewer-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: center; gap: 10px; margin-bottom: 8px; font-weight: 500; }
.interviewer-name { overflow-wrap: anywhere; }
.interviewer-status { display: flex; flex-direction: column; gap: 3px; }
.feedback-action :deep(.el-link__inner) { text-decoration: underline; font-weight: 600;}
.status-text, .date-with-icon { display: inline-flex; align-items: center; gap: 4px; }
.feedback-submitted, .feedback-submitted small { color: #166534; }
.result-tag { display: inline-block; color: #fff; border-radius: 16px; padding: 5px 16px; font-size: 13px; font-weight: 500; width: fit-content; }
// .result-tag.light-result { color: #161616; }s
@media (max-width: 700px) { .interviewer-row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.duration { display: inline-flex; align-items: center; gap: 4px; margin-left: 12px; }
.full-width { width: 100%; }
.feedback-view dt { font-weight: 600; }
.feedback-view dd { margin: 4px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; margin-bottom: 16px; }

</style>
