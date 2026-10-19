import http from '@/api'
import InterviewProcess from '../interface/interviewProcess'
import { ResultCreate, SearchStatusInfo } from '../interface'

/**
 * @name Interview Process 模块
 */

// 获取 Interview Process 的列表
export const getInterviewProcessList = (params: SearchStatusInfo) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/interviewprocess/all', params)
}

// 创建 Interview Process
export const createInterviewProcess = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/interviewprocess/create', data)
}

// 修改 Interview Process
export const updateInterviewProcess = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/interviewprocess/update', data)
}

// 获取 Interview Process 的详情
export const getInterviewProcessDetail = (id: string | number) => {
  return http.get<InterviewProcess.DetailInfo>(`/api/interviewprocess/${encodeURIComponent(id)}`)
}

// 更新行状态为 inactive
export const changeRowStatusToInactive = (id: string, status: number) => {
  return http.post<boolean>(`/api/interviewprocess/deactivate/${encodeURIComponent(id)}/${status}`)
}

// 分享InterviewProcess模版
export const shareInterviewProcess = (data: InterviewProcess.ShareParam) => {
  return http.post<boolean>('/api/interviewprocess/share', data)
}
