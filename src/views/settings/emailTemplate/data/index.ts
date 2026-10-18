import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { ProjectStatus } from '@/enums/projectStatusEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { WorkLocation } from '@/enums/workLocationEnum'
import { RecruitmentType } from '@/enums/recruitmentTypeEnum'
import { getRecruitmentTypeList, getWorkLocationList } from '@/api/modules/common'
import { ROUTER_SETTINGS_EMAIL_TEMPLATE_DETAIL } from '@/router/routerName'
import { enumItem2arr, getTreeOptionsByGroup } from '@/utils'
const { $t } = useLocale()

// 邮件模版表格
export const EMAIL_TEMPLATE_TABLE: Table.ColumnProps[] = [
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
    label: $t('emailTemplate.templateName'),
    link: ROUTER_SETTINGS_EMAIL_TEMPLATE_DETAIL
  },
  {
    prop: 'subject',
    label: $t('emailTemplate.emailSubject')
  },
  {
    prop: 'recruitment_type',
    label: $t('jobPosition.recruitmentType'),
    type: FormItemTypeEnum.SELECT,
    options: enumItem2arr(RecruitmentType)
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
  }
]

// 邮件模版form
export const EMAIL_FORM: Form.FormItem[] = [
  {
    label: $t('emailTemplate.templateName'),
    prop: 'name',
    required: true,
    col: 12
  },
  {
    label: $t('jobPosition.recruitmentType'),
    prop: 'recruitment_type',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getRecruitmentTypeList,
    optionKey: 'value',
    optionName: 'name',
    enum: RecruitmentType,
    required: true
  },
  {
    label: $t('jobPosition.workLocation'),
    prop: 'work_location',
    type: FormItemTypeEnum.TREE_MULTIPLE_SELECT,
    getOptions: getWorkLocationList,
    optionKey: 'value',
    optionName: 'name',
    enum: WorkLocation,
    required: true
  },
  {
    label: $t('emailTemplate.emailSubject'),
    prop: 'subject',
    required: true,
    col: 24
  }
]

export const USER_FORM: Form.FormItem[] = [
  {
    label: $t('emailTemplate.receivers'),
    prop: 'share_to_ids',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    col: 24
  }
]

// 邮件模版详情
export const EMAIL_TEMPLATE_DETAIL: Form.DetailItem[] = [
  {
    label: $t('table.createdBy'),
    prop: 'create_by_name'
  },
  {
    label: $t('table.createdAt'),
    prop: 'create_time',
    isLine: true
  },
  {
    label: $t('table.lastModifiedBy'),
    prop: 'last_modified_by_name',
    isLine: true
  },
  {
    label: $t('table.lastModifiedAt'),
    prop: 'last_modified_time',
    isLine: true
  }
]
