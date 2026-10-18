<template>
  <EspMain :title="`${$t('interviewer.interviewFeedback')} ${$t('cv.for')} ${interviewStore?.candidateName ?? ''}`" class="feedback-wrap">
    <template #left>
      <div class="type">{{ InterviewSession?.[interviewStore?.interviewType]?.name }}</div> 
    </template>
    <template #right>
      <template v-if="isView">
        <i class="iconfont icon-edit text-primary-gradient" @click="changeModeAndSetData(true, false)" v-if="!interviewStore?.readOnly"></i>
      </template>
      <template v-else>
        <ElButton @click="changeModeAndSetData(false, true)">{{ $t('button.cancel') }}</ElButton>
        <ElButton @click="submit" class="btn-primary-gradient">{{ $t('button.submit') }}</ElButton>
      </template>
    </template>
    <div class="detail">
      <div>{{ interviewStore?.interviewMode }}</div>
      <div>|</div>
      <div>{{ `${$t('emailTemplate.interviewTime')}: ${interviewStore?.interviewTime ?? ''}` }}</div>
    </div>
    <EspEditTable ref="tableRef" :columns="state.columns" />
  </EspMain>
</template>
<script setup lang="ts" name="FeedbackForm">
import MyInterview from '@/api/interface/myInterview'
import { getMyInterviewDetail, submitInterviewFeedback } from '@/api/modules/myInterview'
import { AbilityEvaluation } from '@/enums/abilityEvaluationEnum'
import { FeedbackResult } from '@/enums/myInterviewStatusEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { InterviewSession, InterviewSessionEnum } from '@/enums/interviewSessionEnum'
import { useLocale } from '@/hooks/useLocale'
import router from '@/router'
import { ROUTER_INTERVIEWER_MY_REVIEW } from '@/router/routerName'
import { useInterviewStore } from '@/store/modules/interview'
import { isEmpty } from '@/utils'
import { cloneDeep } from 'lodash'
import { OverallTechRating } from '@/enums/overallTechRatingEnum'
import { HR_INTERVIEW_FEEDBACK_TABLE, INDIA_INTERVIEW_FEEDBACK_TABLE, PROFESSIONAL_CEO_INTERVIEW_FEEDBACK_TABLE } from '../data'
const { $t } = useLocale()
const interviewStore = useInterviewStore()
const route = useRoute()
interface ParamsProps {
  isDetail?: boolean // 是否编辑
}

const props = withDefaults(defineProps<ParamsProps>(), {
  isDetail: false
})

const isView = ref<boolean>(props.isDetail)
const tableRef = ref()
interface StateProps {
  id: number
  columns: EditTable.TableColumns[]
}
const state = reactive<StateProps>({
  id: 0,
  columns: []
})

const getObjectByForms = (forms: EditTable.TableColumns[]) => {
  const obj: Record<string, any> = {} as Record<string, any>
  forms.forEach((item: EditTable.TableColumns) => {
    if (item.isParam) {
      const prop = item.prop as string
      if ((item.value || item.value === 0) && !isEmpty(item.prop)) {
        obj[prop] = item.value
      }
    }
    item?.columns?.forEach((col: EditTable.TableColumns) => {
      if (col.isParam) {
        const prop = col.prop as string
        if ((col.value || col.value === 0) && !isEmpty(col.prop)) {
          obj[prop] = col.value
        }
      }
    })
  })
  return obj
}

const submit = () => {
  const validate = tableRef.value.validateTable()
  if (validate) {
    const param: MyInterview.DetailInfo = getObjectByForms(tableRef.value.getTableData())
    param.interview_round_id = interviewStore.interviewRoundId
    param.candidate_resume_id = interviewStore.candidateResumeId
    if (state.id) {
      param.feedback_id = state.id
    } 
    submitInterviewFeedback(param).then(res => {
      if (res?.success) {
        ElMessage.success({ message: $t('message.submitSuc') })
        param.updated_at = res?.result?.updated_at ?? ''
        changeModeAndSetData(false, true, param)
      }
    })
  }
}

// 加载数据
const initData = () => {
  getMyInterviewDetail(state.id).then(res => {
    const result: MyInterview.DetailInfo = res?.result ?? {}
    changeModeAndSetData(!props.isDetail, false, result)
  })
}
// 返回列表页面
const goBack = () => {
  router.replace({
    path: `/${ROUTER_INTERVIEWER_MY_REVIEW}`
  })
}
// 切换编辑模式
const changeModeAndSetData = (isEdit: boolean, needJump: boolean, param?: MyInterview.DetailInfo) => {
  // create 提交/不是detail进去而是列表直接进去修改的提交/ cancel 返回到列表页面
  if (needJump && (!route.params?.id || !props.isDetail)) {
    goBack()
    return
  }
  isView.value = !isEdit
  state.columns.forEach(data => {
    if (param) {
      data.value = param?.[data.prop as keyof MyInterview.DetailInfo] as string | number ?? '' 
      data.text = data.value
    }
    if (isView.value) {
      data.type = FormItemTypeEnum.TEXT
    }
    data.isHide = isView.value && data.value === '' && !data.columns
    switch(data.prop) {
      case 'interviewer':
        data.value = interviewStore?.interviewers ?? ''
        if (param) {
          data.text = param?.updated_at ?? ''
        }
        data.isHide = false
        break
      case 'technical_language_skills':
      case 'domain_knowledge':
      case 'behavioural_competence':
      case 'adaptability':
      case 'leadership':
      case 'behavioral_cultural_fit':
        data.type = isEdit ? FormItemTypeEnum.TEXTAREA : FormItemTypeEnum.TEXT
        data.class = isEdit ? 'child' : ''
        break
      case 'interview_result':
        data.type = isEdit ? FormItemTypeEnum.RADIO : FormItemTypeEnum.TEXT 
        data.class = interviewStore.isIndiaPosition && !isView.value ? `${FeedbackResult?.[data.value!]?.status} short` : FeedbackResult?.[data.value!]?.status
        data.text = FeedbackResult?.[data.value!]?.name
        data.sort = isView.value && interviewStore.isIndiaPosition ? 1 : 11
        break
      case 'overall_tech_rating':
        data.type = isEdit ? FormItemTypeEnum.RADIO : FormItemTypeEnum.TEXT
        data.class = isEdit && interviewStore.isIndiaPosition ? 'short' : '' 
        data.text = OverallTechRating?.[data.value!]?.name
        data.sort = isView.value && interviewStore.isIndiaPosition ? 2 : 10
        break
      default:
        data.type = isEdit ? FormItemTypeEnum.TEXTAREA : FormItemTypeEnum.TEXT
        data.class = isEdit && interviewStore.isIndiaPosition ? 'short' : '' 
        break
    }
    if (data.columns) {
      data.columns.forEach(col => {
        col.type = isEdit ? FormItemTypeEnum.RADIO : FormItemTypeEnum.TEXT
        if (param) {
          col.value = param?.[col.prop as keyof MyInterview.DetailInfo] as string | number ?? '' 
        }
        col.text = AbilityEvaluation?.[col.value!]?.name
      })
    }
  })
  // 印度的评价 result在详情的时候放最前面
  if (interviewStore.isIndiaPosition) {
    state.columns.sort((a, b) => a.sort! - b.sort!)
  }
}
onMounted(() => {
  document.title = $t('title.feedbackDomTitle', { name: interviewStore?.candidateName ?? '' })
  if (interviewStore.isIndiaPosition) {
    state.columns = cloneDeep(INDIA_INTERVIEW_FEEDBACK_TABLE)
  } else if (interviewStore?.interviewType === InterviewSessionEnum.HR) {
    state.columns = cloneDeep(HR_INTERVIEW_FEEDBACK_TABLE)
  } else {
    state.columns = cloneDeep(PROFESSIONAL_CEO_INTERVIEW_FEEDBACK_TABLE)
  }
  if (route.params?.id) {
    state.id = Number(route.params?.id)
    initData()
  } else {
    // 新增页面设置从列表带过来的interviewer数据
    state.columns.forEach(data => {
      if(data.prop === 'interviewer') {
        data.value = interviewStore?.interviewers ?? ''
      }
    })
  }
})
</script>
<style scoped lang="less">
@import '../index.less';
</style>

