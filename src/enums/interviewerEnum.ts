import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum InterviewerStatusEnum {
  PENDING,
  SUITABLE,
  UNSUITABLE,
  HOLD
}

export const InterviewerStatus: Record<string, CommonEnum.enumItem> = {
  [InterviewerStatusEnum.PENDING]: {
    value: InterviewerStatusEnum.PENDING,
    name: $t('interviewer.feedbackPending'),
    status: 'primary'
  },
  [InterviewerStatusEnum.SUITABLE]: {
    value: InterviewerStatusEnum.SUITABLE,
    name: $t('interviewer.feedbackFit'),
    status: 'success'
  },
  [InterviewerStatusEnum.UNSUITABLE]: {
    value: InterviewerStatusEnum.UNSUITABLE,
    name: $t('interviewer.feedbackUnfit'),
    status: 'danger'
  },
  [InterviewerStatusEnum.HOLD]: {
    value: InterviewerStatusEnum.HOLD,
    name: $t('interviewer.hold'),
    status: 'warning'
  }
}
