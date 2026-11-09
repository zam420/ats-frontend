import { getInterviewProcessDetail } from '@/api/modules/evaluationPlan'
import { getRecruitmentPipelineDetail } from '@/api/modules/recruitmentPipeline'
import { getJobPositionDetail } from '@/api/modules/jobPosition'
import { UserPermissionEnum } from '@/enums/userPermission'
import { useGlobalStore } from '@/store/modules/global'
import { ROUTER_404 } from './routerName'
import type { RouteLocationNormalized } from 'vue-router'

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
  }]
])

export async function checkEditAccess(to: RouteLocationNormalized) {
  const access = typeof to.name === 'string' ? editRoutes.get(to.name) : undefined
  if (!access) return true
  const { permission, load } = access
  const id = to.params.id
  if (typeof id !== 'string' || !id.trim()) return `/${ROUTER_404}`

  const response = await load(id)
  if (!response?.result) throw new Error(`Missing details for ${String(to.name)}: ${id}`)

  const globalStore = useGlobalStore()
  const userId = globalStore.userInfo?.id
  const ownerId = response.result.owner_id
  const isOwner = typeof userId === 'string' && userId.length > 0 && userId === ownerId
  return isOwner || globalStore.permissions.includes(permission) ? true : `/${ROUTER_404}`
}
