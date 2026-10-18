<template>
  <ElContainer class="layout">
    <ElAside class="aside-pc-wrap" :class="isCollapse ? 'aside-collapse-wrap' : ''">
      <div
        class="aside-wrap"
        :style="{ width: isCollapse ? COLLAPSE_SM_WIDTH : COLLAPSE_LG_WIDTH }"
      >
        <div class="logo">
          <template v-if="isCollapse">
            <img
              class="logo-img logo-small-img"
              src="@/assets/svgs/logo-red-small.svg"
              alt="logo"
            />
          </template>
          <template v-else>
            <img class="logo-img" src="@/assets/svgs/logo-red.svg" alt="logo" />
          </template>
        </div>
        <ElScrollbar>
          <ElMenu
            :default-active="activeMenu"
            :collapse="isCollapse"
            :ellipsis="false"
            mode="horizontal"
            :unique-opened="true"
            :collapse-transition="false"
          >
            <SubMenu :menu-list="menuList" />
          </ElMenu>
        </ElScrollbar>
        <div class="collapse-icon-wrap" :class="globalStore.isCollapse ? 'expand' : 'fold'">
          <Avatar />
        </div>
        <div class="collapse-icon-wrap" :class="globalStore.isCollapse ? 'expand' : 'fold'">
          <Notification id="message" />
        </div>
        <div
          class="collapse-icon-wrap"
          :class="globalStore.isCollapse ? 'expand' : 'fold'"
          @click="changeCollapse"
          >
          <el-tooltip v-if="globalStore.isCollapse" :content="$t('opt.expand')" placement="top">
            <i
              class="iconfont collapse-icon"
              :class="`icon-${globalStore.isCollapse ? 'expand' : 'fold'}`"
            ></i>
          </el-tooltip>
          <i
            v-else
            class="iconfont collapse-icon"
            :class="`icon-${globalStore.isCollapse ? 'expand' : 'fold'}`"
          ></i>
          <span class="text" v-if="!globalStore.isCollapse">{{ $t('button.packUp') }}</span>
        </div>
      </div>
    </ElAside>
    <ElContainer>
      <!-- <ElHeader>
        <ToolBarLeft />
        <ToolBarRight />
      </ElHeader> -->
      <Main />
    </ElContainer>
    <EspFilePreview />
    <EspDialog />
  </ElContainer>
</template>
<script setup lang="ts" name="LayoutVertical">
import { useGlobalStore } from '@/store/modules/global'
import Main from './components/Main/index.vue'
import SubMenu from './components/Menu/SubMenu.vue'
// import ToolBarLeft from './components/Header/ToolBarLeft.vue'
// import ToolBarRight from './components/Header/ToolBarRight.vue'
import Notification from './components/Header/components/Notification.vue'
import Avatar from './components/Header/components/Avatar.vue'
import { useMenuStore } from '@/store/modules/menu'
import { COLLAPSE_SM_WIDTH, COLLAPSE_LG_WIDTH } from '@/config'

const route = useRoute()
const menuStore = useMenuStore()
const globalStore = useGlobalStore()
const isCollapse = computed(() => globalStore.isCollapse)
const menuList = computed(() => menuStore.menuList)
const activeMenu = computed(
  () => (route?.meta?.activeMenu ? route.meta.activeMenu : route.path) as string
)

const changeCollapse = () => {
  globalStore.setCollapse(!globalStore.isCollapse)
}
</script>

<style scoped lang="less">
@import 'index.less';
</style>
