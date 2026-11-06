<template>
  <JobPositionForm v-if="id" :title="$t('jobPosition.editJobPosition')" :id="id" :is-edit="true" />
</template>
<script setup lang="ts" name="JobPositionEdit">
import { ROUTER_JOB_POSITION } from '@/router/routerName'
import JobPositionForm from './components/JobForm.vue'

const route = useRoute()
const router = useRouter()
const id = ref<string>()
onMounted(() => {
  const paramId = route.params?.id
  if (typeof paramId === 'string' && paramId.trim()) {
    id.value = paramId
  } else {
    router.replace({
      path: `/${ROUTER_JOB_POSITION}`
    })
  }
})
</script>
