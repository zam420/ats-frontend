import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { ProjectStatus } from '@/enums/projectStatusEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { WorkLocation } from '@/enums/workLocationEnum'
import { getWorkLocationList } from '@/api/modules/common'
import { ROUTER_SETTINGS_INTERVIEW_PROCESS_DETAIL } from '@/router/routerName'
import { enumItem2arr, getTreeOptionsByGroup } from '@/utils'
const { $t } = useLocale()

// 面试流程模版表格
export const INTERVIEW_PROCESS_TABLE: Table.ColumnProps[] = [
  // 选择框单元格
  {
    columnType: TableColumnTypeEnum.OPERATION,
    label: $t('table.operate'),
    width: 120,
    fixed: TableColumnFixedEnum.LEFT,
    isShow: false
  },
  {
    prop: 'name',
    label: $t('interviewProcess.interviewName'),
    link: ROUTER_SETTINGS_INTERVIEW_PROCESS_DETAIL,
    filter: false
  },
  {
    prop: 'work_location',
    label: $t('jobPosition.workLocation'),
    type: FormItemTypeEnum.TREE_SELECT,
    options: getTreeOptionsByGroup(enumItem2arr(WorkLocation), WorkLocation)
  },
  {
    prop: 'status',
    label: $t('jobPosition.status'),
    status: ProjectStatus,
    filter: false,
    hideTooltip: true
  },
  {
    prop: 'notes',
    label: $t('cv.notes'),
    filter: false
  }
]

// 面试流程模版form
export const INTERVIEW_PROCESS_FORM: Form.FormItem[] = [
  {
    label: $t('interviewProcess.interviewName'),
    prop: 'name',
    required: true,
    col: 18
  },
  {
    label: $t('jobPosition.workLocation'),
    prop: 'work_location',
    type: FormItemTypeEnum.TREE_SELECT,
    getOptions: getWorkLocationList,
    optionKey: 'value',
    optionName: 'name',
    enum: WorkLocation,
    required: true
  }
]

export const USER_FORM: Form.FormItem[] = [
  {
    label: $t('emailTemplate.receivers'),
    prop: 'share_to',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    col: 24
  }
]

// 面试流程模版详情
export const INTERVIEW_PROCESS_DETAIL: Form.DetailItem[] = [
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
    label: $t('table.lastModifiedBy'),
    prop: 'modified_by_name',
    isLine: true
  },
  {
    label: $t('table.lastModifiedAt'),
    prop: 'modified_at',
    isLine: true
  }
]
