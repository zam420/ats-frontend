import { createApp } from 'vue'

import I18n from './language/index'
import App from './App.vue'
import router, { redirectToLogin } from './router'

// pinia store
import pinia from '@/store/index'

// element plus
import ElementPlus from 'element-plus'

import * as Icons from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import '@fontsource-variable/inter'
import '@/styles/reset.less'
import '@/styles/element.less'
import '@/styles/fonts/iconfont.css'
import '@/styles/common.less'
import { onLogoutBroadcast } from '@/utils/authChannel'
import { useGlobalStore } from '@/store/modules/global'
import { useMenuStore } from '@/store/modules/menu'

const app = createApp(App)

// 注册element Icons组件
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons])
})
app.use(ElementPlus).use(pinia).use(I18n).use(router).mount('#app')

// Another tab ended the session: drop the credentials here too and go to the login page
onLogoutBroadcast(() => {
  useGlobalStore().clearUserInfo()
  useMenuStore().setMenuList([])
  redirectToLogin()
})
