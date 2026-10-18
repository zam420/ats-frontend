import { ResultUpload } from '@/api/interface'
import CV from '@/api/interface/cv'

export type AssemblySizeType = 'large' | 'default' | 'small'

export type LanguageType = 'zh' | 'en'

/* GlobalStore */
export interface GlobalState {
  accessToken: string
  refreshToken: string
  email: string
  activationRequired: boolean
  loginFailedNum: number
  userInfo: any
  assemblySize: AssemblySizeType
  permissions: string[]
  roles: string[]
  defaultUrl: string
  language: LanguageType
  isCollapse: boolean
  breadcrumb: boolean
  breadcrumbIcon: boolean
  tabs: boolean
  tabsIcon: boolean
  footer: boolean
  isNotExistUser: boolean
  isRefresh: 'sm' | 'lg'
}

/* UserState */
export interface UserState {
  token: string
  userInfo: { name: string }
}

/* MenuStore */
export interface MenuState {
  isCollapse: boolean
  menuList: Menu.MenuOptions[]
}

/* tabsMenuProps */
export interface TabsMenuProps {
  icon: string
  title: string
  path: string
  name: string
  close: boolean
}

/* TabsState */
export interface TabsState {
  tabsMenuList: TabsMenuProps[]
}

/* KeepAliveState */
export interface KeepAliveState {
  keepAliveName: string[]
}

/* CVState */
export interface CVState extends ResultUpload {
  applying_position?: number
  recruitment_source?: number
  curOption?: Form.FormSelect
  searchParam?: Record<string, any>
  pdf_details?: CV.CVDetail
  selectedCandidate?: Form.FormSelect[]
}

/* InterviewState */
export interface InterviewState {
  interviewMode: string
  interviewTime: string
  interviewers: string
  interviewType: number
  interviewRoundId: number
  candidateResumeId: number
  readOnly: boolean
  isIndiaPosition: boolean
  candidateName: string
}

/* CVFilterState */
export interface CVFilterState {
  selectTab?: string | number
  page?: number
  pageSize?: number
  filterParam?: Record<string, any>
}