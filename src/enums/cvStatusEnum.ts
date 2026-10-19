import { useLocale } from '@/hooks/useLocale'
import { InterviewerStatusEnum } from './interviewerEnum'

const { $t } = useLocale()

export enum ResumeScreenStatusEnum {
  TO_FORWARD = -1,
  TO_REVIEW = 0,
  REVIEWED = 10
}

export const ResumeScreenStatus: Record<string, CommonEnum.enumItem> = {
  [ResumeScreenStatusEnum.TO_FORWARD]: {
    value: ResumeScreenStatusEnum.TO_FORWARD,
    name: $t('resumeScreenStatusEnum.toForward')
  },
  [ResumeScreenStatusEnum.TO_REVIEW]: {
    value: ResumeScreenStatusEnum.TO_REVIEW,
    name: $t('resumeScreenStatusEnum.toReview')
  },
  [ResumeScreenStatusEnum.REVIEWED]: {
    value: ResumeScreenStatusEnum.REVIEWED,
    name: $t('resumeScreenStatusEnum.reviewed')
  }
}

export const ResumeScreenReviewedStatus: Record<string, CommonEnum.enumItem> = {
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

export enum OnlineTestStatusEnum {
  TO_BE_SCHEDULED = 90,
  SCHEDULED,
  COMPLETED
}

export const OnlineTestStatus: Record<string, CommonEnum.enumItem> = {
  [OnlineTestStatusEnum.TO_BE_SCHEDULED]: {
    value: OnlineTestStatusEnum.TO_BE_SCHEDULED,
    name: $t('onlineTestStatusEnum.toBeScheduled')
  },
  [OnlineTestStatusEnum.SCHEDULED]: {
    value: OnlineTestStatusEnum.SCHEDULED,
    name: $t('onlineTestStatusEnum.scheduled')
  },
  [OnlineTestStatusEnum.COMPLETED]: {
    value: OnlineTestStatusEnum.COMPLETED,
    name: $t('onlineTestStatusEnum.completed')
  }
}

export enum OnlineTestCompletedStatusEnum {
  TO_BE_EVALUATED = 0,
  EVALUATED,
  NOT_SENT
}

export const OnlineTestCompletedStatus: Record<string, CommonEnum.enumItem> = {
  [OnlineTestCompletedStatusEnum.TO_BE_EVALUATED]: {
    value: OnlineTestCompletedStatusEnum.TO_BE_EVALUATED,
    name: $t('onlineTestCompletedStatusEnum.toBeEvaluated')
  },
  [OnlineTestCompletedStatusEnum.EVALUATED]: {
    value: OnlineTestCompletedStatusEnum.EVALUATED,
    name: $t('onlineTestCompletedStatusEnum.evaluated')
  },
  [OnlineTestCompletedStatusEnum.NOT_SENT]: {
    value: OnlineTestCompletedStatusEnum.NOT_SENT,
    name: $t('onlineTestCompletedStatusEnum.notSent')
  }
}

export enum OnlineTestCompleteEvaluatedStatusEnum {
  SUITABLE = 1,
  NOT_SUITABLE
}

export const OnlineTestCompleteEvaluatedStatus: Record<string, CommonEnum.enumItem> = {
  [OnlineTestCompleteEvaluatedStatusEnum.SUITABLE]: {
    value: OnlineTestCompleteEvaluatedStatusEnum.SUITABLE,
    name: $t('onlineTestCompleteEvaluatedStatusEnum.suitable')
  },
  [OnlineTestCompleteEvaluatedStatusEnum.NOT_SUITABLE]: {
    value: OnlineTestCompleteEvaluatedStatusEnum.NOT_SUITABLE,
    name: $t('onlineTestCompleteEvaluatedStatusEnum.notSuitable')
  }
}

export enum WrittenFinalStatusEnum {
  PASS = 0,
  FAIL
}

export const WrittenFinalStatus: Record<string, CommonEnum.enumItem> = {
  [WrittenFinalStatusEnum.PASS]: {
    value: WrittenFinalStatusEnum.PASS,
    name: $t('WrittenFinalStatusEnum.pass')
  },
  [WrittenFinalStatusEnum.FAIL]: {
    value: WrittenFinalStatusEnum.FAIL,
    name: $t('WrittenFinalStatusEnum.fail')
  }
}

export enum ScheduleInterviewStatusEnum {
  TO_BE_SCHEDULED_HR = 40,
  SCHEDULED_HR = 41,
  AWAITE_FEEDBACK_HR = 42,
  RECEIVED_FEEDBACK_HR = 43,
  TO_BE_SCHEDULED_PRO = 50,
  SCHEDULED_PRO = 51,
  AWAITE_FEEDBACK_PRO = 52,
  RECEIVED_FEEDBACK_PRO = 53,
  TO_BE_SCHEDULED_C_LEVEL = 60,
  SCHEDULED_C_LEVEL = 61,
  AWAITE_FEEDBACK_C_LEVEL = 62,
  RECEIVED_FEEDBACK_C_LEVEL = 63
}

export const ScheduleInterviewStatusHr: Record<string, CommonEnum.enumItem> = {
  [ScheduleInterviewStatusEnum.TO_BE_SCHEDULED_HR]: {
    value: ScheduleInterviewStatusEnum.TO_BE_SCHEDULED_HR,
    name: $t('scheduleInterviewStatusEnum.toBeScheduled'),
    status: 'warning'
  },
  [ScheduleInterviewStatusEnum.SCHEDULED_HR]: {
    value: ScheduleInterviewStatusEnum.SCHEDULED_HR,
    name: $t('scheduleInterviewStatusEnum.scheduled'),
    status: 'success'
  },
  [ScheduleInterviewStatusEnum.AWAITE_FEEDBACK_HR]: {
    value: ScheduleInterviewStatusEnum.AWAITE_FEEDBACK_HR,
    name: $t('scheduleInterviewStatusEnum.awaitingFeedback'),
    status: 'primary'
  },
  [ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_HR]: {
    value: ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_HR,
    name: $t('scheduleInterviewStatusEnum.receivedFeedback'),
    status: 'primary'
  }
}

export const ScheduleInterviewStatusPro: Record<string, CommonEnum.enumItem> = {
  [ScheduleInterviewStatusEnum.TO_BE_SCHEDULED_PRO]: {
    value: ScheduleInterviewStatusEnum.TO_BE_SCHEDULED_PRO,
    name: $t('scheduleInterviewStatusEnum.toBeScheduled'),
    status: 'warning'
  },
  [ScheduleInterviewStatusEnum.SCHEDULED_PRO]: {
    value: ScheduleInterviewStatusEnum.SCHEDULED_PRO,
    name: $t('scheduleInterviewStatusEnum.scheduled'),
    status: 'success'
  },
  [ScheduleInterviewStatusEnum.AWAITE_FEEDBACK_PRO]: {
    value: ScheduleInterviewStatusEnum.AWAITE_FEEDBACK_PRO,
    name: $t('scheduleInterviewStatusEnum.awaitingFeedback'),
    status: 'primary'
  },
  [ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_PRO]: {
    value: ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_PRO,
    name: $t('scheduleInterviewStatusEnum.receivedFeedback'),
    status: 'primary'
  }
}

export const ScheduleInterviewStatusCLevel: Record<string, CommonEnum.enumItem> = {
  [ScheduleInterviewStatusEnum.TO_BE_SCHEDULED_C_LEVEL]: {
    value: ScheduleInterviewStatusEnum.TO_BE_SCHEDULED_C_LEVEL,
    name: $t('scheduleInterviewStatusEnum.toBeScheduled'),
    status: 'warning'
  },
  [ScheduleInterviewStatusEnum.SCHEDULED_C_LEVEL]: {
    value: ScheduleInterviewStatusEnum.SCHEDULED_C_LEVEL,
    name: $t('scheduleInterviewStatusEnum.scheduled'),
    status: 'success'
  },
  [ScheduleInterviewStatusEnum.AWAITE_FEEDBACK_C_LEVEL]: {
    value: ScheduleInterviewStatusEnum.AWAITE_FEEDBACK_C_LEVEL,
    name: $t('scheduleInterviewStatusEnum.awaitingFeedback'),
    status: 'primary'
  },
  [ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_C_LEVEL]: {
    value: ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_C_LEVEL,
    name: $t('scheduleInterviewStatusEnum.receivedFeedback'),
    status: 'primary'
  }
}

export enum ReceivedFeedbackStatusEnum {
  PASS = 1,
  HOLD,
  FAIL
}

export const ReceivedFeedbackStatus: Record<string, CommonEnum.enumItem> = {
  [ReceivedFeedbackStatusEnum.PASS]: {
    value: ReceivedFeedbackStatusEnum.PASS,
    name: $t('receivedFeedbackStatusEnum.pass'),
    status: 'success'
  },
  [ReceivedFeedbackStatusEnum.HOLD]: {
    value: ReceivedFeedbackStatusEnum.HOLD,
    name: $t('receivedFeedbackStatusEnum.hold'),
    status: 'warning'
  },
  [ReceivedFeedbackStatusEnum.FAIL]: {
    value: ReceivedFeedbackStatusEnum.FAIL,
    name: $t('receivedFeedbackStatusEnum.fail'),
    status: 'danger'
  }
}

export enum OfferStatusEnum {
  OFFER_NOT_SENT = 70,
  OFFER_SENT
}

export const OfferStatus: Record<string, CommonEnum.enumItem> = {
  [OfferStatusEnum.OFFER_NOT_SENT]: {
    value: OfferStatusEnum.OFFER_NOT_SENT,
    name: $t('offerStatusEnum.offerNotSent'),
    status: 'warning'
  },
  [OfferStatusEnum.OFFER_SENT]: {
    value: OfferStatusEnum.OFFER_SENT,
    name: $t('offerStatusEnum.offerSent'),
    status: 'success'
  }
}

export enum OfferSentStatusEnum {
  AWAITING,
  ACCEPT,
  REJECT
}

export const OfferSentStatus: Record<string, CommonEnum.enumItem> = {
  [OfferSentStatusEnum.AWAITING]: {
    value: OfferSentStatusEnum.AWAITING,
    name: $t('offerSentStatusEnum.awaiting'),
    status: 'warning'
  },
  [OfferSentStatusEnum.ACCEPT]: {
    value: OfferSentStatusEnum.ACCEPT,
    name: $t('offerSentStatusEnum.accept'),
    status: 'success'
  },
  [OfferSentStatusEnum.REJECT]: {
    value: OfferSentStatusEnum.REJECT,
    name: $t('offerSentStatusEnum.reject'),
    status: 'success'
  }
}

export enum OnboardingStatusEnum {
  AWAITING = 80,
  ONBOARDED
}

export const OnboardingStatus: Record<string, CommonEnum.enumItem> = {
  [OnboardingStatusEnum.AWAITING]: {
    value: OnboardingStatusEnum.AWAITING,
    name: $t('onboardingStatusEnum.awaiting'),
    status: 'warning'
  },
  [OnboardingStatusEnum.ONBOARDED]: {
    value: OnboardingStatusEnum.ONBOARDED,
    name: $t('onboardingStatusEnum.onboarded'),
    status: 'success'
  }
}