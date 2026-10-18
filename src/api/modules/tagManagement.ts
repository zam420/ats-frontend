import http from '@/api'
import Tag from '../interface/tagManagement'
import { ResultCreate } from '../interface'

/**
 * @name Tag 模块
 */

// 获取 tag 的列表
export const getTagList = () => {
  return http.get<Tag.TagInfo[]>('api/common/tag/listAll')
}

// 创建tag
export const saveTag = (data: { tag_names: string[]}) => {
  return http.post<ResultCreate>('api/common/tag/save', data)
}

// delete Tag
export const deleteTag = (tag_ids: number[]) => {
  return http.post<boolean>(`api/common/tag/delete`, { tag_ids })
}
