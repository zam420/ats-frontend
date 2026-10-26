import http from '@/api'
import InterviewProcess from '../interface/interviewProcess'
import { ResultCreate } from '../interface'

/**
 * @name Interview Process 模块
 */

// 获取 Interview Process 的列表: owned / shared / system templates
export const getInterviewProcessList = (params: Record<string, any>) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/interviewplan/all', params)
}

export const getSharedInterviewProcessList = (params: Record<string, any>) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/interviewplan/shared', params)
}

export const getTemplateInterviewProcessList = (params: Record<string, any>) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/interviewplan/templates', params)
}

// 创建 Interview Process
export const createInterviewProcess = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/interviewplan/create', data)
}

// 修改 Interview Process
export const updateInterviewProcess = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/interviewplan/update', data)
}

// 获取 Interview Process 的详情
export const getInterviewProcessDetail = (id: string | number) => {
  return http.get<InterviewProcess.DetailInfo>(`/api/interviewplan/${encodeURIComponent(id)}`)
}

// 删除 Interview Process
export const deleteInterviewProcess = (id: string) => {
  return http.post<boolean>(`/api/interviewplan/deactivate/${encodeURIComponent(id)}`)
}

// 更新行状态为 inactive
export const changeRowStatusToInactive = (id: string, _status?: number) => {
  return deleteInterviewProcess(id)
}

// 分享InterviewProcess模版
export const shareInterviewProcess = (data: InterviewProcess.ShareParam) => {
  return http.post<boolean>('/api/interviewplan/share', data)
}
