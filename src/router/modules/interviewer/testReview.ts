import { UserPermissionEnum } from '@/enums/userPermission'
import { ROUTER_INTERVIEWER_TEST_REVIEW } from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Test Review
const testReviewRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_INTERVIEWER_TEST_REVIEW}`,
    name: 'ROUTER_INTERVIEWER_TEST_REVIEW',
    component: () => import('@/views/interviewer/testReview/index.vue'),
    meta: {
      title: $t('menu.testReview'),
      index: 3,
      permissionCode: UserPermissionEnum.WTRM
    }
  }
]
export default testReviewRouter
