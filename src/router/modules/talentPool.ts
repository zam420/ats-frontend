import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_TALENT_POOL, ROUTER_TALENT_POOL_DETAIL } from '../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Talent Pool Module
const talentPoolRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_TALENT_POOL}`,
    name: ROUTER_TALENT_POOL,
    component: () => import('@/views/talentPool/index.vue'),
    meta: {
      icon: 'user',
      title: $t('menu.talentPool'),
      index: 3,
      permissionCode: UserPermissionEnum.TPM
    }
  },
  {
    path: `/${ROUTER_TALENT_POOL_DETAIL}/:id`,
    name: ROUTER_TALENT_POOL_DETAIL,
    component: () => import('@/views/talentPool/TalentPoolDetail.vue'),
    meta: {
      icon: 'user',
      title: $t('talentPool.talentPoolDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_TALENT_POOL}`,
      permissionCode: UserPermissionEnum.TPS
    }
  }
]
export default talentPoolRouter
