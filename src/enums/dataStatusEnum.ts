import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

export enum DataStatusEnum {
  DRAFT = 0,
  SUBMITTED = 1,
  DELETED = 2
}

export const DataStatus: Record<string, CommonEnum.enumItem> = {
  [DataStatusEnum.DRAFT]: {
    value: DataStatusEnum.DRAFT,
    name: $t('dataStatusEnum.draft'),
    status: 'default'
  },
  [DataStatusEnum.SUBMITTED]: {
    value: DataStatusEnum.SUBMITTED,
    name: $t('dataStatusEnum.submitted'),
    status: 'success'
  },
  [DataStatusEnum.DELETED]: {
    value: DataStatusEnum.DELETED,
    name: $t('dataStatusEnum.deleted'),
    status: 'danger'
  }
}
