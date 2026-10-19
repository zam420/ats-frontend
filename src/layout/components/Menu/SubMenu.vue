<template>
  <template v-for="subItem in menuList" :key="subItem.path">
    <el-sub-menu
      :popper-class="`el-sub-menu-popper-wrap ${
        globalStore.isCollapse ? 'el-sub-menu-collapse-popper-wrap' : ''
      }`"
      :show-timeout="0"
      :hide-timeout="200"
      :popper-offset="0"
      :teleported="true"
      v-if="subItem.children?.length"
      :index="subItem.path"
    >
      <template #title>
        <template v-if="subItem.meta?.icon">
          <img
            class="menu-icon menu-icon-grey"
            :src="getAssetsFile(`svgs/${subItem.meta?.icon}.svg`)"
          />
          <img
            class="menu-icon menu-icon-active"
            :src="getAssetsFile(`svgs/${subItem.meta?.icon}-active.svg`)"
          />
        </template>
        <span class="sle">{{ subItem.meta?.title }}</span>
      </template>
      <SubMenu :menuList="subItem.children" />
    </el-sub-menu>
    <el-menu-item v-else :index="subItem.path" @click="handleClickMenu(subItem)">
      <template v-if="subItem.meta?.icon">
        <img
          class="menu-icon menu-icon-grey"
          :src="getAssetsFile(`svgs/${subItem.meta?.icon}.svg`)"
        />
        <img
          class="menu-icon menu-icon-active"
          :src="getAssetsFile(`svgs/${subItem.meta?.icon}-active.svg`)"
        />
      </template>
      <template #title>
        <span class="sle">{{ subItem.meta?.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts" name="SubMenu">
import { useGlobalStore } from '@/store/modules/global'
import { getAssetsFile } from '@/utils'
defineProps<{ menuList: Menu.MenuOptions[] }>()

const router = useRouter()
const globalStore = useGlobalStore()
const handleClickMenu = (subItem: Menu.MenuOptions) => {
  if (subItem.meta?.isLink) {
    return window.open(subItem.meta.isLink, '_blank')
  }
  router.push(subItem.path)
}
</script>
<style lang="less">
.el-scrollbar__view {
  height: 100%;
  & > .el-menu {
    display: block;
    height: 100%;
    border-bottom: none !important;
    &.el-menu--horizontal {
      flex-direction: column;
    }
    .menu-icon {
      margin-right: 1.1em;
      width: 1.85em;
      height: auto;
      &.menu-icon-grey {
        filter: grayscale(1) brightness(0.45);
        opacity: 0.8;
      }
      &.menu-icon-active {
        display: none;
        filter: hue-rotate(-95deg) saturate(0.7) brightness(0.75);
      }
    }
    .el-menu-item,
    .el-sub-menu {
      &:focus {
        background-color: transparent;
        color: var(--el-menu-text-color);
      }
      height: var(--el-menu-item-height);
      width: 100%;
      border-radius: var(--el-border-menu-radius);
      justify-content: left;
      margin-top: 1em;
      border-bottom: none !important;
      &:hover {
        color: var(--el-color-primary) !important;
        background-color: var(--el-color-primary-light-9) !important;
      }
      &.is-active {
        color: var(--el-color-primary) !important;
        background-color: var(--el-color-primary-light-9) !important;
      }
      &.is-opened,
      &:hover,
      &.is-active {
        .menu-icon-active {
          display: block;
        }
        .menu-icon-grey {
          display: none;
        }
      }
    }
    &.el-menu--collapse {
      padding: 0 6px;
      --el-menu-base-level-padding: 14px;
      .el-menu-item {
        .el-menu-tooltip__trigger {
          position: static;
          border-radius: var(--el-border-radius-large);
        }
        &:hover,
        &.is-active {
          .el-menu-tooltip__trigger {
            background-color: var(--el-color-primary-light-9) !important;
            color: var(--color-gray1) !important;
          }
        }
      }
    }
    & > .el-sub-menu {
      position: relative;
      .el-sub-menu__title {
        border-radius: var(--el-border-menu-radius);
        border-bottom: none;
        .el-sub-menu__icon-arrow {
          margin-top: calc(var(--el-font-size-large) / 2 * -1);
          font-size: var(--el-font-size-large);
          transform: rotate(-90deg) !important;
          right: 16px;
        }
      }
      &.is-opened,
      &.is-active,
      &:hover {
        .el-sub-menu__title {
          background-color: var(--el-color-primary-light-9) !important;
          border-radius: var(--el-border-menu-radius);
          color: var(--color-gray1);
          border: none !important;
          outline: none !important;
        }
      }
      &.is-opened,
      &:hover {
        .el-sub-menu__title {
          .el-sub-menu__icon-arrow {
            transform: rotate(90deg) !important;
            color: var(--el-color-primary);
          }
        }
      }
      &.is-active{
        .el-sub-menu__title {
          .el-sub-menu__icon-arrow {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
  & > .el-menu {
    padding: 0 1em;
  }
}
</style>
