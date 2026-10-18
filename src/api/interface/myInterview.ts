declare namespace MyInterview {
  interface SearchParam {
    time_type: number
  }
  interface Interviewer {
    email: string
    id: number
    name: string
  }

  interface InterviewInfo {
    applying_position_id: number
    applying_position_title: string
    candidate_name: string
    candidate_resume_id: number
    feedback_id: null
    interview_candidate_id: number
    interview_time_from: string
    interview_time_to: string
    interviewers: Interviewer[]
    is_online: number
    round_id: number
    status: number
    status_name: string
    interview_time: string
    interview_mode: string
    read_only: boolean
    interviewerNames: string
    interview_type: string
    round_type: number
    interview_round_id: number
    applying_position_locations: Form.FormSelect[]
  }

  interface DetailInfo {
    feedback_id?: number
    interview_round_id?: number,
    candidate_resume_id?: number,
    interview_result?: number
    ability_score?: number
    feedback_type?: number
    experience_score?: number
    potential_score?: number
    overall_evaluation?: string
    work_arrangement?: string
    updated_at?: string
    round_type?: number
    interview_time_from?: string
    interview_time_to?: string
    interviewers?: Interviewer[]
    is_online?: number
    technical_language_skills?: string
    domain_knowledge?: string
    behavioural_competence?: string
    adaptability?: string
    leadership?: string
    behavioral_cultural_fit?: string
    tech_remark?: string
    overall_tech_rating?: number
    operator_name?: string
    job_id?: number
    job_title?: string
  }

  interface FeedbackResult {
    id: number
    updated_at: string
  }
}
export default MyInterview
