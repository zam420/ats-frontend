import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { getUserListByRole } from '@/api/modules/user'
import { ProjectStatus } from '@/enums/projectStatusEnum'
const { $t } = useLocale()

export const ADMIN_TABLE: Table.ColumnProps[] = [
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
    prop: 'admins',
    label: $t('admin.projectAdmins')
  },
  {
    prop: 'created_by_name',
    label: $t('admin.createBy')
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

export const ADMIN_FORM: Form.FormItem[] = [
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
  }
]
