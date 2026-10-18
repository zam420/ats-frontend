import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { getUserListByRole } from '@/api/modules/user'
import { ProjectStatus } from '@/enums/projectStatusEnum'
import { getWorkLocationList } from '@/api/modules/common'
import { WorkLocation } from '@/enums/workLocationEnum'
import { getInterviewProcessTemplates } from '@/api/modules/adminRecruitmentProject'
const { $t } = useLocale()

export const PROJECT_TABLE: Table.ColumnProps[] = [
  // 选择框单元格
  {
    columnType: TableColumnTypeEnum.OPERATION,
    label: $t('table.operate'),
    width: 120,
    fixed: TableColumnFixedEnum.LEFT,
    isShow: false
  },
  {
    prop: 'project_name',
    label: $t('admin.projectName')
  },
  {
    prop: 'adminString',
    label: $t('admin.projectAdmins')
  },
  {
    prop: 'created_by_name',
    label: $t('admin.createBy')
  },
  {
    prop: 'work_location_name',
    label: $t('jobPosition.workLocation')
  },
  {
    prop: 'interview_process_templates_string',
    label: $t('admin.interviewProcessTemplate')
  },
  {
    prop: 'created_at',
    label: $t('admin.createAt')
  },
  {
    prop: 'status',
    label: $t('admin.status'),
    status: ProjectStatus,
    filter: false
  }
]

export const PROJECT_FORM: Form.FormItem[] = [
  {
    label: $t('admin.projectName'),
    prop: 'name',
    required: true,
    col: 24,
    maxlength: 50
  },
  {
    label: $t('admin.projectAdmins'),
    prop: 'admins',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getUserListByRole,
    optionKey: 'id',
    optionName: 'name',
    initOptionParams: { role: 'proa' },
    required: true,
    col: 24
  },
  {
    label: $t('jobPosition.workLocation'),
    prop: 'work_location',
    type: FormItemTypeEnum.TREE_SELECT,
    getOptions: getWorkLocationList,
    optionKey: 'value',
    optionName: 'name',
    enum: WorkLocation,
    required: true,
    col: 24
  },
  {
    label: $t('admin.interviewProcessTemplate'),
    prop: 'interview_process_templates',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getInterviewProcessTemplates,
    optionKey: 'id',
    optionName: 'name',
    isTepRequest: false,
    col: 24
  }
]

export const UPDATE_PROJECT_FORM: Form.FormItem[] = [
  {
    label: '',
    prop: 'project_id',
    isHide: true
  },
  {
    label: $t('admin.projectName'),
    prop: 'name',
    required: true,
    col: 24,
    maxlength: 50
  },
  {
    label: $t('admin.projectAdmins'),
    prop: 'admins',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getUserListByRole,
    optionKey: 'id',
    optionName: 'name',
    initOptionParams: { role: 'proa' },
    required: true,
    col: 24
  },
  {
    label: $t('jobPosition.workLocation'),
    prop: 'work_location',
    type: FormItemTypeEnum.TREE_SELECT,
    getOptions: getWorkLocationList,
    optionKey: 'value',
    optionName: 'name',
    enum: WorkLocation,
    required: true,
    col: 24,
    disabled: true
  },
  {
    label: $t('admin.interviewProcessTemplate'),
    prop: 'interview_process_templates',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    isTepRequest: false,
    col: 24,
    disabled: true
  }
]
