import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { ROUTER_SETTINGS_RECRUITMENT_PIPELINE_DETAIL } from '@/router/routerName'
const { $t } = useLocale()

// Recruitment pipeline list table
export const RECRUITMENT_PIPELINE_TABLE: Table.ColumnProps[] = [
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
    link: ROUTER_SETTINGS_RECRUITMENT_PIPELINE_DETAIL,
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

// Recruitment pipeline create/edit form (no plan owner)
export const RECRUITMENT_PIPELINE_FORM: Form.FormItem[] = [
  {
    label: $t('interviewProcess.interviewName'),
    prop: 'name',
    required: true,
    maxlength: 100,
    col: 8
  },
  {
    label: $t('interviewProcess.description'),
    prop: 'description',
    maxlength: 300,
    col: 16
  }
]

// Recruitment pipeline detail
export const RECRUITMENT_PIPELINE_DETAIL: Form.DetailItem[] = [
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
