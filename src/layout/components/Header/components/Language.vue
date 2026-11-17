<template>
  <ElDropdown trigger="click" placement="right-end" @command="changeLocale" class="locale-selector" :class="{ collapsed }">
    <button type="button" class="locale-trigger" :aria-label="$t('header.language')" :title="$t('header.language')">
      <svg class="locale-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 2.5 4.5 5.5 4.5 9s-1.5 6.5-4.5 9M12 3c-3 2.5-4.5 5.5-4.5 9s1.5 6.5 4.5 9" />
      </svg>
      <span v-if="!collapsed" class="locale-label">{{ currentLabel }}</span>
    </button>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="item of languageList"
          :key="item.value"
          :command="item.value"
          :aria-current="locale === item.value ? 'true' : undefined"
        >
          {{ item.label }}
          <el-icon v-if="locale === item.value" class="locale-check"><Check /></el-icon>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
<script setup lang="ts" name="Language">
import { useLocale } from '@/hooks/useLocale'
import { getSelectedLocale, isCreateOrEditRoute, type AppLocale } from '@/language/locale'
import { OPEN_DIALOG } from '@/config'
import mittBus from '@/utils/mittBus'
import { ElDropdownItem, ElDropdownMenu } from 'element-plus'

withDefaults(defineProps<{ collapsed?: boolean }>(), { collapsed: false })
const { $t } = useLocale()
const route = useRoute()
const locale = ref(getSelectedLocale())

const languageList: { label: string; value: AppLocale }[] = [
  { label: 'United States - English', value: 'en-US' },
  { label: '简体中文(中国大陆)', value: 'zh-CN' }
]
const currentLabel = computed(() => languageList.find(item => item.value === locale.value)?.label)

const applyLocale = (value: AppLocale) => {
  try {
    localStorage.setItem('locale', value)
    window.location.reload()
  } catch (error) {
    console.error('Failed to change language', error)
    ElMessage.error($t('header.languageChangeError'))
  }
}

const changeLocale = (value: AppLocale) => {
  if (value === locale.value) return
  if (!route.matched.some(record => isCreateOrEditRoute(record.path))) {
    applyLocale(value)
    return
  }
  mittBus.emit(OPEN_DIALOG, {
    title: $t('header.language'),
    content: $t('header.languageReloadConfirm'),
    center: 'center',
    size: 'small',
    showCancelButton: true,
    cancelButtonText: $t('button.cancel'),
    confirmButtonText: $t('button.confirm'),
    confirm: () => applyLocale(value)
  })
}
</script>
<style scoped lang="less">
.locale-selector { flex: none; display: block; padding: 0 27px 16px; }
.locale-trigger { display: flex; align-items: center; gap: 12px; width: 100%; padding: 4px; border: 0; background: transparent; color: var(--color-gray1); font: inherit; text-align: left; cursor: pointer; }
.locale-trigger:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
.locale-globe { width: 22px; height: 22px; flex: none; }
.locale-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.collapsed { padding: 0 0 16px; }
.collapsed .locale-trigger { justify-content: center; }
.locale-check { margin-left: 8px; }
</style>
