<template>
  <EspMain :title="title">
    <template #left v-if="!isEmpty(state.status as string)">
      <EspStatus :type="JobStatus?.[state.status as number]?.status ?? ''">{{
        JobStatusEnum?.[state.status as number]
      }}</EspStatus>
    </template>
    <template #right>
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
    </template>
    <EspForm
      ref="espBasicRef"
      :title="$t('jobPosition.basicInformation')"
      :changeForm="changeForm"
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
            />
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <EspQuillEditor
              ref="jobReqRef"
              v-model:content="state.jobReq"
              :label="$t('jobPosition.mandatoryRequirements')"
              :select-options="[]"
              :hide-insert-field="true"
              :compact="true"
            />
          </el-col>
          <el-col :span="12">
            <EspQuillEditor
              ref="jobPrefReqRef"
              v-model:content="state.jobPrefReq"
              :label="$t('jobPosition.preferredRequirements')"
              :select-options="[]"
              :hide-insert-field="true"
              :compact="true"
              :required="false"
            />
          </el-col>
        </el-row>
      </template>
    </EspForm>
    <EspForm
      ref="espOtherRef"
      :title="$t('jobPosition.otherInformation')"
      v-model="state.otherForm"
    />
    <EspForm :title="$t('jobPosition.screeningQuestions')" v-model="state.questionForm" />
  </EspMain>
</template>
<script setup lang="ts" name="JobPositionForm">
import { cloneDeep } from 'lodash-es'
import {
  JOB_POSITION_BASIC_FORM,
  JOB_POSITION_OTHER_FORM,
  JOB_POSITION_QUESTIONS_FORM
} from '../data'
import { getObjectByForms, isEmpty } from '@/utils'
import { JobStatusEnum, JobStatus } from '@/enums/jobStatusEnum'
import {
  createJobPosition,
  editJobPosition,
  getJobFieldsData,
  getJobPositionDetail
} from '@/api/modules/jobPosition'
import JobPosition from '@/api/interface/jobPosition'
import { WorkLocationEnum } from '@/enums/workLocationEnum'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_JOB_POSITION } from '@/router/routerName'
import { isArray } from '@/utils/is'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'

interface ParamsProps {
  title: string // 标题
  id?: string // 数据ID
  isEdit: boolean // 是否编辑
}
interface ReactiveParams {
  status?: string | number // 状态
  baseForm: Form.FormItem[]
  jobDesc: string
  jobReq: string
  jobPrefReq: string
  otherForm: Form.FormItem[]
  questionForm: Form.FormItem[]
}

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false
})

const router = useRouter()
const { $t } = useLocale()

const espBasicRef = ref()
const jobDescRef = ref()
const jobReqRef = ref()
const jobPrefReqRef = ref()
const espOtherRef = ref()
const state = reactive<ReactiveParams>({
  status: undefined,
  baseForm: cloneDeep(JOB_POSITION_BASIC_FORM),
  jobDesc: '',
  jobReq: '',
  jobPrefReq: '',
  otherForm: cloneDeep(JOB_POSITION_OTHER_FORM),
  questionForm: cloneDeep(JOB_POSITION_QUESTIONS_FORM)
})

const save = async () => {
  const isBasicError = espBasicRef.value.validateFrom && (await espBasicRef.value.validateFrom())
  // Validate both editors so both show their error, not just the first
  const descValid = jobDescRef.value?.validate()
  const reqValid = jobReqRef.value?.validate()
  const isDetailError = !!(descValid && reqValid)
  const isOtherError =
    espOtherRef.value.validateFrom &&
    (await espOtherRef.value.validateFrom(null, null, isDetailError))
  if (isBasicError && isDetailError && isOtherError) {
    const baseForm = getObjectByForms(state.baseForm)
    const detailForm = {
      description: jobDescRef.value.getContent(),
      mandatory_requirements: jobReqRef.value.getContent(),
      preferred_requirements: jobPrefReqRef.value.getContent()
    }
    const otherForm = getObjectByForms(state.otherForm)
    const questionForm = getObjectByForms(state.questionForm)
    const questions = Object.values(questionForm) ?? []
    const formData: Record<string, any> = { ...baseForm, ...detailForm, ...otherForm }
    formData.extended_questions = questions
    let saveFun = createJobPosition
    if (props.isEdit) {
      formData.id = props.id
      saveFun = editJobPosition
    } else {
      formData.employment_type = formData.employment_type_id
      formData.evaluation_plan = formData.evaluation_plan_id
      formData.recruitment_pipeline = formData.recruitment_pipeline_id
      formData.work_arrangement_type = formData.work_arrangement_type_id
      delete formData.employment_type_id
      delete formData.evaluation_plan_id
      delete formData.recruitment_pipeline_id
      delete formData.work_arrangement_type_id
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
}

const changeForm = (item: Form.FormItem) => {
  if (item.prop === 'work_location') {
    disabledWorkLocation(item)
  }
}

// Fill the dropdowns from one API call
const setOptions = (form: Form.FormItem[], prop: string, list?: JobPosition.FieldOption[]) => {
  const item = form.find(info => info.prop === prop)
  if (item) {
    item.options = (list ?? []).map(data => ({ label: data.name, value: data.id }))
  }
}
getJobFieldsData().then(res => {
  const data = res?.result
  setOptions(state.baseForm, 'employment_type_id', data?.employment_types)
  setOptions(state.baseForm, 'work_arrangement_type_id', data?.work_arrangement_types)
  setOptions(state.otherForm, 'recruiters', data?.recruiters)
  setOptions(state.otherForm, 'recruitment_pipeline_id', data?.recruitment_pipelines)
  setOptions(state.otherForm, 'evaluation_plan_id', data?.evaluation_plans)
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
    if (['hr_coordinators', 'publish_channel', 'work_location', 'recruiters'].includes(item.prop)) {
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
      const result = (res.result ?? {}) as JobPosition.JobPositionDetail
      state.status = result?.status ?? 0
      state.baseForm = getFormsByRes(state.baseForm, result, espBasicRef.value)
      // Values saved before the rich-text editor are plain text: keep their line breaks
      const toHtml = (text?: string) =>
        !text || text.trim().startsWith('<')
          ? (text ?? '')
          : text
              .split('\n')
              .map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;') || '<br>'}</p>`)
              .join('')
      state.jobDesc = toHtml(result?.description)
      state.jobReq = toHtml(result?.mandatory_requirements)
      state.jobPrefReq = toHtml(result?.preferred_requirements)
      const index = state.baseForm.findIndex(item => item.prop === 'work_location')
      if (index !== -1) {
        state.baseForm[index] = disabledWorkLocation(state.baseForm[index])
      }
      const extendedQuestions = result?.extended_questions ?? []
      if (extendedQuestions?.length) {
        extendedQuestions.forEach((item, index) => {
          if (state.questionForm[index]) {
            state.questionForm[index].value = item
          }
        })
      }
      state.otherForm = getFormsByRes(state.otherForm, result, espOtherRef.value)
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
