import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_HIRING_PROJECT } from '../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Recruitment Project module (top-level sidebar item)
const recruitmentProjectRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_HIRING_PROJECT}`,
    name: 'ROUTER_HIRING_PROJECT',
    component: () => import('@/views/settings/recruitmentProject/index.vue'),
    meta: {
      icon: 'recruitment',
      title: $t('menu.recruitmentProject'),
      index: 1,
      permissionCode: UserPermissionEnum.RPM
    }
  }
]
export default recruitmentProjectRouter
