<template>
  <EspMain title="" customClass="cv-main-container">
    <div class="cv-detail-wrap">
      <EspResumeDetail ref="espResumeDetailRef" />
    </div>
    <!-- 转发简历反馈按钮 -->
    <div class="resume-opt-panel" v-if="Number(status) !== InterviewerStatusEnum.SUITABLE && Number(status) !== InterviewerStatusEnum.UNSUITABLE && isHasPermission(UserPermissionEnum.CRFS) && forwardId">
      <ElButton
        :icon="CircleCheck"
        @click="feedBack(InterviewerStatusEnum.SUITABLE)"
        class="btn-primary-gradient"
        >{{ $t('interviewer.feedbackFit') }}</ElButton>
      <ElButton
        :icon="CircleClose"
        @click="feedBack(InterviewerStatusEnum.UNSUITABLE)"
        class="btn-primary-gradient"
        >{{ $t('interviewer.feedbackUnfit') }}</ElButton>
      <ElButton
        :icon="Remove"
        @click="feedBack(InterviewerStatusEnum.HOLD)"
        :class="{ 'btn-primary-gradient': false, 'btn-primary': true, 'btn-light': true }"
        >{{ $t('interviewer.hold') }}</ElButton>
    </div>
    <!-- 转发笔试反馈按钮 -->
    <div class="resume-opt-panel" v-if="Number(status) !== TestInterviewStatusEnum.SUITABLE && Number(status) !== TestInterviewStatusEnum.UNSUITABLE && isHasPermission(UserPermissionEnum.CRFS) && examForwardId">
      <ElButton
        :icon="CircleCheck"
        @click="testFeedBack(TestInterviewStatusEnum.SUITABLE)"
        class="btn-primary-gradient"
        >{{ $t('interviewer.feedbackFit') }}</ElButton>
      <ElButton
        :icon="CircleClose"
        @click="testFeedBack(TestInterviewStatusEnum.UNSUITABLE)"
        class="btn-primary-gradient"
        >{{ $t('interviewer.feedbackUnfit') }}</ElButton>
    </div>
  </EspMain>
</template>
<script setup lang="ts" name="CVDetail">
import CV from '@/api/interface/cv'
import { CircleClose, CircleCheck, Remove } from '@element-plus/icons-vue'
import { InterviewerStatusEnum } from '@/enums/interviewerEnum'
import { UserPermissionEnum } from '@/enums/userPermission'
import { TestInterviewStatusEnum } from '@/enums/testInterviewStatusEnum'
import { deleteCV, getCVDetail, viewCandidateResumeRecord } from '@/api/modules/cv' //duplicationInfoList
import {
  ROUTER_CV_MANAGEMENT,
  ROUTER_CV_MANAGEMENT_DETAIL,
  ROUTER_CV_MANAGEMENT_EDIT
} from '@/router/routerName'
import { cloneDeep } from 'lodash-es'
import {
  CV_BASIC_DETAIL,
  CV_JOB_INTENTION_DETAIL,
  EDUCATION_BACKGROUND_DETAIL,
  WORK_EXPERIENCE_DETAIL,
  PROJECT_EXPERIENCE_DETAIL,
  SKILLS_PROFICIENCY_DETAIL,
  LANGUAGES_PROFICIENCY_DETAIL,
  SELF_ASSESSMENT_DETAIL,
  OTHER_INFORMATION_DETAIL,
  QUESTION_DETAIL,
  CV_CREATED_DETAIL
} from './data'
import { Degree } from '@/enums/degreeEnum'
import { DetailUserInfo } from '@/api/interface'
import moment from 'moment'
import { MONTH_DOTTED } from '@/config'
import { useLocale } from '@/hooks/useLocale'
import { CandidateStatus } from '@/enums/candidateStatusEnum'
import { isString } from '@/utils/is'
import { ApplicationInfo } from '@/components/EspResumeDetail/interface'
import { isHasPermission } from '@/utils'
interface ParamsProps {
  baseForm: Form.DetailItem[]
  jobIntentionForm: Form.DetailItem[]
  educationForm: Form.DetailItem[][]
  workForm: Form.DetailItem[][]
  projectForm: Form.DetailItem[][]
  skillForm: Form.DetailItem[]
  languageForm: Form.DetailItem[][]
  assessmentForm: Form.DetailItem[]
  otherForm: Form.DetailItem[]
  questionForm: Form.DetailItem[][]
  createForm: Form.DetailItem[]
  cvInfo: CV.CVDetail
  useInfo: DetailUserInfo
  duplications: CV.DuplicationInfo[]
}

const route = useRoute()
const router = useRouter()
const { $t } = useLocale()
const espResumeDetailRef = ref()
const status = route?.query?.status ?? ''
// feedback相关
const forwardId = route?.query?.forward_id ?? ''
const examForwardId = route?.query?.exam_forward_id ?? ''

const state = reactive<ParamsProps>({
  baseForm: cloneDeep(CV_BASIC_DETAIL),
  jobIntentionForm: cloneDeep(CV_JOB_INTENTION_DETAIL),
  educationForm: [cloneDeep(EDUCATION_BACKGROUND_DETAIL)],
  workForm: [cloneDeep(WORK_EXPERIENCE_DETAIL)],
  projectForm: [cloneDeep(PROJECT_EXPERIENCE_DETAIL)],
  skillForm: cloneDeep(SKILLS_PROFICIENCY_DETAIL),
  languageForm: [cloneDeep(LANGUAGES_PROFICIENCY_DETAIL)],
  assessmentForm: cloneDeep(SELF_ASSESSMENT_DETAIL),
  otherForm: cloneDeep(OTHER_INFORMATION_DETAIL),
  questionForm: [cloneDeep(QUESTION_DETAIL)],
  createForm: cloneDeep(CV_CREATED_DETAIL),
  cvInfo: {} as CV.CVDetail,
  useInfo: {} as DetailUserInfo,
  duplications: []
})

const getFormsByRes = (forms: Form.DetailItem[], res: CV.CVDetail) => {
  return forms.map((item: Form.DetailItem) => {
    const prop = item.prop as keyof CV.CVDetail
    if (prop === 'native_place_province') {
      if (res?.native_place_province) {
        item.value = `${res?.native_place_province}`
      }
      if (res?.native_place_city) {
        item.value = `${item.value ? item.value + ' /' : ''} ${res?.native_place_city}`
      }
    } else if (prop === 'interviewers') {
      item.value = res?.[prop]?.map((data: CV.PrivacyInterviewer) => data.name)?.join(', ')
    } else if (item.enum) {
      item.value = item.enum?.[res?.[prop] as string]?.name ?? res?.[prop]
    } else {
      item.value = res?.[prop]
    }
    if (item.value && isString(item.value) && item.value?.includes('\n')) {
      item.value = item.value.split('\n')
    }
    return item
  })
}

const getFormListDate = <T extends { date_from: string; date_to: string; up_to_now?: boolean }>(
  forms: Form.DetailItem[],
  list: T[]
) => {
  const newForms: Form.DetailItem[][] = []
  list.forEach(item => {
    const form = cloneDeep(forms).map(form => {
      const prop = form.prop as keyof T
      if (form.enum) {
        form.value = form.enum?.[item?.[prop] as string]?.name ?? item?.[prop]
      } else {
        form.value = item?.[prop]
      }
      if (form.hasTime) {
        let date_to = item?.date_to ? moment(item?.date_to).format(MONTH_DOTTED) : item?.date_to
        const date_from = item?.date_from
          ? moment(item?.date_from).format(MONTH_DOTTED)
          : item?.date_from
        if (item.up_to_now) {
          date_to = $t('button.toThisDay')
        }
        if (date_from && date_to) {
          form.timeValue = `${date_from}-${date_to}`
        }
      }
      if (form.value && isString(form.value) && form.value?.includes('\n')) {
        form.value = form.value.split('\n')
      }
      return form
    })
    newForms.push(form)
  })
  return newForms
}

const getFormListByRes = <T extends {}>(forms: Form.DetailItem[], list: T[]) => {
  const newForms: Form.DetailItem[][] = []
  list.forEach(item => {
    const form = cloneDeep(forms).map(form => {
      const prop = form.prop as keyof T
      form.value = item?.[prop]
      if (form.value?.includes('\n')) {
        form.value = form.value?.split('\n')
      }
      return form
    })
    newForms.push(form)
  })
  return newForms
}

const getSkillName = (forms: Form.DetailItem[], res: CV.Skills[]) => {
  if (res.length === 0) {
    return []
  }
  return forms.map((item: Form.DetailItem) => {
    const prop = item.prop as keyof CV.Skills
    item.value = res.map(info => {
      return info?.[prop]
    })
    return item
  })
}

const viewResume = (id: number) => {
  // 调用后端接口，传递简历 ID
  viewCandidateResumeRecord(id)
    .then(() => {
      console.log(`简历 ${id} 已查看！`)
    })
    .catch(err => {
      console.error(`上报简历查看 ${id} 失败:`, err)
    })
}

let timeoutId: ReturnType<typeof setTimeout> | null = null
const initData = () => {
  if (route.params?.id) {
    getCVDetail(route.params.id as string).then(res => {
      const result = (res.result ?? {}) as CV.CVDetail
      state.cvInfo = result
      // 设置一个函数来启动定时器
      const startTimer = () => {
        timeoutId = setTimeout(() => {
          viewResume(Number(route.params.id))
        }, 15000) // 15秒 = 15000毫秒
      }

      // 监听页面的可见性变化
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && timeoutId) {
          // 页面不可见时，清理定时器
          clearTimeout(timeoutId)
          timeoutId = null
          console.log('页面隐藏，取消简历查看上报！')
        } else if (document.visibilityState === 'visible') {
          // 页面重新变得可见时，清理旧定时器并重新开始
          if (timeoutId) {
            clearTimeout(timeoutId)
          }
          console.log('页面可见，重新开始计时！')
          startTimer() // 重新启动定时器
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      document.title = $t('title.resumeDetail', { name: result?.name })
      state.duplications = result?.duplications ?? []
      state.useInfo = getUserInfo(result)
      state.baseForm = getFormsByRes(cloneDeep(CV_BASIC_DETAIL), result)
      state.jobIntentionForm = getFormsByRes(cloneDeep(CV_JOB_INTENTION_DETAIL), result)
      state.educationForm = getFormListDate<CV.EducationHistories>(
        EDUCATION_BACKGROUND_DETAIL,
        result?.education_histories ?? []
      )

      state.workForm = getFormListDate<CV.WorkExperiences>(
        WORK_EXPERIENCE_DETAIL,
        result?.work_experiences ?? []
      )
      state.projectForm = getFormListDate<CV.ProjectExperiences>(
        PROJECT_EXPERIENCE_DETAIL,
        result?.project_experiences ?? []
      )
      state.skillForm = getSkillName(cloneDeep(SKILLS_PROFICIENCY_DETAIL), result?.skills ?? [])

      state.languageForm = getFormListByRes<CV.Languages>(
        LANGUAGES_PROFICIENCY_DETAIL,
        result?.languages ?? []
      )
      if (result?.self_assessment) {
        state.assessmentForm = getFormsByRes(cloneDeep(SELF_ASSESSMENT_DETAIL), result)
      } else {
        state.assessmentForm = []
      }

      state.otherForm = getFormsByRes(cloneDeep(OTHER_INFORMATION_DETAIL), result)

      state.questionForm = getFormListByRes<CV.Question>(QUESTION_DETAIL, result?.extended_qa ?? [])

      state.createForm = getFormsByRes(cloneDeep(CV_CREATED_DETAIL), result)

      initApplicationDetail()
    })
  } else {
    router.replace({
      path: `/${ROUTER_CV_MANAGEMENT}`
    })
  }
}

const initApplicationDetail = () => {
  espResumeDetailRef.value &&
    espResumeDetailRef.value.acceptParams({
      userInfo: state.useInfo,
      cvInfo: state.cvInfo,
      applicationDetailList: [
        initDetailObj({
          title: $t('table.basicInformation'),
          data: state.baseForm,
          className: 'basic-info-wrap'
        }),
        initDetailObj({
          title: $t('cv.jobIntention'),
          data: state.jobIntentionForm
        }),
        initDetailObj({
          title: $t('cv.educationBackground'),
          data: state.educationForm
        }),
        initDetailObj({
          title: $t('cv.workExperience'),
          data: state.workForm,
          labelPosition: 'top'
        }),
        initDetailObj({
          title: $t('cv.projectExperience'),
          data: state.projectForm,
          labelPosition: 'top'
        }),
        initDetailObj({
          title: $t('cv.skillsProficiency'),
          data: state.skillForm
        }),
        initDetailObj({
          title: $t('cv.languageProficiency'),
          data: state.languageForm,
          className: 'language-detail-wrap'
        }),
        initDetailObj({
          title: $t('cv.selfAssessment'),
          data: state.assessmentForm,
          labelPosition: 'top'
        }),
        initDetailObj({
          title: $t('table.screeningQuestions'),
          data: state.questionForm
        }),
        initDetailObj({
          title: $t('table.otherInformation'),
          data: state.otherForm,
          className: 'center'
        }),
        initDetailObj({
          title: '',
          data: state.createForm,
          isSmall: true,
          gutter: 32
        })
      ],
      isShowDelete: true,
      isShowEdit: true,
      url: ROUTER_CV_MANAGEMENT,
      detailUrl: ROUTER_CV_MANAGEMENT_DETAIL,
      deleteDetail: deleteCV,
      editDetail: showEdit,
      initData: initData
    })
}

const getUserInfo = (cvInfo: CV.CVDetail) => {
  const { name, status } = CandidateStatus?.[cvInfo.management_status as number] ?? {}
  const obj: DetailUserInfo = {
    name: cvInfo.name,
    gender: cvInfo.gender,
    applying_position_title: cvInfo.applying_position_title,
    applied_at: cvInfo?.applied_at,
    status_type: status,
    status: name,
    resume_count: cvInfo?.resume_count ?? 0,
    tags: cvInfo?.tags ?? [],
    list: [
      cvInfo?.age ? $t('cv.ageYears', { age: cvInfo?.age }) : '',
      Degree?.[cvInfo?.highest_degree]?.name ?? cvInfo?.highest_degree_name,
      cvInfo?.current_place ? $t('cv.currentlyLives', { address: cvInfo?.current_place }) : '',
      cvInfo?.work_years ? $t('cv.workYears', { year: cvInfo?.work_years }) : 0,
      cvInfo?.email,
      cvInfo?.phone_number
    ]
  }
  return obj
}

const initDetailObj = ({
  title,
  data,
  isSmall = false,
  labelPosition = 'left',
  className = ''
}: ApplicationInfo): ApplicationInfo => {
  return {
    title, // 标题
    isSmall, // 是否是小号字体
    labelPosition,
    data,
    className
  }
}

const showEdit = () => {
  router.push({
    path: `/${ROUTER_CV_MANAGEMENT_EDIT}/${state.cvInfo.id}`
  })
}

const feedBack = (result: number) => {
  espResumeDetailRef.value.feedBack(result)
}

const testFeedBack = (result: number) => {
  espResumeDetailRef.value.testFeedBack(result)
}
onMounted(() => {
  initData()
})
// 当组件卸载时，清理定时器（防止内存泄漏）
onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
    console.log('定时器已清除')
  }
})
</script>
<style lang="less" scoped>
.cv-main-container {
  padding: 0;
  .cv-detail-wrap {
    flex: 1;
    flex-basis: auto;
    overflow: auto;
    padding: 2.3em 2em 0.5rem 2em;
  }
  .resume-opt-panel {
    box-sizing: border-box;
    display: flex;
    justify-content: end;
    padding: 1rem 2.5rem 1rem 2rem;
    background-color: var(--el-bg-color);
    box-shadow: 0px 0px 8px 0px var(--el-color-primary-light-9);
  }
}
.basic-info-wrap {
  margin-top: 1.5em !important;
}
.check-btn-wrap {
  span {
    .fja();
    cursor: pointer;
    font-size: var(--el-font-size-base);
    font-weight: normal;
    font-family: var(--font-family-medium);
    margin-left: 1em;
    border: 1px solid var(--el-color-danger-light-9);
    background-color: var(--el-color-danger-light-9);
    padding: 0.15em 0.8em;
    border-radius: var(--el-border-radius-large);
    color: var(--el-color-danger-light-1);
    &:hover {
      border-color: var(--el-color-danger-light-1);
    }
    &.no {
      cursor: auto;
      border-color: var(--el-color-primary-light-10) !important;
      color: var(--el-color-primary) !important;
      background-color: var(--el-color-primary-light-10) !important;
    }
    img {
      display: block;
      width: 1.1em;
      height: 1.1em;
      margin-right: 0.5em;
    }
  }
}
</style>
