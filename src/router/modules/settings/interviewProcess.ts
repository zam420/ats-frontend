import { UserPermissionEnum } from '@/enums/userPermission'
import {
  ROUTER_SETTINGS_EVALUATION_PLAN,
  ROUTER_SETTINGS_EVALUATION_PLAN_CREATE,
  ROUTER_SETTINGS_EVALUATION_PLAN_DETAIL,
  ROUTER_SETTINGS_EVALUATION_PLAN_EDIT
} from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Settings -> Interview Process module
const interviewProcessRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`,
    name: 'ROUTER_SETTINGS_EVALUATION_PLAN',
    component: () => import('@/views/settings/evaluationProcess/index.vue'),
    meta: {
      title: $t('menu.interviewProcess'),
      index: 1,
      permissionCode: UserPermissionEnum.IPTM
    }
  },
  {
    path: `/${ROUTER_SETTINGS_EVALUATION_PLAN_CREATE}`,
    name: 'ROUTER_SETTINGS_EVALUATION_PLAN_CREATE',
    component: () => import('@/views/settings/evaluationProcess/InterviewProcessCreate.vue'),
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
    component: () => import('@/views/settings/evaluationProcess/InterviewProcessEdit.vue'),
    meta: {
      icon: '',
      title: $t('interviewProcess.editInterview'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`,
      permissionCode: UserPermissionEnum.IPTE
    }
  },
  {
    path: `${ROUTER_SETTINGS_EVALUATION_PLAN_DETAIL}:id`,
    name: 'ROUTER_SETTINGS_EVALUATION_PLAN_DETAIL',
    component: () => import('@/views/settings/evaluationProcess/InterviewProcessDetail.vue'),
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
