<template>
  <InterviewProcessForm
    :title="$t('interviewProcess.createInterview')"
    :is-edit="false"
    :is-template="route.query?.template === '1'"
  />
</template>
<script setup lang="ts">
import InterviewProcessForm from './components/InterviewProcessForm.vue'
const route = useRoute()
</script>
