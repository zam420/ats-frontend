<template>
  <EspMain title="">
    <div class="cv-detail-wrap">
      <EspResumeDetail ref="espResumeDetailRef" :hideAddNotes="true" />
    </div>
  </EspMain>
</template>
<script setup lang="ts" name="TalentPoolDetail">
import TalentPool from '@/api/interface/talentPool'
import { getTalentPoolDetail } from '@/api/modules/talentPool'
import { ROUTER_CV_MANAGEMENT_DETAIL, ROUTER_TALENT_POOL } from '@/router/routerName'
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
import { PooledReason } from '@/enums/pooledReasonEnum'
import { isString } from '@/utils/is'
import { ApplicationInfo } from '@/components/EspResumeDetail/interface'

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
  cvInfo: TalentPool.CVDetail
  useInfo: DetailUserInfo
}

const route = useRoute()
const router = useRouter()
const { $t } = useLocale()
const espResumeDetailRef = ref()

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
  cvInfo: {} as TalentPool.CVDetail,
  useInfo: {} as DetailUserInfo
})

const getFormsByRes = (forms: Form.DetailItem[], res: TalentPool.CVDetail) => {
  return forms.map((item: Form.DetailItem) => {
    const prop = item.prop as keyof TalentPool.CVDetail
    if (prop === 'native_place_province') {
      if (res?.native_place_province) {
        item.value = `${res?.native_place_province} /`
      }
      if (res?.native_place_city) {
        item.value = `${item.value} ${res?.native_place_city}`
      }
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

const getSkillName = (forms: Form.DetailItem[], res: TalentPool.Skills[]) => {
  if (res.length === 0) {
    return []
  }
  return forms.map((item: Form.DetailItem) => {
    const prop = item.prop as keyof TalentPool.Skills
    item.value = res.map(info => {
      return info?.[prop]
    })
    return item
  })
}

const initData = () => {
  if (route.params?.id) {
    getTalentPoolDetail(route.params.id as string).then(res => {
      const result = (res.result ?? {}) as TalentPool.CVDetail
      state.cvInfo = result
      state.cvInfo.id = result?.resume_id ?? result.id
      document.title = $t('title.resumeDetail', { name: result?.name })
      state.useInfo = getUserInfo(result)
      state.baseForm = getFormsByRes(cloneDeep(CV_BASIC_DETAIL), result)
      state.jobIntentionForm = getFormsByRes(cloneDeep(CV_JOB_INTENTION_DETAIL), result)
      state.educationForm = getFormListDate<TalentPool.EducationHistories>(
        EDUCATION_BACKGROUND_DETAIL,
        result?.education_histories ?? []
      )

      state.workForm = getFormListDate<TalentPool.WorkExperiences>(
        WORK_EXPERIENCE_DETAIL,
        result?.work_experiences ?? []
      )
      state.projectForm = getFormListDate<TalentPool.ProjectExperiences>(
        PROJECT_EXPERIENCE_DETAIL,
        result?.project_experiences ?? []
      )
      state.skillForm = getSkillName(cloneDeep(SKILLS_PROFICIENCY_DETAIL), result?.skills ?? [])

      state.languageForm = getFormListByRes<TalentPool.Languages>(
        LANGUAGES_PROFICIENCY_DETAIL,
        result?.languages ?? []
      )

      if (result?.self_assessment) {
        state.assessmentForm = getFormsByRes(cloneDeep(SELF_ASSESSMENT_DETAIL), result)
      } else {
        state.assessmentForm = []
      }
      state.otherForm = getFormsByRes(cloneDeep(OTHER_INFORMATION_DETAIL), result)

      state.questionForm = getFormListByRes<TalentPool.Question>(
        QUESTION_DETAIL,
        result?.extended_qa ?? []
      )

      state.createForm = getFormsByRes(cloneDeep(CV_CREATED_DETAIL), result)

      initApplicationDetail()
    })
  } else {
    router.replace({
      path: `/${ROUTER_TALENT_POOL}`
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
      detailUrl: ROUTER_CV_MANAGEMENT_DETAIL,
      isShowDelete: false,
      isShowEdit: false
    })
}

const getUserInfo = (cvInfo: TalentPool.CVDetail) => {
  const { name, status } = PooledReason?.[cvInfo.pooled_reason as number] ?? {}
  const obj: DetailUserInfo = {
    name: cvInfo.name,
    gender: cvInfo.gender,
    applying_position_title: cvInfo.applying_position_title,
    applied_at: cvInfo?.applied_at,
    pooled_at: cvInfo?.pooled_at,
    status_type: status,
    status: name,
    status_comment: cvInfo?.comments ?? '',
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

onMounted(() => {
  initData()
})
</script>
<style lang="less" scoped>
.basic-info-wrap {
  margin-top: 1.5em !important;
}
</style>
