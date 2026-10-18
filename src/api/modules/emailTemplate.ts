import http from '@/api'
import EmailTemplate from '../interface/emailTemplate'
import { ResPage, ResultCreate, SearchStatusInfo } from '../interface'

/**
 * @name Email Template 模块
 */

// 获取 Email Template 的列表
export const getEmailTemplateList = (params: SearchStatusInfo) => {
  return http.get<ResPage<EmailTemplate.EmailInfo>>('/api/emailTemplate/list', params)
}

// 创建/修改 Email Template
export const saveEmailTemplate = (data: EmailTemplate.EmailInfo) => {
  return http.post<ResultCreate>('/api/emailTemplate/save', data)
}

// 获取 Email Template 的详情
export const getEmailTemplateDetail = (id: number) => {
  return http.get<EmailTemplate.DetailInfo>('/api/emailTemplate/getDetails', { id })
}

// 更新行状态为 inactive
export const changeRowStatusToInactive = (id: number, status: number) => {
  return http.post<boolean>(`/api/emailTemplate/changeStatus`, { id, status })
}

// 分享模版
export const shareEmailTemplate = (data: EmailTemplate.ShareParam) => {
  return http.post<boolean>('/api/emailTemplate/saveSharing', data)
}

// 根据job id获取email template列表数据
export const getEmailTemplateListByJob = (job_id: number | number[]) => {
  return http.get<EmailTemplate.EmailInfo[]>('/api/emailTemplate/listByJob', { job_id })
}
