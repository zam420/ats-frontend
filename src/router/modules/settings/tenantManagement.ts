import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_SETTINGS_TENANT_MANAGEMENT } from '../../routerName'
import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

const tenantManagementRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_TENANT_MANAGEMENT}`,
    name: 'ROUTER_SETTINGS_TENANT_MANAGEMENT',
    component: () => import('@/views/settings/tenantManagement/index.vue'),
    meta: {
      title: $t('menu.tenantManagement'),
      index: 4,
      permissionCode: UserPermissionEnum.CLNM
    }
  }
]

export default tenantManagementRouter
