import http from '@/api'
import User from '../interface/user'

/**
 * @name 用户模块
 */

// 获取用户信息
export const getUserInfoApi = () => {
  return http.get<User.UserInfo[]>('api/user/getUserInfo')
}

// 通过 role code 获取 用户列表
export const getUserListByRole = (data: { role: string }) => {
  return http.get<User.UserInfo[]>('/api/user/listUserByRole', data)
}

// 获取内部员工用户列表
export const getInnerUserList = () => {
  return http.get<User.EmailUser[]>('/api/user/listInnerUser')
}

// Change user status
export const changeUserStatus = (data: User.UserInactive) => {
  return http.post<boolean>('/api/user/changeUserStatus', data)
}

export const createUserManagement = (data: User.UserInfo) => {
  return http.post<boolean>('/api/user/saveUser', data)
}

// 获取用户配置的筛选
export const getUserSettings = (type: number) => {
  return http.get<User.UserSetting>('/api/user/getUserSettings', { type })
}

// 保存用户配置的筛选
export const saveUserSettings = (data: User.UserSetting) => {
  return http.post<boolean>('/api/user/saveUserSettings', data)
}