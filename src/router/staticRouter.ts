import { RouteRecordRaw } from 'vue-router'
import { ROUTER_403, ROUTER_404, ROUTER_500, ROUTER_ACTIVATE, ROUTER_FORGOT_PASSWORD, ROUTER_HOME, ROUTER_LOGIN, ROUTER_REGISTER } from './routerName'
import { useGlobalStore } from '@/store/modules/global'
/**
 * staticRouter (静态路由)
 */
export const staticRouter: RouteRecordRaw[] = [
  {
    path: ROUTER_LOGIN,
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: 'Login', isHide: true }
  },
  {
    path: `/${ROUTER_REGISTER}`,
    name: ROUTER_REGISTER,
    component: () => import('@/views/register/index.vue'),
    meta: { title: 'Register', isHide: true }
  },
  {
    path: `/${ROUTER_FORGOT_PASSWORD}`,
    name: ROUTER_FORGOT_PASSWORD,
    component: () => import('@/views/forgot-password/index.vue'),
    meta: { title: 'Forgot Password', isHide: true }
  },
  {
    path: `/${ROUTER_ACTIVATE}`,
    name: ROUTER_ACTIVATE,
    component: () => import('@/views/activate/index.vue'),
    meta: { title: 'Activate Account', isHide: true }
  },
  {
    path: '/',
    redirect: () => {
      const globalStore = useGlobalStore()
      return globalStore.defaultUrl || ROUTER_HOME
    }
  },
  {
    path: '/layout',
    name: 'layout',
    component: () => import('@/layout/index.vue'),
    redirect: () => {
      const globalStore = useGlobalStore()
      return globalStore.defaultUrl || ROUTER_HOME
    },
    children: []
  }
]

/**
 * errorRouter (错误页面路由)
 */
export const errorRouter = [
  {
    path: `/${ROUTER_403}`,
    name: ROUTER_403,
    component: () => import('@/components/EspErrorMessage/403.vue'),
    meta: {
      key: ROUTER_403,
      isHide: true
    }
  },
  {
    path: `/${ROUTER_404}`,
    name: ROUTER_404,
    component: () => import('@/components/EspErrorMessage/404.vue'),
    meta: {
      key: ROUTER_404,
      isHide: true
    }
  },
  {
    path: `/${ROUTER_500}`,
    name: ROUTER_500,
    component: () => import('@/components/EspErrorMessage/500.vue'),
    meta: {
      key: ROUTER_500,
      isHide: true
    }
  },
  // Resolve refresh page, route warnings
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/components/EspErrorMessage/404.vue')
  }
]
