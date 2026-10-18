<template>
  <ResumeForm v-if="id" :title="$t('cv.resume')" :id="id" :is-edit="true" />
</template>
<script setup lang="ts" name="CVEdit">
import { ROUTER_JOB_POSITION } from '@/router/routerName'
import ResumeForm from './components/ResumeForm.vue'
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
      path: `/${ROUTER_JOB_POSITION}`
    })
  }
})
</script>
