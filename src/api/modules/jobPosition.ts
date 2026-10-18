import http from '@/api'
import JobPosition from '../interface/jobPosition'
import { ResultCreate } from '../interface'
import { ContentTypeEnum } from '@/enums/httpEnum'

/**
 * @name Job Position 模块
 */

// 获取 Job Position 的列表
export const getJobPositionList = (params?: any) => {
  return http.get<JobPosition.JobPositionDetail[]>('api/recruitment/listJobPositionSummary', params)
}
// 获取 Job Position 的列表-供cv使用
export const getJobPositionListForCv = () => {
  return http.get<JobPosition.JobPositionDetail[]>('api/recruitment/job/listAll')
}
// 创建 Job Position
export const createJobPosition = (data: JobPosition.JonPositionInfo) => {
  return http.post<ResultCreate>('api/recruitment/createJobPosition', data)
}

// 删除 Job Position
export const deleteJobPosition = (id: number) => {
  return http.post<JobPosition.JobPositionDetail>('api/recruitment/deleteJobPosition', { id })
}

// 修改 Job Position
export const editJobPosition = (data: JobPosition.JonPositionInfo) => {
  return http.post<ResultCreate>('api/recruitment/updateJobPosition', data)
}

// 获取 Job Position 的详情
export const getJobPositionDetail = (id: string | number) => {
  return http.get<JobPosition.JobPositionDetail>('api/recruitment/getJobPositionDetail', { id })
}

// 上传 Job Position
export const uploadJobPosition = (data: FormData) => {
  return http.post<JobPosition.JobPositionDetail>('api/recruitment/jobUpload', data, {
    headers: {
      'Content-Type': ContentTypeEnum.FORM_DATA
    }
  })
}
