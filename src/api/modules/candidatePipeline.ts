import http from '@/api'

export interface PipelineJob { id: string; title: string }
export interface PipelineCandidate {
  id: string
  first_name: string
  last_name: string
  preferred_name: string | null
  email: string
  current_location: string
  created_at: string
}
export interface PipelineStage {
  id: string
  name: string
  stage_type: PipelineStageType
  order: number
  candidates: PipelineCandidate[]
}
export type PipelineStageType = 'APPLIED' | 'SCREENING' | 'EVALUATING' | 'OFFER_APPROVAL' |
  'OFFERED' | 'HIRED' | 'ONBOARDED' | 'BACKGROUND_CHECK' | 'CUSTOM'
export interface CandidatePipeline {
  job_id: string
  job_title: string
  total_applications: number
  stages: PipelineStage[]
}

export const getPipelineJobs = () => http.get<PipelineJob[]>('api/candidate-pipeline/jobs')
export const getCandidatePipeline = (jobId: string) =>
  http.get<CandidatePipeline>(`api/candidate-pipeline/${encodeURIComponent(jobId)}`)
export const moveCandidate = (jobId: string, candidateId: string, fromStageId: string, toStageId: string) =>
  http.post<boolean>(`api/candidate-pipeline/${encodeURIComponent(jobId)}/candidates/${encodeURIComponent(candidateId)}/move`, {
    from_stage_id: fromStageId, to_stage_id: toStageId
  })
