import { useLocale } from '@/hooks/useLocale'
import {
  ROUTER_JOB_POSITION,
  ROUTER_CANDIDATE_PIPELINE,
  ROUTER_JOBS,
  ROUTER_APPLICATIONS,
  ROUTER_JOBS_DETAIL,
  ROUTER_JOB_POSITION_CREATE,
  ROUTER_JOB_POSITION_DETAIL,
  ROUTER_JOB_POSITION_EDIT,
  ROUTER_JOB_POSITION_VIEW,
  ROUTER_JOB_POSITION_CREATE_PREVIEW,
  ROUTER_JOB_POSITION_EDIT_PREVIEW,
  ROUTER_JOB_POSITION_LIST_PREVIEW
} from '../routerName'
import { UserPermissionEnum } from '@/enums/userPermission'

const { $t } = useLocale()

// Home Module
const jobPositionRouter: Menu.MenuOptions[] = [
  {
    path: `/${ROUTER_JOBS}`,
    name: ROUTER_JOBS,
    component: () => import('@/views/jobs/index.vue'),
    meta: {
      icon: 'job',
      title: $t('menu.jobs'),
      index: -2,
      permissionCode: UserPermissionEnum.JPSC
    }
  },
  {
    path: `/${ROUTER_APPLICATIONS}`,
    name: ROUTER_APPLICATIONS,
    component: () => import('@/views/jobs/index.vue'),
    meta: {
      icon: 'job',
      title: $t('menu.applications'),
      index: -1,
      permissionCode: UserPermissionEnum.JPSC
    }
  },
  {
    path: `/${ROUTER_JOBS}/:id`,
    name: ROUTER_JOBS_DETAIL,
    component: () => import('@/views/jobs/JobPreview.vue'),
    meta: {
      title: $t('jobPosition.jobDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_JOBS}`,
      permissionCode: UserPermissionEnum.JPSC
    }
  },
  ...[
    { path: ROUTER_JOB_POSITION_CREATE_PREVIEW, permission: UserPermissionEnum.JPC },
    { path: ROUTER_JOB_POSITION_EDIT_PREVIEW, permission: UserPermissionEnum.JPE }
  ].map(({ path, permission }) => ({
    path: `/${path}`,
    name: path,
    component: () => import('@/views/jobPosition/JobPositionPreview.vue'),
    meta: {
      title: $t('jobPosition.preview'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: permission
    }
  })),
  {
    path: `/${ROUTER_JOB_POSITION_LIST_PREVIEW}/:id`,
    name: ROUTER_JOB_POSITION_LIST_PREVIEW,
    component: () => import('@/views/jobPosition/JobPositionPreview.vue'),
    meta: {
      title: $t('jobPosition.preview'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: UserPermissionEnum.JPS
    }
  },
  {
    path: `/${ROUTER_JOB_POSITION}`,
    name: ROUTER_JOB_POSITION,
    component: () => import('@/views/jobPosition/index.vue'),
    meta: {
      icon: 'job',
      title: $t('menu.jobPosition'),
      index: 0,
      permissionCode: UserPermissionEnum.JPM
    }
  },
  {
    path: `/${ROUTER_CANDIDATE_PIPELINE}`,
    name: `/${ROUTER_CANDIDATE_PIPELINE}`,
    component: () => import('@/views/jobPosition/CandidatePipeline.vue'),
    meta: {
      icon: 'recruitment',
      title: $t('candidatePipeline.title'),
      index: 1,
      permissionCode: UserPermissionEnum.JPS
    }
  },
  {
    path: `/${ROUTER_CANDIDATE_PIPELINE}/:jobId`,
    name: ROUTER_CANDIDATE_PIPELINE,
    component: () => import('@/views/jobPosition/CandidatePipeline.vue'),
    meta: {
      title: $t('candidatePipeline.title'),
      isHide: true,
      activeMenu: `/${ROUTER_CANDIDATE_PIPELINE}`,
      permissionCode: UserPermissionEnum.JPS
    }
  },
  {
    path: `/${ROUTER_JOB_POSITION_CREATE}`,
    name: 'ROUTER_JOB_POSITION_CREATE',
    component: () => import('@/views/jobPosition/JobPositionCreate.vue'),
    meta: {
      icon: '',
      title: $t('jobPosition.createJobPosition'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: UserPermissionEnum.JPC
    }
  },
  {
    path: `/${ROUTER_JOB_POSITION_DETAIL}/:id`,
    name: 'ROUTER_JOB_POSITION_DETAIL',
    component: () => import('@/views/jobPosition/JobPositionDetail.vue'),
    meta: {
      icon: '',
      title: $t('jobPosition.jobPositionDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: UserPermissionEnum.JPS
    }
  },
  {
    path: `/${ROUTER_JOB_POSITION_VIEW}/:id`,
    name: 'ROUTER_JOB_POSITION_VIEW',
    component: () => import('@/views/jobPosition/JobPositionView.vue'),
    meta: {
      icon: '',
      title: $t('jobPosition.jobPositionDetail'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: UserPermissionEnum.JPS
    }
  },
  {
    path: `/${ROUTER_JOB_POSITION_EDIT}/:id`,
    name: 'ROUTER_JOB_POSITION_EDIT',
    component: () => import('@/views/jobPosition/JobPositionEdit.vue'),
    meta: {
      icon: '',
      title: $t('jobPosition.editJobPosition'),
      isHide: true,
      activeMenu: `/${ROUTER_JOB_POSITION}`,
      permissionCode: UserPermissionEnum.JPE
    }
  }
]
export default jobPositionRouter
