<template>
  <component :is="embedded ? 'div' : EspMain" :title="embedded ? undefined : $t('jobPosition.preview')">
    <el-alert v-if="!preview && !loading" :title="$t(loadError ? 'jobPosition.previewJobLoadError' : 'jobPosition.previewUnavailable')" :type="loadError ? 'error' : 'warning'" :closable="false" />
    <article v-if="preview" class="job-preview" v-loading="loading">
      <el-alert v-if="companyError" :title="$t('jobPosition.previewCompanyError')" type="error" :closable="false" />
      <el-alert v-if="logoError" :title="$t('jobPosition.previewLogoError')" type="error" :closable="false" />
      <header class="company-header">
        <div class="logo-slot">
          <img v-if="logoUrl && !logoError" :src="logoUrl" :alt="company?.name ?? ''" class="company-logo" @error="onLogoError" />
        </div>
        <div class="company-heading">
          <div class="job-title-row">
            <h1 class="job-title">{{ preview.title }}</h1>
            <el-button
              v-if="preview.screeningDisplayMode === 'description'"
              type="primary"
              @click="scrollToApplication"
            >
              {{ $t('jobPosition.apply') }}
            </el-button>
          </div>
          <div v-if="company" class="company-name">{{ company.name }}</div>
        </div>
      </header>
      <div class="job-facts">
        <div class="job-fact"><span>{{ $t('jobPosition.employmentType') }}:</span> {{ preview.employmentType || '—' }}</div>
        <div class="job-fact"><span>{{ $t('jobPosition.workArrangement') }}:</span> {{ preview.workArrangement || '—' }}</div>
        <div class="job-fact"><span>{{ $t('jobPosition.workLocation') }}:</span> <WorkLocationSummary :locations="preview.workLocation" /></div>
      </div>
      <p class="posted-date">{{ $t('jobPosition.previewPostedDate') }}: {{ postedDate }}</p>
      <template v-if="preview.screeningDisplayMode === 'description'">
        <hr class="description-divider" />
        <div class="ql-editor job-rich-text preview-description" v-html="description"></div>
        <ApplicantInformationPreview ref="applicantRef" />
        <section v-if="preview.questions.length" class="additional-questions">
          <h1>{{ $t('jobPosition.additionalQuestions') }}</h1>
          <ScreeningQuestionsPreview v-if="preview.questions.length" ref="questionsRef" class="additional-questions-content" :questions="preview.questions" />
        </section>
        <el-button type="primary" class="submit-application-button" :loading="submitting" @click="submit">{{ $t('jobPosition.submitApplication') }}</el-button>
      </template>
      <el-tabs v-else v-model="activePreviewTab" class="preview-tabs">
        <el-tab-pane :label="$t('jobPosition.jobDescription')" name="description">
          <div class="ql-editor job-rich-text preview-description" v-html="description"></div>
        </el-tab-pane>
        <el-tab-pane :label="$t('jobPosition.applyForThisJob')" name="questions">
          <ApplicantInformationPreview ref="applicantRef" :show-heading="false" />
          <section v-if="preview.questions.length" class="additional-questions">
            <h1>{{ $t('jobPosition.additionalQuestions') }}</h1>
            <ScreeningQuestionsPreview v-if="preview.questions.length" ref="questionsRef" class="additional-questions-content" :questions="preview.questions" />
          </section>
          <el-button type="primary" class="submit-application-button" :loading="submitting" @click="submit">{{ $t('jobPosition.submitApplication') }}</el-button>
        </el-tab-pane>
      </el-tabs>
    </article>
  </component>
</template>

<script setup lang="ts">
import { getCurrentTenant, getCurrentTenantLogo, type Tenant } from '@/api/modules/tenant'
import EspMain from '@/components/EspMain/index.vue'
import { getJobFieldsData, getJobPositionDetail } from '@/api/modules/jobPosition'
import { WorkLocation } from '@/enums/workLocationEnum'
import { jobRichTextToHtml } from './jobRichText'
import { readJobPreview, toPreviewQuestions, type JobPreview } from './jobPreview'
import ScreeningQuestionsPreview from './components/ScreeningQuestionsPreview.vue'
import ApplicantInformationPreview from './components/ApplicantInformationPreview.vue'
import WorkLocationSummary from './components/WorkLocationSummary.vue'
import moment from 'moment'
import { DATE_FORMAT } from '@/config'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import './jobRichText.less'
import type { ApplicationData } from '@/api/modules/jobs'
import { useLocale } from '@/hooks/useLocale'

const props = defineProps<{ embedded?: boolean; previewData?: JobPreview; companyName?: string; companyLogoUrl?: string; publishedAt?: string | null; submitting?: boolean }>()
const emit = defineEmits<{ (event: 'submit', data: ApplicationData, resume: File): void }>()
const { $t } = useLocale()
const applicantRef = ref<InstanceType<typeof ApplicantInformationPreview>>()
const questionsRef = ref<InstanceType<typeof ScreeningQuestionsPreview>>()
const submit = () => {
  if (!props.embedded || props.submitting) return
  try {
    if (!applicantRef.value || (preview.value?.questions.length && !questionsRef.value)) throw new Error('Application form is not ready')
    const applicant = applicantRef.value.getApplication()
    if (!applicant) return
    const answers = questionsRef.value?.getAnswers() ?? (preview.value?.questions.length ? null : [])
    if (!answers) return
    const { resume, ...data } = applicant
    emit('submit', { ...data, answers }, resume)
  } catch (error) {
    console.error('Failed to prepare application', error)
    ElMessage.error($t('jobPosition.applicationSubmitError'))
  }
}
const route = useRoute()
const preview = ref<ReturnType<typeof readJobPreview>>(null)
const company = ref<Pick<Tenant, 'name' | 'has_logo'> | null>(null)
const logoUrl = ref('')
const loading = ref(false)
const companyError = ref(false)
const logoError = ref(false)
const onLogoError = () => {
  console.error('Failed to load company logo')
  logoError.value = true
}
const loadError = ref(false)
const activePreviewTab = ref('description')
const description = computed(() => jobRichTextToHtml(preview.value?.description))
const postedDate = computed(() => props.embedded
  ? (props.publishedAt && moment(props.publishedAt).isValid() ? moment(props.publishedAt).format(DATE_FORMAT) : '—')
  : moment().format(DATE_FORMAT))
let disposed = false
watch(() => [props.previewData, props.companyName, props.companyLogoUrl] as const, ([data, name, logo]) => {
  if (!props.embedded) return
  preview.value = data ?? null
  company.value = name ? { name, has_logo: !!logo } : null
  logoUrl.value = logo ?? ''
  logoError.value = false
  activePreviewTab.value = 'description'
}, { immediate: true })

const scrollToApplication = () => {
  document.getElementById('your-application-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(async () => {
  if (props.embedded) return
  loading.value = true
  try {
    if (typeof route.params.id === 'string') {
      const [jobResponse, fieldsResponse] = await Promise.all([
        getJobPositionDetail(route.params.id),
        getJobFieldsData()
      ])
      const job = jobResponse.result
      const fields = fieldsResponse.result
      if (!jobResponse.success || !job || !fieldsResponse.success || !fields ||
          !Array.isArray(fields.employment_types) || !Array.isArray(fields.work_arrangement_types) ||
          !Array.isArray(fields.screening_question_types) || !Array.isArray(job.work_location)) {
        throw new Error('Job preview data is missing')
      }
      if (job.application_questions_display_mode !== 'WITH_DESCRIPTION' && job.application_questions_display_mode !== 'SEPARATE_TABS' &&
          job.application_questions_display_mode !== 0 && job.application_questions_display_mode !== 1) {
        throw new Error('Invalid application questions display mode')
      }
      const employmentType = fields.employment_types.find(type => type.id === job.employment_type)?.name
      const workArrangement = fields.work_arrangement_types.find(type => type.id === job.work_arrangement_type)?.name
      if (!employmentType || !workArrangement) throw new Error('Job preview field options are missing')
      const workLocation = job.work_location.map(location => {
        const value = typeof location === 'number' ? location : location.value
        const name = WorkLocation[String(value)]?.name
        if (!name) throw new Error(`Unknown work location: ${value}`)
        return name
      })
      const questions = (job.screening_questions ?? [])
        .map(({ screening_question_type_id, ...question }) => ({ ...question, screening_question_type: screening_question_type_id }))
        .sort((a, b) => a.order - b.order)
      const savedPreview: JobPreview = {
        title: job.title,
        description: job.description,
        employmentType,
        workArrangement,
        workLocation,
        screeningDisplayMode: job.application_questions_display_mode === 'WITH_DESCRIPTION' || job.application_questions_display_mode === 0 ? 'description' : 'tab',
        questions: toPreviewQuestions(questions, fields.screening_question_types)
      }
      if (disposed) return
      preview.value = savedPreview
    } else {
      preview.value = readJobPreview(route.query.preview)
    }
  } catch (error) {
    console.error('Failed to load job preview', error)
    if (!disposed) loadError.value = true
  } finally {
    if (!preview.value) loading.value = false
  }
  if (!preview.value) return
  try {
    const response = await getCurrentTenant()
    if (!response?.result || typeof response.result.name !== 'string') {
      throw new Error('Invalid current tenant response')
    }
    if (disposed) return
    company.value = response.result
    if (response.result.has_logo) {
      try {
        const logo = await getCurrentTenantLogo()
        if (!(logo instanceof Blob) || !['image/png', 'image/jpeg', 'image/svg+xml'].includes(logo.type)) {
          throw new Error('Invalid tenant logo response')
        }
        if (!disposed) logoUrl.value = URL.createObjectURL(logo)
      } catch (error) {
        console.error('Failed to load current tenant logo', error)
        if (!disposed) logoError.value = true
      }
    }
  } catch (error) {
    console.error('Failed to load current tenant', error)
    if (!disposed) companyError.value = true
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  disposed = true
  if (!props.embedded && logoUrl.value) URL.revokeObjectURL(logoUrl.value)
})
</script>

<style lang="less" scoped>
.job-preview {
  width: 90%;
  box-sizing: border-box;
  min-height: 220px;
  margin: 0px auto;
  padding: 20px 20px 28px;
  background: var(--el-color-white);
}
.company-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.logo-slot { width: 100px; height: 100px; flex: 0 0 100px; }
.company-logo { width: 100px; height: 100px; object-fit: contain; }
.company-heading { min-width: 0; flex: 1; }
.job-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.company-name { font-size: 18px; font-weight: 600; }
.job-title { min-width: 0; flex: 1; font-size: 28px; margin: 0 0 8px; overflow-wrap: anywhere; }
.job-facts { display: flex; flex-wrap: wrap; gap: 8px 24px; font-size:13px; }
.job-fact > span:first-child { font-weight: 600; }
.posted-date { margin: 12px 0 18px; font-size:12px; }
.description-divider { border: 0; border-top: 1px solid var(--el-border-color); margin: 0 0 0px; }
.preview-description { height: auto; overflow-y: visible; padding: 0; font-size: 14px; overflow-wrap: anywhere; margin-top:28px; }
.preview-tabs .preview-description { margin-bottom: 28px; }
.preview-tabs :deep(.el-tabs__header) { margin-bottom: 0px;}
.preview-tabs :deep(.el-tabs__item) { font-size:16px; font-weight: 600;}
.additional-questions { margin-top: 28px; padding-bottom: 28px;}
.additional-questions h1 { font-size: 24px; font-weight: 600; }
.additional-questions-content { margin-top: 20px; }
.submit-application-button { margin-top: 20px; margin-bottom: 28px; }
.el-alert { margin-bottom: 16px; }
</style>
