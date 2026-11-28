<template>
  <main class="candidate-page">
    <header class="pipeline-header">
      <div>
        <el-dropdown v-if="application && applicants.length" trigger="hover" max-height="320" @command="selectCandidate"         @visible-change="onMenu">
            <button class="candidate-switcher" type="button">
              <h1>{{ candidateName(application) }}</h1> <el-icon><ArrowUp v-if="menuOpen" /><ArrowDown v-else /></el-icon></button>
          <template #dropdown>
                    <el-input v-model="search" class="dropdown-search" size="small" clearable :placeholder="$t('button.search')" @keydown.stop />
            <el-dropdown-menu>
                      <el-dropdown-item v-for="applicant in filteredApplicants" :key="applicant.id" :command="applicant.id" :class="{ 'is-current-option': applicant.id === candidateId }">
                {{ applicant.name }}<template v-if="applicant.closeLabel"> ({{ applicant.closeLabel }})</template>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <h1 v-else>{{ application ? candidateName(application) : $t('candidatePipeline.candidateDetail') }}</h1>
        <p v-if="application" class="job-subtitle">{{ application.job_title }}</p>
      </div>
      <el-button @click="back">{{ $t('button.back') }}</el-button>
    </header>
    <el-tabs v-if="application" v-model="activeTab" class="ats-tabs">
      <el-tab-pane name="overview" :label="$t('candidatePipeline.overview')">
        <dl class="details">
          <div><dt>{{ $t('candidatePipeline.firstName') }}</dt><dd>{{ application.first_name }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.lastName') }}</dt><dd>{{ application.last_name }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.preferredName') }}</dt><dd>{{ application.preferred_name || '-' }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.email') }}</dt><dd>{{ application.email }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.phone') }}</dt><dd>{{ application.country_code }} {{ application.phone_number }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.location') }}</dt><dd>{{ application.current_location }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.appliedOnColumn') }}</dt><dd>{{ formatDate(application.created_at) }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.resume') }}</dt><dd><el-link href="#" type="primary" :disabled="downloading" :aria-busy="downloading" @click.prevent="download">{{ application.resume_name }}</el-link></dd></div>
        </dl>
        <h2 class="answersTitle">{{ $t('candidatePipeline.screeningAnswers') }}</h2>
        <p v-if="!application.answers.length">{{ $t('candidatePipeline.noAnswers') }}</p>
        <dl v-else class="answers">
          <div v-for="(answer, index) in application.answers" :key="index">
            <dt>{{ answer.question }}</dt><dd>{{ answer.values.length ? answer.values.join(', ') : '-' }}</dd>
          </div>
        </dl>
      </el-tab-pane>
      <el-tab-pane name="evaluations" :label="$t('candidatePipeline.evaluations')" lazy>
        <CandidateEvaluations :key="`${jobId}-${candidateId}`" :candidate-id="candidateId" />
      </el-tab-pane>
      <el-tab-pane v-if="false" name="notes" :label="$t('candidatePipeline.notes')" />
    </el-tabs>
  </main>
</template>

<script lang="ts">
let applicantsCache: { job: string; list: { id: string; name: string; closeLabel: string }[] } | undefined
</script>

<script setup lang="ts">
import { saveAs } from 'file-saver'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { getCandidateApplication, getCandidateList, getCandidateResume } from '@/api/modules/candidatePipeline'
import type { CandidateApplication } from '@/api/modules/candidatePipeline'
import { ROUTER_CANDIDATE_DETAIL, ROUTER_CANDIDATE_PIPELINE } from '@/router/routerName'
import { useLocale } from '@/hooks/useLocale'
import CandidateEvaluations from './components/CandidateEvaluations.vue'

const route = useRoute()
const router = useRouter()
const { $t } = useLocale()
const activeTab = ref('overview')
const application = ref<CandidateApplication>()
const downloading = ref(false)
const menuOpen = ref(false)
const search = ref('')
const onMenu = (open: boolean) => {
  menuOpen.value = open
  if (open) search.value = ''
}
const filteredApplicants = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return keyword ? applicants.value.filter(item => `${item.name} ${item.closeLabel}`.toLowerCase().includes(keyword)) : applicants.value
})
const jobId = computed(() => typeof route.params.jobId === 'string' ? route.params.jobId : '')
const candidateId = computed(() => typeof route.params.candidateId === 'string' ? route.params.candidateId : '')
interface Applicant { id: string; name: string; closeLabel: string }
const applicants = ref<Applicant[]>([])
let version = 0
let applicantsJob = ''
const candidateName = (person: { first_name: string; last_name: string; preferred_name: string | null }) =>
  `${person.preferred_name || person.first_name} ${person.last_name}`
const loadApplicants = async (job: string) => {
  if (applicantsJob === job) return
  if (window.history.state?.applicantsCached === true && applicantsCache?.job === job) {
    applicantsJob = job
    applicants.value = applicantsCache.list
    return
  }
  applicantsJob = job
  applicants.value = []
  try {
    const response = await getCandidateList(job)
    if (applicantsJob !== job) return
    if (!response.success || !Array.isArray(response.result) || response.result.some(item =>
      typeof item.id !== 'string' || typeof item.name !== 'string'
      || (item.application_close_type !== null && ![0, 1, 2].includes(item.application_close_type)))) {
      throw new Error('Invalid candidate list')
    }
    applicants.value = response.result.map(item => ({
      id: item.id, name: item.name,
      closeLabel: item.application_close_type === null ? '' : $t(`candidatePipeline.closeTypes.${item.application_close_type}`)
    })).sort((a, b) => a.name.localeCompare(b.name))
    applicantsCache = { job, list: applicants.value }
  } catch (error) {
    if (applicantsJob === job) {
      applicantsJob = ''
      console.error('Failed to load applicants', error)
      ElMessage.error($t('candidatePipeline.candidateListLoadError'))
    }
  }
}
const selectCandidate = (id: string) => {
  if (id === candidateId.value) return
  void router.replace({ name: ROUTER_CANDIDATE_DETAIL, params: { jobId: jobId.value, candidateId: id },
    state: { candidatePipelineFromSidebar: window.history.state?.candidatePipelineFromSidebar === true, candidateDetailTab: activeTab.value, applicantsCached: true } })
}
const formatDate = (value: string) => new Date(value).toLocaleString()
const back = () => router.push({ name: ROUTER_CANDIDATE_PIPELINE, params: { jobId: jobId.value },
  state: { candidatePipelineFromSidebar: window.history.state?.candidatePipelineFromSidebar === true } })

watch([jobId, candidateId], async ([job, candidate]) => {
  const current = ++version
  application.value = undefined
  const savedTab = window.history.state?.candidateDetailTab
  activeTab.value = savedTab === 'overview' || savedTab === 'evaluations'
    ? savedTab : window.history.state?.candidateEvaluationTab === true ? 'evaluations' : 'overview'
  if (!job || !candidate) return
  void loadApplicants(job)
  try {
    const response = await getCandidateApplication(candidate)
    if (!response.success || !response.result || !Array.isArray(response.result.answers)
      || response.result.job_id !== job
      || response.result.answers.some(answer => typeof answer.question !== 'string'
        || !Array.isArray(answer.values) || answer.values.some(value => typeof value !== 'string'))) {
      throw new Error('Invalid candidate details')
    }
    if (current === version) application.value = response.result
  } catch (error) {
    if (current === version) {
      console.error('Failed to load candidate details', error)
      ElMessage.error($t('candidatePipeline.detailLoadError'))
    }
  }
}, { immediate: true })

onBeforeUnmount(() => { version++ })

const download = async () => {
  if (!application.value || downloading.value) return
  const current = version
  const filename = application.value.resume_name
  downloading.value = true
  try {
    const response = await getCandidateResume(candidateId.value)
    if (!(response instanceof Blob) || response.type !== 'application/octet-stream') throw new Error('Invalid resume response')
    if (current === version) saveAs(response, filename)
  } catch (error) {
    if (current === version) {
      console.error('Failed to download resume', error)
      ElMessage.error($t('candidatePipeline.resumeError'))
    }
  } finally {
    downloading.value = false
  }
}
</script>

<style lang="less" scoped>
.candidate-page { height: 100%; overflow: auto; padding: 2em 1.5em; }
.pipeline-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 24px; }
.pipeline-header h1 { font-size: 24px; margin: 0 0 8px; }
.pipeline-header p { color: var(--color-gray); margin: 0; }
.candidate-switcher { outline: none; border: 0; background: none; padding: 0; color: inherit; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; font: inherit; }
header p { color: var(--color-gray); margin: 0; }
.job-subtitle { font-size: 14px; font-weight: 500; }
h2 { font-size: 16px; }
.ats-tabs :deep(.el-tabs__header) { margin-bottom: 15px;}
.ats-tabs :deep(.el-tabs__item) { font-size:12px; font-weight: 600;}
.details { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
dt { color: var(--color-gray); margin-bottom: 5px; font-weight: 500;}
dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; }
// .answers > div { margin: 16px 0; padding: 14px; border: 1px solid #e3edf7; border-radius: 6px; }
.answers { margin-top: 16px}
.answers > div { padding: 16px 14px; }
.answersTitle { margin-top: 16px;  }
</style>
<style lang="less">
.dropdown-search { display: flex; width: auto; min-width: 160px; box-sizing: border-box; margin: 6px 10px; }
</style>
