import http from '@/api'

export interface PipelineJob { id: string; title: string }
export interface CandidateListItem {
  id: string
  name: string
  application_close_type: 0 | 1 | 2 | null
}
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
    current_status_name: string
    current_owners: string[]
    completed_rounds: number
    total_rounds: number
    strong_yes: number
    yes: number
    no: number
    strong_no: number
    cancelled: number
    round_results: { name: string; result: EvaluationRoundResult | null; result_name: string | null }[]
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
  job_id: string
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
  result_options: { id: CandidateEvaluationResult; name: string }[]
  interviewers: { id: string; name: string; email: string }[]
  rounds: {
    id: string
    order: number
    name: string
    description: string | null
    round_type: 0 | 1 | 2 | 3
    interviewers: string[] | null
    status: EvaluationRoundStatus
    status_name: string
    result: EvaluationRoundResult | null
    result_name: string | null
    scheduled_at: string | null
    duration_minutes: number | null
    status_changed_at: string | null
    submitted_interviewers: string[]
    submitted_feedback: { interviewer_id: string; result: CandidateEvaluationResult | null; result_name: string | null; submitted_at: string | null }[]
    can_enter_feedback: boolean
  }[]
}
export type EvaluationRoundStatus = 0 | 1 | 3 | 4 | 5
export type EvaluationRoundResult = 0 | 1 | 2 | 3 | 4
export type CandidateEvaluationResult = 0 | 1 | 3 | 4
export interface EvaluationFeedback {
  result: CandidateEvaluationResult | null
  result_name: string | null
  overall_feedback: string | null
  strengths: string | null
  areas_for_improvement: string | null
  submitted: boolean
}
export type EvaluationFeedbackInput = Omit<EvaluationFeedback, 'submitted' | 'result_name'>

const candidateUrl = (jobId: string, candidateId: string) =>
  `api/pipeline/${encodeURIComponent(jobId)}/candidate/${encodeURIComponent(candidateId)}`
export const getCandidateApplication = (candidateId: string) =>
  http.get<CandidateApplication>(`api/candidate/${encodeURIComponent(candidateId)}`, undefined, { preserveHtml: true })
export const getCandidateList = (jobId: string) =>
  http.get<CandidateListItem[]>(`api/candidate/list/${encodeURIComponent(jobId)}`)
export const getCandidateResume = (candidateId: string) =>
  http.getFile(`api/candidate/${encodeURIComponent(candidateId)}/resume`)
const evaluationsUrl = (candidateId: string) => `api/candidate/${encodeURIComponent(candidateId)}/evaluation`
const roundUrl = (candidateId: string, roundId: string) =>
  `${evaluationsUrl(candidateId)}/rounds/${encodeURIComponent(roundId)}`
export const getCandidateEvaluations = (candidateId: string) =>
  http.get<CandidateEvaluations>(evaluationsUrl(candidateId))
export const scheduleEvaluation = (candidateId: string, roundId: string, scheduledAt: string, durationMinutes: number) =>
  http.post<boolean>(`${roundUrl(candidateId, roundId)}/schedule`, { scheduled_at: scheduledAt, duration_minutes: durationMinutes })
export const changeEvaluationInterviewers = (candidateId: string, roundId: string, interviewers: string[]) =>
  http.post<boolean>(`${roundUrl(candidateId, roundId)}/interviewers`, { interviewers })
export const changeEvaluationStatus = (candidateId: string, roundId: string, status: 0 | 3) =>
  http.post<boolean>(`${roundUrl(candidateId, roundId)}/status`, { status })
export const recordEvaluationResult = (candidateId: string, roundId: string, result: EvaluationRoundResult) =>
  http.post<boolean>(`${roundUrl(candidateId, roundId)}/result`, { result })
export const addEvaluationRound = (candidateId: string, data: {
  name: string; description: string | null; round_type: 0 | 1 | 2 | 3; interviewers: string[]
}) => http.post<boolean>(`${evaluationsUrl(candidateId)}/rounds`, data)
export const decideEvaluations = (candidateId: string, decision: 0 | 1) =>
  http.post<boolean>(`${evaluationsUrl(candidateId)}/decision`, { decision })
export const getEvaluationFeedback = (candidateId: string, roundId: string) =>
  http.get<EvaluationFeedback>(`${roundUrl(candidateId, roundId)}/feedback`)
export const getSubmittedEvaluationFeedback = (candidateId: string, roundId: string, interviewerId: string) =>
  http.get<EvaluationFeedback>(`${roundUrl(candidateId, roundId)}/feedback/${encodeURIComponent(interviewerId)}`)
export const saveEvaluationFeedback = (candidateId: string, roundId: string,
  data: EvaluationFeedbackInput, submit: boolean) =>
  http.post<boolean>(`${roundUrl(candidateId, roundId)}/feedback/${submit ? 'submit' : 'draft'}`, data)

export const getPipelineJobs = () => http.get<PipelineJob[]>('api/pipeline/jobs/list')
export const getCandidatePipeline = (jobId: string) =>
  http.get<CandidatePipeline>(`api/pipeline/${encodeURIComponent(jobId)}`)
export const moveCandidate = (jobId: string, candidateId: string, fromStageId: string, toStageId: string) =>
  http.post<boolean>(`${candidateUrl(jobId, candidateId)}/move`, {
    from_stage_id: fromStageId, to_stage_id: toStageId
  })
export const rejectCandidate = (jobId: string, candidateId: string, stageId: string, reason: string, considerForOtherOpenings: boolean) =>
  http.post<boolean>(`${candidateUrl(jobId, candidateId)}/reject`, {
    stage_id: stageId, reason, consider_for_other_openings: considerForOtherOpenings
  })
