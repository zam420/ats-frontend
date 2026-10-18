import { RouteRecordRaw } from 'vue-router'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_INTERVIEWER, ROUTER_INTERVIEWER_RESUME_REVIEW } from '../routerName'
import { UserPermissionEnum } from '@/enums/userPermission'
const { $t } = useLocale()

// * 导入所有router
const metaRouters = import.meta.glob('./interviewer/*.ts', { eager: true })
export let routerArray: RouteRecordRaw[] = []
for (const item of Object.values(metaRouters)) {
  for (const value of Object.values(item as RouteRecordRaw)) {
    routerArray.push(...value)
  }
}

routerArray = routerArray.sort((a: RouteRecordRaw, b: RouteRecordRaw) => {
  const aIndex = a?.meta?.index ?? -1
  const bIndex = b?.meta?.index ?? -1
  return aIndex < bIndex ? -1 : 1
})

// interviewer module
const interviewerRouter: Array<RouteRecordRaw> = [
  {
    path: `/${ROUTER_INTERVIEWER}`,
    name: ROUTER_INTERVIEWER,
    redirect: `/${ROUTER_INTERVIEWER_RESUME_REVIEW}`,
    meta: {
      icon: 'admin',
      title: $t('menu.interviewer'),
      permissionCode: UserPermissionEnum.IM,
      index: 4
    },
    children: [...routerArray]
  }
]

export default interviewerRouter
