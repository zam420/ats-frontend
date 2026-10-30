import http from '@/api'
import RecruitmentPipeline from '../interface/recruitmentPipeline'
import { ResultCreate } from '../interface'

/**
 * @name Recruitment Pipeline 模块
 */

// 获取 Recruitment Pipeline 的列表: all / owned / shared / system templates
export const getRecruitmentPipelineList = (params: Record<string, any>) => {
  return http.get<RecruitmentPipeline.ListInfo[]>('/api/recruitmentpipeline/all', params)
}

export const getOwnedRecruitmentPipelineList = (params: Record<string, any>) => {
  return http.get<RecruitmentPipeline.ListInfo[]>('/api/recruitmentpipeline/owned', params)
}

export const getSharedRecruitmentPipelineList = (params: Record<string, any>) => {
  return http.get<RecruitmentPipeline.ListInfo[]>('/api/recruitmentpipeline/shared', params)
}

export const getTemplateRecruitmentPipelineList = (params: Record<string, any>) => {
  return http.get<RecruitmentPipeline.ListInfo[]>('/api/recruitmentpipeline/templates', params)
}

// 创建 Recruitment Pipeline
export const createRecruitmentPipeline = (data: RecruitmentPipeline.SaveParam) => {
  return http.post<ResultCreate>('/api/recruitmentpipeline/create', data)
}

// 获取所有 round 类型
export const getRecruitmentPipelineRoundTypes = () => {
  return http.get<RecruitmentPipeline.RoundType[]>('/api/recruitmentpipeline/roundtypes')
}

// 创建系统模板
export const createRecruitmentPipelineTemplate = (data: RecruitmentPipeline.SaveParam) => {
  return http.post<ResultCreate>('/api/recruitmentpipeline/templates/create', data)
}

// 另存为
export const saveAsRecruitmentPipeline = (data: RecruitmentPipeline.SaveParam) => {
  return http.post<ResultCreate>('/api/recruitmentpipeline/saveas', data)
}

// 修改系统模板
export const updateRecruitmentPipelineTemplate = (data: RecruitmentPipeline.SaveParam) => {
  return http.post<ResultCreate>('/api/recruitmentpipeline/templates/update', data)
}

// 修改 Recruitment Pipeline
export const updateRecruitmentPipeline = (data: RecruitmentPipeline.SaveParam) => {
  return http.post<ResultCreate>('/api/recruitmentpipeline/update', data)
}

// 获取 Recruitment Pipeline 的详情
export const getRecruitmentPipelineDetail = (id: string | number) => {
  return http.get<RecruitmentPipeline.DetailInfo>(
    `/api/recruitmentpipeline/${encodeURIComponent(id)}`
  )
}

// 删除 Recruitment Pipeline
export const deleteRecruitmentPipeline = (id: string) => {
  return http.post<boolean>(`/api/recruitmentpipeline/deactivate/${encodeURIComponent(id)}`)
}
