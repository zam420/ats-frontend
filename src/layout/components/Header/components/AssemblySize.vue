<template>
  <ElDropdown trigger="click" @command="setAssemblySize">
    <i class="tool-bar-icon iconfont icon-contentright" />
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="item of assemblySizeList"
          :key="item.value"
          :command="item.value"
          :disabled="assemblySize === item.value"
        >
          {{ item.label }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
<script setup lang="ts" name="AssemblySize">
import { useLocale } from '@/hooks/useLocale'
import { AssemblySizeType } from '@/store/interface'
import { useGlobalStore } from '@/store/modules/global'

const { $t } = useLocale()
const globalStore = useGlobalStore()
const assemblySize = computed(() => globalStore.assemblySize)
const assemblySizeList = [
  { label: $t('assemblySize.default'), value: 'default' },
  { label: $t('assemblySize.large'), value: 'large' },
  { label: $t('assemblySize.small'), value: 'small' }
]
const setAssemblySize = (item: AssemblySizeType) => {
  if (assemblySize.value !== item) {
    globalStore.setAssemblySize(item)
  }
}
</script>
<style scoped lang="less"></style>
