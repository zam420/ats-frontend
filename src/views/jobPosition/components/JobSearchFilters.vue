<template>
  <el-form class="job-search" :class="{ 'single-row': singleRow }" label-position="top" @submit.prevent="$emit('search')">
    <div class="job-search-row">
      <el-form-item :label="$t('jobPosition.jobTitle')">
        <el-input v-model="modelValue.title" maxlength="100" />
      </el-form-item>
      <el-form-item :label="$t('jobPosition.workLocation')">
        <el-select v-model="modelValue.workLocations" :teleported="!withinPopover" multiple filterable collapse-tags collapse-tags-tooltip>
          <el-option v-for="location in locationOptions" :key="location.value" :label="location.name" :value="location.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('jobPosition.employmentType')">
        <el-select v-model="modelValue.employmentTypes" :teleported="!withinPopover" multiple filterable collapse-tags collapse-tags-tooltip>
          <el-option v-for="option in fields?.employment_types ?? []" :key="option.id" :label="option.name" :value="option.id" />
        </el-select>
      </el-form-item>
    </div>
    <div class="job-search-row">
      <el-form-item :label="$t('jobPosition.workArrangement')">
        <el-select v-model="modelValue.workArrangementTypes" :teleported="!withinPopover" multiple filterable collapse-tags collapse-tags-tooltip>
          <el-option v-for="option in fields?.work_arrangement_types ?? []" :key="option.id" :label="option.name" :value="option.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('jobPosition.experienceLevel')">
        <el-select v-model="modelValue.experienceLevelTypes" :teleported="!withinPopover" multiple filterable collapse-tags collapse-tags-tooltip>
          <el-option v-for="option in fields?.experience_level_types ?? []" :key="option.id" :label="option.name" :value="option.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="showStatus" :label="$t('jobPosition.status')">
        <el-select v-model="modelValue.jobStatuses" :teleported="!withinPopover" multiple filterable collapse-tags collapse-tags-tooltip>
          <el-option v-for="option in fields?.job_status ?? []" :key="option.id" :label="option.name" :value="option.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('jobPosition.datePosted')">
        <el-select v-model="modelValue.jobPostedDateType" :teleported="!withinPopover" clearable>
          <el-option v-for="option in fields?.job_posted_date_types ?? []" :key="option.id" :label="option.name" :value="option.id" />
        </el-select>
      </el-form-item>
    </div>
    <div class="job-search-actions">
      <el-button type="primary" native-type="submit" :disabled="!fields">{{ $t('button.search') }}</el-button>
      <el-button :disabled="!fields" @click="$emit('reset')">{{ $t('button.reset') }}</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import type JobPosition from '@/api/interface/jobPosition'
import { WorkLocation } from '@/enums/workLocationEnum'

interface JobSearch {
  title: string
  workLocations: number[]
  employmentTypes: (number | string)[]
  workArrangementTypes: (number | string)[]
  experienceLevelTypes: (number | string)[]
  jobStatuses: number[]
  jobPostedDateType: number | undefined
}

defineProps<{ modelValue: JobSearch; fields?: JobPosition.JobSearchFields; showStatus: boolean; singleRow?: boolean; withinPopover?: boolean }>()
defineEmits<{ (event: 'search'): void; (event: 'reset'): void }>()
const locationOptions = Object.values(WorkLocation)
</script>

<style lang="less" scoped>
.job-search {
  display: grid;
  grid-template-columns: minmax(210px, 1.4fr) repeat(3, minmax(160px, 1fr));
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 34px;
  :deep(.el-select) { width: 100%; }
  :deep(.el-form-item) { min-width: 0; margin-bottom: 0; }
}
.job-search-row { display: contents; }
.job-search-actions { display: flex; align-items: flex-end; min-height: 32px; grid-column: 1 / -1; }
.single-row {
  grid-template-columns: minmax(210px, 1.4fr) repeat(5, minmax(140px, 1fr)) auto;
  overflow-x: auto;
  .job-search-actions { grid-column: auto; }
}
@media (max-width: 700px) {
  .job-search:not(.single-row) { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
}
</style>
