import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_SETTINGS_TAG_MANAGEMENT } from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Settings -> Tag Management
const tagManagementRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_TAG_MANAGEMENT}`,
    name: 'ROUTER_SETTINGS_TAG_MANAGEMENT',
    component: () => import('@/views/settings/tagManagement/index.vue'),
    meta: {
      title: $t('menu.tagManagement'),
      index: 4,
      permissionCode: UserPermissionEnum.TMM
    }
  }
]
export default tagManagementRouter
