declare namespace ScheduleInterview {
  interface Candidate {
    candidate_resume_id?: number
    email_body?: string
    email_subject?: string
    candidate_name?: string
    email_bcc?: string[]
    content?: string
    candidate_phone?: string
    candidate_applied_at?: string
    [propName: string]: any
  }

  interface Interviewers {
    id: number
    name: string
    email: string
  }

  interface InterviewInfo {
    id?: number
    round_id?: number
    type?: number
    target_job?: number
    interview_template?: number
    candidates?: Candidate[]
    candidate?: Candidate
    interviewers?: Interviewers[]
    time_from?: string
    time_to?: string
    from_time?: string
    to_time?: string
    round_type?: number
    order?: number
    is_online?: boolean
    interview_location?: string
    info_candidate?: boolean
    info_interviewer?: boolean
    email_template?: number
    status?: number
    teams_meeting_url?: string
    feedback_received?: boolean
    cancelable?: boolean
    modifiable?: boolean
  }

  interface RoundSetting {
    // candidates?: number[]
    round_id?: number
    round_order?: number
    order?: number
    round_type?: number
  }
  interface StepParam {
    interview_id?: number
    candidate_resume_id?: number
    interview_template: number
    interview_type: number
    round_settings: RoundSetting[]
    target_job: number
  }
  interface SetUpResult {
    interview_id: number
    rounds: RoundSetting[]
  }

  interface CandidateResumeId {
    candidate_resume_id: number
  }
  interface DetailInfo {
    created_at: string;
    created_by: number;
    created_by_name: string;
    interview_id: number;
    interview_template: number;
    modified_at: string;
    modified_by: number;
    modified_by_name: string;
    rounds: InterviewInfo[];
    target_job: number;
    target_job_title: string;
    type: number;
    type_name: string;
    interview_mgmt_enable: boolean;
    candidate_resume_id: CandidateResumeId[]
  }

  interface CancelParam {
    interview_id: number
    round_id: number
    candidate_resume_id?: number
  }
}
export default ScheduleInterview
