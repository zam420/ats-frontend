<template>
  <EspMain :title="title" class="resume-main-wrap">
    <template #right>
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton v-if="dataStatus" @click="save()" class="btn-primary-gradient">
        {{ $t('button.save') }}
      </ElButton>
      <ElButton @click="submit" class="btn-primary-gradient">{{ $t('button.submit') }}</ElButton>
    </template>
    <EspForm
      ref="espBasicRef"
      :changeForm="changeBaseForm"
      :title="$t('table.basicInformation')"
      :blurCheck="getResumeByPhoneOrEmail"
      :view="showView"
      v-model="state.baseForm"
    />
    <EspForm
      ref="jobIntentionFormRef"
      :title="$t('cv.jobIntention')"
      :changeForm="changeForm"
      :initOptionCallback="initEditForm"
      v-model="state.jobIntentionForm"
    />
    <div class="education-form-wrap multiple-form-wrap">
      <template :key="index" v-for="index in state.educationForm.length">
        <EspForm
          ref="educationFormRef"
          :title="index === 1 ? $t('cv.educationBackground') : ''"
          :show-add="true"
          :is-watch="true"
          @add="addForm('educationForm', cloneDeep(EDUCATION_BACKGROUND_FORM))"
          :index="index - 1"
          :changeForm="changeEducationForm"
          v-model="state.educationForm[index - 1]"
        >
          <template #operate v-if="index !== 1">
            <i
              @mouseenter="showBg($event)"
              @mouseleave="removeBg($event)"
              @click="deleteForm('educationForm', index)"
              class="iconfont icon-delete"
            ></i>
          </template>
        </EspForm>
      </template>
    </div>
    <div class="work-form-wrap multiple-form-wrap">
      <template :key="index" v-for="index in state.workForm.length">
        <EspForm
          ref="workFormRef"
          :title="index === 1 ? $t('cv.workExperience') : ''"
          :show-add="true"
          :is-watch="true"
          :index="index - 1"
          :changeForm="changeWorkForm"
          @add="addForm('workForm', cloneDeep(WORK_EXPERIENCE_FORM))"
          v-model="state.workForm[index - 1]"
        >
          <template #operate v-if="index !== 1">
            <i
              @mouseenter="showBg($event)"
              @mouseleave="removeBg($event)"
              @click="deleteForm('workForm', index)"
              class="iconfont icon-delete"
            ></i>
          </template>
        </EspForm>
      </template>
    </div>
    <div class="project-form-wrap multiple-form-wrap">
      <template :key="index" v-for="index in state.projectForm.length">
        <EspForm
          ref="projectFormRef"
          :title="index === 1 ? $t('cv.projectExperience') : ''"
          :show-add="true"
          :is-watch="true"
          :index="index - 1"
          :changeForm="changeProjectForm"
          @add="addForm('projectForm', cloneDeep(PROJECT_EXPERIENCE_FORM))"
          v-model="state.projectForm[index - 1]"
        >
          <template #operate v-if="index !== 1">
            <i
              @mouseenter="showBg($event)"
              @mouseleave="removeBg($event)"
              @click="deleteForm('projectForm', index)"
              class="iconfont icon-delete"
            ></i>
          </template>
        </EspForm>
      </template>
    </div>
    <EspForm ref="skillFormRef" :title="$t('cv.skillsProficiency')" v-model="state.skillForm" />
    <div class="language-form-wrap multiple-form-wrap">
      <template :key="index" v-for="index in state.languageForm.length">
        <EspForm
          ref="languageFormRef"
          :title="index === 1 ? $t('cv.languageProficiency') : ''"
          :show-add="true"
          @add="addForm('languageForm', cloneDeep(LANGUAGES_PROFICIENCY_FORM))"
          v-model="state.languageForm[index - 1]"
        >
          <template #operate v-if="index !== 1">
            <i
              @mouseenter="showBg($event)"
              @mouseleave="removeBg($event)"
              @click="deleteForm('languageForm', index)"
              class="iconfont icon-delete"
            ></i>
          </template>
        </EspForm>
      </template>
    </div>
    <EspForm
      ref="assessmentFormRef"
      :title="$t('cv.selfAssessment')"
      v-model="state.assessmentForm"
    />
    <EspForm
      v-if="state.questionForm.length"
      ref="espQuestionRef"
      :is-watch="true"
      :title="$t('table.screeningQuestions')"
      v-model="state.questionForm"
    />
    <EspForm
      ref="espOtherRef"
      :changeForm="changeOtherForm"
      :title="$t('table.otherInformation')"
      v-model="state.otherForm"
    />
  </EspMain>
</template>
<script setup lang="ts" name="ResumeForm">
import { cloneDeep } from 'lodash-es'
import {
  CV_BASIC_FORM,
  CV_JOB_INTENTION_FORM,
  EDUCATION_BACKGROUND_FORM,
  WORK_EXPERIENCE_FORM,
  SKILLS_PROFICIENCY_FORM,
  PROJECT_EXPERIENCE_FORM,
  LANGUAGES_PROFICIENCY_FORM,
  SELF_ASSESSMENT_FORM,
  OTHER_INFORMATION_FORM,
  CV_QUESTION_FORM
} from '../data'
import { getObjectByForms, isEmpty } from '@/utils'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_CV_MANAGEMENT, ROUTER_CV_MANAGEMENT_DETAIL } from '@/router/routerName'
import CV from '@/api/interface/cv'
import {
  duplicationInfoList,
  existResumes,
  getCVDetail,
  saveCV,
  submitCV,
  uploadCV
} from '@/api/modules/cv'
import { ResultUpload, ResultUploadInfo, UserTag } from '@/api/interface'
import { UploadFile, UploadFiles, UploadRawFile } from 'element-plus'
import { useCVStore } from '@/store/modules/cv'
import { RecruitmentTypeEnum } from '@/enums/recruitmentTypeEnum'
import { isWorkLocationUnderChina } from '@/enums/workLocationEnum'
import moment from 'moment'
import { CandidateStatusEnum } from '@/enums/candidateStatusEnum'
import { ResumeSourceEnum } from '@/enums/resumeSourceEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'

interface SetField {
  requireKey: string[]
  hideKey: string[]
}

const chinaCampus: SetField = {
  requireKey: [
    'name',
    'university',
    'degree',
    'recruitment_source',
    'original_resume',
    'applying_position'
  ],
  hideKey: ['employment_status']
}
const chinaCorporate: SetField = {
  requireKey: ['name', 'original_resume', 'recruitment_source', 'applying_position'],
  hideKey: ['recruitment_info_from']
}
const chinaIntern: SetField = {
  requireKey: [
    'name',
    'university',
    'degree',
    'original_resume',
    'recruitment_source',
    'applying_position'
  ],
  hideKey: ['employment_status', 'expected_salary']
}
const nonChina: SetField = {
  requireKey: ['name', 'original_resume', 'applying_position'],
  hideKey: [
    'native_place_province',
    'native_place_city',
    'employment_status',
    'recruitment_info_from',
    'expected_salary'
  ]
}

interface ParamsProps {
  title: string // 标题
  id?: number // 数据ID
  isEdit: boolean // 是否编辑
}
interface ReactiveParams {
  baseForm: Form.FormItem[]
  jobIntentionForm: Form.FormItem[]
  educationForm: Form.FormItem[][]
  workForm: Form.FormItem[][]
  projectForm: Form.FormItem[][]
  skillForm: Form.FormItem[]
  languageForm: Form.FormItem[][]
  assessmentForm: Form.FormItem[]
  otherForm: Form.FormItem[]
  questionForm: Form.FormItem[]
}

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false
})

const router = useRouter()
const cvStore = useCVStore()
const { $t } = useLocale()

const isStatUpload = ref<boolean>(false)
const espBasicRef = ref()
const jobIntentionFormRef = ref()
const educationFormRef = ref()
const projectFormRef = ref()
const workFormRef = ref()
const languageFormRef = ref()
const assessmentFormRef = ref()
const espOtherRef = ref()
const skillFormRef = ref()
const recruitmentType = ref<number>()
const isChina = ref<boolean>(false)
const dataStatus = ref<boolean>(true)
const questionList = ref<CV.Question[]>([])
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(CV_BASIC_FORM),
  jobIntentionForm: cloneDeep(CV_JOB_INTENTION_FORM),
  educationForm: [cloneDeep(EDUCATION_BACKGROUND_FORM)],
  workForm: [cloneDeep(WORK_EXPERIENCE_FORM)],
  projectForm: [cloneDeep(PROJECT_EXPERIENCE_FORM)],
  skillForm: cloneDeep(SKILLS_PROFICIENCY_FORM),
  languageForm: [cloneDeep(LANGUAGES_PROFICIENCY_FORM)],
  assessmentForm: cloneDeep(SELF_ASSESSMENT_FORM),
  otherForm: cloneDeep(OTHER_INFORMATION_FORM),
  questionForm: []
})

const validateFrom = async (formRef: any, showError: boolean) => {
  let isError: boolean[] = []
  let len = 0
  const total = formRef?.length
  while (len < total) {
    const error: boolean = await formRef[len]?.validateFrom(null, null, showError || isError)
    isError.push(error)
    len++
  }
  return !isError.includes(false)
}

const getDataByForms = (forms: Form.FormItem[][]) => {
  const list: Record<string, any>[] = []
  for (const item of forms) {
    const data: Record<string, any> = getObjectByForms(item)
    if (Object.keys(data)?.length) {
      list.push(data)
    }
  }
  return list
}

const getFileFormData = (files: UploadFiles, key: string, formData: FormData) => {
  for (const item of files) {
    if (item?.status !== 'success') {
      const raw = item?.raw as UploadRawFile
      if (!isStatUpload.value) {
        isStatUpload.value = true
      }
      formData.append(key, raw)
    }
  }
  return formData
}

const submit = async () => {
  const isBasicError = espBasicRef.value.validateFrom && (await espBasicRef.value.validateFrom())
  const isJobIntentionError =
    jobIntentionFormRef.value.validateFrom &&
    (await jobIntentionFormRef.value.validateFrom(null, null, isBasicError))
  const isEducationError = await validateFrom(educationFormRef.value, isJobIntentionError)
  const isWorkError = await validateFrom(workFormRef.value, isEducationError)
  const isProjectError = await validateFrom(projectFormRef.value, isWorkError)
  const isOtherError =
    espOtherRef.value.validateFrom &&
    (await espOtherRef.value.validateFrom(null, null, isProjectError))
  if (
    isBasicError &&
    isJobIntentionError &&
    isEducationError &&
    isWorkError &&
    isProjectError &&
    isOtherError
  ) {
    save(true)
  }
}

const save = async (isSubmit: boolean = false) => {
  const otherForm = getObjectByForms(state.otherForm)
  let formData = new FormData()
  formData = getFileFormData(
    (otherForm?.original_resume ?? []) as UploadFiles,
    'original_resumes',
    formData
  )
  formData = getFileFormData((otherForm?.attachments ?? []) as UploadFiles, 'attachments', formData)
  if (isStatUpload.value) {
    uploadCV(formData).then(res => {
      if (res.success) {
        saveData(res?.result as ResultUpload, otherForm, isSubmit)
        return
      }
      ElMessage.error({ message: res?.message })
    })
  } else {
    saveData(null, otherForm, isSubmit)
  }
}

const saveData = (
  res: ResultUpload | null,
  otherForm: Partial<CV.CVInfo>,
  isSubmit: boolean = false
) => {
  const baseForm = getObjectByForms(state.baseForm)
  const jobIntentionForm = getObjectByForms(state.jobIntentionForm)
  const educationForm = getDataByForms(state.educationForm) as CV.EducationHistories[]
  const workForm = getDataByForms(state.workForm) as CV.WorkExperiences[]
  const projectForm = getDataByForms(state.projectForm) as CV.ProjectExperiences[]
  const skillForm = getObjectByForms(state.skillForm)
  const assessmentForm = getObjectByForms(state.assessmentForm)
  const languageForm = getDataByForms(state.languageForm) as CV.Languages[]
  const formObj: Partial<CV.CVInfo> = {
    ...baseForm,
    ...jobIntentionForm,
    education_histories: educationForm,
    work_experiences: workForm,
    project_experiences: projectForm,
    languages: languageForm,
    ...assessmentForm,
    ...otherForm
  }
  if (skillForm.skillName?.length) {
    formObj.skills = skillForm.skillName.map((item: string) => {
      return { skillName: item }
    })
  }
  if (state.questionForm?.length) {
    const extended_qa: CV.Question[] = []
    state.questionForm.forEach(item => {
      if (item.value) {
        extended_qa.push({
          question: item?.question ?? '',
          answer: item.value
        })
      }
    })
    formObj.extended_qa = extended_qa
  }

  formObj.original_resume = []
  formObj.attachments = []
  if (res) {
    formObj.original_resume = res?.original_resume ?? []
    formObj.attachments = res?.attachments ?? []
  }
  if (otherForm?.original_resume?.length) {
    const original_resume: ResultUploadInfo[] = []
    otherForm?.original_resume?.forEach(item => {
      const obj = item as UploadFile
      if (obj?.status === 'success') {
        original_resume?.push({ uid: obj.uid, file_name: obj.name })
      }
    })
    formObj.original_resume = [...formObj.original_resume, ...original_resume] as ResultUploadInfo[]
  }

  if (otherForm?.attachments?.length) {
    const attachments: ResultUploadInfo[] = []
    otherForm?.attachments?.forEach(item => {
      const obj = item as UploadFile
      if (obj?.status === 'success') {
        attachments?.push({ uid: obj.uid, file_name: obj.name })
      }
    })
    formObj.attachments = [...formObj.attachments, ...attachments] as ResultUploadInfo[]
  }

  let saveFun = isSubmit ? submitCV : saveCV
  if (props.isEdit) {
    formObj.candidate_resume_id = props.id
  }
  saveFun(formObj as CV.CVInfo).then(async res => {
    if (res?.success) {
      const id = res?.result?.id as number
      ElMessage.success({ message: isSubmit ? $t('message.submitSuc') : $t('message.saveSuc') })
      if (isSubmit) {
        await duplicationInfoList(id, $t('message.duplicateChecking'))
      }
      router.replace({
        path: `/${ROUTER_CV_MANAGEMENT_DETAIL}/${id}`
      })
      return
    }
    ElMessage.error({ message: res?.message })
  })
}

const addForm = (key: keyof ReactiveParams, form: Form.FormItem[]) => {
  if (state?.[key]) {
    const forms = state?.[key] as Form.FormItem[][]
    forms.push(form)
    nextTick(() => {
      if (key === 'educationForm') {
        initEducationForm()
        return
      }
      if (key === 'projectForm') {
        initProjectForm()
      }
    })
  }
}

const deleteForm = (key: keyof ReactiveParams, index: number) => {
  if (state?.[key]) {
    state?.[key].splice(index - 1, 1)
  }
}

const setForm = (list: Form.FormItem[], isOtherForm?: boolean) => {
  let keyObj: SetField = chinaCampus
  if (isChina.value === true) {
    if (recruitmentType.value === RecruitmentTypeEnum.CAMPUS) {
      keyObj = chinaCampus
    } else if (recruitmentType.value === RecruitmentTypeEnum.CORPORATE) {
      keyObj = chinaCorporate
    } else if (recruitmentType.value === RecruitmentTypeEnum.INTERN) {
      keyObj = chinaIntern
    }
    if (isOtherForm) {
      const index = state.otherForm.findIndex(form => form.prop === 'recruitment_source')
      if (state.otherForm[index].value === ResumeSourceEnum.LIEPIN) {
        keyObj.requireKey = keyObj.requireKey.filter(item => item !== "original_resume")
      }

    }
  } else {
    keyObj = nonChina
  }
  return getForm(list, keyObj)
}

const getForm = (list: Form.FormItem[], keyObj: SetField) => {
  let formList: Form.FormItem[] = []
  formList = list.map(item => {
    if (item.prop === 'id') {
      return item
    }
    if (keyObj?.requireKey?.includes(item.prop)) {
      item.required = true
    } else {
      item.required = false
    }
    if (keyObj?.hideKey?.includes(item.prop)) {
      item.isHide = true
    } else {
      item.isHide = false
    }
    return item
  })
  return formList
}

const initEducationForm = (isInit: boolean = false) => {
  let keyObj = {} as SetField
  if (isChina.value === true) {
    if (recruitmentType.value === RecruitmentTypeEnum.CAMPUS) {
      keyObj = {
        requireKey: ['university', 'degree'],
        hideKey: []
      }
    } else if (recruitmentType.value === RecruitmentTypeEnum.CORPORATE) {
      keyObj = {
        requireKey: [],
        hideKey: ['lab_name']
      }
    } else if (recruitmentType.value === RecruitmentTypeEnum.INTERN) {
      keyObj = {
        requireKey: ['university', 'degree'],
        hideKey: []
      }
    }
  } else {
    keyObj = {
      requireKey: [],
      hideKey: ['lab_name', 'school']
    }
  }
  setTimeout(() => {
    nextTick(() => {
      state.educationForm.forEach((item: any, index: number) => {
        state.educationForm[index] = getForm(item, keyObj)
        if (isInit) {
          changeEducationRequired(index)
        } else {
          educationFormRef.value?.[index] &&
            educationFormRef.value?.[index]?.changeFromModalRule &&
            educationFormRef.value?.[index].changeFromModalRule(state.educationForm[index])
        }
      })
    })
  })
}

const initProjectForm = () => {
  let keyObj: SetField = {
    requireKey: [],
    hideKey: []
  }
  if (isChina.value === true) {
    if (recruitmentType.value === RecruitmentTypeEnum.CAMPUS) {
      keyObj = {
        requireKey: [],
        hideKey: []
      }
    }
  }
  setTimeout(() => {
    nextTick(() => {
      state.projectForm.forEach((item, index) => {
        state.projectForm[index] = getForm(item, keyObj)
        projectFormRef.value?.[index]?.changeFromModalRule &&
          projectFormRef.value?.[index].changeFromModalRule(state.projectForm[index])
      })
    })
  })
}

const changeForm = (item: Form.FormItem, option?: Form.FormSelect) => {
  if (item.prop === 'applying_position') {
    if (!option) {
      option = item.options?.find(option => option.value === item.value)
    }
    recruitmentType.value = option?.recruitment_type
    isChina.value =
      (option?.work_location ?? []).every((item: CommonEnum.enumItem) =>
        isWorkLocationUnderChina(item.value as number)
      ) ?? false
    state.baseForm = setForm(state.baseForm)
    espBasicRef.value && espBasicRef.value.changeFromModalRule(state.baseForm)
    state.jobIntentionForm = setForm(state.jobIntentionForm)
    jobIntentionFormRef.value &&
      jobIntentionFormRef.value.changeFromModalRule(state.jobIntentionForm)
    state.otherForm = setForm(state.otherForm, true)
    espOtherRef.value && espOtherRef.value.changeFromModalRule(state.otherForm)
    initQuestion(option!)
    setTimeout(() => {
      nextTick(() => {
        initEducationForm()
        initProjectForm()
      })
    }, 100)
  }
}

const initQuestion = (option: Form.FormSelect) => {
  if (option?.extended_questions?.length || questionList.value?.length) {
    const questions: string[] = option?.extended_questions
    if (questionList.value?.length) {
      questionList.value.forEach(item => {
        if (questions.every(question => question != item.question)) {
          questions.push(item.question)
        }
      })
    }
    state.questionForm = questions.map((question: string, index: number) => {
      const answer = questionList.value?.find(info => info.question === question)?.answer ?? ''
      return {
        ...CV_QUESTION_FORM,
        label: `${$t('cv.q', { number: index + 1 })} ${question}`,
        prop: `question${index}`,
        question: question,
        value: answer,
        placeholder: $t('form.question')
      }
    })
  } else {
    state.questionForm = []
  }
}

const changeEducationForm = (item: Form.FormItem, index: number) => {
  if (state.educationForm[index]) {
    if (item.prop === 'date_from') {
      const i = state.educationForm[index].findIndex(info => info.prop === 'date_to')
      if (i > -1) {
        state.educationForm[index][i].disableStartDate = item.value
      }
    }
    if (item.prop === 'date_to') {
      const i = state.educationForm[index].findIndex(info => info.prop === 'date_from')
      if (i > -1) {
        state.educationForm[index][i].disableEndDate = item.value
      }
    }
    changeEducationRequired(index)
  }
}

const changeEducationRequired = (index: number) => {
  if (state.educationForm[index]) {
    let requireKey: string[] = []
    if (
      state.educationForm[index].every(info => isEmpty(info.value)) &&
      isChina.value === true &&
      recruitmentType.value !== RecruitmentTypeEnum.CAMPUS
    ) {
      requireKey = []
    } else {
      if (isChina.value === true) {
        if (recruitmentType.value === RecruitmentTypeEnum.CORPORATE) {
          requireKey = []
        } else if (recruitmentType.value === RecruitmentTypeEnum.INTERN) {
          requireKey = ['university', 'degree']
        } else if (recruitmentType.value === RecruitmentTypeEnum.CAMPUS) {
          requireKey = ['university', 'degree']
        }
      } else {
        requireKey = []
      }
    }
    state.educationForm[index] = state.educationForm[index].map(info => {
      if (requireKey.includes(info.prop)) {
        info.required = true
      } else {
        info.required = false
      }
      return info
    })
    setTimeout(() => {
      nextTick(() => {
        educationFormRef.value?.[index] &&
          educationFormRef.value?.[index].changeFromModalRule &&
          educationFormRef.value?.[index].changeFromModalRule(state.educationForm[index])
      })
    }, 100)
  }
}

const initEditData = async () => {
  if (props.id) {
    await getCVDetail(props.id).then(res => {
      const result = (res.result ?? {}) as CV.CVDetail
      document.title = $t('title.resumeEditor', { name: result?.name })
      dataStatus.value = result?.status === CandidateStatusEnum.DRAFT
      questionList.value = result?.extended_qa ?? []
      initFormData(result)
    })
  }
}

const initFormData = (result: CV.CVDetail, isAdd: boolean = false) => {
  state.baseForm = getFormsByRes(state.baseForm, result)
  state.jobIntentionForm = getFormsByRes(state.jobIntentionForm, result)
  state.otherForm = getFormsByRes(state.otherForm, result)
  state.assessmentForm = getFormsByRes(state.assessmentForm, result)
  if (result?.skills?.length) {
    state.skillForm = state.skillForm.map(item => {
      if (item.prop === 'skillName') {
        item.value = result?.skills.map(skill => {
          return skill.skillName
        })
      }
      return item
    })
  }

  const educationForm: Form.FormItem[][] = getFormListByRes<CV.EducationHistories>(
    EDUCATION_BACKGROUND_FORM,
    result?.education_histories,
    state.educationForm?.[0]
  )
  if (educationForm.length > 0) {
    state.educationForm = educationForm
  }
  state.workForm = getFormListByRes<CV.WorkExperiences>(
    WORK_EXPERIENCE_FORM,
    result?.work_experiences,
    isAdd ? state.workForm?.[0] ?? [] : []
  )
  if (state.workForm.length === 0) {
    state.workForm = [cloneDeep(WORK_EXPERIENCE_FORM)]
  }
  state.projectForm = getFormListByRes<CV.ProjectExperiences>(
    PROJECT_EXPERIENCE_FORM,
    result?.project_experiences,
    isAdd ? state.projectForm?.[0] ?? [] : []
  )
  if (state.projectForm.length === 0) {
    state.projectForm = [cloneDeep(PROJECT_EXPERIENCE_FORM)]
  }
  state.languageForm = getFormListByRes<CV.Languages>(LANGUAGES_PROFICIENCY_FORM, result?.languages)
  if (state.languageForm.length === 0) {
    state.languageForm = [cloneDeep(LANGUAGES_PROFICIENCY_FORM)]
  }
  setTimeout(() => {
    nextTick(() => {
      skillFormRef.value && skillFormRef.value.changeFromModalRule(state.skillForm)
      changeOtherForm(state.otherForm.find(item => item.prop === 'recruitment_source')!)
    })
  }, 100)
}

const initEditForm = async (options: Form.FormSelect[]) => {
  if (props.isEdit) {
    await initEditData()
  } else {
    initData()
  }
  const item = state.jobIntentionForm.find(
    item => item.prop === 'applying_position'
  ) as Form.FormItem
  const option = options.find(option => option.value === item?.value)
  changeForm(item, option)
}

const getFormsByRes = (forms: Form.FormItem[], res: CV.CVDetail) => {
  return forms.map((item: Form.FormItem) => {
    let prop = item.prop as keyof CV.CVDetail
    if (prop === 'original_resume' || prop === 'attachments') {
      item.value = initFileInfo(res?.[prop] as ResultUploadInfo[])
    } else if (prop === 'interviewers') {
      item.value = res?.[prop]?.map((data: CV.PrivacyInterviewer) => data.id)
    } else if (prop === 'tags') {
      item.value = res?.[prop]?.map((data: UserTag) => data.tag_id)
    } else {
      item.value = res?.[prop]
    }
    return item
  })
}
const getFormListByRes = <T extends Record<string, any>>(
  forms: Form.FormItem[],
  list: T[] = [],
  oldForms: Form.FormItem[] = []
) => {
  const newForms: Form.FormItem[][] = []
  list?.forEach((item: T) => {
    const form = cloneDeep(forms).map(form => {
      const prop = form.prop as keyof T
      if (prop === 'date_from') {
        form.disableEndDate = item?.['date_to'] ?? null
      } else if (prop === 'date_to') {
        form.disableStartDate = item?.['date_from'] ?? null
      }
      if (form.showToday) {
        const prop1 = form.prop1 as keyof T
        form.upToNow = item?.[prop1]
        form.value = form.upToNo ? '' : item?.[prop]
        return form
      }
      form.value = item?.[prop]
      if (oldForms?.length && form.type === FormItemTypeEnum.SELECT) {
        form.options = oldForms.find(oldForm => oldForm.prop === prop)?.options ?? []
      }
      return form
    })
    newForms.push(form)
  })
  return newForms
}
const initFileInfo = (files: ResultUploadInfo[] = []): UploadFiles => {
  const fileList: UploadFiles = []
  files?.forEach(item => {
    fileList.push({ uid: item.uid, name: item.file_name, status: 'success' })
  })
  return fileList
}

const initData = () => {
  if (cvStore?.original_resume?.length) {
    initFormData((cvStore?.pdf_details ?? {}) as CV.CVDetail, true)
  }
}
const goBack = () => {
  if (router?.options?.history?.state?.back) {
    router.go(-1)
    return
  }
  router.replace({
    path: `/${ROUTER_CV_MANAGEMENT}`
  })
}
const showBg = (e: MouseEvent) => {
  const target = e.target as HTMLInputElement
  target?.parentElement?.classList.add('active')
}
const removeBg = (e: MouseEvent) => {
  const target = e.target as HTMLInputElement
  target?.parentElement?.classList.remove('active')
}
const changeBaseForm = (item: Form.FormItem) => {
  if (item.prop === 'birth_date') {
    const index = state.baseForm.findIndex(info => info.prop === 'age')
    if (index > -1) {
      state.baseForm[index].value = getAgeByBirth(item.value)
    }
  }
}
const changeWorkForm = (item: Form.FormItem, index: number) => {
  if (item.prop === 'date_from') {
    const i = state.workForm[index].findIndex(info => info.prop === 'date_to')
    if (i > -1) {
      state.workForm[index][i].disableStartDate = item.value
    }
  }
  if (item.prop === 'date_to') {
    const i = state.workForm[index].findIndex(info => info.prop === 'date_from')
    if (i > -1) {
      state.workForm[index][i].disableEndDate = item.value
    }
  }
}
const changeProjectForm = (item: Form.FormItem, index: number) => {
  if (item.prop === 'date_from') {
    const i = state.projectForm[index].findIndex(info => info.prop === 'date_to')
    if (i > -1) {
      state.projectForm[index][i].disableStartDate = item.value
    }
  }
  if (item.prop === 'date_to') {
    const i = state.projectForm[index].findIndex(info => info.prop === 'date_from')
    if (i > -1) {
      state.projectForm[index][i].disableEndDate = item.value
    }
  }
}
const changeOtherForm = (item: Form.FormItem) => {
  if (item.prop === 'recruitment_source') {
    const index = state.otherForm.findIndex(form => form.prop === 'original_resume')
    if (index > -1) {
      state.otherForm[index].required = item.value !== ResumeSourceEnum.LIEPIN
      espOtherRef.value && espOtherRef.value.changeFromModalRule(state.otherForm)
    }
  }
}
const getAgeByBirth = (date: string) => {
  const duration = moment.duration(moment().diff(date))
  return duration.years()
}
nextTick(() => {
  if (props.isEdit) {
    // state.educationForm = []
    state.workForm = []
    state.projectForm = []
    state.languageForm = []
  }
})

const getResumeByPhoneOrEmail = (key: string, value?: any) => {
  const param: Record<string, any> = {
    [key]: value
  }
  if (props.isEdit) {
    param.exclude_id = props.id
  }
  if (key === 'phone_number' || key === 'email') {
    existResumes(param).then(res => {
      const result = res?.result as CV.CVExist
      const item = state.baseForm.find(item => item.prop === key)
      if (item) {
        item.isFound = false
        if (result?.phone_number || result?.email) {
          item.isFound = true
        }
      }
    })
  }
}

const showView = (key: string, value?: any) => {
  cvStore.setSearchParam({ [key]: value })
  const { href } = router.resolve({
    path: `/${ROUTER_CV_MANAGEMENT}`
  })
  window.open(href, '_blank')
}
</script>
<style lang="less" scoped>
.resume-main-wrap {
  &:deep(.header) {
    margin-bottom: 1.2em;
  }
  &:deep(.esp-form-wrap) {
    padding-right: 2em;
    .esp-form-title {
      margin-top: 0;
    }
    padding-bottom: 1.8em;
    & + .esp-form-wrap {
      margin-top: 1.5em;
    }
  }
}
.multiple-form-wrap {
  margin-top: 1.5em;
  & + .esp-form-wrap {
    margin-top: 1.5em;
  }
  &:deep(.esp-form-wrap + .esp-form-wrap) {
    border-top: 1px solid var(--color-gray6);
    margin-top: 0;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      left: -3.3em;
      right: -3em;
      top: 0;
      height: 100%;
    }
    &.active {
      &::before {
        background-color: var(--color-gray6);
      }
    }
    .icon-delete {
      position: absolute;
      right: 0.3em;
      top: 50%;
      transform: translate(100%, -50%);
      color: var(--el-color-primary);
      font-size: var(--font-h3);
      opacity: 0.7;
      cursor: pointer;
      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
