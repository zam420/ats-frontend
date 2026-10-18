import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { InterviewerStatus } from '@/enums/interviewerEnum'
const { $t } = useLocale()

export const INTERVIEWER_TABLE: Table.ColumnProps[] = [
  // 选择框单元格
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
    width: 120,
    fixed: TableColumnFixedEnum.LEFT,
    isShow: true
  },
  {
    prop: 'candidate_name',
    label: $t('interviewer.candidate'),
    slotName: 'link',
    filter: false
  },
  {
    prop: 'job_position_title',
    label: $t('interviewer.jobPosition'),
    filter: false
  },
  {
    prop: 'highest_university',
    label: $t('interviewer.universityHighest'),
    filter: false
  },
  {
    prop: 'status',
    label: $t('interviewer.status'),
    status: InterviewerStatus,
    width: 150,
    filter: false
  },
  {
    prop: 'from_user',
    label: $t('interviewer.sharer'),
    filter: false
  },
  {
    prop: 'created_at',
    label: $t('interviewer.shareTime'),
    filter: false
  },
  {
    prop: 'forward_notes',
    label: $t('interviewer.notes'),
    filter: false
  },
  {
    prop: 'feedback_notes',
    label: $t('interviewer.feedbackReason'),
    filter: false
  }
]
export const FEEDBACK_FORM: Form.FormItem[] = [
  {
    label: '',
    isHide: true,
    prop: 'resume_forward_ids'
  },
  {
    label: '',
    isHide: true,
    prop: 'feedback'
  },
  {
    label: $t('interviewer.reasons'),
    prop: 'feedback_notes',
    type: FormItemTypeEnum.TEXTAREA,
    col: 24
  }
]
