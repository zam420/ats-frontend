import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { JobStatus } from '@/enums/jobStatusEnum'
import { ROUTER_JOB_POSITION_DETAIL } from '@/router/routerName'
import {
  getWorkLocationList
} from '@/api/modules/common'
import { WorkLocation } from '@/enums/workLocationEnum'
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
    label: $t('jobPosition.employmentType'),
    prop: 'employment_type_id',
    type: FormItemTypeEnum.SELECT,
    options: [],
    required: true,
    md: 8
  },
  {
    label: $t('jobPosition.workArrangement'),
    prop: 'work_arrangement_type_id',
    type: FormItemTypeEnum.SELECT,
    options: [],
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
    prop: 'description',
    type: FormItemTypeEnum.TEXTAREA,
    required: true,
    col: 12,
    maxlength: 10000
  },
  {
    label: $t('jobPosition.jobRequirements'),
    prop: 'mandatory_requirements',
    type: FormItemTypeEnum.TEXTAREA,
    required: true,
    col: 12,
    maxlength: 5000
  },
  {
    label: $t('jobPosition.preferredRequirements'),
    prop: 'preferred_requirements',
    type: FormItemTypeEnum.TEXTAREA,
    col: 12,
    maxlength: 5000
  },
]
// 职位其他信息
export const JOB_POSITION_HIRING_TEAM_FORM: Form.FormItem[] = [
  {
    label: $t('jobPosition.HRRecruiter'),
    prop: 'recruiters',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    options: [],
    required: true,
    maxTags: 2,
    clearable: true,
    md: 8
  },
  {
    label: $t('jobPosition.hiringManagers'),
    prop: 'hiring_managers',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    options: [],
    required: true,
    maxTags: 2,
    clearable: true,
    md: 8
  }
]
export const JOB_POSITION_PIPELINE_FORM: Form.FormItem[] = [
  {
    label: $t('jobPosition.recruitmentPipeline'),
    prop: 'recruitment_pipeline_id',
    type: FormItemTypeEnum.SELECT,
    options: [],
    required: true,
    md: 8
  }
]
export const JOB_POSITION_EVALUATION_FORM: Form.FormItem[] = [
  {
    label: $t('jobPosition.interviewProcessTemplate'),
    prop: 'evaluation_plan_id',
    type: FormItemTypeEnum.SELECT,
    options: [],
    required: true,
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
    label: $t('jobPosition.employmentType'),
    prop: 'employment_type_name',
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
    prop: 'description',
    isFontBold: true,
    col: 24,
    slotName: 'rich'
  },
  {
    label: $t('jobPosition.mandatoryRequirements'),
    prop: 'mandatory_requirements',
    isFontBold: true,
    isPaddingTop: true,
    col: 12,
    slotName: 'rich'
  },
  {
    label: $t('jobPosition.preferredRequirements'),
    prop: 'preferred_requirements',
    isFontBold: true,
    isPaddingTop: true,
    col: 12,
    slotName: 'rich'
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
    label: $t('jobPosition.interviewProcessTemplate'),
    prop: 'interview_process_templates',
    col: 8,
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
