import http from '@/api'
import Project from '../interface/project'
import { ResultCreate } from '../interface'

/**
 * @name Project 模块
 */

// 获取 Project 的列表
export const getProjectList = (params?: any) => {
  return http.get<Project.ProjectInfo[]>('api/project/listSummary', params)
}
// 创建 Project
export const createProject = () => {
  return http.post<ResultCreate>('api/project/create')
}
