<template>
  <JobPositionForm v-if="id" :title="$t('jobPosition.jobPositionDetail')" :id="id" :is-edit="true" :read-only="true" />
</template>
<script setup lang="ts" name="JobPositionView">
import { ROUTER_JOB_POSITION } from '@/router/routerName'
import JobPositionForm from './components/JobForm.vue'

const route = useRoute()
const router = useRouter()
const id = computed(() => {
  const param = route.params.id
  return typeof param === 'string' && param.trim() ? param : ''
})
onMounted(() => {
  if (!id.value) router.replace({ path: `/${ROUTER_JOB_POSITION}` })
})
</script>
