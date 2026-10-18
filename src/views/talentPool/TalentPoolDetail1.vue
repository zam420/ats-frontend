<template>
  <div class="talent-pool-detail">
    <div class="header-base">
      <img class="header-img" src="@/assets/imgs/user.png" />
      <div class="header-content">
        <div class="candidate-name-base">
          <span>{{ state.candidateName }}</span>
          <img class="gender-img" :src="getAssetsFile(state.gender)" />
        </div>
        <div class="content-base">
          <div class="content-first">
            <span class="first"
              >{{ $t('talentPool.positionApplied') }} {{ state.applyingPositionTitle }}</span
            >
            <span>{{ $t('talentPool.appliedAt') }} {{ state.appliedAt }}</span>
          </div>
          <div class="content-second">
            <span class="line" :key="item" v-for="item in state.headerBaseData">{{ item }}</span>
          </div>
        </div>
      </div>
      <div class="header-end">
        <div class="talent-Pool-status">
          <span class="status-point"></span>
          <span class="status">{{ state.pooledReason }}</span>
        </div>
        <div class="status-date">{{ $t('tp.pooledAt') }} {{ state.pooledAtDate }}</div>
      </div>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.basicInformation') }}</div>
      <div class="content-base">
        <div class="content">
          <span class="first line">{{ $t('talentPool.dateOfBirth') }}{{ state.birthDate }}</span>
          <span>{{ $t('talentPool.placeOfBirth') }}{{ state.provinceCity }}</span>
        </div>
        <div class="content-second">
          <span class="line" :key="item" v-for="item in state.basicInformationData">{{
            item
          }}</span>
        </div>
      </div>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.jobIntention') }}</div>
      <div class="content-base">
        <span class="line" :key="item" v-for="item in state.jobIntentionData">{{ item }}</span>
      </div>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.educationBackground') }}</div>
      <div class="eb-content-base" :key="item.date" v-for="item in state.educationBackgroundData">
        <div class="eb-first">
          <span class="title">{{ item.title }}</span>
          <span class="date">{{ item.date }}</span>
        </div>
        <div class="eb-second">
          <span class="line" :key="contentItem" v-for="contentItem in item.content">{{
            contentItem
          }}</span>
        </div>
      </div>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.workExperienceTitle') }}</div>
      <div class="content-base" :key="item.date" v-for="item in state.workExperienceData">
        <div class="we-first">
          <span class="title">{{ item.companyName }}</span>
          <span class="date">{{ item.date }}</span>
        </div>
        <div class="we-second">{{ item.jobTitle }}</div>
        <div class="we-third">{{ $t('talentPool.majorAchievement') }}</div>
        <div class="we-fourth">{{ item.major }}</div>
      </div>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.projectExperience') }}</div>
      <div class="content-base" :key="item.date" v-for="item in state.projectExperienceData">
        <div class="we-first">
          <span class="title">{{ item.projectName }}</span>
          <span class="date">{{ item.date }}</span>
        </div>
        <div class="we-second">{{ item.jobTitle }}</div>
        <div class="pe-third-base">
          <div class="we-third">{{ $t('talentPool.projectDescription') }}</div>
          <div class="we-fourth">{{ item.projectDes }}</div>
        </div>
        <div class="we-third">{{ $t('talentPool.majorAchievement') }}</div>
        <div class="we-fourth">{{ item.major }}</div>
      </div>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.skillsProficiency') }}</div>
      <span class="sp-content" :key="item" v-for="item in state.skillsProficiencyData">{{
        item
      }}</span>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.languageProficiency') }}</div>
      <div class="content-base">
        <span class="line" :key="item" v-for="item in state.languageProficiencyData">{{
          item
        }}</span>
      </div>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.selfAssessment') }}</div>
      <div class="content-base">
        <div class="we-fourth">{{ state.selfAssessmentData }}</div>
      </div>
    </div>
    <div class="content-bg">
      <div class="content-title title-line">{{ $t('talentPool.otherInformation') }}</div>
      <div class="content-base">
        <span class="line" :key="item" v-for="item in state.otherInformationData">{{ item }}</span>
        <div class="tags-base">
          <span class="tags">{{ $t('talentPool.tags') }}</span>
          <span class="sp-content" :key="item" v-for="item in state.tags">{{ item }}</span>
        </div>
        <div class="pe-third-base">
          <div class="we-third">{{ $t('talentPool.notes') }}</div>
          <div class="we-fourth">{{ state.notes }}</div>
        </div>
        <div class="oi-title">{{ $t('talentPool.originalResume') }}</div>
        <!-- <div :key="item.title" v-for="item in originalResumeData">
          <a :href="item.link">{{ item.title }}</a>
        </div> -->
        <template :key="file.uid" v-for="file in state.originalResumeData">
          <el-link @click="showFilePreview(file)" href="javascript:void(0)" type="primary">
            {{ file?.file_name }}
          </el-link>
        </template>
        <div class="oi-title">{{ $t('talentPool.otherDocuments') }}</div>
        <template :key="file.uid" v-for="file in state.originalResumeData">
          <el-link @click="showFilePreview(file)" href="javascript:void(0)" type="primary">
            {{ file?.file_name }}
          </el-link>
        </template>
      </div>
    </div>
  </div>
  <EspFilePreview ref="espFilePreviewRef" />
</template>
<script setup lang="ts" name="JobPositionTable">
import TalentPool from '@/api/interface/talentPool'
import { ROUTER_TALENT_POOL } from '@/router/routerName'
import { getTalentPoolDetail } from '@/api/modules/talentPool'
import { useLocale } from '@/hooks/useLocale'
import { EmploymentStatus } from '@/enums/employmentStatusEnum'
import { RecruitmentInfoFrom } from '@/enums/recruitmentInfoFromEnum'
import { ResumeSource } from '@/enums/resumeSourceEnum'
import { PooledReason } from '@/enums/pooledReasonEnum'
import { getAssetsFile } from '@/utils'
import mittBus from '@/utils/mittBus'
import { ResultUploadInfo } from '@/api/interface'
import { OPEN_FILE_PREVIEW } from '@/config'
const { $t } = useLocale()
const route = useRoute()
const router = useRouter()
interface StateObj {
  pooledReason: string
  pooledAtDate: string
  candidateName: string
  applyingPositionTitle: string
  appliedAt: string
  headerBaseData: any[]
  birthDate: string
  provinceCity: string
  basicInformationData: string[]
  jobIntentionData: string[]
  educationBackgroundData: TalentPool.educationBackground[]
  workExperienceData: TalentPool.workExperienceData[]
  projectExperienceData: TalentPool.workExperienceData[]
  skillsProficiencyData: string[]
  languageProficiencyData: string[]
  selfAssessmentData: string
  otherInformationData: string[]
  notes: string
  tags: string[]
  gender: string
  originalResumeData: ResultUploadInfo[]
}
const state = reactive<StateObj>({
  pooledReason: '',
  pooledAtDate: '',
  candidateName: '',
  applyingPositionTitle: '',
  appliedAt: '',
  headerBaseData: [],
  birthDate: '',
  provinceCity: '',
  basicInformationData: [],
  jobIntentionData: [],
  educationBackgroundData: [],
  workExperienceData: [],
  projectExperienceData: [],
  skillsProficiencyData: [],
  languageProficiencyData: [],
  selfAssessmentData: '',
  otherInformationData: [],
  notes: '',
  tags: [],
  gender: '',
  originalResumeData: []
})
const initData = () => {
  console.log('12345678')
  if (route.params?.id) {
    console.log('12345678: ', route.params?.id)
    getTalentPoolDetail(route.params.id as string).then(res => {
      console.log('res: ', res)
      const result = (res.result ?? {}) as TalentPool.TalentPoolDetail
      let pooledR = result?.pooled_reason
      state.pooledReason = PooledReason[pooledR]?.name ?? pooledR
      state.gender = result?.gender ? 'imgs/female.png' : 'imgs/male.png'
      console.log('gender: ', state.gender)
      state.pooledAtDate = result?.pooled_at ?? ''
      state.candidateName = result?.name ?? ''
      state.applyingPositionTitle = result?.applying_position_title ?? ''
      state.appliedAt = result?.applied_at ?? ''
      let workExperience = result?.work_years + $t('talentPool.workExperience')
      let highestDegree = result?.highest_degree_name ?? ''
      let expectedWorkLocation = result?.expected_work_location ?? ''
      state.headerBaseData = [
        result?.age ?? '',
        highestDegree,
        expectedWorkLocation,
        workExperience,
        result?.email ?? '',
        result?.phone_number ?? ''
      ]
      state.birthDate = result?.birth_date ?? ''
      let provance = result?.native_place_province ?? ''
      let city = result?.native_place_city ?? ''
      state.provinceCity = provance + '/' + city
      let lastCompanyName = result?.last_company_name ?? ''
      let currentStatus = result?.status
      state.basicInformationData = [
        $t('talentPool.highestDegree') + highestDegree,
        $t('talentPool.lastCompanyName') + lastCompanyName,
        $t('talentPool.currentStatus') + EmploymentStatus[currentStatus]?.name ?? currentStatus
      ]
      let expectedSalary = result?.expected_salary ?? ''
      let recruitingInformation = result?.recruitment_info_from
      state.jobIntentionData = [
        $t('talentPool.jobPosition') + state.applyingPositionTitle,
        $t('talentPool.expectedWorkLocations') + expectedWorkLocation,
        $t('talentPool.expectedSalary') + expectedSalary,
        $t('talentPool.accessRecruitingInformationFrom') +
          RecruitmentInfoFrom[recruitingInformation]?.name ?? recruitingInformation
      ]

      result?.education_histories.forEach(item => {
        let educationbgData = {} as TalentPool.educationBackground
        educationbgData['title'] = item.university
        educationbgData['date'] = item.date_from + '-' + item.date_to
        educationbgData['content'] = [
          item.school,
          item.major,
          item.degree_name,
          item.performance_rank_name,
          item.lab_name
        ]
        state.educationBackgroundData.push(educationbgData)
      })

      result?.work_experiences.forEach(item => {
        let workExperienceData = {} as TalentPool.workExperienceData
        workExperienceData['companyName'] = item.company_name
        workExperienceData['date'] = item.date_from + '-' + item.date_to
        workExperienceData['jobTitle'] = item.title
        workExperienceData['major'] = item.major_achievement
        state.workExperienceData.push(workExperienceData)
      })

      result?.project_experiences.forEach(item => {
        let projectExperienceData = {} as TalentPool.workExperienceData
        projectExperienceData['projectName'] = item.project_name
        projectExperienceData['date'] = item.date_from + '-' + item.date_to
        projectExperienceData['jobTitle'] = item.project_role
        projectExperienceData['major'] = item.major_achievement
        projectExperienceData['projectDes'] = item.project_desc
        state.projectExperienceData.push(projectExperienceData)
      })

      result?.skills.forEach(item => {
        state.skillsProficiencyData.push(item.skillName)
      })
      result?.languages.forEach(item => {
        state.languageProficiencyData.push(item.languages)
      })

      state.selfAssessmentData = result?.self_assessment ?? ''

      let recruitmentSource = result?.recruitment_source
      let referral_code = result?.referral_code ?? ''
      state.otherInformationData = [
        $t('talentPool.resumePortal') + ResumeSource[recruitmentSource]?.name ?? recruitmentSource,
        $t('talentPool.referralCode') + referral_code
      ]

      state.notes = result?.notes ?? ''
      state.tags = result?.tags
      state.originalResumeData = result?.original_resume ?? []
      // highest_degree_name: string
    })
  } else {
    router.replace({
      path: `/${ROUTER_TALENT_POOL}`
    })
  }
}

const showFilePreview = (file: ResultUploadInfo) => {
  mittBus.emit(OPEN_FILE_PREVIEW, file)
}

onMounted(() => {
  initData()
})
</script>
<style lang="less" scoped>
@import 'index.less';
</style>

<!-- <template>
  <EspMain title="">
    <EspDetail :is-user="true" title="" :data="[]" :user-info="state.useInfo">
      <template #right="">
        <div class="header-end">
          <div class="talent-Pool-status">
            <span class="status-point"></span>
            <span class="status">{{ state.pooledReason }}</span>
          </div>
          <div class="status-date">{{ $t('tp.pooledAt') }} {{ state.pooledAtDate }}</div>
        </div>
      </template>
    </EspDetail>
    <EspDetail
      class="basic-info-wrap"
      :title="$t('table.basicInformation')"
      :data="state.baseForm"
    />
    <EspDetail :title="$t('cv.jobIntention')" :data="state.jobIntentionForm" />
    <EspDetail
      v-show="state.cvInfo?.education_histories?.length"
      :title="$t('cv.educationBackground')"
      :data="state.educationForm"
    />
    <EspDetail
      v-show="state.cvInfo?.work_experiences?.length"
      :title="$t('cv.workExperience')"
      :data="state.workForm"
      label-position="top"
    />
    <EspDetail
      v-show="state.cvInfo?.project_experiences?.length"
      :title="$t('cv.projectExperience')"
      :data="state.projectForm"
      label-position="top"
    />
    <EspDetail
      v-show="state.cvInfo?.skills?.length"
      :title="$t('cv.skillsProficiency')"
      :data="state.skillForm"
    />
    <EspDetail
      v-show="state.cvInfo?.languages?.length"
      :title="$t('cv.languageProficiency')"
      :data="state.languageForm"
    />
    <EspDetail
      v-show="state.cvInfo?.self_assessment"
      :title="$t('cv.selfAssessment')"
      :data="state.assessmentForm"
      label-position="top"
    />
    <EspDetail :title="$t('table.otherInformation')" :data="state.otherForm" class="center" />
  </EspMain>
</template>
<script setup lang="ts" name="TalentPoolDetail">
import TalentPool from '@/api/interface/talentPool'
import { getTalentPoolDetail } from '@/api/modules/talentPool'
import { ROUTER_TALENT_POOL } from '@/router/routerName'
import { cloneDeep } from 'lodash'
import { PooledReason } from '@/enums/pooledReasonEnum'
import {
  CV_BASIC_DETAIL,
  CV_JOB_INTENTION_DETAIL,
  EDUCATION_BACKGROUND_DETAIL,
  WORK_EXPERIENCE_DETAIL,
  PROJECT_EXPERIENCE_DETAIL,
  SKILLS_PROFICIENCY_DETAIL,
  LANGUAGES_PROFICIENCY_DETAIL,
  SELF_ASSESSMENT_DETAIL,
  OTHER_INFORMATION_DETAIL
} from './data'
import { Degree } from '@/enums/degreeEnum'
import { DetailUserInfo } from '@/api/interface'
import moment from 'moment'
import { MONTH_DOTTED } from '@/config'
import { useLocale } from '@/hooks/useLocale'

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
  cvInfo: TalentPool.CVDetail
  useInfo: DetailUserInfo
  pooledReason: string
  pooledAtDate: string
}

const route = useRoute()
const router = useRouter()
const { $t } = useLocale()

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
  cvInfo: {} as TalentPool.CVDetail,
  useInfo: {} as DetailUserInfo,
  pooledReason: '',
  pooledAtDate: ''
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
    return item
  })
}

const getFormListDate = <T extends { date_from: string; date_to: string }>(
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
        form.timeValue = `${
          item?.date_from ? moment(item?.date_from).format(MONTH_DOTTED) : item?.date_from
        }-${item?.date_to ? moment(item?.date_to).format(MONTH_DOTTED) : item?.date_to}`
      }
      return form
    })
    newForms.push(form)
  })
  return newForms
}

const getLanguages = (forms: Form.DetailItem[], list: TalentPool.Languages[]) => {
  const newForms: Form.DetailItem[][] = []
  list.forEach(item => {
    const form = cloneDeep(forms).map(form => {
      const prop = form.prop as keyof TalentPool.Languages
      form.value = item?.[prop]
      return form
    })
    newForms.push(form)
  })
  return newForms
}

const getSkillName = (forms: Form.DetailItem[], res: TalentPool.Skills[]) => {
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
      let pooledR = result?.pooled_reason
      state.pooledReason = PooledReason[pooledR]?.name ?? pooledR
      state.pooledAtDate = result?.pooled_at ?? ''
      state.cvInfo = result
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

      state.languageForm = getLanguages(LANGUAGES_PROFICIENCY_DETAIL, result?.languages ?? [])

      state.assessmentForm = getFormsByRes(cloneDeep(SELF_ASSESSMENT_DETAIL), result)

      state.otherForm = getFormsByRes(cloneDeep(OTHER_INFORMATION_DETAIL), result)
    })
  } else {
    router.replace({
      path: `/${ROUTER_TALENT_POOL}`
    })
  }
}
const getUserInfo = (cvInfo: TalentPool.CVDetail) => {
  const obj: DetailUserInfo = {
    name: cvInfo.name,
    gender: cvInfo.gender,
    applying_position_title: cvInfo.applying_position_title,
    applied_at: cvInfo?.applied_at,
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

onMounted(() => {
  initData()
})
</script>
<style lang="less" scoped>
.basic-info-wrap {
  margin-top: 1.5em !important;
}
.header-end {
  .talent-Pool-status {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .status-point {
      height: 0.5em;
      width: 0.5em;
      background-image: linear-gradient(
        to bottom,
        var(--el-color-primary-light-2),
        var(--el-color-primary)
      );
      border-radius: var(--el-border-radius-circle);
      margin-right: 0.3em;
    }
    .status {
      font-size: var(--el-font-size-base);
      font-weight: bold;
      color: var(--el-color-primary);
    }
  }
  .status-date {
    font-size: var(--el-font-size-base);
    color: var(--color-gray2);
    margin-top: 0.3em;
  }
}
</style> -->
