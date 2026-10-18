<template>
  <JobPositionForm v-if="id" :title="$t('jobPosition.editJobPosition')" :id="id" :is-edit="true" />
</template>
<script setup lang="ts" name="JobPositionEdit">
import { ROUTER_JOB_POSITION } from '@/router/routerName'
import JobPositionForm from './components/JobForm.vue'
import { isNumber } from '@/utils/is'

const route = useRoute()
const router = useRouter()
const id = ref<number>()
onMounted(() => {
  const paramId = route.params?.id
  if (paramId && isNumber(Number(paramId))) {
    id.value = Number(paramId)
    console.log(paramId)
  } else {
    router.replace({
      path: `/${ROUTER_JOB_POSITION}`
    })
  }
})
</script>
