<template>
  <el-config-provider
    :locale="locale"
    :button="buttonConfig"
    :size="assemblySize"
    v-if="isPublicRoute || Object.keys(globalStore.userInfo).length > 0 || globalStore.isNotExistUser"
  >
    <router-view />
  </el-config-provider>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getBrowserLang } from '@/utils'
import { ROUTER_WHITE_LIST } from '@/config'
import { useGlobalStore } from '@/store/modules/global'
import { LanguageType } from './store/interface'

// configure element-plus locale
// import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
console.log(window.navigator.onLine)
const globalStore = useGlobalStore()
const route = useRoute()
// Login/register/activation pages render without user info
const isPublicRoute = computed(() => ROUTER_WHITE_LIST.includes(route.path) || route.path === '/activate')

// 初始化语言
const i18n = useI18n()
onMounted(() => {
  const language = globalStore.language ?? getBrowserLang()
  i18n.locale.value = language
  globalStore.updateLanguage(language as LanguageType)
})
// element 语言配置
const locale = computed(() => {
  if (globalStore.language == 'zh') return en
  if (globalStore.language == 'en') return en
  return getBrowserLang() == 'zh' ? en : en
})
// 配置全局组件大小（small/default(medium)/large）
const assemblySize = computed((): string => globalStore.assemblySize)

// 配置 element 按钮文字中间是否有空格
const buttonConfig = reactive({ autoInsertSpace: false })

nextTick(() => {
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    document.body.classList.add('safari')
  }
})
</script>
