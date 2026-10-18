declare namespace Interviewer {
  interface InterviewerInfo {
    id: number
    form_user_id: number
    form_user: string
    to_user_id: number
    to_user: string
    candidate_resume_id: number
    candidate_name: string
    job_position_id: number
    job_position_title: string
    highest_university: string
    forward_notes: string
    feedback_notes: string
    created_at: string
    status: number
    status_name: string
  }
  interface ProjectAdmins {
    id: number
    name: string
  }
  interface InterviewProcessTemplates {
    id: number
    name: string
  }
  interface InterviewerFeedback {
    resume_forward_ids: number[]
    feedback: number
    feedback_notes: string
  }

  interface TestFeedback {
    exam_forward_id: number[]
    status: number
    feedback_notes: string
  }
}
export default Interviewer
