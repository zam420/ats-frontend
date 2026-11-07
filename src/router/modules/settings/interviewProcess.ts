import { UserPermissionEnum } from '@/enums/userPermission'
import {
  ROUTER_SETTINGS_EVALUATION_PLAN,
  ROUTER_SETTINGS_EVALUATION_PLAN_CREATE,
  ROUTER_SETTINGS_EVALUATION_PLAN_DETAIL,
  ROUTER_SETTINGS_EVALUATION_PLAN_EDIT,
  ROUTER_SETTINGS_EVALUATION_PLAN_VIEW
} from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Settings -> Interview Process module
const interviewProcessRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`,
    name: 'ROUTER_SETTINGS_EVALUATION_PLAN',
    component: () => import('@/views/settings/evaluationPlan/index.vue'),
    meta: {
      title: $t('menu.interviewProcess'),
      index: 1,
      permissionCode: UserPermissionEnum.IPTM
    }
  },
  {
    path: `/${ROUTER_SETTINGS_EVALUATION_PLAN_CREATE}`,
    name: 'ROUTER_SETTINGS_EVALUATION_PLAN_CREATE',
    component: () => import('@/views/settings/evaluationPlan/InterviewProcessCreate.vue'),
    meta: {
      icon: '',
      title: $t('interviewProcess.createInterview'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`,
      permissionCode: UserPermissionEnum.IPTC
    }
  },
  {
    path: `/${ROUTER_SETTINGS_EVALUATION_PLAN_EDIT}/:id`,
    name: 'ROUTER_SETTINGS_EVALUATION_PLAN_EDIT',
    component: () => import('@/views/settings/evaluationPlan/InterviewProcessEdit.vue'),
    meta: {
      icon: '',
      title: $t('interviewProcess.editInterview'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`,
      permissionCode: UserPermissionEnum.IPTS
    }
  },
  {
    path: `/${ROUTER_SETTINGS_EVALUATION_PLAN_VIEW}/:id`,
    name: 'ROUTER_SETTINGS_EVALUATION_PLAN_VIEW',
    component: () => import('@/views/settings/evaluationPlan/InterviewProcessEdit.vue'),
    meta: {
      icon: '',
      title: $t('interviewProcess.interviewDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`,
      permissionCode: UserPermissionEnum.IPTS
    }
  },
  {
    path: `${ROUTER_SETTINGS_EVALUATION_PLAN_DETAIL}/:id`,
    name: 'ROUTER_SETTINGS_EVALUATION_PLAN_DETAIL',
    component: () => import('@/views/settings/evaluationPlan/InterviewProcessDetail.vue'),
    meta: {
      icon: '',
      title: $t('interviewProcess.interviewDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`,
      permissionCode: UserPermissionEnum.IPTS
    }
  }
]
export default interviewProcessRouter
