<template>
  <span>
    {{ locations[0] || '—' }}
    <el-tooltip v-if="locations.length > 1" placement="top">
      <template #content>
        <div v-for="(location, index) in locations.slice(1)" :key="index">{{ location }}</div>
      </template>
      <span class="more-locations">{{ $t('jobPosition.moreLocations', { count: locations.length - 1 }) }}</span>
    </el-tooltip>
  </span>
</template>

<script setup lang="ts">
defineProps<{ locations: string[] }>()
</script>

<style lang="less" scoped>
.more-locations { color: var(--el-color-primary); }
</style>
