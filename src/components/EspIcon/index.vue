<template>
  <i class="iconfont text-primary-gradient" v-if="isHasPermission(permission)"></i>
</template>
<script setup lang="ts" name="EspIcon">
import { isHasPermission } from '@/utils'
interface ParamsProps {
  permission: string
  disabled?: boolean
}
withDefaults(defineProps<ParamsProps>(), {
  disabled: false
})
</script>
