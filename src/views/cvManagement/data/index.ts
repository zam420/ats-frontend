import {
  getGenderList,
  getEmploymentStatusList,
  getDegreeList,
  getPerformanceRankList,
  getResumeSourceList,
  getRecruitmentInfoChannelList,
  getUserList,
  getRecruitmentTypeList,
  getJobTypeList,
  getWorkLocationList
} from '@/api/modules/common'
import { getJobPositionListForCv } from '@/api/modules/jobPosition'
import { DATE_FORMAT, EMAIL_REG, TIME_FORMAT, URL_REG } from '@/config'
import { CandidateStatus } from '@/enums/candidateStatusEnum'
import { Degree } from '@/enums/degreeEnum'
import { EmploymentStatus } from '@/enums/employmentStatusEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { Gender } from '@/enums/genderEnum'
import { JobStatusEnum } from '@/enums/jobStatusEnum'
import { PerformanceRank } from '@/enums/performanceRankEnum'
import { RecruitmentInfoFrom } from '@/enums/recruitmentInfoFromEnum'
import { ResumeSource } from '@/enums/resumeSourceEnum'
import { ScheduleViewEnum } from '@/enums/scheduleViewEnum'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { UserPermissionEnum } from '@/enums/userPermission'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_CV_MANAGEMENT_DETAIL } from '@/router/routerName'
import { enumItem2arr, getThirtyMinutesTimeRange, hasNotEspressifEmail, isHasPermission } from '@/utils'
import { PooledReason } from '@/enums/pooledReasonEnum'
import moment from 'moment'
import { getInnerUserList, getUserListByRole } from '@/api/modules/user'
import { RecruitmentType } from '@/enums/recruitmentTypeEnum'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { getProjectList } from '@/api/modules/project'
import { UserRoleEnum } from '@/enums/userRoleEnum'
import { JobType } from '@/enums/jobTypeEnum'
import { WorkLocation } from '@/enums/workLocationEnum'
import { getTagList } from '@/api/modules/tagManagement'
const { $t } = useLocale()

// 简历表格
export const CV_TABLE: Table.ColumnProps[] = [
  {
    prop: TableColumnTypeEnum.SELECTION,
    columnType: TableColumnTypeEnum.SELECTION,
    width: 40,
    fixed: TableColumnFixedEnum.LEFT,
    export: false
  },
  {
    columnType: TableColumnTypeEnum.OPERATION,
    label: $t('table.operate'),
    width: 100,
    fixed: TableColumnFixedEnum.LEFT,
    isShow: isHasPermission(UserPermissionEnum.CRE)
  },
  {
    prop: 'name',
    label: $t('cv.candidate'),
    isFixedShow: true,
    fixed: TableColumnFixedEnum.LEFT,
    countKey: 'resume_count',
    filter: true
  },
  {
    prop: 'status',
    label: $t('cv.status'),
    slotName: 'status',
    status: CandidateStatus,
    type: FormItemTypeEnum.SELECT,
    width: 200,
    options: enumItem2arr(CandidateStatus),
    filter: false,
    isFixedShow: true
  },
  // {
  //   prop: 'nationality',
  //   label: $t('cv.nationality')
  // },
  {
    prop: 'gender_name',
    label: $t('cv.gender'),
    key: 'gender',
    type: FormItemTypeEnum.SELECT,
    options: enumItem2arr(Gender),
    width: '120',
    filter: true
  },
  {
    prop: 'phone_number',
    label: $t('cv.phoneNumber'),
    filter: true
  },
  {
    prop: 'email',
    label: $t('cv.email'),
    width: 180,
    filter: true
  },
  {
    prop: 'current_place',
    label: $t('cv.currentResidence'),
    filter: true
  },
  {
    prop: 'placeOfBirth',
    label: $t('cv.placeOfBirth'),
    key: ['native_place_province', 'native_place_city'],
    width: 125,
    filter: false
  },
  {
    prop: 'employment_status_name',
    label: $t('cv.currentStatus'),
    key: 'employment_status',
    type: FormItemTypeEnum.SELECT,
    options: enumItem2arr(EmploymentStatus),
    filter: true
  },
  {
    prop: 'expected_work_location',
    label: $t('cv.expectedWorkLocations'),
    width: 170,
    filter: false
  },
  {
    prop: 'bachelor_university',
    label: $t('cv.universityBachelors'),
    filter: true
  },
  {
    prop: 'highest_degree_name',
    label: $t('cv.highestDegree'),
    key: 'highest_degree',
    type: FormItemTypeEnum.SELECT,
    options: enumItem2arr(Degree),
    filter: true
  },
  {
    prop: 'highest_major',
    label: $t('cv.majorHighest'),
    filter: true
  },
  {
    prop: 'highest_university',
    label: $t('cv.highestUniversity'),
    filter: true
  },
  {
    prop: 'applying_position_title',
    label: $t('cv.jobPosition'),
    filter: false
  },
  {
    prop: 'recruitment_source_name',
    label: $t('cv.resumePortal'),
    key: 'recruitment_source',
    width: 130,
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    options: enumItem2arr(ResumeSource),
    filter: false
  },
  {
    prop: 'applied_at',
    label: $t('cv.appliedAt'),
    type: FormItemTypeEnum.DATE,
    clearable: true,
    filter: false
  },
  {
    prop: 'tags',
    label: $t('cv.tags'),
    slotName: 'tags',
    width: 300,
    filter: false,
    hideTooltip: true,
    class: 'tag-cell',
    sortable: false
  },
  {
    prop: 'screening_feedbacks',
    label: $t('cv.screeningFeedback'),
    width: 145,
    slotName: 'screeningFeedback',
    filter: false,
    sortable: false,
    hideTooltip: true
  },
  {
    prop: 'notes',
    label: $t('cv.notes'),
    slotName: 'notes',
    width: 195,
    hideTooltip: true,
    filter: true
  },
  {
    prop: 'test_score',
    label: $t('emailTemplate.writtenTestScore'),
    width: 100,
    filter: false
  },
  {
    prop: 'test_feedback',
    label: $t('cv.testFeedback'),
    slotName: 'testFeedback',
    hideTooltip: true,
    width: 135,
    filter: false,
    sortable: false
  },
  {
    prop: 'exam_result',
    label: $t('cv.writtenTestResult'),
    width: 100,
    filter: false,
    sortable: false
  },
  {
    prop: 'referral_code',
    label: $t('cv.referral_code')
  },
  {
    prop: 'expect_onboarding_date',
    label: $t('cv.expectedOnboardingDate'),
    isShow: false,
    width: 210,
    filter: false
  },
  { 
    prop: 'interview_result',
    label: $t('interviewer.interviewResult'),
    slotName: 'interviewResult',
    hideTooltip: true,
    width: 135,
    filter: false,
    sortable: false
  }
]

// 简历上传
export const RESUME_UPLOAD_FORM: Form.FormItem[] = [
  {
    label: $t('cv.appliedJobPosition'),
    prop: 'applying_position',
    type: FormItemTypeEnum.SELECT_V2,
    getOptions: getJobPositionListForCv,
    optionKey: 'id',
    optionName: 'title',
    optionExpandName: 'project_name',
    needTooltip: true,
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
    type: FormItemTypeEnum.SELECT_V2,
    getOptions: getJobPositionListForCv,
    optionKey: 'id',
    optionName: 'title',
    expandKey: ['recruitment_type'],
    optionExpandName: 'project_name',
    needTooltip: true,
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
    maxlength: 1000
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
    required: false,
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
    required: false
  },
  {
    label: $t('cv.dateTo'),
    prop: 'date_to',
    prop1: 'up_to_now',
    type: FormItemTypeEnum.MONTH,
    required: false,
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
    enum: ResumeSource
  },
  {
    label: $t('cv.referral_code'),
    prop: 'referral_code',
    maxlength: 10
  },
  {
    label: $t('cv.tags'),
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getTagList,
    optionKey: 'tag_id',
    optionName: 'name',
    prop: 'tags',
    maxTags: 2,
    col: 12
  },
  // {
  //   label: $t('cv.notes'),
  //   prop: 'notes',
  //   type: FormItemTypeEnum.TEXTAREA,
  //   col: 24,
  //   maxlength: 10000
  // },
  // {
  //   label: $t('cv.privacyNotes'),
  //   prop: 'interviewers',
  //   type: FormItemTypeEnum.MULTIPLE_SELECT,
  //   getOptions: getInterviewers,
  //   optionKey: 'id',
  //   optionName: 'name',
  //   placeholder: $t('cv.privacyViewerPlaceHolder'),
  //   col: 24
  // },
  // {
  //   label: '',
  //   prop: 'privacy_notes',
  //   type: FormItemTypeEnum.TEXTAREA,
  //   placeholder: $t('cv.privacyNotesPlaceHolder'),
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
    validateRules: URL_REG,
    placeholder: $t('form.link')
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
  // {
  //   label: $t('cv.notesInterviewers'),
  //   prop: 'interviewers',
  //   isFontBold: true,
  //   col: 24
  // },
  // {
  //   label: $t('cv.privacyNotes'),
  //   prop: 'privacy_notes',
  //   isFontBold: true,
  //   labelPosition: 'top',
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

// Schedule菜单
export const SCHEDULE_MENU_LIST: Form.FormSelect[] = [
  {
    label: $t('cv.oneToOneInterview'),
    value: ScheduleViewEnum.ONE_BY_ONE
  },
  {
    label: $t('cv.groupInterview'),
    value: ScheduleViewEnum.GROUP
  }
]

// forward resume form
export const FORWARD_RESUME_FORM: Form.FormItem[] = [
  {
    label: $t('cv.selectedCandidate'),
    prop: 'candidate_resume_ids',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    disabled: true,
    maxTags: 5,
    col: 24
  },
  {
    label: $t('emailTemplate.receivers'),
    prop: 'receivers',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: () => {
      return getUserList(ShareTypeEnum.FORWARD_RECEIVER)
    },
    allowCreate: true,
    optionKey: 'email',
    validateFun: (data: any) => {
      return hasNotEspressifEmail(data)
    },
    text: $t('message.emailFormatError'),
    collapseTag: false,
    optionName: 'name',
    optionSubName: 'email',
    required: true,
    col: 24
  }
]

// forward test form
export const FORWARD_TEST_FORM: Form.FormItem[] = [
  {
    label: $t('cv.selectedCandidate'),
    prop: 'resume_ids',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    disabled: true,
    maxTags: 5,
    col: 24
  },
  {
    label: $t('emailTemplate.receivers'),
    prop: 'interviewers',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: () => {
      return getUserList(ShareTypeEnum.FORWARD_RECEIVER)
    },
    allowCreate: true,
    optionKey: 'email',
    validateFun: (data: any) => {
      return hasNotEspressifEmail(data)
    },
    text: $t('message.emailFormatError'),
    collapseTag: false,
    optionName: 'name',
    optionSubName: 'email',
    required: true,
    col: 24
  }
]

const today = moment(new Date()).format(DATE_FORMAT)
const currentTime = getThirtyMinutesTimeRange()
const startFullDate = `${today} ${currentTime.startTime}:00`
const thirtyMinutesAgo = new Date(startFullDate).setMinutes(new Date(startFullDate).getMinutes() - 30);
// move to talent pool form
export const MOVE_TALENT_POOP_FORM: Form.FormItem[] = [
  {
    label: $t('cv.selectedCandidate'),
    prop: 'resumes_ids',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    disabled: true,
    maxTags: 5,
    col: 24
  },
  {
    label: $t('cv.pooledReason'),
    prop: 'pooled_reason',
    type: FormItemTypeEnum.SELECT,
    options: enumItem2arr(PooledReason),
    required: true,
    col: 12
  },
  {
    label: ' ',
    prop: 'comments',
    placeholder: $t('cv.addNotes'),
    col: 12
  },
  {
    label: $t('cv.sentRejectionLetter'),
    prop: 'send_thanks_letter',
    type: FormItemTypeEnum.RADIO,
    options: [{value: true, label: $t('cv.yes')}, {value: false, label: $t('cv.no')}],
    labelPosition: 'left',
    value: true,
    required: true,
    col: 24
  },
  {
    label: $t('cv.sentTime'),
    prop: 'send_time',
    prop1: 'send_immediately',
    type: FormItemTypeEnum.DATE_TIME,
    disableStartDate: today,
    value: startFullDate,
    startDate: today,
    showToday: true,
    startTime: currentTime.startTime,
    disableStartTime: moment(thirtyMinutesAgo).format(TIME_FORMAT),
    required: true,
    col: 24
  }
]

export const EMAIL_TEMPLATE_FORM: Form.FormItem[] = [
  {
    label: '',
    prop: '',
    type: FormItemTypeEnum.HORIZONTAL_LINE
  },
  {
    label: $t('menu.emailTemplate'),
    type: FormItemTypeEnum.SELECT,
    prop: 'email_template',
    required: true,
    col: 24
  }
]

// contact candidate form
export const CONTACT_CANDIDATE_FORM: Form.FormItem[] = [
  {
    label: $t('cv.selectedCandidate'),
    prop: 'resumes_ids',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    disabled: true,
    maxTags: 5,
    col: 24
  },
  {
    label: $t('cv.cc'),
    prop: 'bcc_users',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getInnerUserList,
    optionKey: 'id',
    optionName: 'email',
    col: 24
  }
]

export const CONTACT_EMAIL_TEMPLATE_FORM: Form.FormItem[] = [
  {
    label: $t('menu.emailTemplate'),
    type: FormItemTypeEnum.SELECT,
    prop: 'email_template',
    required: true,
    col: 24
  }
]

// move to onboarding management form
export const MOVE_ONBOARDING_FORM: Form.FormItem[] = [
  {
    label: $t('cv.selectedCandidate'),
    prop: 'resumes_ids',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    disabled: true,
    maxTags: 5,
    col: 24
  },
  {
    label: $t('cv.expectedOnboardingDate'),
    prop: 'expect_onboarding_date',
    type: FormItemTypeEnum.DATE,
    required: true,
    col: 24
  }
]

// quick notes form
export const QUICK_NOTES_FORM: Form.FormItem[] = [
  {
    label: $t('cv.notes'),
    prop: 'notes',
    type: FormItemTypeEnum.TEXTAREA,
    required: true,
    maxlength: 10000,
    rows: 10,
    col: 24
  }
]

// send test form
export const SEND_WRITTEN_TEST_FORM: Form.FormItem[] = [
  {
    label: $t('cv.selectedCandidate'),
    prop: 'resumes_ids',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    disabled: true,
    maxTags: 5,
    col: 24
  },
  {
    label: $t('cv.writtenTestPaper'),
    prop: 'paper_id',
    type: FormItemTypeEnum.SELECT,
    // getOptions: getTestPapper,
    // optionKey: 'paper_id',
    // optionName: 'paper_name',
    required: true,
    col: 24
  }
  // {
  //   label: $t('cv.testTime'),
  //   prop: 'testTime',
  //   type: FormItemTypeEnum.DATE_TIME_RANGE,
  //   minPlaceholder: $t('cv.startDate'),
  //   maxPlaceholder: $t('cv.endDate'),
  //   disableStartTimeDate: today,
  //   disableStartDate: today,
  //   required: true,
  //   col: 24
  // }
]

// 表格筛选表单
export const FILTER_FORM: Form.FormItem[] = [
  {
    label: $t('cv.university'),
    prop: 'university',
    groupName: $t('cv.basicInfo'),
    groupOrder: 1,
    clearable: true
  },
  {
    label: $t('cv.major'),
    prop: 'major',
    groupName: $t('cv.basicInfo'),
    groupOrder: 1,
    clearable: true
  },
  {
    prop: 'graduation_year',
    label: $t('cv.graduationYear'),
    type: FormItemTypeEnum.YEAR_RANGE,
    groupName: $t('cv.basicInfo'),
    groupOrder: 1,
    clearable: true,
    minProp: 'graduation_year_start',
    maxProp: 'graduation_year_end',
    minPlaceholder: $t('cv.from'),
    maxPlaceholder: $t('cv.to')
  },
  {
    prop: 'expected_work_location',
    label: $t('cv.expectedWorkLocations'),
    groupName: $t('cv.basicInfo'),
    groupOrder: 1,
    clearable: true
  },
  {
    prop: 'native_place_province',
    label: $t('cv.placeOfBirthProvince'),
    groupName: $t('cv.basicInfo'),
    groupOrder: 1,
    clearable: true
  },
  {
    prop: 'native_place_city',
    label: $t('cv.placeOfBirthCity'),
    groupName: $t('cv.basicInfo'),
    groupOrder: 1,
    clearable: true
  },
  {
    prop: 'applied_at',
    label: $t('cv.appliedAt'),
    type: FormItemTypeEnum.DATE_RANGE,
    groupName: $t('cv.applicationInfo'),
    groupOrder: 2,
    clearable: true,
    minProp: 'applied_at_start',
    maxProp: 'applied_at_end',
    minPlaceholder: $t('cv.from'),
    maxPlaceholder: $t('cv.to')
  },
  {
    prop: 'recruitment_source',
    label: $t('cv.resumePortal'),
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    options: enumItem2arr(ResumeSource),
    teleported: false,
    groupName: $t('cv.applicationInfo'),
    groupOrder: 2,
    clearable: true
  },
  {
    prop: 'written_exam_score',
    label: $t('emailTemplate.writtenTestScore'),
    type: FormItemTypeEnum.NUMBER_RANGE,
    groupName: $t('cv.applicationInfo'),
    groupOrder: 3,
    clearable: true,
    minProp: 'written_exam_score_from',
    maxProp: 'written_exam_score_to',
    minPlaceholder: $t('cv.from'),
    maxPlaceholder: $t('cv.to'),
    additionalTitle: $t('cv.evaluationResult')
  }
  // {
  //   prop: 'screening_feedback',
  //   label: $t('cv.screeningFeedback'),
  //   type: FormItemTypeEnum.MULTIPLE_SELECT,
  //   options: enumItem2arr(InterviewerStatus),
  //   groupName: $t('cv.evaluationResult'),
  //   groupOrder: 3,
  //   clearable: true
  // }
]

// job position筛选表单
export const JOBPOSITION_FILTER_FORM: Form.FormItem[] = [
  {
    label: $t('jobPosition.workLocation'),
    prop: 'work_location_ids',
    type: FormItemTypeEnum.TREE_MULTIPLE_SELECT,
    teleported: false,
    getOptions: getWorkLocationList,
    optionKey: 'value',
    optionName: 'name',
    enum: WorkLocation,
    clearable: true
  },
  {
    label: $t('jobPosition.recruitmentProject'),
    prop: 'project_id',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    teleported: false,
    getOptions: getProjectList,
    optionKey: 'project_id',
    optionName: 'project_name',
    clearable: true
  },
  {
    label: $t('jobPosition.HRRecruiter'),
    prop: 'recruiter_id',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    teleported: false,
    getOptions: getUserListByRole,
    initOptionParams: { role: UserRoleEnum.HRR },
    clearable: true
  },
  {
    label: $t('jobPosition.recruitmentType'),
    prop: 'recruitment_type',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    teleported: false,
    getOptions: getRecruitmentTypeList,
    optionKey: 'value',
    optionName: 'name',
    enum: RecruitmentType,
    clearable: true
  },
  {
    label: $t('jobPosition.jobType'),
    prop: 'job_type',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    teleported: false,
    getOptions: getJobTypeList,
    optionKey: 'value',
    optionName: 'name',
    enum: JobType,
    clearable: true
  },
  {
    label: $t('jobPosition.projectStatus'),
    prop: 'project_status',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    teleported: false,
    options: enumItem2arr(ProjectStatus),
    clearable: true,
    value: [ProjectStatusEnum.ACTIVE]
  }
]