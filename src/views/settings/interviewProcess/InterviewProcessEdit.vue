<template>
  <InterviewProcessForm :title="$t('interviewProcess.editInterview')" :is-edit="true" :id="id" />
</template>
<script setup lang="ts">
import InterviewProcessForm from './components/InterviewProcessForm.vue'
import { ROUTER_SETTINGS_INTERVIEW_PROCESS } from '@/router/routerName'
import { isNumber } from '@/utils/is'

const route = useRoute()
const router = useRouter()
const id = ref<number>()
onMounted(() => {
  const paramId = route.params?.id
  if (paramId && isNumber(Number(paramId))) {
    id.value = Number(paramId)
  } else {
    router.replace({
      path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS}`
    })
  }
})
</script>
