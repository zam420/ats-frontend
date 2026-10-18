import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_PROJECT } from '../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Admin Module
const adminRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_PROJECT}`,
    name: ROUTER_PROJECT,
    component: () => import('@/views/admin/index.vue'),
    meta: {
      icon: 'admin',
      title: $t('menu.project'),
      index: 0,
      permissionCode: UserPermissionEnum.RPM,
      isHide: true
    }
  }
]
export default adminRouter
