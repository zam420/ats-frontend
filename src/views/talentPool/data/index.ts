import { useLocale } from '@/hooks/useLocale'
import { ROUTER_TALENT_POOL_DETAIL } from '@/router/routerName'
import {
  getGenderList,
  getEmploymentStatusList,
  getDegreeList,
  getPerformanceRankList,
  getResumeSourceList,
  getRecruitmentInfoChannelList
} from '@/api/modules/common'
import { getJobPositionList } from '@/api/modules/jobPosition'
import { EMAIL_REG, URL_REG } from '@/config'
import { Degree } from '@/enums/degreeEnum'
import { EmploymentStatus } from '@/enums/employmentStatusEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { Gender } from '@/enums/genderEnum'
import { JobStatusEnum } from '@/enums/jobStatusEnum'
import { PerformanceRank } from '@/enums/performanceRankEnum'
import { RecruitmentInfoFrom } from '@/enums/recruitmentInfoFromEnum'
import { ResumeSource } from '@/enums/resumeSourceEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { enumItem2arr } from '@/utils'
import { PooledReason } from '@/enums/pooledReasonEnum'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { ProjectStatusEnum } from '@/enums/projectStatusEnum'
const { $t } = useLocale()

export const TALENT_POOL_TABLE: Partial<Table.ColumnProps>[] = [
  {
    columnType: TableColumnTypeEnum.OPERATION,
    label: $t('table.operate'),
    width: 120,
    fixed: TableColumnFixedEnum.LEFT
  },
  {
    prop: 'candidate_name',
    label: $t('cv.candidateName'),
    link: ROUTER_TALENT_POOL_DETAIL,
    isFixedShow: true,
    isPaddingLeft: true,
    fixed: TableColumnFixedEnum.LEFT
  },
  {
    prop: 'phone_number',
    label: $t('cv.phoneNumber'),
    filter: true
  },
  {
    prop: 'email',
    label: $t('cv.email'),
    width: '210',
    filter: true
  },
  {
    prop: 'bachelor_university',
    label: $t('tp.universityBachelor')
  },
  {
    prop: 'highest_university',
    label: $t('tp.universityHighest')
  },
  {
    prop: 'highest_degree_name',
    label: $t('cv.highestDegree'),
    key: 'highest_degree',
    type: FormItemTypeEnum.SELECT,
    options: enumItem2arr(Degree)
  },
  {
    prop: 'highest_major',
    label: $t('tp.majorHighest')
  },
  {
    prop: 'latest_company_name',
    label: $t('tp.companyName')
  },
  {
    prop: 'job_position_name',
    label: $t('cv.jobPosition')
  },
  {
    prop: 'pooled_reason',
    label: $t('tp.pooledReason'),
    type: FormItemTypeEnum.SELECT,
    slotName: 'pooledReason',
    options: enumItem2arr(PooledReason)
  },
  {
    prop: 'pooled_at',
    label: $t('tp.pooledAt'),
    type: FormItemTypeEnum.DATE,
    clearable: true
  },
  {
    prop: 'referral_code',
    label: $t('cv.referral_code')
  }
]
// 简历上传
export const RESUME_UPLOAD_FORM: Form.FormItem[] = [
  {
    label: $t('cv.appliedJobPosition'),
    prop: 'applying_position',
    type: FormItemTypeEnum.SELECT_V2,
    getOptions: getJobPositionList,
    optionKey: 'id',
    optionName: 'title',
    initOptionParams: { status: [JobStatusEnum.Draft, JobStatusEnum.Published], project_status: [ProjectStatusEnum.ACTIVE] },
    required: true,
    col: 24
  },
  {
    label: $t('cv.resumePortal'),
    prop: 'recruitment_source',
    type: FormItemTypeEnum.SELECT_V2,
    getOptions: getResumeSourceList,
    optionKey: 'value',
    optionName: 'name',
    required: true,
    enum: ResumeSource,
    col: 24
  }
]

// 简历表单
export const CV_BASIC_FORM: Form.FormItem[] = [
  {
    label: $t('cv.candidateName'),
    prop: 'name',
    required: true,
    maxlength: 50
  },
  {
    label: $t('cv.gender'),
    prop: 'gender',
    type: FormItemTypeEnum.RADIO_BTN,
    getOptions: getGenderList,
    optionKey: 'value',
    optionName: 'name',
    enum: Gender
  },
  {
    label: $t('cv.dateOfBirth'),
    prop: 'birth_date',
    type: FormItemTypeEnum.DATE
  },
  {
    label: $t('cv.age'),
    prop: 'age',
    disabled: true
  },
  {
    label: $t('cv.phoneNumber'),
    prop: 'phone_number',
    text: $t('form.foundPhoneNumber'),
    maxlength: 50
  },
  {
    label: $t('cv.email'),
    prop: 'email',
    validateRules: EMAIL_REG,
    text: $t('form.foundEmail')
  },
  {
    label: $t('cv.currentStatus'),
    prop: 'employment_status',
    type: FormItemTypeEnum.RADIO_BTN,
    getOptions: getEmploymentStatusList,
    optionKey: 'value',
    optionName: 'name',
    enum: EmploymentStatus
  },
  {
    label: $t('cv.currentResidence'),
    prop: 'current_place',
    maxlength: 200
  },
  {
    label: $t('cv.placeOfBirthProvince'),
    prop: 'native_place_province',
    maxlength: 50
  },
  {
    label: $t('cv.placeOfBirthCity'),
    prop: 'native_place_city',
    maxlength: 50
  }
]
// 求职意向表单
export const CV_JOB_INTENTION_FORM: Form.FormItem[] = [
  {
    label: $t('cv.appliedJobPosition'),
    prop: 'applying_position',
    type: FormItemTypeEnum.SELECT,
    getOptions: getJobPositionList,
    optionKey: 'id',
    optionName: 'title',
    expandKey: ['recruitment_type'],
    initOptionParams: { status: [JobStatusEnum.Draft, JobStatusEnum.Published], project_status: [ProjectStatusEnum.ACTIVE] },
    isCallback: true,
    required: true
  },
  {
    label: $t('cv.expectedWorkLocations'),
    prop: 'expected_work_location',
    maxlength: 50
  },
  {
    label: $t('cv.expectedSalary'),
    prop: 'expected_salary',
    col: 5,
    maxlength: 100
  },
  {
    label: $t('cv.accessRecruitingInformationFrom'),
    prop: 'recruitment_info_from',
    type: FormItemTypeEnum.SELECT,
    getOptions: getRecruitmentInfoChannelList,
    optionKey: 'value',
    optionName: 'name',
    required: true,
    enum: RecruitmentInfoFrom,
    col: 7
  }
]
// 教育经历表单
export const EDUCATION_BACKGROUND_FORM: Form.FormItem[] = [
  {
    label: 'ID',
    prop: 'id',
    isHide: true,
    isParam: true
  },
  {
    label: $t('cv.universityName'),
    prop: 'university',
    maxlength: 100
  },
  {
    label: $t('cv.school'),
    prop: 'school',
    maxlength: 100
  },
  {
    label: $t('cv.dateFrom'),
    prop: 'date_from',
    type: FormItemTypeEnum.MONTH
  },
  {
    label: $t('cv.dateTo'),
    prop: 'date_to',
    prop1: 'up_to_now',
    type: FormItemTypeEnum.MONTH,
    showToday: true,
    upToNow: false
  },
  {
    label: $t('cv.degree'),
    prop: 'degree',
    type: FormItemTypeEnum.SELECT,
    getOptions: getDegreeList,
    optionKey: 'value',
    optionName: 'name',
    enum: Degree
  },
  {
    label: $t('cv.major'),
    prop: 'major',
    maxlength: 100
  },
  {
    label: $t('cv.performanceRanking'),
    prop: 'performance_rank',
    type: FormItemTypeEnum.SELECT,
    getOptions: getPerformanceRankList,
    optionKey: 'value',
    optionName: 'name',
    enum: PerformanceRank
  },
  {
    label: $t('cv.labName'),
    prop: 'lab_name',
    maxlength: 200
  }
]

// 工作经历表单
export const WORK_EXPERIENCE_FORM: Form.FormItem[] = [
  {
    label: 'ID',
    prop: 'id',
    isHide: true,
    isParam: true
  },
  {
    label: $t('cv.companyName'),
    prop: 'company_name',
    maxlength: 100
  },
  {
    label: $t('cv.title'),
    prop: 'title',
    maxlength: 100
  },
  {
    label: $t('cv.dateFrom'),
    prop: 'date_from',
    type: FormItemTypeEnum.MONTH
  },
  {
    label: $t('cv.dateTo'),
    prop: 'date_to',
    prop1: 'up_to_now',
    type: FormItemTypeEnum.MONTH,
    showToday: true,
    upToNow: false
  },
  {
    label: $t('cv.majorAchievement'),
    prop: 'major_achievement',
    type: FormItemTypeEnum.TEXTAREA,
    col: 24,
    maxlength: 500
  }
]

// 项目经历表单
export const PROJECT_EXPERIENCE_FORM: Form.FormItem[] = [
  {
    label: 'ID',
    prop: 'id',
    isHide: true,
    isParam: true
  },
  {
    label: $t('cv.projectName'),
    prop: 'project_name',
    required: true,
    maxlength: 100
  },
  {
    label: $t('cv.projectRole'),
    prop: 'project_role'
  },
  {
    label: $t('cv.dateFrom'),
    prop: 'date_from',
    type: FormItemTypeEnum.MONTH,
    required: true
  },
  {
    label: $t('cv.dateTo'),
    prop: 'date_to',
    prop1: 'up_to_now',
    type: FormItemTypeEnum.MONTH,
    required: true,
    showToday: true,
    upToNow: false
  },
  {
    label: $t('cv.projectDescription'),
    prop: 'project_desc',
    type: FormItemTypeEnum.TEXTAREA,
    col: 12,
    maxlength: 500
  },
  {
    label: $t('cv.projectResponsibility'),
    prop: 'major_achievement',
    type: FormItemTypeEnum.TEXTAREA,
    col: 12,
    maxlength: 500
  }
]

// 技能熟练度表单
export const SKILLS_PROFICIENCY_FORM: Form.FormItem[] = [
  {
    label: $t('cv.skillName'),
    prop: 'skillName',
    type: FormItemTypeEnum.TAG,
    maxTags: 6,
    col: 24
  }
]

// 语言熟练度表单
export const LANGUAGES_PROFICIENCY_FORM: Form.FormItem[] = [
  {
    label: $t('cv.languages'),
    prop: 'languages',
    col: 12
  },
  {
    label: $t('cv.level'),
    prop: 'level',
    col: 12,
    maxlength: 100
  }
]

// 自我评价表单
export const SELF_ASSESSMENT_FORM: Form.FormItem[] = [
  {
    label: $t('cv.assessmentContent'),
    prop: 'self_assessment',
    type: FormItemTypeEnum.TEXTAREA,
    col: 24,
    maxlength: 1000
  }
]

// 其他信息表单
export const OTHER_INFORMATION_FORM: Form.FormItem[] = [
  {
    label: $t('cv.resumePortal'),
    prop: 'recruitment_source',
    type: FormItemTypeEnum.SELECT,
    getOptions: getResumeSourceList,
    optionKey: 'value',
    optionName: 'name',
    enum: ResumeSource,
    required: true
  },
  {
    label: $t('cv.referral_code'),
    prop: 'referral_code',
    maxlength: 10
  },
  {
    label: $t('cv.tags'),
    type: FormItemTypeEnum.TAG,
    prop: 'tags',
    maxTags: 2,
    col: 12
  },
  // {
  //   label: $t('cv.notes'),
  //   prop: 'notes',
  //   type: FormItemTypeEnum.TEXTAREA,
  //   col: 24,
  //   maxlength: 500
  // },
  {
    label: $t('cv.originalResume'),
    prop: 'original_resume',
    type: FormItemTypeEnum.FILE_ICON,
    accept: 'PDF/DOC/DOCX/HTML',
    fileNum: 20,
    required: true,
    class: 'disabled-remove',
    col: 24
  },
  {
    label: $t('cv.otherDocuments'),
    prop: 'attachment_links',
    validateRules: URL_REG
  },
  {
    label: '',
    prop: 'attachments',
    type: FormItemTypeEnum.FILE_ICON,
    accept: 'PDF/DOC/DOCX/HTML',
    fileNum: 5,
    col: 24
  }
]

export const CV_QUESTION_FORM: Form.FormItem = {
  label: $t('cv.q'),
  prop: 'question',
  type: FormItemTypeEnum.TEXTAREA,
  col: 12,
  maxlength: 3000
}

// 简历表单详情
export const CV_BASIC_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.dateOfBirth'),
    prop: 'birth_date'
  },
  {
    label: $t('cv.placeOfBirthProvinceCity'),
    prop: 'native_place_province',
    isLine: true
  },
  {
    label: '',
    prop: '',
    isNewRow: true
  },
  {
    label: $t('cv.highestDegree'),
    prop: 'highest_degree',
    enum: Degree
  },
  {
    label: $t('cv.lastCompanyName'),
    prop: 'last_company_name',
    isLine: true
  },
  {
    label: $t('cv.currentStatus'),
    prop: 'employment_status',
    enum: EmploymentStatus,
    isLine: true
  }
]

// 求职意向详情
export const CV_JOB_INTENTION_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.jobPosition'),
    prop: 'applying_position_title'
  },
  {
    label: $t('cv.expectedWorkLocations'),
    prop: 'expected_work_location',
    isLine: true
  },
  {
    label: $t('cv.expectedSalary'),
    prop: 'expected_salary',
    isLine: true
  },
  {
    label: $t('cv.accessRecruitingInformationFrom'),
    prop: 'recruitment_info_from',
    enum: RecruitmentInfoFrom,
    isLine: true
  }
]

// 教育经历详情
export const EDUCATION_BACKGROUND_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.universityName'),
    prop: 'university',
    hasTime: true,
    isTitle: true,
    col: 24
  },
  {
    label: $t('cv.school'),
    prop: 'school'
  },
  {
    label: $t('cv.degree'),
    prop: 'degree',
    enum: Degree,
    isLine: true
  },
  {
    label: $t('cv.major'),
    prop: 'major',
    isLine: true
  },
  {
    label: $t('cv.ranking'),
    prop: 'performance_rank',
    enum: PerformanceRank,
    isLine: true
  },
  {
    label: $t('cv.lab'),
    prop: 'lab_name',
    isLine: true
  }
]

// 工作经历详情
export const WORK_EXPERIENCE_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.companyName'),
    prop: 'company_name',
    isTitle: true,
    hasTime: true,
    isLabel: false,
    col: 24
  },
  {
    label: $t('cv.title'),
    prop: 'title',
    isLabel: false,
    isFontBold: true,
    col: 24
  },
  {
    label: $t('cv.majorAchievement'),
    prop: 'major_achievement',
    isFontBold: true,
    col: 24
  }
]

// 项目经历详情
export const PROJECT_EXPERIENCE_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.projectName'),
    prop: 'project_name',
    isTitle: true,
    hasTime: true,
    isLabel: false,
    col: 24
  },
  {
    label: $t('cv.projectRole'),
    prop: 'project_role',
    isLabel: false,
    isFontBold: true,
    col: 24
  },
  {
    label: $t('cv.projectDescription'),
    prop: 'project_desc',
    isFontBold: true,
    col: 24
  },
  {
    label: $t('cv.majorAchievement'),
    prop: 'major_achievement',
    isFontBold: true,
    col: 24
  }
]

// 技能熟练度表单
export const SKILLS_PROFICIENCY_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.skillName'),
    prop: 'skillName',
    isLabel: false,
    isTag: true,
    col: 24
  }
]

// 语言熟练度表单
export const LANGUAGES_PROFICIENCY_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.languages'),
    prop: 'languages',
    isLabel: false
  },
  {
    label: $t('cv.level'),
    prop: 'level',
    isLabel: false,
    isLine: true
  }
]
// 自我评价表单
export const SELF_ASSESSMENT_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.assessmentContent'),
    prop: 'self_assessment',
    isLabel: false,
    col: 24
  }
]

// 其他信息表单
export const OTHER_INFORMATION_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.resumePortal'),
    prop: 'recruitment_source',
    enum: ResumeSource
  },
  {
    label: $t('cv.referral_code'),
    prop: 'referral_code',
    isLine: true
  },
  {
    label: '',
    prop: '',
    isNewRow: true
  },
  // {
  //   label: $t('cv.notes'),
  //   prop: 'notes',
  //   isFontBold: true,
  //   labelPosition: 'top',
  //   btnText: $t('button.checkContactInfoInLiePin'),
  //   col: 24
  // },
  {
    label: $t('cv.originalResume'),
    prop: 'original_resume',
    isFile: true,
    class: 'pdf-not-show',
    isFontBold: true,
    labelPosition: 'top',
    col: 24
  },
  {
    label: $t('cv.otherDocuments'),
    prop: 'attachment_links',
    labelPosition: 'top',
    isFontBold: true,
    isLink: true,
    associatedField: 'attachments',
    col: 24
  },
  {
    label: '',
    prop: 'attachments',
    isFile: true,
    isFontBold: true,
    isLabel: false,
    class: 'pdf-not-show',
    col: 24
  }
]

// 问题详情
export const QUESTION_DETAIL: Form.DetailItem[] = [
  {
    label: '',
    prop: 'question',
    isTitle: true,
    isLabel: false,
    col: 24
  },
  {
    label: '',
    prop: 'answer',
    isLabel: false,
    col: 24
  }
]

// 详情
export const CV_CREATED_DETAIL: Form.DetailItem[] = [
  {
    label: $t('table.createdBy'),
    prop: 'created_by'
  },
  {
    label: $t('table.createdAt'),
    prop: 'create_at',
    isLine: true
  },
  {
    label: $t('table.lastModifiedAt'),
    prop: 'update_at',
    isLine: true
  }
]
