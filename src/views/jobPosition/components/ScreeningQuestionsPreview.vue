<template>
  <div class="screening-preview">
    <div v-for="(question, index) in questions" :key="index" class="screening-control">
      <template v-if="question.code === 'HN'">
        <component :is="`h${question.headingLevel ?? 1}`" class="heading" :class="`heading-${question.headingLevel ?? 1}`">{{ question.label }}</component>
      </template>
      <p v-else-if="question.code === 'LBL'" class="display-label">{{ question.label }}</p>
      <template v-else>
        <div :id="`screening-label-${index}`" class="question-label">
          {{ question.label }}<span v-if="question.mandatory" class="required" aria-hidden="true"> *</span>
        </div>
        <el-input v-if="question.code === 'INPUT' || question.code === 'INPUTAREA'"
          v-model="textAnswers[index]" :type="question.code === 'INPUTAREA' ? 'textarea' : 'text'"
          :maxlength="question.maxChars ?? undefined" :aria-labelledby="`screening-label-${index}`" />
        <el-checkbox-group v-else-if="question.code === 'CHK'" v-model="multipleAnswers[index]" :aria-labelledby="`screening-label-${index}`">
          <el-checkbox v-for="(option, optionIndex) in question.options" :key="optionIndex" :label="option">{{ option }}</el-checkbox>
        </el-checkbox-group>
        <el-radio-group v-else-if="question.code === 'RDO'" v-model="singleAnswers[index]" :aria-labelledby="`screening-label-${index}`">
          <el-radio v-for="(option, optionIndex) in question.options" :key="optionIndex" :label="option">{{ option }}</el-radio>
        </el-radio-group>
        <el-select v-else-if="question.code === 'DD' && question.multiSelect" v-model="multipleAnswers[index]"
          multiple :aria-labelledby="`screening-label-${index}`">
          <el-option v-for="(option, optionIndex) in question.options" :key="optionIndex" :label="option" :value="option" />
        </el-select>
        <el-select v-else-if="question.code === 'DD'" v-model="singleAnswers[index]" :aria-labelledby="`screening-label-${index}`">
          <el-option v-for="(option, optionIndex) in question.options" :key="optionIndex" :label="option" :value="option" />
        </el-select>
        <p v-else role="alert">{{ $t('screeningForms.unsupportedType') }}</p>
      </template>
      <p v-if="question.description.trim()" class="question-description">{{ question.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PreviewQuestion } from '../jobPreview'

const props = defineProps<{ questions: PreviewQuestion[] }>()
const textAnswers = ref(props.questions.map(() => ''))
const singleAnswers = ref(props.questions.map(question => question.defaultOption ?? ''))
const multipleAnswers = ref(props.questions.map(question => question.defaultOption ? [question.defaultOption] : []))
</script>

<style lang="less" scoped>
.screening-control + .screening-control { margin-top: 24px; }
.heading { font-weight: bold; overflow-wrap: anywhere; }
.heading-1 { font-size: 24px; }
.heading-2 { font-size: 20px; }
.heading-3 { font-size: 16px; }
.display-label { font-size: 14px; }
.question-label { font-weight: 600; margin-bottom: 8px; overflow-wrap: anywhere; }
.required { color: var(--el-color-danger); }
.question-description { margin-top: 6px; font-size: x-small; white-space: pre-wrap; overflow-wrap: anywhere; }
.el-select { width: 100%; max-width: 400px; }
</style>
