<template>
  <button type="button" class="job-card" @click="$emit('open', job.id)">
    <div class="card-header">
      <div class="logo-slot">
        <img v-if="logoUrl && !logoError" :src="logoUrl" :alt="job.company_name" @error="onLogoError" />
        <span v-else-if="logoError" class="logo-error">{{ $t('jobPosition.previewLogoError') }}</span>
      </div>
      <div>
        <h2>{{ job.title }}</h2>
        <div class="company-name">{{ job.company_name }}</div>
      </div>
    </div>
    <div class="job-facts">
      <span><strong>{{ $t('jobPosition.employmentType') }}:</strong> {{ employmentType }}</span>
      <span><strong>{{ $t('jobPosition.workArrangement') }}:</strong> {{ workArrangement }}</span>
      <span><strong>{{ $t('jobPosition.workLocation') }}:</strong> {{ workLocation }}</span>
    </div>
    <p class="posted-date">{{ $t('jobPosition.previewPostedDate') }}: {{ postedDate }}</p>
    <hr class="description-divider" />
    <p v-if="job.short_description" class="description">{{ job.short_description }}...</p>
  </button>
</template>

<script setup lang="ts">
import moment from 'moment'
import { DATE_FORMAT } from '@/config'
import { resolveJobLogoUrl, type CandidateJobSummary } from '@/api/modules/jobs'
import type JobPosition from '@/api/interface/jobPosition'
import { WorkLocation } from '@/enums/workLocationEnum'

const props = defineProps<{ job: CandidateJobSummary; fields: JobPosition.JobSearchFields }>()
defineEmits<{ (event: 'open', id: string): void }>()
const logoUrl = computed(() => props.job.company_logo_url ? resolveJobLogoUrl(props.job.company_logo_url) : '')
const logoError = ref(false)
const employmentType = computed(() => props.fields.employment_types.find(item => item.id === props.job.employment_type)?.name ?? String(props.job.employment_type))
const workArrangement = computed(() => props.fields.work_arrangement_types.find(item => item.id === props.job.work_arrangement_type)?.name ?? String(props.job.work_arrangement_type))
const workLocation = computed(() => props.job.work_location.map(value => WorkLocation[String(value)]?.name ?? String(value)).join(', '))
const postedDate = computed(() => props.job.published_at && moment(props.job.published_at).isValid()
  ? moment(props.job.published_at).format(DATE_FORMAT) : '—')
watch(logoUrl, () => { logoError.value = false })
const onLogoError = () => {
  console.error('Failed to load job company logo')
  logoError.value = true
}
</script>

<style lang="less" scoped>
.job-card { display: block; width: 100%; padding: 24px; text-align: left; border: 1px solid var(--el-border-color); border-radius: 12px; background: white; cursor: pointer; }
.job-card:hover, .job-card:focus-visible { border-color: var(--el-color-primary); }
.card-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.logo-slot { display: flex; align-items: center; width: 80px; height: 80px; flex: 0 0 80px; }
.logo-slot img { width: 100%; height: 100%; object-fit: contain; }
.logo-error { font-size: 11px; color: var(--el-color-danger); }
h2 { font-size: 22px; margin: 0 0 8px; overflow-wrap: anywhere; }
.company-name { font-size: 16px; font-weight: 600; }
.job-facts { display: flex; flex-wrap: wrap; gap: 8px 24px; }
.posted-date { margin: 12px 0; }
.description-divider { border: 0; border-top: 1px solid var(--el-border-color); margin: 0; }
.description { margin: 28px 0 0; white-space: normal; overflow-wrap: anywhere; }
</style>
