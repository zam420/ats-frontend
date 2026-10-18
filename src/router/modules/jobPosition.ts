import { useLocale } from '@/hooks/useLocale'
import {
  ROUTER_JOB_POSITION,
  ROUTER_JOB_POSITION_CREATE,
  ROUTER_JOB_POSITION_DETAIL,
  ROUTER_JOB_POSITION_EDIT
} from '../routerName'
import { UserPermissionEnum } from '@/enums/userPermission'

const { $t } = useLocale()

// Home Module
const jobPositionRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_JOB_POSITION}`,
    name: ROUTER_JOB_POSITION,
    component: () => import('@/views/jobPosition/index.vue'),
    meta: {
      icon: 'job',
      title: $t('menu.jobPosition'),
      index: 0,
      permissionCode: UserPermissionEnum.JPM
    }
  },
  {
    path: `/${ROUTER_JOB_POSITION_CREATE}`,
    name: 'ROUTER_JOB_POSITION_CREATE',
    component: () => import('@/views/jobPosition/JobPositionCreate.vue'),
    meta: {
      icon: '',
      title: $t('jobPosition.createJobPosition'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: UserPermissionEnum.JPC
    }
  },
  {
    path: `/${ROUTER_JOB_POSITION_DETAIL}/:id`,
    name: 'ROUTER_JOB_POSITION_DETAIL',
    component: () => import('@/views/jobPosition/JobPositionDetail.vue'),
    meta: {
      icon: '',
      title: $t('jobPosition.jobPositionDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: UserPermissionEnum.JPS
    }
  },
  {
    path: `/${ROUTER_JOB_POSITION_EDIT}/:id`,
    name: 'ROUTER_JOB_POSITION_EDIT',
    component: () => import('@/views/jobPosition/JobPositionEdit.vue'),
    meta: {
      icon: '',
      title: $t('jobPosition.editJobPosition'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: UserPermissionEnum.JPE
    }
  }
]
export default jobPositionRouter
