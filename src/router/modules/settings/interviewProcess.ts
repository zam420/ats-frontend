import { UserPermissionEnum } from '@/enums/userPermission'
import {
  ROUTER_SETTINGS_INTERVIEW_PROCESS,
  ROUTER_SETTINGS_INTERVIEW_PROCESS_CREATE,
  ROUTER_SETTINGS_INTERVIEW_PROCESS_DETAIL,
  ROUTER_SETTINGS_INTERVIEW_PROCESS_EDIT
} from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Settings -> Interview Process module
const interviewProcessRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS}`,
    name: 'ROUTER_SETTINGS_INTERVIEW_PROCESS',
    component: () => import('@/views/settings/interviewProcess/index.vue'),
    meta: {
      title: $t('menu.interviewProcess'),
      index: 1,
      permissionCode: UserPermissionEnum.IPTM
    }
  },
  {
    path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS_CREATE}`,
    name: 'ROUTER_SETTINGS_INTERVIEW_PROCESS_CREATE',
    component: () => import('@/views/settings/interviewProcess/InterviewProcessCreate.vue'),
    meta: {
      icon: '',
      title: $t('interviewProcess.createInterview'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS}`,
      permissionCode: UserPermissionEnum.IPTC
    }
  },
  {
    path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS_EDIT}/:id`,
    name: 'ROUTER_SETTINGS_INTERVIEW_PROCESS_EDIT',
    component: () => import('@/views/settings/interviewProcess/InterviewProcessEdit.vue'),
    meta: {
      icon: '',
      title: $t('interviewProcess.editInterview'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS}`,
      permissionCode: UserPermissionEnum.IPTE
    }
  },
  {
    path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS_DETAIL}/:id`,
    name: 'ROUTER_SETTINGS_INTERVIEW_PROCESS_DETAIL',
    component: () => import('@/views/settings/interviewProcess/InterviewProcessDetail.vue'),
    meta: {
      icon: '',
      title: $t('interviewProcess.interviewDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS}`,
      permissionCode: UserPermissionEnum.IPTS
    }
  }
]
export default interviewProcessRouter
