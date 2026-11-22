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
  rejection_reason: string | null
  consider_for_other_openings: boolean | null
  rejected_at: string | null
  rejected_stage_name: string | null
  rejected_stage_type: PipelineStageType | null
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
  pipeline_count: number
  stages: PipelineStage[]
  rejected_candidates: PipelineCandidate[]
}

export const getPipelineJobs = () => http.get<PipelineJob[]>('api/pipeline/jobs')
export const getCandidatePipeline = (jobId: string) =>
  http.get<CandidatePipeline>(`api/pipeline/${encodeURIComponent(jobId)}`)
export const moveCandidate = (jobId: string, candidateId: string, fromStageId: string, toStageId: string) =>
  http.post<boolean>(`api/pipeline/${encodeURIComponent(jobId)}/candidates/${encodeURIComponent(candidateId)}/move`, {
    from_stage_id: fromStageId, to_stage_id: toStageId
  })
export const rejectCandidate = (jobId: string, candidateId: string, stageId: string, reason: string, considerForOtherOpenings: boolean) =>
  http.post<boolean>(`api/pipeline/${encodeURIComponent(jobId)}/candidates/${encodeURIComponent(candidateId)}/reject`, {
    stage_id: stageId, reason, consider_for_other_openings: considerForOtherOpenings
  })
