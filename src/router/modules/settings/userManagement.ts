import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_SETTINGS_USER_MANAGEMENT } from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Settings -> User Management
const userManagementRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_USER_MANAGEMENT}`,
    name: 'ROUTER_SETTINGS_USER_MANAGEMENT',
    component: () => import('@/views/settings/userManagement/index.vue'),
    meta: {
      title: $t('menu.userManagement'),
      index: 3,
      permissionCode: UserPermissionEnum.UMM
    }
  }
]
export default userManagementRouter
