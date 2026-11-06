<template>
  <EvaluationForm
    :title="$t('interviewProcess.createInterview')"
    :is-edit="false"
    :is-template="route.query?.template === '1'"
  />
</template>
<script setup lang="ts">
import EvaluationForm from './components/EvaluationForm.vue'
const route = useRoute()
</script>
