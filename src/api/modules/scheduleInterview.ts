import http from '@/api'
import ScheduleInterview from '../interface/scheduleInterview'

/**
 * @name Schedule Interview 模块
 */

// Send Schedule Interview
export const sendScheduleInterview = (data: ScheduleInterview.InterviewInfo) => {
  return http.post<boolean>('/api/interview/submit', data)
}

// save Schedule Interview
export const saveScheduleInterview = (data: ScheduleInterview.InterviewInfo) => {
  return http.post<boolean>('/api/interview/save', data)
}

// change Schedule Interview step
export const changeScheduleInterviewStep = (data: ScheduleInterview.StepParam) => {
  return http.post<ScheduleInterview.SetUpResult>('/api/interview/setup', data)
}

// 获取schedule interview详情
export const getScheduleInterviewDetail = (id: number) => {
  return http.get<ScheduleInterview.DetailInfo>('/api/interview/detail', { id })
}

// 取消面试
export const cancelSchedule = (data: ScheduleInterview.CancelParam) => {
  return http.post<boolean>('/api/interview/cancel', data)
}

// 获取群面新增的面试者下拉数据
export const getGroupCandidates = (job_position_id: number) => {
  return http.get<ScheduleInterview.Candidate[]>('/api/recruitment/listForInterview', { job_position_id })
}

// 批量预约面试
export const submitInterviewInBulk = (data: ScheduleInterview.InterviewInfo) => {
  return http.post<ScheduleInterview.SetUpResult>('/api/interview/submitInBulk', data)
}

//  预约面试时获取员工的一些信息
export const getCandidatesData = (candidate_resume_ids: number[]) => {
  return http.post<ScheduleInterview.Candidate[]>('/api/recruitment/listCandidateResume', { candidate_resume_ids })
}