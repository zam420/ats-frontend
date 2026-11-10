import { UserPermissionEnum } from '@/enums/userPermission'
import { useLocale } from '@/hooks/useLocale'
import {
  ROUTER_SETTINGS_SCREENING_FORMS,
  ROUTER_SETTINGS_SCREENING_FORMS_CREATE,
  ROUTER_SETTINGS_SCREENING_FORMS_EDIT,
  ROUTER_SETTINGS_SCREENING_FORMS_VIEW
} from '../../routerName'

const { $t } = useLocale()
const routes: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_SCREENING_FORMS}`,
    name: 'ROUTER_SETTINGS_SCREENING_FORMS',
    component: () => import('@/views/settings/screeningQuestionsForm/index.vue'),
    meta: { title: $t('screeningForms.title'), index: 1.6, permissionCode: UserPermissionEnum.SQTM }
  },
  {
    path: `/${ROUTER_SETTINGS_SCREENING_FORMS_CREATE}`,
    name: 'ROUTER_SETTINGS_SCREENING_FORMS_CREATE',
    component: () => import('@/views/settings/screeningQuestionsForm/ScreeningFormPage.vue'),
    meta: { title: $t('screeningForms.create'), isHide: true, activeMenu: `/${ROUTER_SETTINGS_SCREENING_FORMS}`, permissionCode: UserPermissionEnum.SQTC }
  },
  {
    path: `/${ROUTER_SETTINGS_SCREENING_FORMS_EDIT}/:id`,
    name: 'ROUTER_SETTINGS_SCREENING_FORMS_EDIT',
    component: () => import('@/views/settings/screeningQuestionsForm/ScreeningFormPage.vue'),
    meta: { title: $t('screeningForms.edit'), isHide: true, activeMenu: `/${ROUTER_SETTINGS_SCREENING_FORMS}`, permissionCode: UserPermissionEnum.SQTS }
  },
  {
    path: `/${ROUTER_SETTINGS_SCREENING_FORMS_VIEW}/:id`,
    name: 'ROUTER_SETTINGS_SCREENING_FORMS_VIEW',
    component: () => import('@/views/settings/screeningQuestionsForm/ScreeningFormPage.vue'),
    meta: { title: $t('screeningForms.view'), isHide: true, activeMenu: `/${ROUTER_SETTINGS_SCREENING_FORMS}`, permissionCode: UserPermissionEnum.SQTS }
  }
]
export default routes
