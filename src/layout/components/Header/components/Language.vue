<template>
  <ElDropdown trigger="click" @command="changeLanguage">
    <i class="tool-bar-icon iconfont icon-zhongyingwen"></i>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="item of languageList"
          :key="item.value"
          :command="item.value"
          :disabled="language === item.value"
        >
          {{ item.label }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
<script setup lang="ts" name="Language">
import { useLocale } from '@/hooks/useLocale'
import { useGlobalStore } from '@/store/modules/global'
import { ElDropdownItem, ElDropdownMenu } from 'element-plus'

const { changeLanguage } = useLocale()
const globalStore = useGlobalStore()
const language = computed(() => globalStore.language)

const languageList = [
  { label: '简体中文', value: 'zh' },
  { label: 'English', value: 'en' }
]
</script>
<style scoped lang="less"></style>
