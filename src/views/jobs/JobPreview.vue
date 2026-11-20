<template>
  <div class="job-details">
    <div v-if="submitted" class="application-success">
      <h1>{{ $t('jobPosition.applicationThankYou') }}</h1>
      <p>{{ $t('jobPosition.applicationReceived') }}</p>
      <el-button type="primary" @click="exploreJobs">{{ $t('jobPosition.exploreCompanyJobs', { company: companyName }) }}</el-button>
    </div>
    <div v-else v-loading="loading" class="preview-content">
      <el-alert v-if="loadError" :title="$t('jobPosition.previewJobLoadError')" type="error" :closable="false" />
      <JobPositionPreview v-if="preview" embedded :preview-data="preview" :company-name="companyName"
        :company-logo-url="logoUrl" :published-at="publishedAt" :submitting="submitting" @submit="apply" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getJob, getJobsFilters, resolveJobLogoUrl, submitApplication, type ApplicationData } from '@/api/modules/jobs'
import { ROUTER_JOBS } from '@/router/routerName'
import { useLocale } from '@/hooks/useLocale'
import { WorkLocation } from '@/enums/workLocationEnum'
import JobPositionPreview from '@/views/jobPosition/JobPositionPreview.vue'
import { toPreviewQuestions, type JobPreview } from '@/views/jobPosition/jobPreview'

const route = useRoute()
const router = useRouter()
const { $t } = useLocale()
const loading = ref(true)
const submitting = ref(false)
const submitted = ref(false)
const loadError = ref(false)
const preview = ref<JobPreview>()
const companyName = ref('')
const companyId = ref('')
const logoUrl = ref('')
const publishedAt = ref<string | null>(null)
let disposed = false
const apply = async (data: ApplicationData, resume: File) => {
  if (submitting.value || typeof route.params.id !== 'string') return
  submitting.value = true
  try {
    const response = await submitApplication(route.params.id, data, resume)
    if (!response.success) throw new Error('Application was not accepted')
    if (!disposed) submitted.value = true
  } catch (error) {
    console.error('Failed to submit job application', error)
    if (!disposed) ElMessage.error($t('jobPosition.applicationSubmitError'))
  } finally {
    if (!disposed) submitting.value = false
  }
}
const exploreJobs = () => router.push({ path: `/${ROUTER_JOBS}`, query: { company: companyId.value, companyName: companyName.value } })

onMounted(async () => {
  try {
    const id = route.params.id
    if (typeof id !== 'string' || !id) throw new Error('Job ID missing')
    const [jobResponse, fieldsResponse] = await Promise.all([getJob(id), getJobsFilters()])
    const job = jobResponse.result
    const fields = fieldsResponse.result
    if (!jobResponse.success || !job || !fieldsResponse.success || !fields ||
        !Array.isArray(fields.employment_types) || !Array.isArray(fields.work_arrangement_types) ||
        !Array.isArray(fields.screening_question_types) || !Array.isArray(job.work_location) || !job.company_id) {
      throw new Error('Job preview data missing')
    }
    const employmentType = fields.employment_types.find(item => item.id === job.employment_type)?.name
    const workArrangement = fields.work_arrangement_types.find(item => item.id === job.work_arrangement_type)?.name
    if (!employmentType || !workArrangement) throw new Error('Job preview field options missing')
    const mode = job.application_questions_display_mode
    if (mode !== 0 && mode !== 1 && mode !== 'WITH_DESCRIPTION' && mode !== 'SEPARATE_TABS') throw new Error('Invalid display mode')
    const workLocation = job.work_location.map(value => {
      const location = WorkLocation[String(value)]
      if (!location) throw new Error(`Unknown work location: ${value}`)
      return location.name
    })
    const questions = (job.screening_questions ?? []).map(({ id, public_id, screening_question_type_id, ...question }) => ({
      ...question, id: public_id, screening_question_type: screening_question_type_id
    })).sort((a, b) => a.order - b.order)
    if (disposed) return
    preview.value = {
      title: job.title, description: job.description, employmentType, workArrangement, workLocation,
      screeningDisplayMode: mode === 0 || mode === 'WITH_DESCRIPTION' ? 'description' : 'tab',
      questions: toPreviewQuestions(questions, fields.screening_question_types)
    }
    companyName.value = job.company_name
    companyId.value = job.company_id
    publishedAt.value = job.published_at
    logoUrl.value = job.company_logo_url ? resolveJobLogoUrl(job.company_logo_url) : ''
  } catch (error) {
    console.error('Failed to load job preview', error)
    if (!disposed) loadError.value = true
  } finally {
    if (!disposed) loading.value = false
  }
})
onBeforeUnmount(() => {
  disposed = true
})
</script>

<style lang="less" scoped>
.job-details { padding: 2.3em 2em 0.5rem; height: 100%; overflow: auto; }
.preview-content { min-height: 120px; }
.application-success { margin: 60px auto; max-width: 700px; text-align: center; }
.application-success p { margin: 20px 0; }
</style>
