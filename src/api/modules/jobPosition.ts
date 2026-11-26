import http from '@/api'
import JobPosition from '../interface/jobPosition'
import { ResPage, ResultCreate } from '../interface'
import { ContentTypeEnum } from '@/enums/httpEnum'

/**
 * @name Job Position 模块
 */

// 获取 Job Position 的列表
export const getJobPositionList = (params?: any) => {
  return http.get<ResPage<JobPosition.JobPositionListItem>>('api/job/all', params)
}
// 获取 Job Position 的列表-供cv使用
export const getJobPositionListForCv = () => {
  return http.get<JobPosition.JobPositionDetail[]>('api/job/job/listAll')
}
// 获取 Job Position 表单下拉数据
export const getJobFieldsData = () => {
  return http.get<JobPosition.JobFieldsData>('api/job/filters')
}

// 创建 Job Position
export const createJobPosition = (data: JobPosition.JonPositionInfo) => {
  return http.post<ResultCreate>('api/job/create', data)
}

export const saveAsJobPosition = (data: JobPosition.JonPositionInfo) => {
  return http.post<ResultCreate>('api/job/saveas', data)
}

export const deactivateJobPosition = (id: string) => {
  return http.post<boolean>(`api/job/deactivate/${encodeURIComponent(id)}`)
}

// 修改 Job Position
export const editJobPosition = (data: JobPosition.JonPositionInfo) => {
  return http.post<ResultCreate>('api/job/update', data)
}

export const getEvaluationPlanImpact = (id: string | number, rounds: JobPosition.JonPositionInfo['evaluation_plan_rounds']) =>
  http.post<{ token: string; candidates: number; ignored_candidates: number }>('api/job/evaluation-impact', {
    id, evaluation_plan_rounds: rounds
  })

// 发布 Job Position
export const publishJobPosition = (id: string) => {
  return http.post<boolean>(`api/job/publish/${encodeURIComponent(id)}`)
}

export const closeJobPosition = (id: string) => {
  return http.post<boolean>(`api/job/close/${encodeURIComponent(id)}`)
}

// 获取 Job Position 的详情
export const getJobPositionDetail = (id: string | number) => {
  return http.get<JobPosition.JobPositionDetail>(`api/job/${encodeURIComponent(id)}`, undefined, {
    preserveHtml: true
  })
}

// 上传 Job Position
export const uploadJobPosition = (data: FormData) => {
  return http.post<JobPosition.JobPositionDetail>('api/job/jobUpload', data, {
    headers: {
      'Content-Type': ContentTypeEnum.FORM_DATA
    }
  })
}
