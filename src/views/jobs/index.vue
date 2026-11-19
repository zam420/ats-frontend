<template>
  <EspMain class="jobs-page" :title="$t('jobPosition.searchJobs')">
    <JobSearchFilters :model-value="searchForm" :fields="fields" :show-status="false" single-row @search="search" @reset="reset" />
    <div class="jobs-results">
      <section class="jobs-list" v-loading="listLoading">
        <el-alert v-if="listError" :title="$t('jobPosition.jobsLoadError')" type="error" :closable="false" />
        <el-empty v-else-if="!listLoading && searched && !jobs.length" :description="$t('jobPosition.noJobs')" />
        <template v-if="fields">
          <JobCard v-for="job in jobs" :key="job.id" :job="job" :fields="fields" @open="openJob" />
        </template>
        <el-pagination v-if="total > pageSize" layout="prev, pager, next" :total="total"
          :page-size="pageSize" :current-page="pageNum" @current-change="changePage" />
      </section>
    </div>
  </EspMain>
</template>

<script setup lang="ts">
import { getJobs, getJobsFilters, type CandidateJobSummary } from '@/api/modules/jobs'
import type JobPosition from '@/api/interface/jobPosition'
import JobSearchFilters from '@/views/jobPosition/components/JobSearchFilters.vue'
import JobCard from './JobCard.vue'
import { ROUTER_JOBS_PREVIEW } from '@/router/routerName'
import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
const emptySearch = () => ({
  title: '', workLocations: [] as number[], employmentTypes: [] as (number | string)[],
  workArrangementTypes: [] as (number | string)[], experienceLevelTypes: [] as (number | string)[],
  jobStatuses: [] as number[], jobPostedDateType: undefined as number | undefined
})
const searchForm = reactive(emptySearch())
const fields = ref<JobPosition.JobSearchFields>()
const jobs = ref<CandidateJobSummary[]>([])
const router = useRouter()
const listLoading = ref(false)
const listError = ref(false)
const searched = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = 20
let searchVersion = 0
let appliedSearch = emptySearch()

const openJob = (id: string) => {
  const href = router.resolve(`/${ROUTER_JOBS_PREVIEW}/${encodeURIComponent(id)}`).href
  const page = window.open(href, '_blank')
  if (!page) {
    ElMessage.error($t('jobPosition.previewOpenError'))
    return
  }
  page.opener = null
}
const loadJobs = async () => {
  const version = ++searchVersion
  listLoading.value = true
  listError.value = false
  searched.value = true
  jobs.value = []
  total.value = 0
  try {
    const { jobStatuses, ...filters } = appliedSearch
    const response = await getJobs({ ...filters, pageNum: pageNum.value, pageSize })
    if (!response?.success || !response.result || !Array.isArray(response.result.data_list)) throw new Error('Job search response missing')
    if (version !== searchVersion) return
    jobs.value = response.result.data_list
    total.value = response.result.total_count
  } catch (error) {
    if (version !== searchVersion) return
    console.error('Failed to search jobs', error)
    listError.value = true
  } finally {
    if (version === searchVersion) listLoading.value = false
  }
}
const search = () => {
  appliedSearch = {
    title: searchForm.title.trim(), workLocations: [...searchForm.workLocations],
    employmentTypes: [...searchForm.employmentTypes], workArrangementTypes: [...searchForm.workArrangementTypes],
    experienceLevelTypes: [...searchForm.experienceLevelTypes], jobStatuses: [],
    jobPostedDateType: searchForm.jobPostedDateType
  }
  pageNum.value = 1
  void loadJobs()
}
const reset = () => {
  Object.assign(searchForm, emptySearch())
  search()
}
const changePage = (page: number) => {
  pageNum.value = page
  void loadJobs()
}
onMounted(async () => {
  try {
    const response = await getJobsFilters()
    const result = response?.result
    if (!response?.success || !result || !Array.isArray(result.employment_types) ||
        !Array.isArray(result.work_arrangement_types) || !Array.isArray(result.experience_level_types) ||
        !Array.isArray(result.screening_question_types) || !Array.isArray(result.job_posted_date_types)) throw new Error('Job filter options missing')
    fields.value = result
  } catch (error) {
    console.error('Failed to load job filters', error)
    ElMessage.error($t('jobPosition.fieldsLoadError'))
  }
})
onBeforeUnmount(() => {
  searchVersion++
})
</script>

<style lang="less" scoped>
.jobs-page.main-wrap { overflow: hidden; min-height: 0; }
.jobs-page :deep(.header), .jobs-page > .job-search { flex-shrink: 0; }
.jobs-results { flex: 1 1 0; min-height: 0; overflow-y: auto; }
.jobs-list { width: min(100%, 960px); margin: 0 auto; min-height: 120px; }
.jobs-list :deep(.job-card + .job-card) { margin-top: 16px; }
.el-pagination { margin-top: 16px; }
</style>
