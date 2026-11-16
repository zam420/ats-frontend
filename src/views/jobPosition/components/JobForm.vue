<template>
  <EspMain :title="title">
    <template #left v-if="!isEmpty(state.status as string)">
      <EspStatus :type="statusType">{{ statusText }}</EspStatus>
    </template>
    <template #right>
      <ElButton v-if="!readOnly" :disabled="!jobReady" @click="preview">{{ $t('jobPosition.previewButton') }}</ElButton>
      <ElButton @click="goBack">{{ $t(readOnly ? 'button.back' : 'button.cancel') }}</ElButton>
      <ElButton v-if="!readOnly" :disabled="!jobReady || templateLoading" @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
    </template>
    <el-tabs v-model="activeTab" class="job-tabs">
      <el-tab-pane :label="$t('jobPosition.jobDescription')" name="description">
        <p class="tab-subtitle">{{ $t('jobPosition.descriptionTabSubtitle') }}</p>
        <EspForm
          ref="espBasicRef"
          :title="$t('jobPosition.basicInformation')"
          :changeForm="changeForm"
          :disabled="readOnly"
          v-model="state.baseForm"
        />
        <EspForm :title="$t('jobPosition.jobDetail')" :model-value="[]">
          <template #info>
            <el-row :gutter="20">
              <el-col :span="24">
                <EspQuillEditor
                  ref="jobDescRef"
                  v-model:content="state.jobDesc"
                  :label="$t('jobPosition.jobDescription')"
                  :select-options="[]"
                  :hide-insert-field="true"
                  :full-toolbar="true"
                  :read-only="readOnly"
                  :match-editable-layout="true"
                />
              </el-col>
            </el-row>
          </template>
        </EspForm>
      </el-tab-pane>
      <el-tab-pane :label="$t('jobPosition.screeningQuestions')" name="questions">
        <p class="tab-subtitle">{{ $t('jobPosition.questionsTabSubtitle') }}</p>
        <ElButton v-if="!readOnly" @click="openTemplateDialog('questions')">{{ $t('jobPosition.loadFromTemplates') }}</ElButton>
        <ScreeningFormPage v-if="jobReady && screeningQuestionTypes !== null" :key="questionEditorKey" ref="screeningFormRef" embedded
          :initial-questions="screeningQuestions" :question-types="screeningQuestionTypes" :read-only="readOnly" />
      </el-tab-pane>
      <el-tab-pane :label="$t('jobPosition.configuration')" name="configuration">
        <p class="tab-subtitle">{{ $t('jobPosition.configurationTabSubtitle') }}</p>
        <EspForm
          ref="espInternalDetailsRef"
          :title="$t('jobPosition.internalDetails')"
          v-model="state.internalDetailsForm"
          :form-rules="internalDetailsRules"
          :disabled="readOnly"
        />
        <EspForm
          ref="espHiringTeamRef"
          :title="$t('jobPosition.hiringTeam')"
          v-model="state.hiringTeamForm"
          :disabled="readOnly"
          class="interviewer-select"
          @mouseover="showFullTagText"
        />
        <EspForm :title="$t('jobPosition.jobDisplayConfiguration')" :model-value="[]" :disabled="readOnly">
          <template #info>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item :label="$t('jobPosition.screeningDisplayMode')">
                  <el-select v-model="screeningDisplayMode" :disabled="readOnly">
                    <el-option value="description" :label="$t('jobPosition.withJobDescription')" />
                    <el-option value="tab" :label="$t('jobPosition.separateTab')" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </EspForm>
      </el-tab-pane>
      <el-tab-pane :label="$t('jobPosition.recruitmentPipeline')" name="pipeline">
        <p v-if="!readOnly" class="tab-subtitle">{{ $t('jobPosition.pipelineTabSubtitle') }}</p>
        <ElButton v-if="!readOnly" @click="openTemplateDialog('pipeline')">{{ $t('jobPosition.loadFromTemplates') }}</ElButton>
        <RecruitmentPipelineForm
          v-if="jobReady"
          :key="pipelineEditorKey"
          ref="pipelineEditorRef"
          :title="''"
          :is-edit="true"
          :read-only="readOnly"
          :stages-only="true"
          :initial-rounds="recruitmentRounds"
          :hide-preview-errors="readOnly"
          :round-types="recruitmentPipelineRoundTypes"
          @default-rounds="recordDefaultPipelineRounds"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('jobPosition.interviewProcessTemplate')" name="evaluation">
        <p v-if="!readOnly" class="tab-subtitle">{{ $t('jobPosition.evaluationTabSubtitle') }}</p>
        <ElButton v-if="!readOnly" @click="openTemplateDialog('evaluation')">{{ $t('jobPosition.loadFromTemplates') }}</ElButton>
        <EvaluationForm
          v-if="jobReady"
          :key="evaluationEditorKey"
          ref="evaluationEditorRef"
          :title="''"
          :is-edit="true"
          :rounds-only="true"
          :initial-rounds="evaluationRounds"
          :read-only="readOnly"
          :hide-preview-errors="readOnly"
          :round-types="evaluationPlanRoundTypes"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('jobPosition.evaluationFeedback')" name="feedback">
        <p class="tab-subtitle">{{ $t('jobPosition.feedbackTabSubtitle') }}</p>
      </el-tab-pane>
    </el-tabs>
    <el-dialog v-model="templateDialogOpen" :title="$t('jobPosition.loadFromTemplates')" width="500px"
      :show-close="!templateLoading" :close-on-click-modal="!templateLoading" :close-on-press-escape="!templateLoading">
      <el-alert v-if="templateHasChanges" :title="$t('jobPosition.templateUnsavedWarning')" type="warning" :closable="false" show-icon />
      <el-select v-model="templateSelection" filterable :disabled="templateLoading" :loading="templateLoading" class="template-select" @change="loadTemplate">
        <el-option v-for="option in templateOptions" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
      <template #footer>
        <ElButton :disabled="templateLoading" @click="templateDialogOpen = false">{{ $t('button.cancel') }}</ElButton>
      </template>
    </el-dialog>
  </EspMain>
</template>
<script setup lang="ts" name="JobPositionForm">
import { cloneDeep } from 'lodash-es'
import type { FormRules } from 'element-plus'
import {
  JOB_POSITION_BASIC_FORM,
  JOB_POSITION_INTERNAL_DETAILS_FORM,
  JOB_POSITION_HIRING_TEAM_FORM
} from '../data'
import { getObjectByForms, isEmpty } from '@/utils'
import {
  createJobPosition,
  editJobPosition,
  getJobFieldsData,
  getJobPositionDetail
} from '@/api/modules/jobPosition'
import JobPosition from '@/api/interface/jobPosition'
import InterviewProcess from '@/api/interface/evaluationPlan'
import RecruitmentPipeline from '@/api/interface/recruitmentPipeline'
import { WorkLocation, WorkLocationEnum } from '@/enums/workLocationEnum'
import { JobStatusEnum, JobStatus } from '@/enums/jobStatusEnum'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_JOB_POSITION, ROUTER_JOB_POSITION_CREATE_PREVIEW, ROUTER_JOB_POSITION_EDIT_PREVIEW } from '@/router/routerName'
import { isArray } from '@/utils/is'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { jobRichTextToHtml } from '../jobRichText'
import RecruitmentPipelineForm from '@/views/settings/recruitmentPipeline/components/RecruitmentPipelineForm.vue'
import EvaluationForm from '@/views/settings/evaluationPlan/components/EvaluationForm.vue'
import ScreeningFormPage from '@/views/settings/screeningQuestionsForm/ScreeningFormPage.vue'
import { getScreeningForm } from '@/api/modules/screeningQuestionsForm'
import { getRecruitmentPipelineDetail } from '@/api/modules/recruitmentPipeline'
import { getInterviewProcessDetail } from '@/api/modules/evaluationPlan'
import type { ScreeningFormListItem, ScreeningQuestion, ScreeningQuestionType } from '@/api/interface/screeningQuestionsForm'
import { newPreviewStorageKey, type PreviewQuestion, type ScreeningDisplayMode } from '../jobPreview'

interface ParamsProps {
  title: string // 标题
  id?: string // 数据ID
  isEdit: boolean // 是否编辑
  readOnly?: boolean
}
interface ReactiveParams {
  status?: string | number // 状态
  baseForm: Form.FormItem[]
  jobDesc: string
  internalDetailsForm: Form.FormItem[]
  hiringTeamForm: Form.FormItem[]
}

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false
})

const router = useRouter()
const { $t } = useLocale()

const activeTab = ref('description')
const jobReady = ref(!props.isEdit)
const screeningForms = ref<ScreeningFormListItem[]>([])
const screeningQuestionTypes = ref<ScreeningQuestionType[] | null>(null)
const screeningDisplayMode = ref<ScreeningDisplayMode>('description')
const screeningFormRef = ref<InstanceType<typeof ScreeningFormPage>>()
const pipelineEditorRef = ref<InstanceType<typeof RecruitmentPipelineForm>>()
const evaluationEditorRef = ref<InstanceType<typeof EvaluationForm>>()
const screeningQuestions = ref<ScreeningQuestion[]>([])
const recruitmentRounds = ref<RecruitmentPipeline.RoundParam[]>([])
const evaluationRounds = ref<InterviewProcess.RoundParam[]>([])
const questionEditorKey = ref(0)
const pipelineEditorKey = ref(0)
const evaluationEditorKey = ref(0)
const templateDialogOpen = ref(false)
const templateLoading = ref(false)
const templateSelection = ref<string | number>('')
const templateKind = ref<'questions' | 'pipeline' | 'evaluation'>('questions')
const pipelineOptions = ref<Form.FormSelect[]>([])
const evaluationOptions = ref<Form.FormSelect[]>([])
const savedTabData = reactive({ questions: '[]', pipeline: '[]', evaluation: '[]' })
const templateHasChanges = ref(false)
const evaluationPlanRoundTypes = ref<InterviewProcess.RoundType[]>([])
const recruitmentPipelineRoundTypes = ref<RecruitmentPipeline.RoundType[]>([])
const espBasicRef = ref()
const jobDescRef = ref()
const espInternalDetailsRef = ref()
const espHiringTeamRef = ref()
const state = reactive<ReactiveParams>({
  status: undefined,
  baseForm: cloneDeep(JOB_POSITION_BASIC_FORM),
  jobDesc: '',
  internalDetailsForm: cloneDeep(JOB_POSITION_INTERNAL_DETAILS_FORM),
  hiringTeamForm: cloneDeep(JOB_POSITION_HIRING_TEAM_FORM)
})
const internalDetailsRules: FormRules = {
  requisition_id: [
    { required: true, whitespace: true, message: $t('form.required'), trigger: 'blur' },
    { min: 4, max: 20, message: $t('jobPosition.internalDetailsLength', { min: 4, max: 20 }), trigger: 'blur' }
  ],
  num_of_openings: [
    { type: 'integer', required: true, min: 1, max: 50, message: $t('jobPosition.openingsInteger'), trigger: 'change' }
  ],
  office: [
    { required: true, whitespace: true, message: $t('form.required'), trigger: 'blur' },
    { min: 4, max: 100, message: $t('jobPosition.internalDetailsLength', { min: 4, max: 100 }), trigger: 'blur' }
  ],
  department: [
    { required: true, whitespace: true, message: $t('form.required'), trigger: 'blur' },
    { min: 4, max: 100, message: $t('jobPosition.internalDetailsLength', { min: 4, max: 100 }), trigger: 'blur' }
  ]
}
const statusText = computed(() => typeof state.status === 'number'
  ? JobStatusEnum[state.status]
  : state.status)
const statusType = computed(() => {
  if (typeof state.status === 'number') return JobStatus[state.status]?.status ?? 'default'
  const colors: Record<string, 'warning' | 'success' | 'default'> = {
    DRAFT: 'warning',
    UNDER_REVIEW: 'warning',
    OPEN: 'success',
    ON_HOLD: 'warning',
    CLOSED: 'default'
  }
  return colors[state.status ?? ''] ?? 'default'
})
const templateOptions = computed(() => templateKind.value === 'questions'
  ? screeningForms.value.map(form => ({ label: form.name, value: form.id }))
  : templateKind.value === 'pipeline' ? pipelineOptions.value : evaluationOptions.value)

const questionPayload = (questions: ScreeningQuestion[]) => questions.map((question, order) => ({
  label: question.label, description: question.description, screening_question_type_id: question.screening_question_type,
  order, options: question.options, default_option: question.default_option,
  is_mandatory: question.is_mandatory, is_drop_down_multi_select: question.is_drop_down_multi_select,
  max_chars: question.max_chars, heading_level: question.heading_level ?? null
}))
const pipelinePayload = (rounds: RecruitmentPipeline.RoundParam[]) =>
  rounds.map(({ round_type, name, description }, order) => ({ round_type, name, description, order }))
const evaluationPayload = (rounds: InterviewProcess.RoundParam[]) =>
  rounds.map(({ round_type, name, description, interviewers }, order) => ({
    round_type, name, description, interviewers: interviewers ?? [], order
  }))
const currentTabData = (kind: 'questions' | 'pipeline' | 'evaluation') => {
  if (kind === 'questions') {
    if (!screeningFormRef.value) throw new Error('Screening editor is not ready')
    return screeningFormRef.value.getQuestions()
  }
  if (kind === 'pipeline') {
    if (!pipelineEditorRef.value) throw new Error('Pipeline editor is not ready')
    return pipelineEditorRef.value.getRounds()
  }
  if (!evaluationEditorRef.value) throw new Error('Evaluation editor is not ready')
  return evaluationEditorRef.value.getRounds()
}
const recordDefaultPipelineRounds = (rounds: RecruitmentPipeline.RoundParam[]) => {
  if (!recruitmentRounds.value.length) {
    savedTabData.pipeline = JSON.stringify(rounds)
  }
}
const openTemplateDialog = (kind: 'questions' | 'pipeline' | 'evaluation') => {
  try {
    const data = currentTabData(kind)
    const emptyEditTab = props.isEdit && (kind === 'questions' || kind === 'evaluation') && data.length === 0
    templateHasChanges.value = !emptyEditTab && JSON.stringify(data) !== savedTabData[kind]
    templateKind.value = kind
    templateSelection.value = ''
    templateDialogOpen.value = true
  } catch (error) {
    console.error('Cannot open template dialog', error)
    ElMessage.error($t('jobPosition.previewScreeningError'))
  }
}
const loadTemplate = async () => {
  if (!templateSelection.value || templateLoading.value) return
  templateLoading.value = true
  try {
    if (templateKind.value === 'questions') {
      const response = await getScreeningForm(String(templateSelection.value))
      if (!response?.success || !Array.isArray(response.result?.questions)) throw new Error('Screening template is missing')
      screeningQuestions.value = cloneDeep(response.result.questions).sort((a, b) => a.order - b.order)
      savedTabData.questions = JSON.stringify(questionPayload(screeningQuestions.value))
      questionEditorKey.value++
    } else if (templateKind.value === 'pipeline') {
      const response = await getRecruitmentPipelineDetail(templateSelection.value)
      if (!response?.success || !Array.isArray(response.result?.rounds)) throw new Error('Pipeline template is missing')
      recruitmentRounds.value = response.result.rounds.map(round => ({
        round_type: Number(round.round_type), name: round.name, description: round.description, order: round.order
      }))
      savedTabData.pipeline = JSON.stringify(pipelinePayload(recruitmentRounds.value))
      pipelineEditorKey.value++
    } else {
      const response = await getInterviewProcessDetail(templateSelection.value)
      if (!response?.success || !Array.isArray(response.result?.rounds)) throw new Error('Evaluation template is missing')
      evaluationRounds.value = response.result.rounds.map(round => ({
        round_type: Number(round.round_type), name: round.name, description: round.description, order: round.order,
        interviewers: (round.interviewers ?? []).map(user => typeof user === 'object' ? user.id : user)
      }))
      savedTabData.evaluation = JSON.stringify(evaluationPayload(evaluationRounds.value))
      evaluationEditorKey.value++
    }
    templateDialogOpen.value = false
  } catch (error) {
    console.error('Failed to load job template', error)
    ElMessage.error($t('jobPosition.templateLoadError'))
    templateSelection.value = ''
  } finally {
    templateLoading.value = false
  }
}

const findOptionLabel = (options: Form.FormSelect[], value: string | number): string | undefined => {
  for (const option of options) {
    if (String(option.value) === String(value)) return option.label
    const child = findOptionLabel(option.children ?? [], value)
    if (child) return child
  }
  return undefined
}

const previewFieldLabel = (prop: string): string => {
  const field = state.baseForm.find(item => item.prop === prop)
  const values: unknown[] = Array.isArray(field?.value) ? field.value : [field?.value]
  return values.flatMap(value => {
    if (value == null || value === '') return []
    if (typeof value !== 'string' && typeof value !== 'number') throw new Error(`Invalid ${prop} value`)
    const label = findOptionLabel(field?.options ?? [], value)
      ?? (prop === 'work_location' ? WorkLocation[String(value)]?.name : undefined)
    if (!label) throw new Error(`Unable to resolve ${prop} option: ${value}`)
    return [label]
  }).join(', ')
}

const preview = () => {
  let employmentType: string
  let workArrangement: string
  let workLocation: string
  let questions: PreviewQuestion[]
  try {
    if (!screeningFormRef.value) throw new Error('Screening form is not ready')
    questions = screeningFormRef.value.getPreviewQuestions()
  } catch (error) {
    console.error('Failed to prepare screening questions for preview', error)
    ElMessage.error($t('jobPosition.previewScreeningError'))
    return
  }
  try {
    employmentType = previewFieldLabel('employment_type_id')
    workArrangement = previewFieldLabel('work_arrangement_type_id')
    workLocation = previewFieldLabel('work_location')
  } catch (error) {
    console.error('Failed to resolve job preview details', error)
    ElMessage.error($t('jobPosition.previewFieldsError'))
    return
  }
  let key = ''
  try {
    key = newPreviewStorageKey()
    sessionStorage.setItem(key, JSON.stringify({
      title: state.baseForm.find(item => item.prop === 'title')?.value ?? '',
      description: jobDescRef.value?.getContent() ?? state.jobDesc,
      employmentType,
      workArrangement,
      workLocation,
      screeningDisplayMode: screeningDisplayMode.value,
      questions
    }))
    const path = props.isEdit ? ROUTER_JOB_POSITION_EDIT_PREVIEW : ROUTER_JOB_POSITION_CREATE_PREVIEW
    const href = router.resolve({ path: `/${path}`, query: { preview: key } }).href
    const page = window.open(href, '_blank')
    if (!page) throw new Error('Preview window blocked')
    page.opener = null
  } catch (error) {
    console.error('Failed to open job preview', error)
    ElMessage.error($t('jobPosition.previewOpenError'))
  } finally {
    if (key) {
      try {
        sessionStorage.removeItem(key)
      } catch (error) {
        console.error('Failed to remove temporary job preview data', error)
      }
    }
  }
}

const save = async () => {
  if (props.readOnly) return
  const basicValid = await espBasicRef.value.validateFrom(null, null, false)
  const descValid = jobDescRef.value?.validate()
  const internalDetailsValid = await espInternalDetailsRef.value.validateFrom(null, null, false)
  const hiringTeamValid = await espHiringTeamRef.value.validateFrom(null, null, false)
  if (!basicValid || !descValid || !internalDetailsValid || !hiringTeamValid) {
    activeTab.value = !basicValid || !descValid
      ? 'description' : 'configuration'
    ElMessage.error($t('form.requiredError'))
    return
  }
  const baseForm = getObjectByForms(state.baseForm)
  const detailForm = {
    description: jobDescRef.value.getContent()
  }
  const formData: Record<string, any> = {
    ...baseForm,
    ...detailForm,
    ...getObjectByForms(state.internalDetailsForm),
    ...getObjectByForms(state.hiringTeamForm)
  }
  try {
    if (!screeningFormRef.value) throw new Error('Screening editor is not ready')
    if (!screeningFormRef.value.validateQuestions()) {
      activeTab.value = 'questions'
      return
    }
    formData.screening_questions = currentTabData('questions')
    formData.recruitment_pipeline_rounds = currentTabData('pipeline')
    formData.evaluation_plan_rounds = currentTabData('evaluation')
  } catch (error) {
    console.error('Failed to collect job application fields', error)
    ElMessage.error($t('jobPosition.previewScreeningError'))
    return
  }
  if (!formData.recruitment_pipeline_rounds.length) {
    activeTab.value = 'pipeline'
    ElMessage.error($t('jobPosition.recruitmentStageRequired'))
    return
  }
  if (!formData.evaluation_plan_rounds.length) {
    activeTab.value = 'evaluation'
    ElMessage.error($t('jobPosition.evaluationRoundRequired'))
    return
  }
  formData.hiring_managers = state.hiringTeamForm.find(item => item.prop === 'hiring_managers')?.value ?? []
  formData.employment_type = formData.employment_type_id
  formData.work_arrangement_type = formData.work_arrangement_type_id
  delete formData.employment_type_id
  delete formData.work_arrangement_type_id
  let saveFun = createJobPosition
  if (props.isEdit) {
    formData.id = props.id
    saveFun = editJobPosition
  }
  saveFun(formData as JobPosition.JonPositionInfo).then(res => {
    if (res?.success) {
      ElMessage.success({ message: $t('message.saveSuc') })
      if (props.isEdit) {
        goBack()
      } else {
        router.replace({
          path: `/${ROUTER_JOB_POSITION}`
        })
      }
      return
    }
    ElMessage.error({ message: res?.message })
  }).catch(error => {
    console.error('Failed to save job position', error)
    ElMessage.error($t('jobPosition.jobSaveError'))
  })
}

const changeForm = (item: Form.FormItem) => {
  if (item.prop === 'work_location') {
    disabledWorkLocation(item)
  }
}

// Fill the dropdowns from one API call
const setOptions = (
  form: Form.FormItem[],
  prop: string,
  list?: JobPosition.FieldOption[],
  includeEmail = false
) => {
  const item = form.find(info => info.prop === prop)
  if (item) {
    item.options = (list ?? []).map(data => ({
      label: data.name,
      value: data.id,
      ...(includeEmail ? { subLabel: data.email } : {})
    }))
  }
}
const showFullTagText = (event: MouseEvent) => {
  const tag = (event.target as HTMLElement).closest('.el-select__tags-text') as HTMLElement | null
  if (tag && !tag.title) tag.title = tag.textContent?.trim() ?? ''
}
getJobFieldsData().then(res => {
  const data = res.result
  if (!res.success || !data) {
    throw new Error(res.message || 'Job fields are missing')
  }
  setOptions(state.baseForm, 'employment_type_id', data.employment_types)
  setOptions(state.baseForm, 'work_arrangement_type_id', data.work_arrangement_types)
  setOptions(state.hiringTeamForm, 'recruiters', data.recruiters, true)
  setOptions(state.hiringTeamForm, 'hiring_managers', data.hiring_managers, true)
  pipelineOptions.value = data.recruitment_pipelines.map(option => ({ label: option.name, value: option.id }))
  evaluationOptions.value = data.evaluation_plans.map(option => ({ label: option.name, value: option.id }))
  if (!Array.isArray(data.evaluation_plan_round_types) || !Array.isArray(data.recruitment_pipeline_round_types)
      || !Array.isArray(data.screening_questions_forms) || !Array.isArray(data.screening_question_types)) {
    throw new Error('Job form options or types are missing')
  }
  evaluationPlanRoundTypes.value = data.evaluation_plan_round_types
  recruitmentPipelineRoundTypes.value = data.recruitment_pipeline_round_types
  screeningForms.value = data.screening_questions_forms
  screeningQuestionTypes.value = data.screening_question_types
}).catch(error => {
  console.error('Failed to load job fields', error)
  ElMessage.error($t('jobPosition.fieldsLoadError'))
})

const disabledWorkLocation = (item: Form.FormItem) => {
  if (item?.value?.length > 0) {
    const value = item?.value?.[0]
    if (value >= WorkLocationEnum.CZECH || value === WorkLocationEnum.REMOTE) {
      item.options = item.options?.map((info: Form.FormSelect) => {
        if (info.label === $t('workLocationEnum.china')) {
          info.disabled = true
          info?.children?.forEach((child: Form.FormSelect) => {
            child.disabled = true
          })
        }
        return info
      })
    } else {
      item.options = item.options?.map((info: Form.FormSelect) => {
        if (info.label !== $t('workLocationEnum.china')) {
          info.disabled = true
          info?.children?.forEach((child: Form.FormSelect) => {
            child.disabled = true
          })
        }
        return info
      })
    }
    item.defaultExpendKeys = item?.value ?? []
  } else {
    item.options = item.options?.map((info: Form.FormSelect) => {
      info.disabled = false
      info?.children?.forEach((child: Form.FormSelect) => {
        child.disabled = false
      })
      return info
    })
  }
  return item
}

const getFormsByRes = (
  forms: Form.FormItem[],
  res: JobPosition.JobPositionDetail,
  formRef: any
) => {
  return forms.map((item: Form.FormItem) => {
    const responseFields: Record<string, keyof JobPosition.JobPositionDetail> = {
      employment_type_id: 'employment_type',
      work_arrangement_type_id: 'work_arrangement_type'
    }
    const prop = responseFields[item.prop] ?? (item.prop as keyof JobPosition.JobPositionDetail)
    if (['hr_coordinators', 'publish_channel', 'work_location', 'recruiters', 'hiring_managers'].includes(item.prop)) {
      const list = (res?.[prop] ?? []) as (CommonEnum.enumItem | string | number)[]
      item.value = list.map(info => {
        return typeof info === 'object' ? info.value ?? info.id : info
      })
    } else {
      if (isArray(res?.[prop])) {
        const arrVal = res?.[prop] as CommonEnum.enumItem[]
        item.value = arrVal.map((info: CommonEnum.enumItem) => {
          return info.value
        })
      } else if (item.prop === 'num_of_openings' && (res?.[prop] == null || res?.[prop] === '')) {
        item.value = 1
      } else {
        item.value = res?.[prop]
      }
    }
    if (item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT) {
      item.defaultExpendKeys = item?.value ?? []
    }
    formRef &&
      formRef.changeFormModel({
        prop: item.prop,
        value: item.value
      })
    return item
  })
}
const initData = () => {
  if (props.id) {
    getJobPositionDetail(props.id).then(res => {
      if (!res?.success || !res.result) throw new Error('Job details are missing')
      const result = (res.result ?? {}) as JobPosition.JobPositionDetail
      state.status = result?.status ?? 0
      state.baseForm = getFormsByRes(state.baseForm, result, espBasicRef.value)
      state.jobDesc = jobRichTextToHtml(result?.description)
      const index = state.baseForm.findIndex(item => item.prop === 'work_location')
      if (index !== -1) {
        state.baseForm[index] = disabledWorkLocation(state.baseForm[index])
      }
      state.internalDetailsForm = getFormsByRes(state.internalDetailsForm, result, espInternalDetailsRef.value)
      state.hiringTeamForm = getFormsByRes(state.hiringTeamForm, result, espHiringTeamRef.value)
      screeningQuestions.value = (result.screening_questions ?? []).map(({ screening_question_type_id, ...question }) => ({
        ...question, screening_question_type: screening_question_type_id
      })).sort((a, b) => a.order - b.order)
      recruitmentRounds.value = [...(result.recruitment_pipeline_rounds ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      evaluationRounds.value = [...(result.evaluation_plan_rounds ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      savedTabData.questions = JSON.stringify(questionPayload(screeningQuestions.value))
      savedTabData.pipeline = JSON.stringify(pipelinePayload(recruitmentRounds.value))
      savedTabData.evaluation = JSON.stringify(evaluationPayload(evaluationRounds.value))
      jobReady.value = true
    }).catch(error => {
      console.error('Failed to load job details', error)
      ElMessage.error($t('jobPosition.previewJobLoadError'))
    })
  }
}
const goBack = () => {
  if (router?.options?.history?.state?.back) {
    router.go(-1)
    return
  }
  router.replace({
    path: `/${ROUTER_JOB_POSITION}`
  })
}
onMounted(() => {
  if (props.isEdit) {
    initData()
  }
})
</script>
<style lang="less" scoped>
@import '@/styles/interviewer-select.less';

.template-select { width: 100%; margin-top: 16px; }

.job-tabs {
  padding: .8em 0 0;
  --el-tabs-header-height: 32px;

  :deep(.el-tabs__nav-wrap::after),
  :deep(.el-tabs__active-bar) {
    display: none;
  }

  :deep(.el-tabs__item) {
    padding: 0 1em !important;
    margin-right: .5em;
    color: var(--color-gray2);
    font-family: var(--font-family-bold);
    line-height: 1;

    &:hover {
      color: var(--el-color-primary);
    }
    &.is-active {
      background-color: var(--el-color-primary);
      color: var(--el-color-white);
      border-radius: var(--el-border-radius-round);
    }
  }
}
.tab-subtitle {
  color: var(--el-text-color-secondary);
  margin-bottom: 1em;
  font-size:13px;
}
</style>
