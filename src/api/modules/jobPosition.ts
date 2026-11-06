import http from '@/api'
import JobPosition from '../interface/jobPosition'
import { ResultCreate } from '../interface'
import { ContentTypeEnum } from '@/enums/httpEnum'

/**
 * @name Job Position 模块
 */

// 获取 Job Position 的列表
export const getJobPositionList = (params?: any) => {
  return http.get<JobPosition.JobPositionDetail[]>('api/job/all', params)
}
// 获取 Job Position 的列表-供cv使用
export const getJobPositionListForCv = () => {
  return http.get<JobPosition.JobPositionDetail[]>('api/job/job/listAll')
}
// 获取 Job Position 表单下拉数据
export const getJobFieldsData = () => {
  return http.get<JobPosition.JobFieldsData>('api/job/jobFieldsData')
}

// 创建 Job Position
export const createJobPosition = (data: JobPosition.JonPositionInfo) => {
  return http.post<ResultCreate>('api/job/create', data)
}

// 删除 Job Position
export const deleteJobPosition = (id: number) => {
  return http.post<JobPosition.JobPositionDetail>('api/job/deleteJobPosition', { id })
}

// 修改 Job Position
export const editJobPosition = (data: JobPosition.JonPositionInfo) => {
  return http.post<ResultCreate>('api/job/update', data)
}

// 发布 Job Position
export const publishJobPosition = (data: { id: string | number; status: number }) => {
  return http.post<boolean>('api/job/publish', data)
}

// 获取 Job Position 的详情
export const getJobPositionDetail = (id: string | number) => {
  return http.get<JobPosition.JobPositionDetail>(`api/job/${encodeURIComponent(id)}`)
}

// 上传 Job Position
export const uploadJobPosition = (data: FormData) => {
  return http.post<JobPosition.JobPositionDetail>('api/job/jobUpload', data, {
    headers: {
      'Content-Type': ContentTypeEnum.FORM_DATA
    }
  })
}
