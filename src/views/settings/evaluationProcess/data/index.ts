import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { ROUTER_SETTINGS_EVALUATION_PLAN_DETAIL } from '@/router/routerName'
const { $t } = useLocale()

// 面试流程模版表格
export const INTERVIEW_PROCESS_TABLE: Table.ColumnProps[] = [
  // 选择框单元格
  {
    columnType: TableColumnTypeEnum.OPERATION,
    label: $t('table.operate'),
    width: 80,
    fixed: TableColumnFixedEnum.LEFT,
    isShow: false
  },
  {
    prop: 'name',
    label: $t('interviewProcess.interviewName'),
    link: ROUTER_SETTINGS_EVALUATION_PLAN_DETAIL,
    filter: false,
    minWidth: 30
  },
  {
    prop: 'owner_id',
    label: $t('interviewProcess.owner'),
    filter: false,
    minWidth: 20
  },
  {
    prop: 'round_sequence',
    label: $t('interviewProcess.roundSequence'),
    filter: false,
    minWidth: 40
  },
  {
    prop: 'description',
    label: $t('interviewProcess.description'),
    filter: false,
    minWidth: 50
  }
]

// 面试流程模版form
export const INTERVIEW_PROCESS_FORM: Form.FormItem[] = [
  {
    label: $t('interviewProcess.interviewName'),
    prop: 'name',
    required: true,
    maxlength: 100,
    col: 6
  },
  {
    label: $t('interviewProcess.description'),
    prop: 'description',
    maxlength: 300,
    col: 12
  },
  {
    label: $t('interviewProcess.planOwner'),
    prop: 'owner_id',
    type: FormItemTypeEnum.SELECT,
    options: [],
    isHide: true,
    col: 6
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
