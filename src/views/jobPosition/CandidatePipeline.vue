<template>
  <main class="pipeline-page">
    <header class="pipeline-header">
      <div>
        <h1>{{ $t('candidatePipeline.title') }}</h1>
        <el-dropdown v-if="board" :disabled="moving || rejectSubmitting || !jobs.length" trigger="click" @command="selectJob">
          <button class="job-switcher job-subtitle" type="button">{{ board.job_title }} <el-icon><ArrowDown /></el-icon></button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="job in jobs" :key="job.id" :command="job.id">{{ job.title }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="actions">
        <el-button v-if="!fromSidebar" :disabled="moving || rejectSubmitting" @click="router.push(`/${ROUTER_JOB_POSITION}`)">{{ $t('button.back') }}</el-button>
        <el-button>{{ $t('candidatePipeline.export') }}</el-button>
        <el-button type="primary">{{ $t('candidatePipeline.addCandidate') }}</el-button>
      </div>
    </header>
    <p v-if="jobsLoaded && !jobs.length && !jobId" class="empty">{{ $t('candidatePipeline.noJobs') }}</p>
    <el-tabs v-if="board" v-model="activeTab">
      <el-tab-pane name="pipeline" :label="$t('candidatePipeline.pipelineTab', { count: board.pipeline_count })">
    <div class="board">
      <section v-for="(stage, index) in board.stages" :key="stage.id" class="stage"
        :style="{ backgroundColor: stageColors[stage.stage_type].background }"
        @dragover="dragOver($event, index)" @drop="drop($event, index)">
        <div class="stage-header" :style="{ backgroundColor: stageColors[stage.stage_type].header }"><h2>{{ stage.name }} <span class="count">{{ stage.candidates.length }}</span></h2></div>
        
        <div class="candidates-container">
          <p v-if="!stage.candidates.length" class="empty">{{ $t('candidatePipeline.empty') }}</p>
          <article v-for="candidate in stage.candidates" :key="candidate.id" class="candidate"
            :draggable="!moving && index < board.stages.length - 1"
            @dragstart="dragStart($event, candidate.id, index)" @dragend="dragging = null">
            <div class="candidate-heading">
              <strong>{{ displayName(candidate) }}</strong>
              <el-dropdown trigger="hover" :disabled="moving || rejectSubmitting" @command="handleCandidateAction($event, candidate, index, stage.id)">
                <button type="button" class="candidate-actions" :aria-label="$t('candidatePipeline.actions')" draggable="false">
                  <el-icon><MoreFilled /></el-icon>
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="move" :disabled="index === board.stages.length - 1">
                      {{ $t('candidatePipeline.move') }}
                    </el-dropdown-item>
                    <el-dropdown-item command="reject">{{ $t('candidatePipeline.reject') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="candidate-detail"><el-icon><Clock /></el-icon><span>{{ applicationAge(candidate.created_at) }}</span></div>
            <div class="candidate-detail"><el-icon><Location /></el-icon><span>{{ candidate.current_location }}</span></div>
          </article>
        </div>
      </section>
    </div>
      </el-tab-pane>
      <el-tab-pane name="rejected" :label="$t('candidatePipeline.rejectedTab', { count: board.rejected_candidates.length })">
        <EspTable :key="loadVersion" :columns="rejectedColumns" :request-api="loadRejectedCandidates" :is-front-pagination="true"
          :is-set-col="false" :is-custom-header="true">
          <template #first_name="{ row }">{{ displayName(row) }}</template>
          <template #closed_at_stage_name="{ row }">
            <span v-if="row.closed_at_stage_name" class="rejected-stage"
              :style="{ backgroundColor: rejectedStageColor(row) }">{{ row.closed_at_stage_name }}</span>
            <span v-else>-</span>
          </template>
          <template #created_at="{ row }">{{ formatDate(row.created_at) }}</template>
          <template #closed_at="{ row }">{{ formatDate(row.closed_at) }}</template>
          <template #closed_reason="{ row }">
            <el-tooltip v-if="reasonIsLong(row.closed_reason)" :content="row.closed_reason" placement="top" popper-class="rejection-reason-tooltip">
              <span tabindex="0">{{ displayReason(row.closed_reason) }}</span>
            </el-tooltip>
            <span v-else>{{ displayReason(row.closed_reason) }}</span>
          </template>
        </EspTable>
      </el-tab-pane>
      <el-tab-pane v-for="tab in emptyTabs" :key="tab.name" :name="tab.name" :label="$t(tab.label, { count: 0 })">
        <EspTable :columns="emptyColumns" :is-front-pagination="true" :is-set-col="false" :is-custom-header="true" />
      </el-tab-pane>
    </el-tabs>
    <el-dialog v-model="rejectDialogOpen" :title="$t('candidatePipeline.rejectTitle', { name: rejectTarget?.name ?? '' })"
      width="min(500px, 90vw)" :close-on-click-modal="!rejectSubmitting" :close-on-press-escape="!rejectSubmitting"
      :show-close="!rejectSubmitting">
      <el-form label-position="top" @submit.prevent="submitRejection">
        <el-form-item :label="$t('candidatePipeline.rejectionReason')">
          <el-input v-model="rejectionReason" type="textarea" :rows="3" :maxlength="2000" show-word-limit :disabled="rejectSubmitting" />
        </el-form-item>
        <el-form-item :label="$t('candidatePipeline.considerOtherOpenings')">
          <el-radio-group v-model="considerOtherOpenings" :disabled="rejectSubmitting">
            <el-radio :label="true">{{ $t('candidatePipeline.yes') }}</el-radio>
            <el-radio :label="false">{{ $t('candidatePipeline.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="rejectSubmitting" @click="rejectDialogOpen = false">{{ $t('button.cancel') }}</el-button>
        <el-button type="primary" :loading="rejectSubmitting" @click="submitRejection">{{ $t('candidatePipeline.reject') }}</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { ArrowDown, Clock, Location, MoreFilled } from '@element-plus/icons-vue'
import { escape } from 'lodash-es'
import moment from 'moment'
import { useLocale } from '@/hooks/useLocale'
import { DATE_FORMAT, OPEN_DIALOG } from '@/config'
import mittBus from '@/utils/mittBus'
import { ROUTER_JOB_POSITION, ROUTER_CANDIDATE_PIPELINE } from '@/router/routerName'
import { getCandidatePipeline, getPipelineJobs, moveCandidate, rejectCandidate } from '@/api/modules/candidatePipeline'
import type { CandidatePipeline, PipelineCandidate, PipelineJob, PipelineStageType } from '@/api/modules/candidatePipeline'
import { applicationAgeDays } from './candidateApplicationAge'

const route = useRoute()
const router = useRouter()
const { $t } = useLocale()
const emptyColumns = computed<Table.ColumnProps[]>(() => [
  { prop: 'first_name', label: $t('candidatePipeline.name'), minWidth: 140, filter: false, sortable: false },
  { prop: 'email', label: $t('candidatePipeline.email'), minWidth: 190, filter: false, sortable: false },
  { prop: 'created_at', label: $t('candidatePipeline.appliedOnColumn'), minWidth: 115, filter: false, sortable: false }
])
const rejectedColumns = computed<Table.ColumnProps[]>(() => [
  ...emptyColumns.value.slice(0, 2),
  { prop: 'closed_at_stage_name', label: $t('candidatePipeline.rejectedStage'), minWidth: 145, filter: false, sortable: false },
  emptyColumns.value[2],
  { prop: 'closed_at', label: $t('candidatePipeline.rejectedOn'), minWidth: 115, filter: false, sortable: false },
  { prop: 'closed_reason', label: $t('candidatePipeline.reason'), minWidth: 240, filter: false, sortable: false, hideTooltip: true }
])
const emptyTabs = [
  { name: 'offerCancelled', label: 'candidatePipeline.offerCancelledTab' },
  { name: 'notJoined', label: 'candidatePipeline.notJoinedTab' }
]
const stageColors: Record<PipelineStageType, { background: string; header: string }> = {
  APPLIED: { background: '#f8fbfe', header: '#eff6fe' },
  SCREENING: { background: '#f4faff', header: '#e6f4fd' },
  EVALUATING: { background: '#fdfbfa', header: '#fcf5ed' },
  OFFER_APPROVAL: { background: '#fff9f5', header: '#faeee4' },
  OFFERED: { background: '#f9f9fd', header: '#f2f0fc' },
  HIRED: { background: '#f7fcfe', header: '#edfafb' },
  ONBOARDED: { background: '#fbfdf6', header: '#f2f8e9' },

  BACKGROUND_CHECK: { background: '#fdfafa', header: '#f9eef1' },
  CUSTOM: { background: '#fbfdf6', header: '#f2f8e9' }
}
const jobs = ref<PipelineJob[]>([])
const jobsLoaded = ref(false)
const board = ref<CandidatePipeline>()
const loadRejectedCandidates = async () => {
  if (!board.value) throw new Error('Candidate pipeline is not loaded')
  return { result: board.value.rejected_candidates }
}
const activeTab = ref('pipeline')
const moving = ref(false)
const rejectDialogOpen = ref(false)
const rejectSubmitting = ref(false)
const rejectTarget = ref<{ id: string; name: string; stageId: string; jobId: string }>()
const rejectionReason = ref('')
const considerOtherOpenings = ref(true)
const dragging = ref<{ id: string; from: number } | null>(null)
let loadVersion = 0
let disposed = false
let clockTimer: ReturnType<typeof setInterval> | undefined
const now = ref(new Date())
const fromSidebar = ref(false)
watch(() => route.fullPath, () => {
  if (route.name === `/${ROUTER_CANDIDATE_PIPELINE}`) {
    fromSidebar.value = true
  } else if (route.name === ROUTER_CANDIDATE_PIPELINE) {
    fromSidebar.value = window.history.state?.candidatePipelineFromSidebar === true
  }
}, { immediate: true, flush: 'sync' })
const jobId = computed(() => typeof route.params.jobId === 'string' && route.params.jobId
  ? route.params.jobId
  : typeof route.query.job === 'string' ? route.query.job : '')
const displayName = (candidate: PipelineCandidate) =>
  `${candidate.preferred_name || candidate.first_name} ${candidate.last_name}`
const rejectedStageColor = (candidate: PipelineCandidate) =>
  candidate.closed_at_stage_type ? stageColors[candidate.closed_at_stage_type].header : undefined
const formatDate = (date: string | null) => date ? moment(date, moment.ISO_8601, true).format(DATE_FORMAT) : '-'
const reasonIsLong = (reason: string | null) => reason != null && Array.from(reason).length > 60
const displayReason = (reason: string | null) => {
  if (!reason) return '-'
  return reasonIsLong(reason) ? `${Array.from(reason).slice(0, 57).join('')}...` : reason
}
const applicationAge = (createdAt: string) => {
  const days = applicationAgeDays(createdAt, now.value)
  if (days < 0) return $t('candidatePipeline.appliedOn', { date: createdAt.slice(0, 10) })
  if (days === 0) return $t('candidatePipeline.appliedToday')
  if (days === 1) return $t('candidatePipeline.appliedOneDayAgo')
  return $t('candidatePipeline.appliedDaysAgo', { count: days })
}

const loadBoard = async () => {
  const version = ++loadVersion
  const id = jobId.value
  board.value = undefined
  if (!id) return
  try {
    const response = await getCandidatePipeline(id)
    if (!response.success || !response.result || !Array.isArray(response.result.stages)
      || !Array.isArray(response.result.rejected_candidates) || !Number.isInteger(response.result.pipeline_count)
      || response.result.pipeline_count < 0) throw new Error('Invalid pipeline response')
    for (const stage of response.result.stages) {
      if (!Object.prototype.hasOwnProperty.call(stageColors, stage.stage_type)) throw new Error('Invalid pipeline stage type')
      if (!Array.isArray(stage.candidates)) throw new Error('Invalid pipeline candidates')
      for (const candidate of stage.candidates) applicationAgeDays(candidate.created_at, now.value)
    }
    for (const candidate of response.result.rejected_candidates) {
      applicationAgeDays(candidate.created_at, now.value)
      if (candidate.closed_at) applicationAgeDays(candidate.closed_at, now.value)
      if (candidate.closed_at_stage_type && !Object.prototype.hasOwnProperty.call(stageColors, candidate.closed_at_stage_type)) {
        throw new Error('Invalid rejected stage type')
      }
      if (typeof candidate.consider_for_other_openings !== 'boolean') throw new Error('Invalid rejection preference')
    }
    if (version === loadVersion) board.value = response.result
  } catch (error) {
    if (version === loadVersion) {
      console.error('Failed to load candidate pipeline', error)
      ElMessage.error($t('candidatePipeline.loadError'))
    }
  }
}
watch(jobId, (id, previousId) => {
  if (route.name !== ROUTER_CANDIDATE_PIPELINE && route.name !== `/${ROUTER_CANDIDATE_PIPELINE}`) return
  if (previousId && id !== previousId) {
    rejectDialogOpen.value = false
    rejectTarget.value = undefined
    activeTab.value = 'pipeline'
  }
  void loadBoard()
  if (!id && jobs.value.length) {
    void router.replace({ name: ROUTER_CANDIDATE_PIPELINE, params: { jobId: jobs.value[0].id }, state: { candidatePipelineFromSidebar: fromSidebar.value } })
  }
}, { immediate: true })
onMounted(async () => {
  clockTimer = setInterval(() => { now.value = new Date() }, 60_000)
  try {
    if (!route.params.jobId && jobId.value) {
      await router.replace({ name: ROUTER_CANDIDATE_PIPELINE, params: { jobId: jobId.value }, state: { candidatePipelineFromSidebar: fromSidebar.value } })
    }
    const response = await getPipelineJobs()
    if (!response.success || !Array.isArray(response.result)) throw new Error('Invalid job list')
    if (disposed) return
    jobs.value = response.result
    jobsLoaded.value = true
    if (!jobId.value && jobs.value.length) {
      await router.replace({ name: ROUTER_CANDIDATE_PIPELINE, params: { jobId: jobs.value[0].id }, state: { candidatePipelineFromSidebar: fromSidebar.value } })
    }
  } catch (error) {
    if (disposed) return
    console.error('Failed to load pipeline jobs', error)
    ElMessage.error($t('candidatePipeline.loadError'))
  }
})
onBeforeUnmount(() => {
  disposed = true
  loadVersion++
  if (clockTimer) clearInterval(clockTimer)
})
const selectJob = (id: string) => {
  if (!moving.value && !rejectSubmitting.value && id !== jobId.value) router.push({ name: ROUTER_CANDIDATE_PIPELINE, params: { jobId: id }, state: { candidatePipelineFromSidebar: fromSidebar.value } })
}
const handleCandidateAction = (command: string, candidate: PipelineCandidate, index: number, stageId: string) => {
  if (moving.value || rejectSubmitting.value || !board.value) return
  if (command === 'move') {
    advance(candidate.id, index)
  } else if (command === 'reject') {
    rejectTarget.value = { id: candidate.id, name: displayName(candidate), stageId, jobId: board.value.job_id }
    rejectionReason.value = ''
    considerOtherOpenings.value = true
    rejectDialogOpen.value = true
  }
}
const submitRejection = async () => {
  const target = rejectTarget.value
  if (!target || rejectSubmitting.value) return
  rejectSubmitting.value = true
  try {
    const result = await rejectCandidate(target.jobId, target.id, target.stageId, rejectionReason.value.trim(), considerOtherOpenings.value)
    if (!result.success || result.result !== true) throw new Error('Rejection was not accepted')
    rejectDialogOpen.value = false
    ElMessage.success($t('candidatePipeline.rejectSuccess'))
    await loadBoard()
  } catch (error) {
    console.error('Failed to reject candidate', error)
    ElMessage.error($t('candidatePipeline.rejectError'))
  } finally {
    rejectSubmitting.value = false
  }
}
const dragStart = (event: DragEvent, id: string, from: number) => {
  if (moving.value) { event.preventDefault(); return }
  dragging.value = { id, from }
  event.dataTransfer?.setData('text/plain', id)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}
const dragOver = (event: DragEvent, index: number) => {
  if (!moving.value && dragging.value && index === dragging.value.from + 1) event.preventDefault()
}
const drop = (event: DragEvent, index: number) => {
  if (!dragging.value || index !== dragging.value.from + 1 || moving.value) return
  event.preventDefault()
  const { id, from } = dragging.value
  dragging.value = null
  void advance(id, from)
}
const advance = (id: string, fromIndex: number) => {
  const current = board.value
  if (!current || moving.value) return
  const from = current.stages[fromIndex]
  const to = current.stages[fromIndex + 1]
  const candidateIndex = from?.candidates.findIndex(candidate => candidate.id === id) ?? -1
  if (!from || !to || candidateIndex < 0) return
  moving.value = true
  const [candidate] = from.candidates.splice(candidateIndex, 1)
  to.candidates.push(candidate)
  const cancelMove = () => {
    to.candidates.splice(to.candidates.findIndex(item => item.id === id), 1)
    from.candidates.splice(candidateIndex, 0, candidate)
    moving.value = false
  }
  mittBus.emit(OPEN_DIALOG, {
    title: $t('candidatePipeline.title'),
    content: escape($t('candidatePipeline.confirmMove', { name: displayName(candidate), stage: to.name })),
    center: 'center',
    size: 'small',
    showCancelButton: true,
    cancelButtonText: $t('button.cancel'),
    confirmButtonText: $t('button.confirm'),
    cancel: cancelMove,
    confirm: async () => {
      try {
        const result = await moveCandidate(current.job_id, id, from.id, to.id)
        if (!result.success || result.result !== true) throw new Error('Move was not accepted')
      } catch (error) {
        console.error('Failed to move candidate', error)
        ElMessage.error($t('candidatePipeline.moveError'))
        await loadBoard()
      } finally {
        moving.value = false
      }
    }
  })
}
</script>

<style lang="less" scoped>
.pipeline-page { height: 100%; overflow: auto; padding: 2em 1.5em; }
.job-switcher { border: 0; background: none; padding: 0; color: inherit; cursor: pointer; display: inline-flex; gap: 5px; align-items: center; font: inherit; }
.pipeline-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 24px; }
.pipeline-header h1 { font-size: 24px; margin: 0 0 8px; }
.pipeline-header p { color: var(--color-gray); margin: 0; }
.job-subtitle { font-size: 16px; font-weight: 500; }
.actions { display: flex; white-space: nowrap; }
.board { display: flex; gap: 8px; overflow-x: auto; align-items: flex-start; padding-bottom: 20px; }
.stage { flex: 0 0 225px; border-radius: 8px; min-height: 600px; box-shadow: inset 0 0 0 1px #e3edf7; }
.stage-header { margin-bottom: 10px; padding: 14px 10px; border-radius: 6px; }
.stage h2 { font-size: 14.5px; margin: 0; display: flex; justify-content: space-between; align-items: center; }
.count { border-radius: 12px; background: #e4e7ed; padding: 2px 8px; }
.candidates-container { padding: 14px 10px; }
.candidate { background: white; border-radius: 6px; padding: 12px 6px 12px 12px; margin-bottom: 10px; overflow-wrap: anywhere; box-shadow: inset 0 0 0 1px #e3edf7; }
.candidate[draggable="true"] { cursor: grab; }
.candidate-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; font-size: 12.5px;font-weight: 600;}
.candidate-actions { border: 0; padding: 0; background: none; cursor: pointer; color: var(--color-gray); font-size: 18px; }
.candidate-actions .el-icon { transform: rotate(90deg); }
.candidate-detail { display: flex; align-items: center; gap: 6px; color: var(--color-gray); font-size: 11.8px; margin-top: 6px; }
.rejected-stage { display: inline-block; padding: 4px 8px; border-radius: 6px; }
.empty { color: var(--color-gray); font-size: 13px; }
@media (max-width: 700px) { .pipeline-header { align-items: flex-start; flex-direction: column; } }
</style>
<style lang="less">
.rejection-reason-tooltip { max-width: 400px; white-space: pre-wrap; }
</style>
