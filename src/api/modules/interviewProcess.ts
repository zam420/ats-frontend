import http from '@/api'
import InterviewProcess from '../interface/interviewProcess'
import { ResultCreate } from '../interface'

/**
 * @name Interview Process 模块
 */

// 获取 Interview Process 的列表: owned / shared / system templates
export const getInterviewProcessList = (params: Record<string, any>) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/evaluationplan/all', params)
}

export const getOwnedInterviewProcessList = (params: Record<string, any>) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/evaluationplan/owned', params)
}

export const getSharedInterviewProcessList = (params: Record<string, any>) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/evaluationplan/shared', params)
}

export const getTemplateInterviewProcessList = (params: Record<string, any>) => {
  return http.get<InterviewProcess.ListInfo[]>('/api/evaluationplan/templates', params)
}

// 创建 Interview Process
export const createInterviewProcess = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/evaluationplan/create', data)
}

// 获取所有面试环节类型
export const getInterviewRoundTypes = () => {
  return http.get<InterviewProcess.RoundType[]>('/api/evaluationplan/roundtypes')
}

// 创建系统模板
export const createInterviewProcessTemplate = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/evaluationplan/templates/create', data)
}

// 另存为
export const saveAsInterviewProcess = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/evaluationplan/saveas', data)
}

// 修改系统模板
export const updateInterviewProcessTemplate = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/evaluationplan/templates/update', data)
}

// 修改 Interview Process
export const updateInterviewProcess = (data: InterviewProcess.SaveParam) => {
  return http.post<ResultCreate>('/api/evaluationplan/update', data)
}

// 获取 Interview Process 的详情
export const getInterviewProcessDetail = (id: string | number) => {
  return http.get<InterviewProcess.DetailInfo>(`/api/evaluationplan/${encodeURIComponent(id)}`)
}

// 删除 Interview Process
export const deleteInterviewProcess = (id: string) => {
  return http.post<boolean>(`/api/evaluationplan/deactivate/${encodeURIComponent(id)}`)
}

// 更新行状态为 inactive
export const changeRowStatusToInactive = (id: string, _status?: number) => {
  return deleteInterviewProcess(id)
}

// 分享InterviewProcess模版
export const shareInterviewProcess = (data: InterviewProcess.ShareParam) => {
  return http.post<boolean>('/api/evaluationplan/share', data)
}
