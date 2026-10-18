import http from '@/api'
import talentPool from '../interface/talentPool'
import { SearchInfo } from '../interface'

/**
 * @name Job Position 模块
 */

// 获取 Job Position 的列表
export const getTalentPoolList = (params: SearchInfo) => {
  return http.get<talentPool.TalentPoolInfo[]>('api/talentPool/list', params)
}

// 获取 CV 的详情
export const getTalentPoolDetail = (id: string | number) => {
  return http.get<talentPool.TalentPoolDetail>('/api/talentPool/getTalentDetails', { id })
}

// resetTalent
export const resetTalent = (ids: number[]) => {
  return http.post<boolean>('/api/talentPool/resetTalent', { ids })
}
