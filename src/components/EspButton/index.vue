<template>
  <el-button
    :type="type"
    :class="{ 'btn-primary-gradient': isGradient }"
    :disabled="disabled"
    v-if="isHasPermission(permission)"
  >
    <slot></slot>
  </el-button>
</template>
<script setup lang="ts" name="EspButton">
import { isHasPermission } from '@/utils'
interface ParamsProps {
  permission: string
  disabled?: boolean
  type?: string
  isGradient?: boolean
}
withDefaults(defineProps<ParamsProps>(), {
  disabled: false,
  type: '',
  isGradient: true
})
</script>
