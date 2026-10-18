import http from '@/api'
import { TableHeadersParam, TableHeaders, ResultEnumInfo, ButtonConfig } from '../interface'
import { ContentTypeEnum } from '@/enums/httpEnum'
import User from '../interface/user'

// * 设置自定义表头
export const setTableHeader = (param: TableHeadersParam) => {
  return http.post<boolean>('/api/common/saveTableConfig', param)
}

// * 获取自定义表头
export const getTableHeader = (table: string) => {
  return http.get<TableHeaders[]>('/api/common/getTableConfig', { table })
}

// 获取 Recruitment Type
export const getRecruitmentTypeList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listRecruitmentType')
}

// 获取 Employment Type
export const getEmploymentTypeList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listEmploymentType')
}

// 获取 Job Type
export const getJobTypeList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listJobType')
}

// 获取 Work Location
export const getWorkLocationList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listWorkLocation')
}

// 获取 Resume Inbox
export const getResumeInboxList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listResumeInbox')
}

// 获取 Channel Type
export const getChannelTypeList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listChannelType')
}

// 获取 Gender
export const getGenderList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listGender')
}

// 获取 Employment Status
export const getEmploymentStatusList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listEmploymentStatus')
}

// 获取 Degree
export const getDegreeList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listDegree')
}

// 获取 Performance Rank
export const getPerformanceRankList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listPerformanceRank')
}

// 获取 Resume Source
export const getResumeSourceList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listResumeSource')
}

// 获取 Recruitment Info Channel
export const getRecruitmentInfoChannelList = () => {
  return http.get<ResultEnumInfo[]>('/api/enum/listRecruitmentInfoChannel')
}
// 下载文件
export const downloadFile = (uid: number) => {
  return http.getFile<any>(
    '/api/common/downloadFile',
    { uid },
    {
      responseType: 'blob',
      headers: {
        Accept: ContentTypeEnum.OCTET_STEAM
      }
    }
  )
}

// 获取用户列表, 只获取 active 用户
export const getUserList = (type: number) => {
  return http.get<User.UserInfo[]>('/api/user/getUserFor', { for: type })
}

// userManagement --> 获取用户列表
export const getUserManagementList = () => {
  return http.get<User.UserInfo[]>('/api/user/listUser', { type: 0 })
}

// clearall notification
export const clearAllNotification = () => {
  return http.post<boolean>('/api/user/removeAllNotifications')
}

// delete one notification
export const deleteNotification = (id: number) => {
  return http.post<boolean>('/api/user/removeNotification', { id })
}

// 保存button配置
export const saveTableButtonConfig = (param: ButtonConfig) => {
  return http.post<boolean>('/api/common/saveTableButtonConfig', param)
}

// 获取button配置
export const getTableButtonConfig = (table: string, state: string) => {
  return http.get<ButtonConfig>('/api/common/getTableButtonConfig', { table, state })
}