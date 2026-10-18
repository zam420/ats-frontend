import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

export enum AbilityEvaluationEnum {
  POOL = 1,
  FAIR,
  AVERAGE,
  GOOD,
  EXCELLENT
}

export const AbilityEvaluation: Record<string, CommonEnum.enumItem> = {
  [AbilityEvaluationEnum.POOL]: {
    value: AbilityEvaluationEnum.POOL,
    name: $t('abilityEvaluationEnum.poor')
  },
  [AbilityEvaluationEnum.FAIR]: {
    value: AbilityEvaluationEnum.FAIR,
    name: $t('abilityEvaluationEnum.fair')
  },
  [AbilityEvaluationEnum.AVERAGE]: {
    value: AbilityEvaluationEnum.AVERAGE,
    name: $t('abilityEvaluationEnum.average')
  },
  [AbilityEvaluationEnum.GOOD]: {
    value: AbilityEvaluationEnum.GOOD,
    name: $t('abilityEvaluationEnum.good')
  },
  [AbilityEvaluationEnum.EXCELLENT]: {
    value: AbilityEvaluationEnum.EXCELLENT,
    name: $t('abilityEvaluationEnum.excellent')
  }
}