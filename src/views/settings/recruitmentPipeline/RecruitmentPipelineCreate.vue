<template>
  <RecruitmentPipelineForm
    :title="$t('recruitmentPipeline.createPipeline')"
    :is-edit="false"
    :is-template="route.query?.template === '1'"
  />
</template>
<script setup lang="ts">
import RecruitmentPipelineForm from './components/RecruitmentPipelineForm.vue'
const route = useRoute()
</script>
