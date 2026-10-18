declare namespace JobPosition {
  interface JonPositionInfo {
    id: number
    title: string
    project_id: number
    recruitment_type: number
    employment_type: number
    job_type: number
    work_location: string
    job_desc: string
    job_req: string
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
    id: number
    created_at: string
    created_by_id: number
    created_by_name: string
    employment_type_name: string
    employment_type: number
    hr_coordinators: CommonEnum.enumItem[] | string
    hr_recruiter_id: number
    hr_recruiter_name: string
    job_desc: string
    job_req: string
    title: string
    job_type_name: string
    job_type: number
    last_modified_at: string
    project_id: number
    project_name: string
    publish_channel: CommonEnum.enumItem[] | string
    published_at: string
    recruitment_type_name: string
    recruitment_type: number
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
}
export default JobPosition
