<template>
  <EspMain :title="title">
    <template #left v-if="!isEmpty(state.status as string)">
      <EspStatus :type="statusType">{{ statusText }}</EspStatus>
    </template>
    <template #right>
      <ElButton v-if="!readOnly" :disabled="!jobReady" @click="preview">{{ $t('jobPosition.previewButton') }}</ElButton>
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton v-if="!readOnly" @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
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
      </el-tab-pane>
      <el-tab-pane :label="$t('jobPosition.recruitmentPipeline')" name="pipeline">
        <p v-if="!readOnly" class="tab-subtitle">{{ $t('jobPosition.pipelineTabSubtitle') }}</p>
        <EspForm v-if="!readOnly" ref="espPipelineRef" v-model="state.pipelineForm" />
        <RecruitmentPipelineForm
          v-if="selectedPipelineId"
          :key="selectedPipelineId"
          :id="selectedPipelineId"
          :title="''"
          :is-edit="true"
          :read-only="true"
          :stages-only="true"
          :hide-preview-errors="readOnly"
          :round-types="recruitmentPipelineRoundTypes"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('jobPosition.interviewProcessTemplate')" name="evaluation">
        <p v-if="!readOnly" class="tab-subtitle">{{ $t('jobPosition.evaluationTabSubtitle') }}</p>
        <EspForm v-if="!readOnly" ref="espEvaluationRef" v-model="state.evaluationForm" />
        <EvaluationForm
          v-if="selectedEvaluationId"
          :key="selectedEvaluationId"
          :id="selectedEvaluationId"
          :title="''"
          :is-edit="true"
          :rounds-only="true"
          :read-only="readOnly"
          :hide-preview-errors="readOnly"
          :round-types="evaluationPlanRoundTypes"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('jobPosition.evaluationFeedback')" name="feedback">
        <p class="tab-subtitle">{{ $t('jobPosition.feedbackTabSubtitle') }}</p>
      </el-tab-pane>
    </el-tabs>
  </EspMain>
</template>
<script setup lang="ts" name="JobPositionForm">
import { cloneDeep } from 'lodash-es'
import type { FormRules } from 'element-plus'
import {
  JOB_POSITION_BASIC_FORM,
  JOB_POSITION_INTERNAL_DETAILS_FORM,
  JOB_POSITION_HIRING_TEAM_FORM,
  JOB_POSITION_PIPELINE_FORM,
  JOB_POSITION_EVALUATION_FORM
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
import { newPreviewStorageKey } from '../jobPreview'

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
  pipelineForm: Form.FormItem[]
  evaluationForm: Form.FormItem[]
}

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false
})

const router = useRouter()
const { $t } = useLocale()

const activeTab = ref('description')
const jobReady = ref(!props.isEdit)
const evaluationPlanRoundTypes = ref<InterviewProcess.RoundType[]>([])
const recruitmentPipelineRoundTypes = ref<RecruitmentPipeline.RoundType[]>([])
const espBasicRef = ref()
const jobDescRef = ref()
const espInternalDetailsRef = ref()
const espHiringTeamRef = ref()
const espPipelineRef = ref()
const espEvaluationRef = ref()
const state = reactive<ReactiveParams>({
  status: undefined,
  baseForm: cloneDeep(JOB_POSITION_BASIC_FORM),
  jobDesc: '',
  internalDetailsForm: cloneDeep(JOB_POSITION_INTERNAL_DETAILS_FORM),
  hiringTeamForm: cloneDeep(JOB_POSITION_HIRING_TEAM_FORM),
  pipelineForm: cloneDeep(JOB_POSITION_PIPELINE_FORM),
  evaluationForm: cloneDeep(JOB_POSITION_EVALUATION_FORM)
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
const selectedPipelineId = computed(() => {
  const value = state.pipelineForm.find(item => item.prop === 'recruitment_pipeline_id')?.value
  return value == null || value === '' ? '' : String(value)
})
const selectedEvaluationId = computed(() => {
  const value = state.evaluationForm.find(item => item.prop === 'evaluation_plan_id')?.value
  return value == null || value === '' ? '' : String(value)
})

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
      workLocation
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
  const pipelineValid = await espPipelineRef.value.validateFrom(null, null, false)
  const evaluationValid = await espEvaluationRef.value.validateFrom(null, null, false)
  if (!basicValid || !descValid || !internalDetailsValid || !hiringTeamValid || !pipelineValid || !evaluationValid) {
    activeTab.value = !basicValid || !descValid
      ? 'description'
      : !internalDetailsValid || !hiringTeamValid ? 'configuration' : !pipelineValid ? 'pipeline' : 'evaluation'
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
    ...getObjectByForms(state.hiringTeamForm),
    ...getObjectByForms(state.pipelineForm),
    ...getObjectByForms(state.evaluationForm)
  }
  formData.hiring_managers = state.hiringTeamForm.find(item => item.prop === 'hiring_managers')?.value ?? []
  formData.employment_type = formData.employment_type_id
  formData.evaluation_plan = formData.evaluation_plan_id
  formData.recruitment_pipeline = formData.recruitment_pipeline_id
  formData.work_arrangement_type = formData.work_arrangement_type_id
  delete formData.employment_type_id
  delete formData.evaluation_plan_id
  delete formData.recruitment_pipeline_id
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
  setOptions(state.pipelineForm, 'recruitment_pipeline_id', data.recruitment_pipelines)
  setOptions(state.evaluationForm, 'evaluation_plan_id', data.evaluation_plans)
  if (!Array.isArray(data.evaluation_plan_round_types) || !Array.isArray(data.recruitment_pipeline_round_types)) {
    throw new Error('Job round types are missing')
  }
  evaluationPlanRoundTypes.value = data.evaluation_plan_round_types
  recruitmentPipelineRoundTypes.value = data.recruitment_pipeline_round_types
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
      work_arrangement_type_id: 'work_arrangement_type',
      recruitment_pipeline_id: 'recruitment_pipeline',
      evaluation_plan_id: 'evaluation_plan'
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
      state.pipelineForm = getFormsByRes(state.pipelineForm, result, espPipelineRef.value)
      state.evaluationForm = getFormsByRes(state.evaluationForm, result, espEvaluationRef.value)
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
