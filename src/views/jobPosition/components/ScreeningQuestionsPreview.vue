<template>
  <div class="screening-preview">
    <div v-for="(question, index) in questions" :key="index" class="screening-control">
      <div v-if="question.code === 'LBL'" class="ql-editor job-rich-text display-label" v-html="jobRichTextToHtml(question.label)"></div>
      <template v-else>
        <div :id="`screening-label-${index}`" class="question-label">
          <div v-if="question.code === 'CHK' || question.code === 'RDO'" class="ql-editor job-rich-text choice-label" v-html="jobRichTextToHtml(question.label)"></div>
          <template v-else>{{ question.label }}</template><span v-if="question.mandatory" class="required" aria-hidden="true"> *</span>
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
import { jobRichTextToHtml } from '../jobRichText'
import { useLocale } from '@/hooks/useLocale'
import '../jobRichText.less'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps<{ questions: PreviewQuestion[] }>()
const { $t } = useLocale()
const textAnswers = ref(props.questions.map(() => ''))
const singleAnswers = ref(props.questions.map(question => question.defaultOption ?? ''))
const multipleAnswers = ref(props.questions.map(question => question.defaultOption ? [question.defaultOption] : []))
const getAnswers = () => {
  const result: { question_id: string; values: string[] }[] = []
  for (const [index, question] of props.questions.entries()) {
    if (!question.id) throw new Error('Screening question ID missing')
    const values = question.code === 'LBL' ? []
      : question.code === 'CHK' || (question.code === 'DD' && question.multiSelect) ? multipleAnswers.value[index]
      : question.code === 'RDO' || question.code === 'DD' ? (singleAnswers.value[index] ? [singleAnswers.value[index]] : [])
      : textAnswers.value[index].trim() ? [textAnswers.value[index].trim()] : []
    if (question.code !== 'LBL' && question.mandatory && !values.length) {
      ElMessage.error($t('jobPosition.applicationQuestionsRequired'))
      return null
    }
    result.push({ question_id: question.id, values })
  }
  return result
}
defineExpose({ getAnswers })
</script>

<style lang="less" scoped>
.screening-control + .screening-control { margin-top: 24px; }
.display-label { font-size: 13px; height: auto; overflow-y: visible; padding: 0; overflow-wrap: anywhere; }
.question-label { font-weight: 600; margin-bottom: 8px; overflow-wrap: anywhere; }
.choice-label { display: inline-block; height: auto; overflow: visible; padding: 0; vertical-align: baseline; }
.required { color: var(--el-color-danger); }
.question-description { margin-top: 6px; font-size: x-small; white-space: pre-wrap; overflow-wrap: anywhere; }
.el-select { width: 100%; max-width: 400px; }
</style>
