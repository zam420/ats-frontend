<template>
  <InterviewProcessForm :title="$t('interviewProcess.editInterview')" :is-edit="true" :id="id" />
</template>
<script setup lang="ts">
import InterviewProcessForm from './components/InterviewProcessForm.vue'
import { ROUTER_SETTINGS_INTERVIEW_PROCESS } from '@/router/routerName'
import { isNumber } from '@/utils/is'

const route = useRoute()
const router = useRouter()
const id = ref<string>()
onMounted(() => {
  const paramId = route.params?.id
  console.log("zamzamzamzamazmaz", paramId)
  if (paramId) {
    id.value = paramId as string
  } else {
    router.replace({
      path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS}`
    })
  }
})
</script>
