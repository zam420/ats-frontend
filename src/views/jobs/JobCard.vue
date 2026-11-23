<template>
  <button type="button" class="job-card" :disabled="unavailable" :title="unavailable ? $t('jobPosition.applicationJobUnavailable') : undefined" @click="$emit('open', job.id)">
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
      <span><strong>{{ $t('jobPosition.workLocation') }}:</strong> <WorkLocationSummary :locations="workLocation" /></span>
    </div>
    <p class="posted-date">
      {{ $t('jobPosition.previewPostedDate') }}: {{ postedDate }}
      <span v-if="appliedAt" class="applied-date">{{ $t('jobPosition.applicationDate') }}: {{ appliedDate }}</span>
    </p>
    <p v-if="unavailable" class="unavailable">{{ $t('jobPosition.applicationJobUnavailable') }}</p>
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
import WorkLocationSummary from '@/views/jobPosition/components/WorkLocationSummary.vue'

const props = defineProps<{ job: CandidateJobSummary; fields: JobPosition.JobSearchFields; appliedAt?: string; unavailable?: boolean }>()
defineEmits<{ (event: 'open', id: string): void }>()
const logoUrl = computed(() => props.job.company_logo_url ? resolveJobLogoUrl(props.job.company_logo_url) : '')
const logoError = ref(false)
const employmentType = computed(() => props.fields.employment_types.find(item => item.id === props.job.employment_type)?.name ?? String(props.job.employment_type))
const workArrangement = computed(() => props.fields.work_arrangement_types.find(item => item.id === props.job.work_arrangement_type)?.name ?? String(props.job.work_arrangement_type))
const workLocation = computed(() => props.job.work_location.map(value => WorkLocation[String(value)]?.name ?? String(value)))
const postedDate = computed(() => props.job.published_at && moment(props.job.published_at).isValid()
  ? moment(props.job.published_at).format(DATE_FORMAT) : '—')
const appliedDate = computed(() => props.appliedAt && moment(props.appliedAt).isValid()
  ? moment(props.appliedAt).format(DATE_FORMAT) : '—')
watch(logoUrl, () => { logoError.value = false })
const onLogoError = () => {
  console.error('Failed to load job company logo')
  logoError.value = true
}
</script>

<style lang="less" scoped>
.job-card { display: block; width: 100%; padding: 24px; text-align: left; border: 1px solid var(--el-border-color); border-radius: 12px; background: white; cursor: pointer; }
.job-card:hover, .job-card:focus-visible { border-color: var(--el-color-primary); }
.job-card:disabled { cursor: not-allowed; }
.job-card:disabled:hover { border-color: var(--el-border-color); }
.card-header { display: flex; align-items: center; gap: 18px; margin-bottom: 16px; }
.logo-slot { display: flex; align-items: center; width: 50px; height: 50px; flex: 0 0 50px; }
.logo-slot img { width: 100%; height: 100%; object-fit: contain; }
.logo-error { font-size: 11px; color: var(--el-color-danger); }
h2 { font-size: 18px; margin: 0 0 8px; overflow-wrap: anywhere; }
.company-name { font-size: 14px; font-weight: 600; }
.job-facts { display: flex; flex-wrap: wrap; gap: 8px 24px; font-size:13px; }
.posted-date { margin: 12px 0; font-size:12px;}
.applied-date { margin-left: 24px; }
.unavailable { margin: 0 0 12px; font-size: 12px; color: var(--el-text-color-secondary); }
.description-divider { border: 0; border-top: 1px solid var(--el-border-color); margin: 0; }
.description { margin: 20px 0 0; white-space: normal; overflow-wrap: anywhere; }
</style>
