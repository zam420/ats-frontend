<template>
  <EspMain :title="state.jobTitle">
    <template #left>
      <EspStatus :type="JobStatus?.[state.status as number]?.status ?? ''">{{
        JobStatusEnum?.[state.status as number]
      }}</EspStatus>
    </template>
    <template #right>
      <EspIcon @click="showEdit" :permission="UserPermissionEnum.JPE" class="icon-edit" />
      <!-- <i class="iconfont icon-send text-primary-gradient"></i> -->
    </template>
    <EspDetail
      class="first"
      :title="$t('jobPosition.basicInformation')"
      :data="state.basicDetailForm"
    />
    <EspDetail label-position="top" :title="$t('jobPosition.jobDetail')" :data="state.detailForm" />
    <EspDetail :title="$t('jobPosition.otherInformation')" :data="state.otherDetailForm" />
    <EspDetail
      v-if="state.extendedQuestions.length"
      :title="$t('jobPosition.screeningQuestions')"
      :data="state.questionForm"
    />
    <EspDetail :is-small="true" :gutter="32" :data="state.createdDetailForm" />
  </EspMain>
</template>
<script setup lang="ts" name="JobPOsitionDetail">
import { getJobPositionDetail } from '@/api/modules/jobPosition'
import {
  JOB_POSITION_CREATED_DETAIL,
  JOB_POSITION_BASIC_DETAIL,
  JOB_POSITION_DETAIL_DETAIL,
  JOB_POSITION_OTHER_DETAIL,
  JOB_POSITION_QUESTIONS_DETAIL
} from './data'
import { JobStatusEnum, JobStatus } from '@/enums/jobStatusEnum'
import { ROUTER_JOB_POSITION, ROUTER_JOB_POSITION_EDIT } from '@/router/routerName'
import { cloneDeep } from 'lodash-es'
import JobPosition from '@/api/interface/jobPosition'
import { isArray, isString } from '@/utils/is'
import { UserPermissionEnum } from '@/enums/userPermission'
import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()
interface ReactiveParams {
  createdDetailForm: Form.FormItem[]
  basicDetailForm: Form.FormItem[]
  detailForm: Form.FormItem[]
  otherDetailForm: Form.FormItem[]
  questionForm: Form.FormItem[]
  extendedQuestions: string[]
  id: number | string
  jobTitle: string
  status: number
}

const route = useRoute()
const router = useRouter()
const state = reactive<ReactiveParams>({
  id: '',
  createdDetailForm: cloneDeep(JOB_POSITION_CREATED_DETAIL),
  basicDetailForm: cloneDeep(JOB_POSITION_BASIC_DETAIL),
  detailForm: cloneDeep(JOB_POSITION_DETAIL_DETAIL),
  otherDetailForm: cloneDeep(JOB_POSITION_OTHER_DETAIL),
  questionForm: cloneDeep(JOB_POSITION_QUESTIONS_DETAIL),
  extendedQuestions: [],
  jobTitle: '',
  status: 0
})

const getFormsByRes = (forms: Form.FormItem[], res: JobPosition.JobPositionDetail) => {
  return forms.map((item: Form.FormItem) => {
    const prop = item.prop as keyof JobPosition.JobPositionDetail
    let value: string | string[]
    if (isArray(res?.[prop])) {
      const arrVal = res?.[prop] as CommonEnum.enumItem[]
      const arr: string[] = arrVal.map((info: CommonEnum.enumItem) => {
        if (item.enum) {
          return item.enum?.[info.value].name ?? info.name
        }
        return info.name
      })
      value = arr.join(', ')
    } else if (item.enum) {
      value = item.enum?.[res?.[prop] as string]?.name ?? res?.[prop]
    } else {
      value = res?.[prop] as string
    }
    if ((typeof value != 'boolean') && value && value?.includes('\n') && isString(value)) {
      value = value.split('\n')
    }
    item.value = value
    return item
  })
}

const initData = () => {
  if (route.params?.id) {
    getJobPositionDetail(route.params.id as string).then(res => {
      const result = (res.result ?? {}) as JobPosition.JobPositionDetail
      state.jobTitle = result?.title ?? ''
      state.id = result?.id
      state.status = result?.status ?? 0
      state.createdDetailForm = getFormsByRes(state.createdDetailForm, result)
      state.basicDetailForm = getFormsByRes(state.basicDetailForm, result)
      state.detailForm = getFormsByRes(state.detailForm, result)
      state.extendedQuestions = result?.extended_questions ?? []
      if (state.extendedQuestions?.length) {
        state.extendedQuestions.forEach((item, index) => {
          if (state.questionForm[index]) {
            state.questionForm[index].value = item
          }
        })
      }
      state.otherDetailForm = getFormsByRes(state.otherDetailForm, result)
      const interviewProcessTemplates =
        result?.interview_process_templates?.map(info => info.name) ?? []
      const index = state.otherDetailForm.findIndex(
        info => info.prop === 'interview_process_templates'
      )
      state.otherDetailForm[index].value = interviewProcessTemplates?.join(', ')
      const feedbackIndex = state.otherDetailForm.findIndex(
        info => info.prop === 'public_interview_feedback'
      )
      state.otherDetailForm[feedbackIndex].value = result?.public_interview_feedback ? $t('cv.yes') : $t('cv.no')
    })
  } else {
    router.replace({
      path: `/${ROUTER_JOB_POSITION}`
    })
  }
}
const showEdit = () => {
  router.push({
    path: `/${ROUTER_JOB_POSITION_EDIT}/${state.id}`
  })
}

onMounted(() => {
  initData()
})
</script>
<style scoped lang="less">
:deep(.esp-detail-wrap) {
  &.first {
    margin-top: 2.2em;
  }
}
</style>
