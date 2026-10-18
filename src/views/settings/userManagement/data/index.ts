import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { ProjectStatus } from '@/enums/projectStatusEnum'
import { UserRoleEnum } from '@/enums/userRoleEnum'
const { $t } = useLocale()

export const USERLIST_TABLE: Table.ColumnProps[] = [
  // 选择框单元格
  {
    columnType: TableColumnTypeEnum.OPERATION,
    label: $t('table.operate'),
    width: 120,
    fixed: TableColumnFixedEnum.LEFT
  },
  {
    prop: 'name',
    label: $t('userManagement.userName'),
    sortable: false
  },
  {
    prop: 'email',
    label: $t('userManagement.userEmail'),
    sortable: false
  },
  {
    prop: 'roles',
    label: $t('userManagement.role'),
    filter: false,
    sortable: false
  },
  {
    prop: 'status',
    label: $t('userManagement.status'),
    status: ProjectStatus,
    filter: false,
    sortable: false
  },
  {
    prop: 'join_date',
    label: $t('userManagement.joinDate'),
    filter: false,
    sortable: false
  }
]

export const rolesList: Form.FormSelect[] = [
  {
    value: UserRoleEnum.SA,
    label: 'System Admin'
  },
  {
    value: UserRoleEnum.HRD,
    label: 'HR Directiors'
  },
  {
    value: UserRoleEnum.PROA,
    label: 'Project Admins'
  },
  {
    value: UserRoleEnum.HRR,
    label: 'HR Recruiters'
  },
  {
    value: UserRoleEnum.HRRC,
    label: 'HR Recruiter Coordinators'
  },
  {
    value: UserRoleEnum.HM,
    label: 'Hiring Managers'
  },
  {
    value: UserRoleEnum.ITV,
    label: 'Interviewers'
  },
  {
    value: UserRoleEnum.CDT,
    label: 'Candidates'
  }
]

export const CREATE_USER_FORM: Form.FormItem[] = [
  {
    prop: 'type',
    label: '',
    value: 0,
    isHide: true
  },
  {
    prop: 'name',
    label: $t('userManagement.userName'),
    col: 24,
    required: true
  },
  {
    prop: 'email',
    label: $t('userManagement.userEmail'),
    col: 24,
    required: true
  },
  {
    prop: 'roles',
    label: $t('userManagement.role'),
    col: 24,
    required: true,
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    options: rolesList,
    clearable: true,
    maxTag: 5
  }
]

export const USER_FORM: Form.FormItem[] = [
  {
    prop: 'id',
    label: '',
    isHide: true
  },
  {
    prop: 'type',
    label: '',
    value: 0,
    isHide: true
  },
  {
    prop: 'name',
    label: $t('userManagement.userName'),
    col: 24,
    required: true
  },
  {
    prop: 'email',
    label: $t('userManagement.userEmail'),
    col: 24,
    required: true
  },
  {
    prop: 'roles',
    label: $t('userManagement.role'),
    col: 24,
    required: true,
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    options: rolesList,
    clearable: true,
    maxTag: 5
  }
]
