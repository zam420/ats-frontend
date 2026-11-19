import http from '@/api'
import type { ResPage } from '@/api/interface'
import type JobPosition from '@/api/interface/jobPosition'
import type { ScreeningQuestion } from '@/api/interface/screeningQuestionsForm'

export interface CandidateJobSummary {
  id: string
  title: string
  company_name: string
  company_has_logo: boolean
  company_logo_url: string | null
  published_at: string | null
  short_description: string | null
  employment_type: number
  work_arrangement_type: number
  work_location: number[]
}

export interface CandidateJob extends Omit<CandidateJobSummary, 'short_description'> {
  description: string
  application_questions_display_mode: number | 'WITH_DESCRIPTION' | 'SEPARATE_TABS'
  screening_questions: Array<Omit<ScreeningQuestion, 'screening_question_type'> & { screening_question_type_id: number }> | null
}

export const getJobs = (params: object) => http.get<ResPage<CandidateJobSummary>>('/api/jobs/all', params, { preserveHtml: true })
export const getJobsFilters = () => http.get<JobPosition.JobSearchFields>('/api/jobs/filters')
export const getJob = (id: string) => http.get<CandidateJob>(`/api/jobs/${encodeURIComponent(id)}`, undefined, { preserveHtml: true })
export const resolveJobLogoUrl = (url: string) =>
  new URL(url, new URL(import.meta.env.VITE_API_URL || '/', window.location.origin)).href
