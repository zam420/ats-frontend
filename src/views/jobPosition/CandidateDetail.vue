<template>
  <main class="candidate-page">
    <header>
      <div>
        <h1>{{ application ? `${application.preferred_name || application.first_name} ${application.last_name}` : $t('candidatePipeline.candidateDetail') }}</h1>
        <p v-if="application">{{ application.job_title }}</p>
      </div>
      <el-button @click="back">{{ $t('button.back') }}</el-button>
    </header>
    <el-tabs v-if="application" v-model="activeTab">
      <el-tab-pane name="overview" :label="$t('candidatePipeline.overview')">
        <dl class="details">
          <div><dt>{{ $t('candidatePipeline.firstName') }}</dt><dd>{{ application.first_name }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.lastName') }}</dt><dd>{{ application.last_name }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.preferredName') }}</dt><dd>{{ application.preferred_name || '-' }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.email') }}</dt><dd>{{ application.email }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.phone') }}</dt><dd>{{ application.country_code }} {{ application.phone_number }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.location') }}</dt><dd>{{ application.current_location }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.appliedOnColumn') }}</dt><dd>{{ formatDate(application.created_at) }}</dd></div>
          <div><dt>{{ $t('candidatePipeline.resume') }}</dt><dd><el-button link type="primary" :loading="downloading" @click="download">{{ application.resume_name }}</el-button></dd></div>
        </dl>
        <h2>{{ $t('candidatePipeline.screeningAnswers') }}</h2>
        <p v-if="!application.answers.length">{{ $t('candidatePipeline.noAnswers') }}</p>
        <dl v-else class="answers">
          <div v-for="(answer, index) in application.answers" :key="index">
            <dt>{{ answer.question }}</dt><dd>{{ answer.values.length ? answer.values.join(', ') : '-' }}</dd>
          </div>
        </dl>
      </el-tab-pane>
      <el-tab-pane name="evaluations" :label="$t('candidatePipeline.evaluations')" lazy>
        <CandidateEvaluations :key="`${jobId}-${candidateId}`" :job-id="jobId" :candidate-id="candidateId" />
      </el-tab-pane>
      <el-tab-pane name="notes" :label="$t('candidatePipeline.notes')" />
    </el-tabs>
  </main>
</template>

<script setup lang="ts">
import { saveAs } from 'file-saver'
import { getCandidateApplication, getCandidateResume } from '@/api/modules/candidatePipeline'
import type { CandidateApplication } from '@/api/modules/candidatePipeline'
import { ROUTER_CANDIDATE_PIPELINE } from '@/router/routerName'
import { useLocale } from '@/hooks/useLocale'
import CandidateEvaluations from './components/CandidateEvaluations.vue'

const route = useRoute()
const router = useRouter()
const { $t } = useLocale()
const activeTab = ref('overview')
const application = ref<CandidateApplication>()
const downloading = ref(false)
const jobId = computed(() => typeof route.params.jobId === 'string' ? route.params.jobId : '')
const candidateId = computed(() => typeof route.params.candidateId === 'string' ? route.params.candidateId : '')
let version = 0
const formatDate = (value: string) => new Date(value).toLocaleString()
const back = () => router.push({ name: ROUTER_CANDIDATE_PIPELINE, params: { jobId: jobId.value },
  state: { candidatePipelineFromSidebar: window.history.state?.candidatePipelineFromSidebar === true } })

watch([jobId, candidateId], async ([job, candidate]) => {
  const current = ++version
  application.value = undefined
  activeTab.value = 'overview'
  if (!job || !candidate) return
  try {
    const response = await getCandidateApplication(job, candidate)
    if (!response.success || !response.result || !Array.isArray(response.result.answers)
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
    const response = await getCandidateResume(jobId.value, candidateId.value)
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
header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
h1 { margin: 0; font-size: 24px; }
header p { color: var(--color-gray); }
h2 { font-size: 16px; }
.details { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
dt { color: var(--color-gray); margin-bottom: 5px; }
dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; }
.answers > div { margin: 16px 0; padding: 14px; border: 1px solid #e3edf7; border-radius: 6px; }
</style>
