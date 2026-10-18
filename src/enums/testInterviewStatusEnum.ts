import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum TestInterviewStatusEnum {
  PENDING,
  SUITABLE,
  UNSUITABLE
}

export const TestInterviewStatus: Record<string, CommonEnum.enumItem> = {
  [TestInterviewStatusEnum.PENDING]: {
    value: TestInterviewStatusEnum.PENDING,
    name: $t('interviewer.feedbackPending'),
    status: 'primary'
  },
  [TestInterviewStatusEnum.SUITABLE]: {
    value: TestInterviewStatusEnum.SUITABLE,
    name: $t('interviewer.feedbackFit'),
    status: 'success'
  },
  [TestInterviewStatusEnum.UNSUITABLE]: {
    value: TestInterviewStatusEnum.UNSUITABLE,
    name: $t('interviewer.feedbackUnfit'),
    status: 'danger'
  }
}
