import { RouteRecordRaw } from 'vue-router'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_SETTINGS_EVALUATION_PLAN, ROUTER_SETTINGS } from '../routerName'
import { UserPermissionEnum } from '@/enums/userPermission'
const { $t } = useLocale()

// * 导入所有router
const metaRouters = import.meta.glob('./settings/*.ts', { eager: true })
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

// Settings
const settingsRouter: Array<RouteRecordRaw> = [
  {
    path: `/${ROUTER_SETTINGS}`,
    name: ROUTER_SETTINGS,
    redirect: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`,
    meta: {
      icon: 'settings',
      title: $t('menu.settings'),
      permissionCode: UserPermissionEnum.STM,
      index: 5
    },
    children: [...routerArray]
  }
]

export default settingsRouter
