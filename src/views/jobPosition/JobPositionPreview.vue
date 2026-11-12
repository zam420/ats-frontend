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
          <h1 class="job-title">{{ preview.title }}</h1>
          <div v-if="company" class="company-name">{{ company.name }}</div>
        </div>
      </header>
      <div class="job-facts">
        <div class="job-fact"><span>{{ $t('jobPosition.employmentType') }}:</span> {{ preview.employmentType || '—' }}</div>
        <div class="job-fact"><span>{{ $t('jobPosition.workArrangement') }}:</span> {{ preview.workArrangement || '—' }}</div>
        <div class="job-fact"><span>{{ $t('jobPosition.workLocation') }}:</span> {{ preview.workLocation || '—' }}</div>
      </div>
      <p class="posted-date">{{ $t('jobPosition.previewPostedDate') }}: {{ postedDate }}</p>
      <section class="job-preview-description">
        <h2>{{ $t('jobPosition.jobDescription') }}</h2>
        <div class="ql-editor preview-description" v-html="description"></div>
      </section>
    </article>
  </EspMain>
</template>

<script setup lang="ts">
import { getCurrentTenant, getCurrentTenantLogo, type Tenant } from '@/api/modules/tenant'
import { jobRichTextToHtml } from './jobRichText'
import { readJobPreview } from './jobPreview'
import moment from 'moment'
import { DATE_FORMAT } from '@/config'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const preview = ref<ReturnType<typeof readJobPreview>>(null)
const company = ref<Tenant | null>(null)
const logoUrl = ref('')
const loading = ref(false)
const companyError = ref(false)
const logoError = ref(false)
const description = computed(() => jobRichTextToHtml(preview.value?.description))
const postedDate = moment().format(DATE_FORMAT)
let disposed = false

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
  padding: 20px;
  background: var(--el-color-white);
}
.job-preview-description {
  padding-bottom: 40px;
}
.company-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
.logo-slot { width: 100px; height: 100px; flex: 0 0 100px; }
.company-logo { width: 100px; height: 100px; object-fit: contain; }
.company-heading { min-width: 0; }
.company-name { font-size: 18px; font-weight: 600; }
.job-title { font-size: 28px; margin: 0 0 8px; overflow-wrap: anywhere; }
.job-facts { display: flex; flex-wrap: wrap; gap: 8px 24px; }
.job-fact span { font-weight: 600; }
.posted-date { margin: 12px 0 28px; }
section h2 { font-size: 18px; margin: 0 0 12px; }
.preview-description { padding: 0; font-size: 14px; overflow-wrap: anywhere; }
.el-alert { margin-bottom: 16px; }
</style>
