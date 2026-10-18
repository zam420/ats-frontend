import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

export enum GenderEnum {
  MALE,
  FEMALE
}

export const Gender: Record<string, CommonEnum.enumItem> = {
  [GenderEnum.MALE]: {
    value: GenderEnum.MALE,
    name: $t('genderEnum.male')
  },
  [GenderEnum.FEMALE]: {
    value: GenderEnum.FEMALE,
    name: $t('genderEnum.female')
  }
}
