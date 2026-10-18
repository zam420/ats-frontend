import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

export enum DegreeEnum {
  SECONDARY_TECHNICAL_SCHOOL = 0,
  HIGHER_VOCATIONAL_COLLEGE = 1,
  BACHELORS = 2,
  MASTERS = 3,
  PHD = 4
}

export const Degree: Record<string, CommonEnum.enumItem> = {
  [DegreeEnum.SECONDARY_TECHNICAL_SCHOOL]: {
    value: DegreeEnum.SECONDARY_TECHNICAL_SCHOOL,
    name: $t('degreeEnum.secondaryTechnicalSchool')
  },
  [DegreeEnum.HIGHER_VOCATIONAL_COLLEGE]: {
    value: DegreeEnum.HIGHER_VOCATIONAL_COLLEGE,
    name: $t('degreeEnum.higherVocationalCollege')
  },
  [DegreeEnum.BACHELORS]: {
    value: DegreeEnum.BACHELORS,
    name: $t('degreeEnum.bachelor')
  },
  [DegreeEnum.MASTERS]: {
    value: DegreeEnum.MASTERS,
    name: $t('degreeEnum.master')
  },
  [DegreeEnum.PHD]: {
    value: DegreeEnum.PHD,
    name: $t('degreeEnum.phd')
  }
}
