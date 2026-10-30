import { UserPermissionEnum } from '@/enums/userPermission'
import {
  ROUTER_SETTINGS_RECRUITMENT_PIPELINE,
  ROUTER_SETTINGS_RECRUITMENT_PIPELINE_CREATE,
  ROUTER_SETTINGS_RECRUITMENT_PIPELINE_DETAIL,
  ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT
} from '../../routerName'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

// Settings -> Recruitment Pipeline module
const recruitmentPipelineRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE}`,
    name: 'ROUTER_SETTINGS_RECRUITMENT_PIPELINE',
    component: () => import('@/views/settings/recruitmentPipeline/index.vue'),
    meta: {
      title: $t('menu.recruitmentPipeline'),
      index: 1.5,
      permissionCode: UserPermissionEnum.RPTM
    }
  },
  {
    path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE_CREATE}`,
    name: 'ROUTER_SETTINGS_RECRUITMENT_PIPELINE_CREATE',
    component: () => import('@/views/settings/recruitmentPipeline/RecruitmentPipelineCreate.vue'),
    meta: {
      icon: '',
      title: $t('recruitmentPipeline.createPipeline'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE}`,
      permissionCode: UserPermissionEnum.RPTC
    }
  },
  {
    path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT}/:id`,
    name: 'ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT',
    component: () => import('@/views/settings/recruitmentPipeline/RecruitmentPipelineEdit.vue'),
    meta: {
      icon: '',
      title: $t('recruitmentPipeline.editPipeline'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE}`,
      permissionCode: UserPermissionEnum.RPTE
    }
  },
  {
    path: `${ROUTER_SETTINGS_RECRUITMENT_PIPELINE_DETAIL}:id`,
    name: 'ROUTER_SETTINGS_RECRUITMENT_PIPELINE_DETAIL',
    component: () => import('@/views/settings/recruitmentPipeline/RecruitmentPipelineDetail.vue'),
    meta: {
      icon: '',
      title: $t('recruitmentPipeline.pipelineDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE}`,
      permissionCode: UserPermissionEnum.RPTS
    }
  }
]
export default recruitmentPipelineRouter
