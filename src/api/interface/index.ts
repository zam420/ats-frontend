import CV from './cv'

// * 请求响应参数（不包含data）
export interface Result {
  success?: boolean
  code: number
  message?: string
}
// 请求响应参数（包含data）
export interface ResultData<T = any> extends Result {
  data?: T
  result?: T
}

// 分页响应参数
export interface ResPage<T> {
  data_list: T[]
  current_size: number
  total_page: number
  total_count: number
}

// 分页请求参数
export interface ReqPage {
  page_num: number
  page_size: number
}

// 自定义表头数据格式
export interface TableHeaders {
  display?: boolean
  field?: string
  sort: number
}
// 自定义表头数据传参格式
export interface TableHeadersParam {
  fields: TableHeaders[]
  table: string
}

// 分页格式
export interface SortColumn {
  order_by: string
  order: number
}

export interface SearchInfo {
  page_size: number
  page_num: number
}

export interface SearchStatusInfo extends SearchInfo {
  status: number
}

export interface userManagementInfo {
  type: number
}

// 创建返回
export interface ResultCreate {
  id: number
}

export interface ResultUploadInfo {
  uid: number
  file_name: string
}

// 上传返回
export interface ResultUpload {
  attachments?: ResultUploadInfo[]
  original_resume: ResultUploadInfo[]
  pdf_details?: CV.CVDetail
}

// 返回枚举
export interface ResultEnumInfo {
  value: number
  name: string
}

export interface UserTag {
  resume_tag_id: number
  resume_id: number
  tag_id: number
  tag_name: string
  match_type: number
  match_type_name: string
  match_count: number
}

export interface DetailUserInfo {
  name: string
  gender?: number
  applying_position_title?: string
  applied_at?: string
  pooled_at?: string
  status_comment?: string
  status_type?: string
  status?: string
  resume_count?: number
  tags?: UserTag[]
  list: any[]
}

export interface SearchOption {
  index: number
  options: any
  enum?: Record<string, CommonEnum.enumItem>
}

export interface Button {
  button_id: string
  sort: number
}
export interface ButtonConfig {
  table: string
	state: string | number
	buttons: Button[]
}