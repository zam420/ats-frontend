import { UploadFiles } from 'element-plus'
import { ResultUploadInfo, UserTag } from '.'

declare namespace CV {
  interface Skills {
    skillName: string
  }
  interface Languages {
    languages: string
    level: number
  }
  interface CommonDate {
    date_from: string
    date_to: string
    up_to_now?: boolean
  }
  interface EducationHistories extends CommonDate {
    university: string
    school: string
    lab_name: string
    degree: string
    major: string
    performance_rank: number
  }
  interface WorkExperiences extends CommonDate {
    company_name: string
    title: string
    major_achievement: string
    work_years: number
  }
  interface ProjectExperiences extends CommonDate {
    project_name: string
    project_role: string
    project_desc: string
    major_achievement: string
  }
  interface Question {
    question: string
    answer: string
  }
  interface shareUser {
    id: number
    name: string
  }
  interface Notes {
    comment_id?: number
    candidate_resume_id: number
    commentator_id?: number
    commentator_name: string
    share_to: shareUser[]
    comment: string
    comment_at: string
    canOpt: boolean
    notiText: string
    initial: string
    isShowTooltip: boolean
  }
  interface CVInfo {
    id: number
    name: string
    gender: number
    birth_date: string
    age?: number
    phone_number: string
    email: string
    current_place: string
    native_place_province: string
    native_place_city: string
    employment_status: number
    recruitment_info_from: number
    expected_work_location: string
    expected_salary: number
    skills: Skills[]
    languages: Languages[]
    self_assessment: string
    original_resume: ResultUploadInfo[] | UploadFiles
    attachments: ResultUploadInfo[] | UploadFiles
    referral_code: string
    applying_position: number
    recruitment_source: number
    notes: Notes[]
    tags: UserTag[]
    attachment_links: string
    education_histories: EducationHistories[]
    work_experiences: WorkExperiences[]
    project_experiences: ProjectExperiences[]
    candidate_resume_id?: number
    data_status?: number
    extended_qa?: Question[]
    candidate_id: number | string
    duplication_checked_at: string
    interview?: any
    has_viewed?: boolean
  }
  interface PrivacyInterviewer {
    id: number
    name: string
    email: string
  }

  interface CVDetail extends CVInfo {
    gender_name: string
    applying_position_title: string
    bachelor_university: string
    employment_status_name: string
    duplications?: DuplicationInfo[]
    highest_degree: number
    highest_degree_name: string
    highest_major?: number
    highest_university: string
    recruitment_source_name: string
    status_name: string
    status: number
    applied_at?: string
    work_years?: number
    resume_count?: number
    placeOfBirth?: string
    has_access_to?: boolean
    has_access_to_itv_feedback?: boolean
    has_access_to_test_feedback?: boolean
    has_access_to_screening_feedback?: boolean
    interviewers?: PrivacyInterviewer[]
    privacy_notes?: string
    test_score?: number
    exam_result?: string
    exam?: any
    management_status?: number
  }
  interface CVExist {
    phone_number?: boolean
    email?: boolean
  }
  interface DuplicationInfo {
    candidate_id: number
    candidate_name: string
    deleted?: boolean
    resumes: ResumesInfo[]
  }
  interface ResumesInfo {
    resume_id: number
    job_position_id: number
    job_position_name: string
    applied_at: string
    match_rate: number
    full_match: boolean
    phone_number_match_rate: number
    email_match_rate: number
    candidate_name_match_rate: number
    university_name_match_rate: number
    university_from_match_rate: number
    university_to_match_rate: number
    company_name_match_rate: number
    company_from_match_rate: number
    company_to_match_rate: number
    checkData?: checkDataInfo[]
  }
  interface checkResumeDuplication {
    id: string | number
  }
  interface checkDataInfo {
    title: string
    matchRate: string
  }
  interface coverDuplicateResumesInfo {
    src_resume_id: string | number
    dst_candidate_id?: number
    dst_resume_ids?: number[]
  }
  interface ApplicationProgress {
    application_progress: ProgressData[]
    applied_at: string
    applying_position: number
    applying_position_title: string
    candidate_resume_id: number
    hr_recruiter_id: number
    hr_recruiter_name: string
    pooled_reason: string
    project_id: number
    project_name: string
    recruitment_source: number
    recruitment_source_name: string
    recruitment_type: number
    recruitment_type_name: string
    status: number
    status_name: string
  }
  interface ProgressData {
    time_from?: string
    node_type?: number
    isPending?: boolean
    date_time: string
    state?: number
    state_name: string
  }
  interface ForwardResumeParam {
    candidate_resume_ids: number[]
    receivers: number[]
    forward_notes: string
  }
  interface OnboardingParam {
    expect_onboarding_date: string
  }
  interface MoveToParam {
    candidate_resume_ids: number[]
    move_to_status: number
    additional_params?: OnboardingParam
  }
  interface StatusTotalResult {
    count: number
    status: number
    status_name: string
  }

  interface EmailInfo {
    resume_id: number
    email_subject?: string
    email_content: string
  }

  interface MoveTalentPoolInfo {
    pooled_reason: number
    comments?: string
    send_thanks_letter: boolean
    send_time?: string
    send_immediately?: boolean
    cc_list?: string[]
    resumes?: EmailInfo[]
  }

  interface EmailRecords {
    send_time: string
    status: number
    status_name: string
    creator_id: number
    creator_email: string
    creator_name: string
    to: string[]
    cc: string[]
    subject: string
    content: string
    is_html_mail: boolean
  }

  interface EmailRecord {
    to_candidate: EmailRecords[]
    to_employee: EmailRecords[]
  }

  interface OperateHistory {
    log: string
    operate_at: string
    operator_id: number
    operator_name: string
  }

  interface ContactCandidate {
    candidate_resume_id: number
    email_body: string
    email_subject: string
  }

  interface ContactCandidateParam {
    bcc_users: number[]
    candidate_mails: ContactCandidate[]
  }

  interface QuickNote {
    id: number
    notes: string
  }

  interface WorkLocation {
    value: number
    name: string
  }

  interface JobPosition {
    title: string
    id: number | string
    recruiter_id?: number
    recruiter_name?: string
    project_id?: number
    project_name?: string
    job_type?: number
    job_type_name?: string
    recruitment_type?: number
    recruitment_type_name?: string
    status?: number
    status_name?: string
    work_location?: WorkLocation[]
    resume_count?: number
  }

  interface TestPapper {
    begin_time: string
    end_time: string
    forever: boolean
    paper_id: number
    paper_name: string
  }

  interface TestScore {
    id: number
    paper_id: number
    paper_name: string
    status: number
    status_name: string
    test_date: string
    score: number
    paper_score: number
    cheat_status: number
    cheat_status_name: string
    result_url: string
    result_file: ResultUploadInfo
    created_at: string
    created_by_name: string
    test_url: string
  }

  interface WrittenTest {
    paper_id: number
    paper_name: string
    begin_time: string
    end_time: string
    email_subject: string
    email_resumes: EmailInfo[]
  }

  interface CommentParam {
    candidate_resume_id?: number
    candidate_resume_ids?: number[]
    comment?: string
    comment_id?: number
    share_to?: number[]
  }

  interface ShareTo {
    email: string
    id: number
    name: string
  }

  interface CommentResult {
    candidate_resume_id: number
    comment: string
    comment_at: string
    comment_id: number
    commentator_id: number
    commentator_name: string
    share_to: ShareTo[]
  }

  interface ForwardTestParam {
    resume_ids: number[]
    interviewers: number[]
  }

  interface HRFeedbackParam {
    resume_ids: number[]
    hr_feedback: number
  }

  interface TestFeedback {
    feedback_notes: string
    feedback_status: number
    feedback_time: string
    feedback_user_id: number
    feedback_user_name: string
    job_id?: number
    job_title?: string
  }

  interface ScreenFeedback {
    notes: string
    status: number
    status_name: string
    feedback_at: string
    feedback_user_id: number
    feedback_user_name: string
    job_id?: number
    job_title?: string
  }
}
export default CV
