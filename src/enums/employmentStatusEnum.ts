import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

export enum EmploymentStatusEnum {
  EMPLOYED,
  TERMINATED
}

export const EmploymentStatus: Record<string, CommonEnum.enumItem> = {
  [EmploymentStatusEnum.EMPLOYED]: {
    value: EmploymentStatusEnum.EMPLOYED,
    name: $t('employmentStatusEnum.employed')
  },
  [EmploymentStatusEnum.TERMINATED]: {
    value: EmploymentStatusEnum.TERMINATED,
    name: $t('employmentStatusEnum.terminated')
  }
}
