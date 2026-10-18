<template>
  <ElMain>
    <RouterView v-slot="{ Component, route }">
      <Transition appear name="fade-transform" mode="out-in">
        <KeepAlive :include="keepAliveName">
          <component :is="Component" :key="route.fullPath" v-if="isRouterShow"></component>
        </KeepAlive>
      </Transition>
    </RouterView>
  </ElMain>
</template>
<script setup lang="ts" name="Menu">
import { useGlobalStore } from '@/store/modules/global'
import { storeToRefs } from 'pinia'
import { useKeepAliveStore } from '@/store/modules/keepAlive'
import { COLLAPSE_MENU_WIDTH, LARGE_WIDTH } from '@/config'

const globalStore = useGlobalStore()
const { isCollapse } = storeToRefs(globalStore)

const keepAliveStore = useKeepAliveStore()
const { keepAliveName } = storeToRefs(keepAliveStore)

// 注入刷新页面的方法
const isRouterShow = ref<boolean>(true)
const refreshCurrentPage = (val: boolean) => (isRouterShow.value = val)
provide('refresh', refreshCurrentPage)

// 监听窗口大小变化， 折叠侧边栏
const screenWidth = ref<number>(0)
globalStore.setIsRefresh(document.body.clientWidth >= LARGE_WIDTH ? 'lg' : 'sm')
const listeningWindow = useDebounceFn(() => {
  screenWidth.value = document.body.clientWidth
  if (!isCollapse.value && screenWidth.value < COLLAPSE_MENU_WIDTH) {
    globalStore.setCollapse(true)
  }
  if (isCollapse.value && screenWidth.value > COLLAPSE_MENU_WIDTH) {
    globalStore.setCollapse(false)
  }
})
window.addEventListener('resize', listeningWindow, false)
onBeforeUnmount(() => {
  window.removeEventListener('resize', listeningWindow)
})
</script>
<style lang="less" scoped>
@import 'index.less';
</style>
