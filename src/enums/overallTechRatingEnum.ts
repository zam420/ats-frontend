import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

export enum OverallTechRatingEnum {
  BELOW_AVERAGE = 1,
  AVERAGE,
  GOOD,
  VERY_GOOD,
  EXCELLENT
}

export const OverallTechRating: Record<string, CommonEnum.enumItem> = {
  [OverallTechRatingEnum.BELOW_AVERAGE]: {
    value: OverallTechRatingEnum.BELOW_AVERAGE,
    name: $t('overallTechRatingEnum.belowAverage')
  },
  [OverallTechRatingEnum.AVERAGE]: {
    value: OverallTechRatingEnum.AVERAGE,
    name: $t('overallTechRatingEnum.average')
  },
  [OverallTechRatingEnum.GOOD]: {
    value: OverallTechRatingEnum.GOOD,
    name: $t('overallTechRatingEnum.good')
  },
  [OverallTechRatingEnum.VERY_GOOD]: {
    value: OverallTechRatingEnum.VERY_GOOD,
    name: $t('overallTechRatingEnum.veryGood')
  },
  [OverallTechRatingEnum.EXCELLENT]: {
    value: OverallTechRatingEnum.EXCELLENT,
    name: $t('overallTechRatingEnum.excellent')
  }
}