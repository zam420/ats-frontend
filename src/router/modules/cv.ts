import { UserPermissionEnum } from '@/enums/userPermission'
import {
  ROUTER_CV_MANAGEMENT,
  ROUTER_CV_MANAGEMENT_CREATE,
  ROUTER_CV_MANAGEMENT_DETAIL,
  ROUTER_CV_MANAGEMENT_EDIT,
  ROUTER_CV_MANAGEMENT_SCHEDULE_INTERVIEW
} from '../routerName'
import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

// CV Management Module
const cvRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_CV_MANAGEMENT}`,
    name: ROUTER_CV_MANAGEMENT,
    component: () => import('@/views/cvManagement/index.vue'),
    meta: {
      icon: 'cv',
      title: $t('menu.cvManagement'),
      index: 2,
      permissionCode: UserPermissionEnum.CRM
    }
  },
  {
    path: `/${ROUTER_CV_MANAGEMENT}/:type/:value`,
    name: 'ROUTER_CV_MANAGEMENT',
    component: () => import('@/views/cvManagement/index.vue'),
    meta: {
      icon: '',
      isHide: true,
      title: $t('menu.cvManagement'),
      activeMenu: `/${ROUTER_CV_MANAGEMENT}`,
      permissionCode: UserPermissionEnum.CRM
    }
  },
  {
    path: `/${ROUTER_CV_MANAGEMENT_CREATE}`,
    name: 'ROUTER_CV_MANAGEMENT_CREATE',
    component: () => import('@/views/cvManagement/CVCreate.vue'),
    meta: {
      icon: '',
      title: $t('cv.resume'),
      isHide: true,
      activeMenu: `/${ROUTER_CV_MANAGEMENT}`,
      permissionCode: UserPermissionEnum.CRC
    }
  },
  {
    path: `/${ROUTER_CV_MANAGEMENT_DETAIL}/:id`,
    name: 'ROUTER_CV_MANAGEMENT_DETAIL',
    component: () => import('@/views/cvManagement/CVDetail.vue'),
    meta: {
      icon: '',
      title: $t('cv.resume'),
      isHide: true,
      activeMenu: `/${ROUTER_CV_MANAGEMENT}`,
      permissionCode: UserPermissionEnum.CRS
    }
  },
  {
    path: `/${ROUTER_CV_MANAGEMENT_EDIT}/:id`,
    name: 'ROUTER_CV_MANAGEMENT_EDIT',
    component: () => import('@/views/cvManagement/CVEdit.vue'),
    meta: {
      icon: '',
      title: $t('cv.resume'),
      isHide: true,
      activeMenu: `/${ROUTER_CV_MANAGEMENT}`,
      permissionCode: UserPermissionEnum.CRE
    }
  },
  {
    path: `/${ROUTER_CV_MANAGEMENT_SCHEDULE_INTERVIEW}/:type/:jobId`,
    name: 'ROUTER_CV_MANAGEMENT_SCHEDULE_INTERVIEW',
    component: () => import('@/views/scheduleInterview/components/ScheduleInterview.vue'),
    meta: {
      icon: '',
      title: $t('button.scheduleInterview'),
      isHide: true,
      activeMenu: `/${ROUTER_CV_MANAGEMENT}`,
      permissionCode: UserPermissionEnum.CRS
    }
  }
]
export default cvRouter
