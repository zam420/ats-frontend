import http from '@/api'
import AdminRecruitmentProject from '../interface/adminRecruitmentProject'
import { ResultCreate } from '../interface'

/**
 * @name Job Position 模块
 */

// 获取 Admin Recruitment Project 的列表
export const getAdminRecruitmentProjectList = (params?: Record<string, any>) => {
  return http.get<AdminRecruitmentProject.AdminRecruitmentProjectInfo[]>(
    'api/project/list',
    params
  )
}

// 创建 Admin Recruitment Project
export const createAdminRecruitmentProject = (
  data: AdminRecruitmentProject.AdminRecruitmentProjectInfo
) => {
  return http.post<ResultCreate>('api/project/create', data)
}

// 更新 Admin Recruitment Project
export const updateAdminRecruitmentProject = (
  data: AdminRecruitmentProject.AdminRecruitmentProjectInfo
) => {
  return http.post<ResultCreate>('api/project/update', data)
}

export const getInterviewProcessTemplates = (data: { work_location: number[] | number }) => {
  return http.get<AdminRecruitmentProject.InterviewProcessTemplates[]>(
    '/api/interviewplan/listBy',
    data
  )
}

// 获取 Admin Recruitment Project 的详情
export const getJobPositionDetail = () => {
  return http.get<AdminRecruitmentProject.AdminRecruitmentProjectInfo>(
    'api/recruitment/getJobPositionDetail'
  )
}

export const changeRowStatusToInactive = (id: string, status: number) => {
  return http.post<boolean>(`/api/project/deactivate/${encodeURIComponent(id)}/${status}`)
}

