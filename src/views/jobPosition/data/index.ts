import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { JobStatus } from '@/enums/jobStatusEnum'
import { ROUTER_JOB_POSITION_DETAIL } from '@/router/routerName'
import { getProjectList } from '@/api/modules/project'
import {
  getChannelTypeList,
  getEmploymentTypeList,
  getJobTypeList,
  getRecruitmentTypeList,
  getResumeInboxList,
  getWorkLocationList
} from '@/api/modules/common'
import { RecruitmentType } from '@/enums/recruitmentTypeEnum'
import { EmploymentType } from '@/enums/employmentTypeEnum'
import { JobType } from '@/enums/jobTypeEnum'
import { WorkLocation } from '@/enums/workLocationEnum'
import { getUserListByRole } from '@/api/modules/user'
import { UserRoleEnum } from '@/enums/userRoleEnum'
import { ChannelType } from '@/enums/channelTypeEnum'
import { ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { UserPermissionEnum } from '@/enums/userPermission'
import { isHasPermission } from '@/utils'

const { $t } = useLocale()

// 表格
export const JOB_POSITION_TABLE: Table.ColumnProps[] = [
  // 选择框单元格
  // {
  //   prop: TableColumnTypeEnum.SELECTION,
  //   columnType: TableColumnTypeEnum.SELECTION,
  //   width: 40,
  //   fixed: TableColumnFixedEnum.LEFT,
  //   export: false
  // },
  {
    columnType: TableColumnTypeEnum.OPERATION,
    label: $t('table.operate'),
    width: 50,
    fixed: TableColumnFixedEnum.LEFT,
    isShow: isHasPermission(UserPermissionEnum.JPE)
  },
  {
    prop: 'title',
    label: $t('jobPosition.jobTitle'),
    link: ROUTER_JOB_POSITION_DETAIL
  },
  {
    prop: 'project_name',
    label: $t('jobPosition.recruitmentProject')
  },
  {
    prop: 'recruitment_type_name',
    label: $t('jobPosition.recruitmentType')
  },
  {
    prop: 'work_location',
    label: $t('jobPosition.workLocation')
  },
  {
    prop: 'status',
    label: $t('jobPosition.status'),
    status: JobStatus,
    width: '100px',
    filter: false
  }
]

// 工作职位表单
export const JOB_POSITION_BASIC_FORM: Form.FormItem[] = [
  {
    label: $t('jobPosition.jobTitle'),
    prop: 'title',
    maxlength: 100,
    required: true,
    md: 8
  },
  {
    label: $t('jobPosition.recruitmentProject'),
    prop: 'project_id',
    type: FormItemTypeEnum.SELECT,
    getOptions: getProjectList,
    optionKey: 'project_id',
    optionName: 'project_name',
    initOptionParams: { status: ProjectStatusEnum.ACTIVE },
    required: true,
    md: 8
  },
  {
    label: $t('jobPosition.recruitmentType'),
    prop: 'recruitment_type',
    type: FormItemTypeEnum.SELECT,
    getOptions: getRecruitmentTypeList,
    optionKey: 'value',
    optionName: 'name',
    enum: RecruitmentType,
    required: true,
    md: 8
  },
  {
    label: $t('jobPosition.employmentType'),
    prop: 'employment_type',
    type: FormItemTypeEnum.SELECT,
    getOptions: getEmploymentTypeList,
    optionKey: 'value',
    optionName: 'name',
    enum: EmploymentType,
    required: true,
    md: 8
  },
  {
    label: $t('jobPosition.jobType'),
    prop: 'job_type',
    type: FormItemTypeEnum.SELECT,
    getOptions: getJobTypeList,
    optionKey: 'value',
    optionName: 'name',
    enum: JobType,
    required: true,
    md: 8
  },
  {
    label: $t('jobPosition.workLocation'),
    prop: 'work_location',
    type: FormItemTypeEnum.TREE_MULTIPLE_SELECT,
    getOptions: getWorkLocationList,
    optionKey: 'value',
    optionName: 'name',
    enum: WorkLocation,
    required: true,
    md: 8
  }
]
// 职位描述
export const JOB_POSITION_DETAIL_FORM: Form.FormItem[] = [
  {
    label: $t('jobPosition.jobDescription'),
    prop: 'job_desc',
    type: FormItemTypeEnum.TEXTAREA,
    required: true,
    col: 12,
    maxlength: 5000
  },
  {
    label: $t('jobPosition.jobRequirements'),
    prop: 'job_req',
    type: FormItemTypeEnum.TEXTAREA,
    required: true,
    col: 12,
    maxlength: 1000
  }
]
// 职位其他信息
export const JOB_POSITION_OTHER_FORM: Form.FormItem[] = [
  {
    label: $t('jobPosition.HRRecruiter'),
    prop: 'hr_recruiter',
    type: FormItemTypeEnum.SELECT,
    getOptions: getUserListByRole,
    initOptionParams: { role: UserRoleEnum.HRR },
    required: true,
    md: 8
  },
  {
    label: $t('jobPosition.HRCoordinators'),
    prop: 'hr_coordinators',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getUserListByRole,
    multipleLimit: 10,
    clearable: true,
    initOptionParams: { role: UserRoleEnum.HRRC },
    md: 8
  },
  {
    label: $t('jobPosition.interviewProcessTemplate'),
    prop: 'interview_process_templates',
    clearable: true,
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    md: 8
  },
  {
    label: $t('jobPosition.resumeInbox'),
    prop: 'resume_inbox',
    type: FormItemTypeEnum.SELECT,
    getOptions: getResumeInboxList,
    optionKey: 'value',
    optionName: 'value',
    required: true,
    md: 8
  },
  {
    label: $t('jobPosition.jobPortals'),
    prop: 'publish_channel',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getChannelTypeList,
    optionKey: 'value',
    optionName: 'name',
    clearable: true,
    enum: ChannelType,
    md: 8
  },
  {
    label: $t('jobPosition.professionalInterviewFeedback'),
    prop: 'public_interview_feedback',
    type: FormItemTypeEnum.SWITCH,
    value: false,
    md: 8
  }
]

// 职位问题信息
export const JOB_POSITION_QUESTIONS_FORM: Form.FormItem[] = [
  {
    label: $t('jobPosition.question', { number: 1 }),
    prop: 'question1',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 2 }),
    prop: 'question2',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 3 }),
    prop: 'question3',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 4 }),
    prop: 'question4',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 5 }),
    prop: 'question5',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 6 }),
    prop: 'question6',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 7 }),
    prop: 'question7',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 8 }),
    prop: 'question8',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 9 }),
    prop: 'question9',
    md: 8
  },
  {
    label: $t('jobPosition.question', { number: 10 }),
    prop: 'question10',
    md: 8
  }
]

// 工作职位详情
export const JOB_POSITION_CREATED_DETAIL: Form.DetailItem[] = [
  {
    label: $t('table.createdBy'),
    prop: 'created_by_name'
  },
  {
    label: $t('table.createdAt'),
    prop: 'created_at',
    isLine: true
  },
  {
    label: $t('table.lastModifiedAt'),
    prop: 'last_modified_at',
    isLine: true
  }
]
// 工作职位详情
export const JOB_POSITION_BASIC_DETAIL: Form.DetailItem[] = [
  {
    label: $t('jobPosition.recruitmentProject'),
    prop: 'project_name',
    col: 8
  },
  {
    label: $t('jobPosition.recruitmentType'),
    prop: 'recruitment_type',
    enum: RecruitmentType,
    col: 8
  },
  {
    label: $t('jobPosition.employmentType'),
    prop: 'employment_type',
    enum: EmploymentType,
    col: 8
  },
  {
    label: $t('jobPosition.jobType'),
    prop: 'job_type',
    enum: JobType,
    col: 8
  },
  {
    label: $t('jobPosition.workLocation'),
    prop: 'work_location',
    enum: WorkLocation,
    col: 16
  }
]
// 职位描述
export const JOB_POSITION_DETAIL_DETAIL: Form.DetailItem[] = [
  {
    label: $t('jobPosition.jobDescription'),
    prop: 'job_desc',
    isFontBold: true,
    col: 24
  },
  {
    label: $t('jobPosition.jobRequirements'),
    prop: 'job_req',
    isFontBold: true,
    isPaddingTop: true,
    col: 24
  }
]
// 职位其他信息详情
export const JOB_POSITION_OTHER_DETAIL: Form.DetailItem[] = [
  {
    label: $t('jobPosition.HRRecruiter'),
    prop: 'hr_recruiter_name',
    col: 8
  },
  {
    label: $t('jobPosition.HRCoordinators'),
    prop: 'hr_coordinators',
    col: 8
  },
  {
    label: $t('jobPosition.interviewProcessTemplate'),
    prop: 'interview_process_templates',
    col: 8,
    value: ''
  },
  {
    label: $t('jobPosition.resumeInbox'),
    prop: 'resume_inbox',
    col: 8
  },
  {
    label: $t('jobPosition.jobPortals'),
    prop: 'publish_channel',
    enum: ChannelType,
    col: 8
  },
  {
    label: $t('jobPosition.professionalInterviewFeedback'),
    prop: 'public_interview_feedback',
    md: 8
  }
]

// 职位其他信息详情
export const JOB_POSITION_QUESTIONS_DETAIL: Form.DetailItem[] = [
  {
    label: $t('jobPosition.question', { number: 1 }),
    prop: 'question1',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 2 }),
    prop: 'question2',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 3 }),
    prop: 'question3',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 4 }),
    prop: 'question4',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 5 }),
    prop: 'question5',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 6 }),
    prop: 'question6',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 7 }),
    prop: 'question7',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 8 }),
    prop: 'question8',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 9 }),
    prop: 'question9',
    col: 8
  },
  {
    label: $t('jobPosition.question', { number: 10 }),
    prop: 'question10',
    col: 8
  }
]
