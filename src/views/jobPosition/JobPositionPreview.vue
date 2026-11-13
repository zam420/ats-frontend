<template>
  <EspMain :title="$t('jobPosition.preview')">
    <el-alert v-if="!preview" :title="$t('jobPosition.previewUnavailable')" type="warning" :closable="false" />
    <article v-else class="job-preview" v-loading="loading">
      <el-alert v-if="companyError" :title="$t('jobPosition.previewCompanyError')" type="error" :closable="false" />
      <el-alert v-if="logoError" :title="$t('jobPosition.previewLogoError')" type="error" :closable="false" />
      <header class="company-header">
        <div class="logo-slot">
          <img v-if="logoUrl" :src="logoUrl" :alt="company?.name ?? ''" class="company-logo" />
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
        <div class="job-fact"><span>{{ $t('jobPosition.workLocation') }}:</span> {{ preview.workLocation || '—' }}</div>
      </div>
      <p class="posted-date">{{ $t('jobPosition.previewPostedDate') }}: {{ postedDate }}</p>
      <template v-if="preview.screeningDisplayMode === 'description'">
        <hr class="description-divider" />
        <div class="ql-editor job-rich-text preview-description" v-html="description"></div>
        <ApplicantInformationPreview />
        <section class="additional-questions">
          <h1>{{ $t('jobPosition.additionalQuestions') }}</h1>
          <ScreeningQuestionsPreview v-if="preview.questions.length" class="additional-questions-content" :questions="preview.questions" />
        </section>
        <el-button type="primary" class="submit-application-button">{{ $t('jobPosition.submitApplication') }}</el-button>
      </template>
      <el-tabs v-else v-model="activePreviewTab" class="preview-tabs">
        <el-tab-pane :label="$t('jobPosition.jobDescription')" name="description">
          <div class="ql-editor job-rich-text preview-description" v-html="description"></div>
        </el-tab-pane>
        <el-tab-pane :label="$t('jobPosition.applyForThisJob')" name="questions">
          <ApplicantInformationPreview :show-heading="false" />
          <section class="additional-questions">
            <h1>{{ $t('jobPosition.additionalQuestions') }}</h1>
            <ScreeningQuestionsPreview v-if="preview.questions.length" class="additional-questions-content" :questions="preview.questions" />
          </section>
          <el-button type="primary" class="submit-application-button">{{ $t('jobPosition.submitApplication') }}</el-button>
        </el-tab-pane>
      </el-tabs>
    </article>
  </EspMain>
</template>

<script setup lang="ts">
import { getCurrentTenant, getCurrentTenantLogo, type Tenant } from '@/api/modules/tenant'
import { jobRichTextToHtml } from './jobRichText'
import { readJobPreview } from './jobPreview'
import ScreeningQuestionsPreview from './components/ScreeningQuestionsPreview.vue'
import ApplicantInformationPreview from './components/ApplicantInformationPreview.vue'
import moment from 'moment'
import { DATE_FORMAT } from '@/config'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import './jobRichText.less'

const route = useRoute()
const preview = ref<ReturnType<typeof readJobPreview>>(null)
const company = ref<Tenant | null>(null)
const logoUrl = ref('')
const loading = ref(false)
const companyError = ref(false)
const logoError = ref(false)
const activePreviewTab = ref('description')
const description = computed(() => jobRichTextToHtml(preview.value?.description))
const postedDate = moment().format(DATE_FORMAT)
let disposed = false

const scrollToApplication = () => {
  document.getElementById('your-application-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(async () => {
  try {
    preview.value = readJobPreview(route.query.preview)
  } catch (error) {
    console.error('Failed to read job preview', error)
  }
  if (!preview.value) return
  loading.value = true
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
  if (logoUrl.value) URL.revokeObjectURL(logoUrl.value)
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
.job-facts { display: flex; flex-wrap: wrap; gap: 8px 24px; }
.job-fact span { font-weight: 600; }
.posted-date { margin: 12px 0 18px; }
.description-divider { border: 0; border-top: 1px solid var(--el-border-color); margin: 0 0 0px; }
.preview-description { height: auto; overflow-y: visible; padding: 0; font-size: 14px; overflow-wrap: anywhere; margin-top:28px; }
.preview-tabs :deep(.el-tabs__header) { margin-bottom: 0px; }
// .preview-tabs :deep(.el-tabs__content) { padding-bottom: 28px; }
.additional-questions { margin-top: 28px; padding-bottom: 28px;}
.additional-questions h1 { font-size: 24px; font-weight: 600; }
.additional-questions-content { margin-top: 20px; }
.submit-application-button { margin-top: 20px; margin-bottom: 28px; }
.el-alert { margin-bottom: 16px; }
</style>
