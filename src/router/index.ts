import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { useGlobalStore } from '@/store/modules/global'
import { ROUTER_WHITE_LIST } from '@/config'
import { staticRouter, errorRouter } from '@/router/staticRouter'
import NProgress from '@/config/nprogress'
import { ROUTER_404, ROUTER_ACTIVATE, ROUTER_LOGIN, ROUTER_REGISTER } from './routerName'
import { useMenuStore } from '@/store/modules/menu'
import { isHasPermission } from '@/utils'

// * 导入所有router
const metaRouters = import.meta.glob('./modules/*.ts', { eager: true })

// * 处理路由表
export let routerArray: RouteRecordRaw[] = []
for (const item of Object.values(metaRouters)) {
  for (const [key, value] of Object.entries(item as RouteRecordRaw)) {
    if (key === 'default') {
      routerArray.push(...value)
    }
  }
  // router.addRoute('layout', item)
}
routerArray = routerArray.sort((a: RouteRecordRaw, b: RouteRecordRaw) => {
  const aIndex = a?.meta?.index ?? -1
  const bIndex = b?.meta?.index ?? -1
  return aIndex < bIndex ? -1 : 1
})

/**
 * @description 📚 路由参数配置简介
 * @param path ==> 菜单路径
 * @param name ==> 菜单别名
 * @param redirect ==> 重定向地址
 * @param component ==> 视图文件路径
 * @param meta ==> 菜单信息
 * @param meta.icon ==> 菜单图标
 * @param meta.title ==> 菜单标题
 * @param meta.activeMenu ==> 当前路由为详情页时，需要高亮的菜单
 * @param meta.isLink ==> 是否外链
 * @param meta.isHide ==> 是否隐藏
 * @param meta.isFull ==> 是否全屏(示例：数据大屏页面)
 * @param meta.isAffix ==> 是否固定在 tabs nav
 * @param meta.isKeepAlive ==> 是否缓存
 * */
const router = createRouter({
  history: createWebHistory(),
  routes: [...staticRouter, ...errorRouter],
  strict: false,
  scrollBehavior: () => ({ left: 0, top: 0 })
})
routerArray.forEach(item => {
  router.addRoute('layout', item)
})

/**
 * @description 路由拦截 beforeEach
 * */
router.beforeEach(async (to, from, next) => {
  const globalStore = useGlobalStore()
  const menuStore = useMenuStore()
  // 1.NProgress 开始
  NProgress.start()

  // 2.动态设置标题
  const title = import.meta.env.VITE_GLOB_APP_TITLE
  document.title = to.meta.title ? `${to.meta.title} - ${title}` : title
  // 4.判断访问页面是否在路由白名单地址(静态路由)中，如果存在直接放行
  if (ROUTER_WHITE_LIST.includes(to.path)) {
    // Already signed in: skip the login/register pages
    if ((to.path === ROUTER_LOGIN || to.path === `/${ROUTER_REGISTER}`) && globalStore.accessToken) {
      return next(globalStore.activationRequired ? `/${ROUTER_ACTIVATE}` : '/')
    }
    return next()
  }

  // 5.判断是否有 Token，没有重定向到 login 页面
  if (!globalStore.accessToken) {
    NProgress.done()
    return next({
      path: ROUTER_LOGIN,
      query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : undefined
    })
  }
  // Unactivated accounts can only see the activation page
  const activatePath = `/${ROUTER_ACTIVATE}`
  if (globalStore.activationRequired) {
    return to.path === activatePath ? next() : next(activatePath)
  }
  if (to.path === activatePath) {
    return next('/')
  }
  if (menuStore.menuList.length === 0) {
    try {
      await globalStore.getUserInfo()
    } catch (e) {
      // Token invalid/expired or user info unavailable: force a fresh login
      globalStore.clearUserInfo()
      NProgress.done()
      return next({ path: ROUTER_LOGIN })
    }
    if (globalStore.isNotExistUser) {
      return
    }
    const nextParam = isHasPermission(to.meta.permissionCode as string) ? {
      path: to.path,
      query: to.query
    } : {
      path: globalStore.defaultUrl
    }
    next(nextParam)
    return
  }
  if (!isHasPermission(to.meta.permissionCode as string)) {
    router.push({
      path: ROUTER_404
    })
    return
  }
  // 6.正常访问页面
  next()
})

/**
 * @description 路由跳转错误
 * */
router.onError(error => {
  NProgress.done()
  console.warn('路由错误', error.message)
})

/**
 * @description 路由跳转结束
 * */
router.afterEach(() => {
  NProgress.done()
})

export default router
