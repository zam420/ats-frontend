import { getInterviewProcessDetail } from '@/api/modules/evaluationPlan'
import { getRecruitmentPipelineDetail } from '@/api/modules/recruitmentPipeline'
import { getJobPositionDetail } from '@/api/modules/jobPosition'
import { getScreeningForm } from '@/api/modules/screeningQuestionsForm'
import { UserPermissionEnum } from '@/enums/userPermission'
import { useGlobalStore } from '@/store/modules/global'
import { ROUTER_404 } from './routerName'
import type { RouteLocationNormalized } from 'vue-router'
import type { ScreeningFormDetail } from '@/api/interface/screeningQuestionsForm'
import type RecruitmentPipeline from '@/api/interface/recruitmentPipeline'
import type InterviewProcess from '@/api/interface/evaluationPlan'

declare module 'vue-router' {
  interface RouteMeta {
    screeningFormDetails?: { id: string; detail: ScreeningFormDetail }
    recruitmentPipelineDetails?: { id: string; detail: RecruitmentPipeline.DetailInfo }
    evaluationPlanDetails?: { id: string; detail: InterviewProcess.DetailInfo }
  }
}

const editRoutes = new Map([
  ['ROUTER_SETTINGS_EVALUATION_PLAN_EDIT', {
    permission: UserPermissionEnum.IPTA,
    load: getInterviewProcessDetail
  }],
  ['ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT', {
    permission: UserPermissionEnum.RPTA,
    load: getRecruitmentPipelineDetail
  }],
  ['ROUTER_JOB_POSITION_EDIT', {
    permission: UserPermissionEnum.JPA,
    load: getJobPositionDetail
  }],
  ['ROUTER_SETTINGS_SCREENING_FORMS_EDIT', {
    permission: UserPermissionEnum.SQTA,
    load: getScreeningForm
  }]
])

export async function checkEditAccess(to: RouteLocationNormalized) {
  const access = typeof to.name === 'string' ? editRoutes.get(to.name) : undefined
  if (!access) return true
  const { permission, load } = access
  const id = to.params.id
  if (typeof id !== 'string' || !id.trim()) return `/${ROUTER_404}`

  const pipelineResponse = to.name === 'ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT'
    ? await getRecruitmentPipelineDetail(id) : undefined
  const evaluationResponse = to.name === 'ROUTER_SETTINGS_EVALUATION_PLAN_EDIT'
    ? await getInterviewProcessDetail(id) : undefined
  const response = to.name === 'ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT'
    ? pipelineResponse
    : to.name === 'ROUTER_SETTINGS_EVALUATION_PLAN_EDIT' ? evaluationResponse : await load(id)
  if (!response?.result) throw new Error(`Missing details for ${String(to.name)}: ${id}`)

  const globalStore = useGlobalStore()
  const userId = globalStore.userInfo?.id
  const ownerId = response.result.owner_id
  const isOwner = typeof userId === 'string' && userId.length > 0 && userId === ownerId
  const isScreeningSystemAdmin = to.name === 'ROUTER_SETTINGS_SCREENING_FORMS_EDIT'
    && 'is_system_template' in response.result && response.result.is_system_template
    && globalStore.permissions.includes(UserPermissionEnum.SQTSA)
  if (!isOwner && !isScreeningSystemAdmin && !globalStore.permissions.includes(permission)) {
    return `/${ROUTER_404}`
  }
  if (to.name === 'ROUTER_SETTINGS_SCREENING_FORMS_EDIT' && 'questions' in response.result) {
    to.meta.screeningFormDetails = { id, detail: response.result }
  }
  if (pipelineResponse?.result) {
    to.meta.recruitmentPipelineDetails = { id, detail: pipelineResponse.result }
  }
  if (evaluationResponse?.result) {
    to.meta.evaluationPlanDetails = { id, detail: evaluationResponse.result }
  }
  return true
}
