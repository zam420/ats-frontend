import { defineStore } from 'pinia'
import { AssemblySizeType, GlobalState, LanguageType } from '@/store/interface'
import piniaPersistConfig from '@/config/piniaPersist'
import { getUserInfoApi } from '@/api/modules/user'
import { logoutApi, refreshApi } from '@/api/modules/auth'
import router, { routerArray } from '@/router'
import { ROUTER_LOGIN } from '@/router/routerName'
import { useMenuStore } from './menu'
import { getShowMenuList } from '@/utils'

export const useGlobalStore = defineStore({
  id: 'globalStore',
  // 修改默认值之后，需清除 localStorage 数据
  state: (): GlobalState => ({
    accessToken: '', // 用户 token
    refreshToken: '', // 用户 refreshToken
    email: '', // email of the signed-in user
    activationRequired: false, // true until the account is activated with the emailed code
    loginFailedNum: 0, // 用户登录失败的次数
    userInfo: {}, // 用户信息
    permissions: [],
    roles: [],
    defaultUrl: '', // 跳转链接
    // element 组件大小
    assemblySize: 'default',
    // 当前系统语言
    language: 'en',
    // 折叠菜单
    isCollapse: false,
    // 面包屑导航
    breadcrumb: true,
    // 面包屑导航图标
    breadcrumbIcon: true,
    // 标签页
    tabs: true,
    // 标签页图标
    tabsIcon: true,
    // 页脚
    footer: false,
    // 用户不存在
    isNotExistUser: false,
    isRefresh: 'sm'
  }),
  getters: {},
  actions: {
    // Set token
    setToken(token: string = '') {
      this.accessToken = token
    },
    // Set user information
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo
    },
    // Set component size
    setAssemblySize(assemblySize: AssemblySizeType) {
      this.assemblySize = assemblySize
    },
    // Change language
    updateLanguage(language: LanguageType) {
      this.language = language
    },
    // Set menu collapse
    setCollapse(isCollapse: boolean) {
      this.isCollapse = isCollapse
    },
    // login: store tokens returned by /auth/login or /auth/register
    async login(res: { email?: string; accessToken: string; refreshToken: string; activationRequired?: boolean }) {
      this.accessToken = `Bearer ${res.accessToken}`
      this.refreshToken = res.refreshToken
      this.email = res.email ?? ''
      this.activationRequired = !!res.activationRequired
      // Until the account is activated the user only sees the activation page, so skip loading user info
      if (!this.activationRequired) {
        await this.getUserInfo()
      }
    },
    // Get a new access token using the refresh token; throws if the refresh token is rejected
    async refreshAccessToken() {
      const res = await refreshApi(this.refreshToken)
      this.accessToken = `Bearer ${res.accessToken}`
      this.refreshToken = res.refreshToken
    },
    // Called after a successful activation: the current token still says "deactivated", so get a fresh one
    async onActivated() {
      const res = await refreshApi(this.refreshToken)
      this.accessToken = `Bearer ${res.accessToken}`
      this.activationRequired = false
      await this.getUserInfo()
    },
    // logout
    async logOut() {
      try {
        await logoutApi(this.refreshToken)
      } catch (e) {
        console.log(e)
      }
      this.clearUserInfo()
      useMenuStore().setMenuList([])
      router.replace(ROUTER_LOGIN)
    },
    // Get user information
    getUserInfo() {
      this.initMenu()
      return new Promise((resolve, reject) => {
        getUserInfoApi()
          .then(res => {
            this.initUserInfo(res)
            resolve(res)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    // Initialize menu
    initMenu() {
      const menuStore = useMenuStore()
      const list: Menu.MenuOptions[] = routerArray as unknown as Menu.MenuOptions[]
      const menuList = getShowMenuList(list, this.permissions)
      this.defaultUrl = menuList?.[0]?.name ?? ''
      menuStore.setMenuList(menuList)
    },
    // Initialize user information
    initUserInfo(res: any) {
      const user = res?.result ?? {}
      this.permissions = user?.permissions ?? []
      this.roles = user?.roles ?? []
      this.initMenu()
      this.userInfo = user
    },
    // Clear user information
    clearUserInfo() {
      this.accessToken = ''
      this.refreshToken = ''
      this.email = ''
      this.activationRequired = false
      this.roles = []
      this.userInfo = {}
    },
    // Compare user information for changes
    compareUserInfo(userInfo: any) {
      const permissionSet = JSON.stringify(this.userInfo?.permissionSet ?? [])
      const newPermissionSet = JSON.stringify(userInfo?.permissionSet ?? [])
      const roleSet = JSON.stringify(this.userInfo?.roleSet ?? [])
      const newRoleSet = JSON.stringify(userInfo?.roleSet ?? [])
      return (
        this.userInfo?.email !== userInfo?.email ||
        permissionSet !== newPermissionSet ||
        roleSet !== newRoleSet
      )
    },
    setIsNotExistUser(isNotExistUser: boolean = false) {
      this.isNotExistUser = isNotExistUser
    },
    setIsRefresh(isRefresh: 'sm' | 'lg') {
      this.isRefresh = isRefresh
    }
  },
  persist: piniaPersistConfig('globalStore')
})
