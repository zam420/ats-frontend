import http from '@/api'
import { ResultCreate, ResultData } from '../interface'
import MyInterview from '../interface/myInterview'

/**
 * @name My Interviewer 模块
 */

// 获取 My Interview 的列表
export const getMyInterviewList = (data: MyInterview.SearchParam) => {
  return http.get<MyInterview.InterviewInfo[]>('/api/interview/forMe', data)
}

// submit Interview feedback
export const submitInterviewFeedback = (data: MyInterview.DetailInfo) => {
  return http.post<MyInterview.FeedbackResult>('/api/interview/feedback/submit', data)
}

// 获取my interview详情
export const getMyInterviewDetail = (id: number) => {
  return http.get<MyInterview.DetailInfo>('/api/interview/feedback/detail', { id })
}
