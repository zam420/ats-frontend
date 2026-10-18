import { UserPermissionEnum } from '@/enums/userPermission'
import {
  ROUTER_SETTINGS_EMAIL_TEMPLATE,
  ROUTER_SETTINGS_EMAIL_TEMPLATE_CREATE,
  ROUTER_SETTINGS_EMAIL_TEMPLATE_DETAIL,
  ROUTER_SETTINGS_EMAIL_TEMPLATE_EDIT
} from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Settings -> Email Template module
const emailTemplateRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE}`,
    name: 'ROUTER_SETTINGS_EMAIL_TEMPLATE',
    component: () => import('@/views/settings/emailTemplate/index.vue'),
    meta: {
      title: $t('menu.emailTemplate'),
      index: 2,
      permissionCode: UserPermissionEnum.ETM
    }
  },
  {
    path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE_CREATE}`,
    name: 'ROUTER_SETTINGS_EMAIL_TEMPLATE_CREATE',
    component: () => import('@/views/settings/emailTemplate/EmailTemplateCreate.vue'),
    meta: {
      icon: '',
      title: $t('emailTemplate.createEmailTemplate'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE}`,
      permissionCode: UserPermissionEnum.ETC
    }
  },
  {
    path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE_EDIT}/:id`,
    name: 'ROUTER_SETTINGS_EMAIL_TEMPLATE_EDIT',
    component: () => import('@/views/settings/emailTemplate/EmailTemplateEdit.vue'),
    meta: {
      icon: '',
      title: $t('emailTemplate.editEmailTemplate'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE}`,
      permissionCode: UserPermissionEnum.ETE
    }
  },
  {
    path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE_DETAIL}/:id`,
    name: 'ROUTER_SETTINGS_EMAIL_TEMPLATE_DETAIL',
    component: () => import('@/views/settings/emailTemplate/EmailTemplateDetail.vue'),
    meta: {
      icon: '',
      title: $t('emailTemplate.emailTemplateDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE}`,
      permissionCode: UserPermissionEnum.ETS
    }
  }
]
export default emailTemplateRouter
