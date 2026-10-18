import { UploadFiles } from 'element-plus'
import { ResultUploadInfo, UserTag } from '.'

declare namespace TalentPool {
  interface TalentPoolInfo {
    id: number
    candidate_name: string
    bachelor_university: string
    highest_university: string
    highest_degree: number
    highest_degree_name: string
    highest_major: string
    latest_company_name: string
    job_position_name: string
    pooled_reason: string
    pooled_at: string
  }
  interface educationBackground {
    title: string
    date: string
    content: string[]
  }
  interface workExperienceData {
    companyName?: string
    date: string
    jobTitle: string
    major: string
    projectDes?: string
    projectName?: string
  }
  interface TalentPoolDetail {
    id: number
    name: string
    gender: number
    applying_position_title: string
    applied_at: string
    age: number
    highest_degree_name: string
    expected_work_location: string
    work_years: number
    email: string
    phone_number: string
    birth_date: string
    native_place_province: string
    native_place_city: string
    last_company_name: string
    status: number
    expected_salary: string
    recruitment_info_from: number
    education_histories: EducationBG[]
    work_experiences: WorkExoerience[]
    project_experiences: ProjectExperience[]
    skills: Skills[]
    languages: Languages[]
    self_assessment: string
    recruitment_source: number
    referral_code: string
    notes: string
    tags: string[]
    pooled_reason: number
    pooled_at: string
    original_resume: OriginalResume[]
  }
  interface OriginalResume {
    file_name: string
    uid: number
  }
  interface ProjectExperience {
    id: number
    date_from: string
    date_to: string
    major_achievement: string
    project_desc: string
    project_name: string
    project_role: string
  }
  interface WorkExoerience {
    id: number
    company_name: string
    date_from: string
    date_to: string
    major_achievement: string
    title: string
    work_years: number
  }
  interface EducationBG {
    id: number
    date_from: string
    date_to: string
    degree: number
    degree_name: string
    lab_name: string
    major: string
    performance_rank: string
    performance_rank_name: string
    school: string
    university: string
  }
  interface Skills {
    skillName: string
  }
  interface Languages {
    languages: string
    level: number
  }
  // new
  interface CommonDate {
    date_from: string
    date_to: string
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
    notes: string
    tags: UserTag[]
    attachment_links: string
    education_histories: EducationHistories[]
    work_experiences: WorkExperiences[]
    project_experiences: ProjectExperiences[]
    pooled_reason: number
    pooled_at: string
    extended_qa?: Question[]
  }
  interface Question {
    question: string
    answer: string
  }
  interface CVDetail extends CVInfo {
    gender_name: string
    applying_position_title: string
    bachelor_university: string
    employment_status_name: string
    highest_degree: number
    highest_degree_name: string
    highest_major?: number
    highest_university: string
    recruitment_source_name: string
    status_name: string
    status: number
    applied_at?: string
    work_years?: number
    comments?: string
    resume_count?: number
    resume_id?: number
  }
}
export default TalentPool
