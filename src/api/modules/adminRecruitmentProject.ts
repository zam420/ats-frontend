import http from '@/api'
import AdminRecruitmentProject from '../interface/adminRecruitmentProject'
import { ResultCreate } from '../interface'

/**
 * @name Job Position 模块
 */

// 获取 Admin Recruitment Project 的列表
export const getAdminRecruitmentProjectList = () => {
  return http.get<AdminRecruitmentProject.AdminRecruitmentProjectInfo[]>(
    'api/project/list'
  )
}

// 创建 Admin Recruitment Project
export const createAdminRecruitmentProject = (
  data: AdminRecruitmentProject.AdminRecruitmentProjectInfo
) => {
  return http.post<ResultCreate>('api/project/save', data)
}

export const getInterviewProcessTemplates = (data: { work_location: number[] | number }) => {
  return http.get<AdminRecruitmentProject.InterviewProcessTemplates[]>(
    '/api/interviewprocess/listBy',
    data
  )
}

// 获取 Admin Recruitment Project 的详情
export const getJobPositionDetail = () => {
  return http.get<AdminRecruitmentProject.AdminRecruitmentProjectInfo>(
    'api/recruitment/getJobPositionDetail'
  )
}

// 更新行状态为 inactive
export const changeRowStatusToInactive = (data: AdminRecruitmentProject.ProjectInactive) => {
  return http.post<Record<string, any>[]>('api/project/deactivate', data)
}
