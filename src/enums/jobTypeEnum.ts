import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum JobTypeEnum {
  IC,
  AI,
  HARDWARE,
  SOFTWARE,
  GENERAL,
  BUSINESS,
  PRODUCTION
}

export const JobType: Record<string, CommonEnum.enumItem> = {
  [JobTypeEnum.IC]: {
    value: JobTypeEnum.IC,
    name: $t('jobTypeEnum.IC')
  },
  [JobTypeEnum.AI]: {
    value: JobTypeEnum.AI,
    name: $t('jobTypeEnum.AI')
  },
  [JobTypeEnum.HARDWARE]: {
    value: JobTypeEnum.HARDWARE,
    name: $t('jobTypeEnum.hardware')
  },
  [JobTypeEnum.SOFTWARE]: {
    value: JobTypeEnum.SOFTWARE,
    name: $t('jobTypeEnum.software')
  },
  [JobTypeEnum.GENERAL]: {
    value: JobTypeEnum.GENERAL,
    name: $t('jobTypeEnum.general')
  },
  [JobTypeEnum.BUSINESS]: {
    value: JobTypeEnum.BUSINESS,
    name: $t('jobTypeEnum.business')
  },
  [JobTypeEnum.PRODUCTION]: {
    value: JobTypeEnum.PRODUCTION,
    name: $t('jobTypeEnum.production')
  }
}
