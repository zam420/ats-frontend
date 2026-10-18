import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { TestInterviewStatus } from '@/enums/testInterviewStatusEnum'
const { $t } = useLocale()

export const TEST_INTERVIEW_TABLE: Table.ColumnProps[] = [
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
    prop: 'job_title',
    label: $t('interviewer.jobPosition'),
    filter: false
  },
  {
    prop: 'highest_university',
    label: $t('interviewer.universityHighest'),
    filter: false
  },
  {
    prop: 'result_file',
    label: $t('interviewer.onlineTestReport'),
    slotName: 'report',
    filter: false
  },
  {
    prop: 'test_score',
    label: $t('interviewer.testScore'),
    filter: false
  },
  {
    prop: 'status',
    label: $t('interviewer.status'),
    status: TestInterviewStatus,
    width: 150,
    filter: false
  },
  {
    prop: 'resume_notes',
    label: $t('interviewer.notes'),
    width: 150,
    filter: false
  },
  {
    prop: 'feedback_notes',
    label: $t('interviewer.feedbackReason'),
    filter: false
  }
]
export const TEST_FEEDBACK_FORM: Form.FormItem[] = [
  {
    label: '',
    isHide: true,
    prop: 'forward_ids'
  },
  {
    label: '',
    isHide: true,
    prop: 'status'
  },
  {
    label: $t('interviewer.reasons'),
    prop: 'feedback_notes',
    type: FormItemTypeEnum.TEXTAREA,
    col: 24
  }
]
