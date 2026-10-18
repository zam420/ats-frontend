import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum ExamStatusEnum {
  SCHEDULED,
  COMPLETED,
  SUBMITTED,
  SYNCED,
  DELETED,
  EVALUATED
}

export const ExamStatus: Record<string, CommonEnum.enumItem> = {
  [ExamStatusEnum.SCHEDULED]: {
    value: ExamStatusEnum.SCHEDULED,
    name: $t('ExamStatusEnum.scheduled')
  },
  [ExamStatusEnum.COMPLETED]: {
    value: ExamStatusEnum.COMPLETED,
    name: $t('ExamStatusEnum.completed')
  },
  [ExamStatusEnum.SUBMITTED]: {
    value: ExamStatusEnum.SUBMITTED,
    name: $t('ExamStatusEnum.submitted')
  },
  [ExamStatusEnum.SYNCED]: {
    value: ExamStatusEnum.SYNCED,
    name: $t('ExamStatusEnum.synced')
  },
  [ExamStatusEnum.DELETED]: {
    value: ExamStatusEnum.DELETED,
    name: $t('ExamStatusEnum.deleted')
  },
  [ExamStatusEnum.EVALUATED]: {
    value: ExamStatusEnum.EVALUATED,
    name: $t('ExamStatusEnum.evaluated')
  }
}
