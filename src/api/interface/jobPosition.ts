import InterviewProcess from './evaluationPlan'
import RecruitmentPipeline from './recruitmentPipeline'

declare namespace JobPosition {
  interface JonPositionInfo {
    id: number
    title: string
    project_id: number
    employment_type_id: number
    work_arrangement_type_id: number
    recruitment_pipeline_id: number | string
    evaluation_plan_id: number | string
    work_location: string
    description: string
    mandatory_requirements: string
    preferred_requirements?: string
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
  interface JobPositionDetail {
    id: string | number
    created_at: string
    created_by_id: number
    created_by_name: string
    employment_type_name: string
    employment_type_id: number
    employment_type?: number
    work_arrangement_type_id?: number
    work_arrangement_type?: number
    recruitment_pipeline_id?: number | string
    recruitment_pipeline?: string
    evaluation_plan_id?: number | string
    evaluation_plan?: string
    recruiters?: string[]
    hiring_managers?: string[]
    hr_coordinators: CommonEnum.enumItem[] | string
    hr_recruiter_id: number
    hr_recruiter_name: string
    description: string
    mandatory_requirements: string
    preferred_requirements?: string
    title: string
    last_modified_at: string
    project_id: number
    project_name: string
    publish_channel: CommonEnum.enumItem[] | string
    published_at: string
    resume_inbox_name: string
    resume_inbox: number
    status_name: string
    status: number
    work_location: CommonEnum.enumItem[] | string
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
  interface JobFieldsData {
    employment_types: FieldOption[]
    work_arrangement_types: FieldOption[]
    recruitment_pipelines: FieldOption[]
    evaluation_plans: FieldOption[]
    recruiters: FieldOption[]
    hiring_managers: FieldOption[]
    evaluation_plan_round_types: InterviewProcess.RoundType[]
    recruitment_pipeline_round_types: RecruitmentPipeline.RoundType[]
  }
}
export default JobPosition
