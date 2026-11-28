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
  closed: boolean
  application_close_type: 0 | 1 | 2 | null
  closed_reason: string | null
  consider_for_other_openings: boolean | null
  closed_at: string | null
  closed_at_stage_name: string | null
  closed_at_stage_type: PipelineStageType | null
  evaluation: {
    current_round_name: string | null
    current_status: EvaluationRoundStatus
    current_owners: string[]
    completed_rounds: number
    total_rounds: number
    strong_yes: number
    yes: number
    no: number
    strong_no: number
    cancelled: number
    round_results: { name: string; result: EvaluationRoundResult | null }[]
    decision: 0 | 1 | null
  } | null
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
export interface CandidateApplication {
  id: string
  job_title: string
  first_name: string
  last_name: string
  preferred_name: string | null
  email: string
  country_code: string
  phone_number: string
  current_location: string
  resume_name: string
  created_at: string
  answers: { question: string; values: string[] }[]
}
export interface CandidateEvaluations {
  initialized: boolean
  decision: 0 | 1 | null
  can_manage: boolean
  can_decide: boolean
  can_resolve_conflict: boolean
  current_user_id: string
  interviewers: { id: string; name: string; email: string }[]
  rounds: {
    id: string
    order: number
    name: string
    description: string | null
    round_type: 0 | 1 | 2 | 3
    interviewers: string[] | null
    status: EvaluationRoundStatus
    result: EvaluationRoundResult | null
    scheduled_at: string | null
    duration_minutes: number | null
    status_changed_at: string | null
    submitted_interviewers: string[]
    submitted_feedback: { interviewer_id: string; result: EvaluationRoundResult | null; submitted_at: string | null }[]
    can_enter_feedback: boolean
  }[]
}
export type EvaluationRoundStatus = 0 | 1 | 3 | 4 | 5
export type EvaluationRoundResult = 0 | 1 | 2 | 3 | 4
export interface EvaluationFeedback {
  result: EvaluationRoundResult | null
  overall_feedback: string | null
  strengths: string | null
  areas_for_improvement: string | null
  submitted: boolean
}
export type EvaluationFeedbackInput = Omit<EvaluationFeedback, 'submitted'>

const candidateUrl = (jobId: string, candidateId: string) =>
  `api/pipeline/${encodeURIComponent(jobId)}/candidates/${encodeURIComponent(candidateId)}`
export const getCandidateApplication = (jobId: string, candidateId: string) =>
  http.get<CandidateApplication>(candidateUrl(jobId, candidateId), undefined, { preserveHtml: true })
export const getCandidateResume = (jobId: string, candidateId: string) =>
  http.getFile(`${candidateUrl(jobId, candidateId)}/resume`)
export const getCandidateEvaluations = (jobId: string, candidateId: string) =>
  http.get<CandidateEvaluations>(`${candidateUrl(jobId, candidateId)}/evaluations`)
const evaluationsUrl = (jobId: string, candidateId: string) => `${candidateUrl(jobId, candidateId)}/evaluations`
const roundUrl = (jobId: string, candidateId: string, roundId: string) =>
  `${evaluationsUrl(jobId, candidateId)}/rounds/${encodeURIComponent(roundId)}`
export const scheduleEvaluation = (jobId: string, candidateId: string, roundId: string, scheduledAt: string, durationMinutes: number) =>
  http.post<boolean>(`${roundUrl(jobId, candidateId, roundId)}/schedule`, { scheduled_at: scheduledAt, duration_minutes: durationMinutes })
export const changeEvaluationInterviewers = (jobId: string, candidateId: string, roundId: string, interviewers: string[]) =>
  http.post<boolean>(`${roundUrl(jobId, candidateId, roundId)}/interviewers`, { interviewers })
export const changeEvaluationStatus = (jobId: string, candidateId: string, roundId: string, status: 0 | 3) =>
  http.post<boolean>(`${roundUrl(jobId, candidateId, roundId)}/status`, { status })
export const recordEvaluationResult = (jobId: string, candidateId: string, roundId: string, result: EvaluationRoundResult) =>
  http.post<boolean>(`${roundUrl(jobId, candidateId, roundId)}/result`, { result })
export const addEvaluationRound = (jobId: string, candidateId: string, data: {
  name: string; description: string | null; round_type: 0 | 1 | 2 | 3; interviewers: string[]
}) => http.post<boolean>(`${evaluationsUrl(jobId, candidateId)}/rounds`, data)
export const decideEvaluations = (jobId: string, candidateId: string, decision: 0 | 1) =>
  http.post<boolean>(`${evaluationsUrl(jobId, candidateId)}/decision`, { decision })
export const getEvaluationFeedback = (jobId: string, candidateId: string, roundId: string) =>
  http.get<EvaluationFeedback>(`${roundUrl(jobId, candidateId, roundId)}/feedback`)
export const getSubmittedEvaluationFeedback = (jobId: string, candidateId: string, roundId: string, interviewerId: string) =>
  http.get<EvaluationFeedback>(`${roundUrl(jobId, candidateId, roundId)}/feedback/${encodeURIComponent(interviewerId)}`)
export const saveEvaluationFeedback = (jobId: string, candidateId: string, roundId: string,
  data: EvaluationFeedbackInput, submit: boolean) =>
  http.post<boolean>(`${roundUrl(jobId, candidateId, roundId)}/feedback/${submit ? 'submit' : 'draft'}`, data)

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
