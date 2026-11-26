import InterviewProcess from './evaluationPlan'
import RecruitmentPipeline from './recruitmentPipeline'
import type { ScreeningFormListItem, ScreeningQuestion, ScreeningQuestionType } from './screeningQuestionsForm'

declare namespace JobPosition {
  type ApplicationQuestionsDisplayMode = 'WITH_DESCRIPTION' | 'SEPARATE_TABS'
  interface JonPositionInfo {
    id: number
    title: string
    employment_type_id: number
    work_arrangement_type_id: number
    experience_level_type: number
    application_questions_display_mode: number
    screening_questions: Array<Omit<ScreeningQuestion, 'id'>>
    recruitment_pipeline_rounds: RecruitmentPipeline.RoundParam[]
    evaluation_plan_rounds: InterviewProcess.RoundParam[]
    evaluation_impact_token?: string
    confirm_ignored_evaluation_changes?: boolean
    work_location: string
    description: string
    requisition_id: string
    num_of_openings: number
    office: string
    department: string
    hiring_managers?: string[]
    hr_recruiter: number
    hr_coordinators: number[]
    interview_process_template: string
    interview_feedback_template: string
    resume_inbox: string
    publish_channel: number[]
    created_by: string
    created_at: string
    updated_at: string
    published_at: string
    extended_questions?: string[]
    status: number
  }
  interface ProcessTemp {
    id: number
    name: string
  }
  interface JobPositionListItem {
    id: string
    title: string
    employment_type: number
    work_arrangement_type: number
    experience_level_type: number | null
    work_location: (number | CommonEnum.enumItem)[] | null
    status: number | string
    owner_id: string | null
    owner_name: string | null
    application_count: number
  }
  interface JobPositionDetail {
    id: string | number
    owner_id: string | null
    created_at: string
    created_by_id: number
    created_by_name: string
    employment_type_name: string
    employment_type_id: number
    employment_type?: number
    work_arrangement_type_id?: number
    work_arrangement_type?: number
    experience_level_type: number
    application_questions_display_mode: ApplicationQuestionsDisplayMode | 0 | 1
    screening_questions?: ScreeningQuestion[] | null
    recruitment_pipeline_rounds?: RecruitmentPipeline.RoundParam[] | null
    evaluation_plan_rounds?: InterviewProcess.RoundParam[] | null
    recruiters?: string[]
    hiring_managers?: string[]
    hr_coordinators: CommonEnum.enumItem[] | string
    hr_recruiter_id: number
    hr_recruiter_name: string
    description: string
    requisition_id: string
    num_of_openings: number
    office: string
    department: string
    title: string
    last_modified_at: string
    publish_channel: CommonEnum.enumItem[] | string
    published_at: string
    resume_inbox_name: string
    resume_inbox: number
    status_name: string
    status: number
    work_location: (number | CommonEnum.enumItem)[] | string
    extended_questions?: string[]
    interview_process_templates?: ProcessTemp[]
    public_interview_feedback?: boolean
  }
  interface CrateJonPositionInfo {
    id: number
  }
  interface FieldOption {
    id: number | string
    name: string
    email?: string
  }
  interface JobSearchFields {
    employment_types: FieldOption[]
    work_arrangement_types: FieldOption[]
    experience_level_types: FieldOption[]
    job_status: { id: number; name: string }[]
    job_posted_date_types: { id: number; name: string }[]
    screening_question_types: ScreeningQuestionType[]
  }
  interface JobFieldsData extends JobSearchFields {
    job_questions_display_mode: { id: number; name: string }[]
    recruitment_pipelines: FieldOption[]
    evaluation_plans: FieldOption[]
    screening_questions_forms: ScreeningFormListItem[]
    recruiters: FieldOption[]
    hiring_managers: FieldOption[]
    evaluation_plan_round_types: InterviewProcess.RoundType[]
    recruitment_pipeline_round_types: RecruitmentPipeline.RoundType[]
  }
}
export default JobPosition
