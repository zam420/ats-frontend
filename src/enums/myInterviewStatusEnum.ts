import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum MyInterviewStatusEnum {
  AWAITE_INTERVIEW,
  AWAITE_FEEDBACK,
  EVALUATED
}

export enum MyInterviewQueryTypeEnum {
  TODAY,
  AWAITING_INTERVIEW,
  HISTORY
}

export enum InterviewMode {
  FACE_TO_FACE,
  ONLINE
}

export enum FeedbackResultEnum {
  PASS,
  HOLD,
  FAIL
}

export const MyInterviewStatus: Record<string, CommonEnum.enumItem> = {
  [MyInterviewStatusEnum.AWAITE_INTERVIEW]: {
    value: MyInterviewStatusEnum.AWAITE_INTERVIEW,
    name: $t('interviewer.awaitingInterview'),
    status: 'warning'
  },
  [MyInterviewStatusEnum.AWAITE_FEEDBACK]: {
    value: MyInterviewStatusEnum.AWAITE_FEEDBACK,
    name: $t('interviewer.awaitingFeedback'),
    status: 'success'
  },
  [MyInterviewStatusEnum.EVALUATED]: {
    value: MyInterviewStatusEnum.EVALUATED,
    name: $t('interviewer.evaluated'),
    status: 'primary'
  }
}

export const FeedbackResult: Record<string, CommonEnum.enumItem> = {
  [FeedbackResultEnum.PASS]: {
    value: FeedbackResultEnum.PASS,
    name: $t('receivedFeedbackStatusEnum.pass'),
    status: 'success'
  },
  [FeedbackResultEnum.HOLD]: {
    value: FeedbackResultEnum.HOLD,
    name: $t('receivedFeedbackStatusEnum.hold'),
    status: 'warning'
  },
  [FeedbackResultEnum.FAIL]: {
    value: FeedbackResultEnum.FAIL,
    name: $t('receivedFeedbackStatusEnum.fail'),
    status: 'danger'
  }
}
