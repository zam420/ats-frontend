import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum ExamCheatStatusEnum {
  PENDING,
  YES,
  NO,
  MAYBE = 3
}

export const ExamCheatStatus: Record<string, CommonEnum.enumItem> = {
  [ExamCheatStatusEnum.PENDING]: {
    value: ExamCheatStatusEnum.PENDING,
    name: $t('ExamCheatStatusEnum.pending')
  },
  [ExamCheatStatusEnum.YES]: {
    value: ExamCheatStatusEnum.YES,
    name: $t('ExamCheatStatusEnum.yes')
  },
  [ExamCheatStatusEnum.NO]: {
    value: ExamCheatStatusEnum.NO,
    name: $t('ExamCheatStatusEnum.no')
  },
  [ExamCheatStatusEnum.MAYBE]: {
    value: ExamCheatStatusEnum.MAYBE,
    name: $t('ExamCheatStatusEnum.maybe')
  }
}