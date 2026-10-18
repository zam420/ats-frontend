import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum EmploymentTypeEnum {
  FULL_TIME,
  PART_TIME,
  CONTRACT,
  INTERNSHIP
}

export const EmploymentType: Record<string, CommonEnum.enumItem> = {
  [EmploymentTypeEnum.FULL_TIME]: {
    value: EmploymentTypeEnum.FULL_TIME,
    name: $t('employmentTypeEnum.fullTime')
  },
  [EmploymentTypeEnum.PART_TIME]: {
    value: EmploymentTypeEnum.PART_TIME,
    name: $t('employmentTypeEnum.partTime')
  },
  [EmploymentTypeEnum.CONTRACT]: {
    value: EmploymentTypeEnum.CONTRACT,
    name: $t('employmentTypeEnum.Contract')
  },
  [EmploymentTypeEnum.INTERNSHIP]: {
    value: EmploymentTypeEnum.INTERNSHIP,
    name: $t('employmentTypeEnum.internship')
  }
}
