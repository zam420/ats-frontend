<template>
  <ResumeForm :title="$t('cv.resume')" :is-edit="false" />
</template>
<script setup lang="ts" name="CVCreate">
import ResumeForm from './components/ResumeForm.vue'
</script>
