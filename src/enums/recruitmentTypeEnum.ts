import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum RecruitmentTypeEnum {
  CAMPUS,
  CORPORATE,
  INTERN
}

export const RecruitmentType: Record<string, CommonEnum.enumItem> = {
  [RecruitmentTypeEnum.CAMPUS]: {
    value: RecruitmentTypeEnum.CAMPUS,
    name: $t('recruitmentTypeEnum.campus')
  },
  [RecruitmentTypeEnum.CORPORATE]: {
    value: RecruitmentTypeEnum.CORPORATE,
    name: $t('recruitmentTypeEnum.corporate')
  },
  [RecruitmentTypeEnum.INTERN]: {
    value: RecruitmentTypeEnum.INTERN,
    name: $t('recruitmentTypeEnum.intern')
  }
}
