<template>
  <RecruitmentPipelineForm
    :title="$t('recruitmentPipeline.editPipeline')"
    :is-edit="true"
    :id="id"
    :read-only="route.query?.readonly === '1'"
  />
</template>
<script setup lang="ts">
import RecruitmentPipelineForm from './components/RecruitmentPipelineForm.vue'
import { ROUTER_SETTINGS_RECRUITMENT_PIPELINE } from '@/router/routerName'

const route = useRoute()
const router = useRouter()
const id = ref<string>()
onMounted(() => {
  const paramId = route.params?.id
  if (paramId) {
    id.value = paramId as string
  } else {
    router.replace({
      path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE}`
    })
  }
})
</script>
