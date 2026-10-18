declare namespace AdminRecruitmentProject {
  interface AdminRecruitmentProjectInfo {
    created_at: string
    created_by_id: number
    created_by_name: string
    project_id: number
    project_name: string
    status_name: string
    status: number
    work_location: number
    work_location_name: string
    admins: ProjectAdmins[] | string
    interview_process_templates: InterviewProcessTemplates[] | string
    name: string
    adminString?: string
    interview_process_templates_string?: string
  }
  interface ProjectAdmins {
    id: number
    name: string
  }
  interface InterviewProcessTemplates {
    id: number
    name: string
  }
  interface ProjectInactive {
    project_id: number
  }
}
export default AdminRecruitmentProject
