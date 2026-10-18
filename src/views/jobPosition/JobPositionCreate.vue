<template>
  <JobPositionForm :title="$t('jobPosition.createJobPosition')" :is-edit="false" />
</template>
<script setup lang="ts" name="JobPositionCreate">
import JobPositionForm from './components/JobForm.vue'
</script>
