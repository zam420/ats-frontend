<template>
  <EmailTemplateForm :title="$t('emailTemplate.editEmailTemplate')" :is-edit="true" :id="id" />
</template>
<script setup lang="ts">
import EmailTemplateForm from './components/EmailTemplateForm.vue'
import { ROUTER_SETTINGS_EMAIL_TEMPLATE } from '@/router/routerName'
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
      path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE}`
    })
  }
})
</script>
