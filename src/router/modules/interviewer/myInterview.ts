import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_INTERVIEWER_MY_REVIEW, ROUTER_INTERVIEWER_MY_REVIEW_CREATE, ROUTER_INTERVIEWER_MY_REVIEW_DETAIL, ROUTER_INTERVIEWER_MY_REVIEW_EDIT } from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// My Interview
const myInterviewerRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_INTERVIEWER_MY_REVIEW}`,
    name: 'ROUTER_INTERVIEWER_MY_REVIEW',
    component: () => import('@/views/interviewer/myInterview/index.vue'),
    meta: {
      title: $t('menu.myInterview'),
      index: 2,
      permissionCode: UserPermissionEnum.MIM
    }
  },
  {
    path: `/${ROUTER_INTERVIEWER_MY_REVIEW_CREATE}`,
    name: 'ROUTER_INTERVIEWER_MY_REVIEW_CREATE',
    component: () => import('@/views/interviewer/myInterview/FeedbackCreate.vue'),
    meta: {
      icon: '',
      title: $t('interviewer.interviewFeedback'),
      isHide: true,
      activeMenu: `/${ROUTER_INTERVIEWER_MY_REVIEW}`,
      permissionCode: UserPermissionEnum.MIM
    }
  },
  {
    path: `/${ROUTER_INTERVIEWER_MY_REVIEW_EDIT}/:id`,
    name: 'ROUTER_INTERVIEWER_MY_REVIEW_EDIT',
    component: () => import('@/views/interviewer/myInterview/FeedbackEdit.vue'),
    meta: {
      icon: '',
      title: $t('interviewer.interviewFeedback'),
      isHide: true,
      activeMenu: `/${ROUTER_INTERVIEWER_MY_REVIEW}`,
      permissionCode: UserPermissionEnum.MIM
    }
  },
  {
    path: `/${ROUTER_INTERVIEWER_MY_REVIEW_DETAIL}/:id`,
    name: 'ROUTER_INTERVIEWER_MY_REVIEW_DETAIL',
    component: () => import('@/views/interviewer/myInterview/FeedbackDetail.vue'),
    meta: {
      icon: '',
      title: $t('interviewer.interviewFeedback'),
      isHide: true,
      activeMenu: `/${ROUTER_INTERVIEWER_MY_REVIEW}`,
      permissionCode: UserPermissionEnum.MIM
    }
  }
]
export default myInterviewerRouter
