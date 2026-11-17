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
import { useRoute } from 'vue-router'
import { ROUTER_WHITE_LIST } from '@/config'
import { useGlobalStore } from '@/store/modules/global'
import { getLanguage, getSelectedLocale } from '@/language/locale'

// configure element-plus locale
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
console.log(window.navigator.onLine)
const globalStore = useGlobalStore()
const route = useRoute()
// Login/register/activation pages render without user info
const isPublicRoute = computed(() => ROUTER_WHITE_LIST.includes(route.path) || route.path === '/activate')

const selectedLocale = getSelectedLocale()
globalStore.updateLanguage(getLanguage(selectedLocale))
document.documentElement.lang = selectedLocale
// element 语言配置
const locale = computed(() => globalStore.language === 'zh' ? zhCn : en)
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
