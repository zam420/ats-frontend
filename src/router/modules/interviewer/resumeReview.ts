import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_INTERVIEWER_RESUME_REVIEW } from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Resume Review
const interviewerRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_INTERVIEWER_RESUME_REVIEW}`,
    name: 'ROUTER_INTERVIEWER_RESUME_REVIEW',
    component: () => import('@/views/interviewer/resumeReview/index.vue'),
    meta: {
      title: $t('menu.resumeReview'),
      index: 1,
      permissionCode: UserPermissionEnum.RSM
    }
  }
]
export default interviewerRouter
