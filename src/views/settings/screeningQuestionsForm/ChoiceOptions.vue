<template>
  <div class="choice-options">
    <div v-for="(option, index) in options" :key="index" class="inline-option">
      <div class="option-content">
        <input v-if="marker" class="option-marker" :type="marker" :checked="defaultOption === option" disabled :aria-label="$t('screeningForms.optionPreview')" />
        <el-input :model-value="option" class="inline-input option-label" maxlength="100" :aria-label="$t('screeningForms.option')" @update:model-value="(value: string) => $emit('rename', index, value)" />
      </div>
      <div v-if="canWrite" class="option-actions" role="group" :aria-label="$t('screeningForms.optionSettings')">
        <ElButton text :disabled="requireOne && options.length <= 1" :aria-label="$t('screeningForms.removeOption')" :title="$t('screeningForms.removeOption')" @click="$emit('remove', index)">
          <el-icon><Delete /></el-icon>
        </ElButton>
        <button type="button" class="default-switch" role="switch" :class="{ 'is-on': defaultOption === option }"
          :aria-label="$t('screeningForms.setDefault')" :aria-checked="defaultOption === option"
          :title="$t('screeningForms.setDefault')" @click="$emit('toggle-default', option)"><span></span></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'

defineProps<{
  options: string[]
  defaultOption: string | null
  marker?: 'checkbox' | 'radio'
  canWrite: boolean
  requireOne: boolean
}>()
defineEmits<{
  (event: 'rename', index: number, value: string): void
  (event: 'remove', index: number): void
  (event: 'toggle-default', option: string): void
}>()
</script>

<style lang="less" scoped>
.choice-options { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 8px 20px; }
.inline-option { position: relative; display: flex; align-items: flex-start; }
.option-content { display: flex; align-items: center; gap: 8px; }
.option-marker { margin: 0; flex: none; }
.option-label { width: auto; min-width: 100px; max-width: 250px; }
.inline-input :deep(.el-input__wrapper) { padding: 0; background: transparent; box-shadow: none; }
.option-actions { position: absolute; z-index: 10; top: 100%; left: 20px; display: flex; align-items: center; gap: 4px; padding: 4px; background: var(--el-bg-color-overlay); border: 1px solid var(--el-border-color-light); border-radius: 4px; box-shadow: var(--el-box-shadow-light); visibility: hidden; }
.inline-option:hover .option-actions, .inline-option:focus-within .option-actions { visibility: visible; }
.option-actions :deep(.el-button) { min-width: 32px !important; width: 32px; height: 32px !important; margin: 0; padding: 5px; font-size: 19px; }
.default-switch { position: relative; width: 38px; height: 22px; padding: 0; border: 0; border-radius: 11px; background: var(--el-border-color); cursor: pointer; }
.default-switch.is-on { background: var(--el-color-primary); }
.default-switch span { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; }
.default-switch.is-on span { transform: translateX(16px); }
.default-switch:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
</style>
