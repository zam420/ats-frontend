<template>
  <EspMain :title="$t('jobPosition.preview')">
    <div v-loading="loading" class="preview-content">
      <el-alert v-if="loadError" :title="$t('jobPosition.previewJobLoadError')" type="error" :closable="false" />
      <JobPositionPreview v-if="preview" embedded :preview-data="preview" :company-name="companyName"
        :company-logo-url="logoUrl" :published-at="publishedAt" />
    </div>
  </EspMain>
</template>

<script setup lang="ts">
import { getJob, getJobsFilters, resolveJobLogoUrl } from '@/api/modules/jobs'
import { WorkLocation } from '@/enums/workLocationEnum'
import JobPositionPreview from '@/views/jobPosition/JobPositionPreview.vue'
import { toPreviewQuestions, type JobPreview } from '@/views/jobPosition/jobPreview'

const route = useRoute()
const loading = ref(true)
const loadError = ref(false)
const preview = ref<JobPreview>()
const companyName = ref('')
const logoUrl = ref('')
const publishedAt = ref<string | null>(null)
let disposed = false

onMounted(async () => {
  try {
    const id = route.params.id
    if (typeof id !== 'string' || !id) throw new Error('Job ID missing')
    const [jobResponse, fieldsResponse] = await Promise.all([getJob(id), getJobsFilters()])
    const job = jobResponse.result
    const fields = fieldsResponse.result
    if (!jobResponse.success || !job || !fieldsResponse.success || !fields ||
        !Array.isArray(fields.employment_types) || !Array.isArray(fields.work_arrangement_types) ||
        !Array.isArray(fields.screening_question_types) || !Array.isArray(job.work_location)) {
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
    }).join(', ')
    const questions = (job.screening_questions ?? []).map(({ screening_question_type_id, ...question }) => ({
      ...question, screening_question_type: screening_question_type_id
    })).sort((a, b) => a.order - b.order)
    if (disposed) return
    preview.value = {
      title: job.title, description: job.description, employmentType, workArrangement, workLocation,
      screeningDisplayMode: mode === 0 || mode === 'WITH_DESCRIPTION' ? 'description' : 'tab',
      questions: toPreviewQuestions(questions, fields.screening_question_types)
    }
    companyName.value = job.company_name
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
.preview-content { min-height: 120px; }
</style>
