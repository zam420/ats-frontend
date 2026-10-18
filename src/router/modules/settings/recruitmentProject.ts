import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_SETTINGS_RECRUITMENT_PROJECT } from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Settings -> Recruitment Project module
const recruitmentProjectRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_RECRUITMENT_PROJECT}`,
    name: 'ROUTER_SETTINGS_RECRUITMENT_PROJECT',
    component: () => import('@/views/settings/recruitmentProject/index.vue'),
    meta: {
      title: $t('menu.recruitmentProject'),
      index: 0,
      permissionCode: UserPermissionEnum.RPM
    }
  }
]
export default recruitmentProjectRouter
