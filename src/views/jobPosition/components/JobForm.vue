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
    <EspForm ref="espDetailRef" :title="$t('jobPosition.jobDetail')" v-model="state.detailForm" />
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
  JOB_POSITION_DETAIL_FORM,
  JOB_POSITION_OTHER_FORM,
  JOB_POSITION_QUESTIONS_FORM
} from '../data'
import { getObjectByForms, isEmpty } from '@/utils'
import { JobStatusEnum, JobStatus } from '@/enums/jobStatusEnum'
import { createJobPosition, editJobPosition, getJobPositionDetail } from '@/api/modules/jobPosition'
import JobPosition from '@/api/interface/jobPosition'
import { WorkLocationEnum } from '@/enums/workLocationEnum'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_JOB_POSITION } from '@/router/routerName'
import { isArray } from '@/utils/is'
import { getInterviewProcessTemplates } from '@/api/modules/adminRecruitmentProject'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'

interface ParamsProps {
  title: string // 标题
  id?: number // 数据ID
  isEdit: boolean // 是否编辑
}
interface ReactiveParams {
  status?: string | number // 状态
  baseForm: Form.FormItem[]
  detailForm: Form.FormItem[]
  otherForm: Form.FormItem[]
  questionForm: Form.FormItem[]
}

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false
})

const router = useRouter()
const { $t } = useLocale()

const espBasicRef = ref()
const espDetailRef = ref()
const espOtherRef = ref()
const state = reactive<ReactiveParams>({
  status: undefined,
  baseForm: cloneDeep(JOB_POSITION_BASIC_FORM),
  detailForm: cloneDeep(JOB_POSITION_DETAIL_FORM),
  otherForm: cloneDeep(JOB_POSITION_OTHER_FORM),
  questionForm: cloneDeep(JOB_POSITION_QUESTIONS_FORM)
})

const save = async () => {
  const isBasicError = espBasicRef.value.validateFrom && (await espBasicRef.value.validateFrom())
  const isDetailError =
    espDetailRef.value.validateFrom &&
    (await espDetailRef.value.validateFrom(null, null, isBasicError))
  const isOtherError =
    espOtherRef.value.validateFrom &&
    (await espOtherRef.value.validateFrom(null, null, isDetailError))
  if (isBasicError && isDetailError && isOtherError) {
    const baseForm = getObjectByForms(state.baseForm)
    const detailForm = getObjectByForms(state.detailForm)
    const otherForm = getObjectByForms(state.otherForm)
    const questionForm = getObjectByForms(state.questionForm)
    const questions = Object.values(questionForm) ?? []
    const formData: Record<string, any> = { ...baseForm, ...detailForm, ...otherForm }
    formData.extended_questions = questions
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
}

const changeForm = (item: Form.FormItem) => {
  if (item.prop === 'work_location') {
    disabledWorkLocation(item)
    if (item.value && item.value?.length > 0) {
      // 获取worklocation对应的interview process模版
      getInterviewProcessTemplates({ work_location: item.value }).then(res => {
        const list = res?.result ?? []
        const options = list?.map(data => {
          return {
            label: data.name,
            value: data.id
          }
        })
        const index = state.otherForm.findIndex(info => info.prop === 'interview_process_templates')
        state.otherForm[index].options = [...options]
        state.otherForm[index].value = undefined
      })
    }
  }
}

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
    let prop = item.prop as keyof JobPosition.JobPositionDetail
    if (['hr_coordinators', 'publish_channel', 'work_location'].includes(item.prop)) {
      const list = (res?.[prop] ?? []) as CommonEnum.enumItem[]
      item.value = list.map(info => {
        return info.value ?? info.id
      })
    } else {
      if (item.prop === 'hr_recruiter') {
        prop = 'hr_recruiter_id'
      }
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
      state.detailForm = getFormsByRes(state.detailForm, result, espDetailRef.value)
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
      const worklocationIds = (result?.work_location as CommonEnum.enumItem[])?.map(
        info => info.value
      )
      const interviewProcessTemplates =
        result?.interview_process_templates?.map(info => info.id) ?? []
      // 获取worklocation对应的interview process模版
      getInterviewProcessTemplates({ work_location: worklocationIds as number[] }).then(resData => {
        const list = resData?.result ?? []
        const options = list?.map(data => {
          return {
            label: data.name,
            value: data.id
          }
        })
        const index = state.otherForm.findIndex(info => info.prop === 'interview_process_templates')
        state.otherForm[index].options = [...options]
        state.otherForm[index].value = [...interviewProcessTemplates]
      })
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
nextTick(() => {
  if (props.isEdit) {
    setTimeout(() => {
      initData()
    }, 100)
    return
  }
})

nextTick(() => {})
</script>
