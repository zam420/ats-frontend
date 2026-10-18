import http from '@/api'
import InterviewProcess from '../interface/interviewProcess'
import { ResultCreate, SearchStatusInfo } from '../interface'

/**
 * @name Interview Process 模块
 */

// 获取 Interview Process 的列表
export const getInterviewProcessList = (params: SearchStatusInfo) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/interview/processTemp/page', params)
}

// 创建/修改 Interview Process
export const saveInterviewProcess = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/interview/processTemp/save', data)
}

// 获取 Interview Process 的详情
export const getInterviewProcessDetail = (id: number) => {
  return http.get<InterviewProcess.DetailInfo>('/api/interview/processTemp/detail', { id })
}

// 更新行状态为 inactive
export const changeRowStatusToInactive = (id: number, status: number) => {
  return http.post<boolean>(`/api/interview/processTemp/toggleStatus`, { ipt_id: id, status })
}

// 分享InterviewProcess模版
export const shareInterviewProcess = (data: InterviewProcess.ShareParam) => {
  return http.post<boolean>('/api/interview/processTemp/share', data)
}
