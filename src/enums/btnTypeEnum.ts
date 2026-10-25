import { useLocale } from '@/hooks/useLocale'
import { OfferSentStatusEnum } from './cvStatusEnum'
import { CandidateStatusEnum } from '@/enums/candidateStatusEnum'
import { ScheduleViewEnum } from './scheduleViewEnum'
const { $t } = useLocale()
export enum BtnTypeEnum {
  CONTACT_CANDIDATE = 1,
  BATCH_NOTES,
  SCHEDULE_INTERVIEW,
  SCHEDULE_ONE_BY_ONE,
  SCHEDULE_GROUP,
  FORWARD,
  FORWARD_RESUME,
  FORWARD_TEST,
  MOVETO,
  MOVETO_UNSCREEN,
  MOVETO_RESUME_SCREEN,
  MOVETO_ONLINE_WRITTEN,
  MOVETO_HR,
  MOVETO_PROFESSIONAL,
  MOVETO_C_LEVEL,
  MOVETO_OFFER_MANAGEMENT,
  MOVETO_ONBOARD,
  MOVETO_TALENT_POOL,
  TALENT_POOL,
  SEND_TEST,
  SUITABLE,
  NOT_SUITABLE,
  TEST_RESULT,
  TEST_RESULT_PASS,
  TEST_RESULT_FAIL,
  OFFER_SENT,
  ON_BOARDING_DATE,
  OFFER_FEEDBACK,
  OFFER_ACCEPT,
  OFFER_REJECT
}

export const ButtonSettings: Record<string, CommonEnum.enumItem> = {
  [BtnTypeEnum.FORWARD]: {
    value: BtnTypeEnum.FORWARD,
    name: $t('button.forward'),
    group: $t('button.forward'),
    isParent: true
  },
  [BtnTypeEnum.FORWARD_RESUME]: {
    value: BtnTypeEnum.FORWARD_RESUME,
    name: $t('button.forwardResume'),
    group: $t('button.forward')
  },
  [BtnTypeEnum.FORWARD_TEST]: {
    value: BtnTypeEnum.FORWARD_TEST,
    name: $t('button.forwardTest'),
    group: $t('button.forward')
  },
  [BtnTypeEnum.MOVETO]: {
    value: BtnTypeEnum.MOVETO,
    name: $t('button.moveTo'),
    group: $t('button.moveTo'),
    isParent: true
  },
  [BtnTypeEnum.MOVETO_UNSCREEN]: {
    value: BtnTypeEnum.MOVETO_UNSCREEN,
    paramValue: CandidateStatusEnum.UNSCREEN,
    name: $t('candidateStatusEnum.unscreen'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.MOVETO_RESUME_SCREEN]: {
    value: BtnTypeEnum.MOVETO_RESUME_SCREEN,
    paramValue: CandidateStatusEnum.RESUME_SCREEN,
    name: $t('candidateStatusEnum.resumeScreening'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.MOVETO_ONLINE_WRITTEN]: {
    value: BtnTypeEnum.MOVETO_ONLINE_WRITTEN,
    paramValue: CandidateStatusEnum.ONLINE_WRITTEN,
    name: $t('candidateStatusEnum.onlineWrittenTest'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.MOVETO_HR]: {
    value: BtnTypeEnum.MOVETO_HR,
    paramValue: CandidateStatusEnum.HR,
    name: $t('candidateStatusEnum.HRInterview'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.MOVETO_PROFESSIONAL]: {
    value: BtnTypeEnum.MOVETO_PROFESSIONAL,
    paramValue: CandidateStatusEnum.PROFESSIONAL,
    name: $t('candidateStatusEnum.functionalInterview'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.MOVETO_C_LEVEL]: {
    value: BtnTypeEnum.MOVETO_C_LEVEL,
    paramValue: CandidateStatusEnum.C_LEVEL,
    name: $t('candidateStatusEnum.executiveInterview'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.MOVETO_OFFER_MANAGEMENT]: {
    value: BtnTypeEnum.MOVETO_OFFER_MANAGEMENT,
    paramValue: CandidateStatusEnum.OFFER_MANAGEMENT,
    name: $t('candidateStatusEnum.offerManagement'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.MOVETO_ONBOARD]: {
    value: BtnTypeEnum.MOVETO_ONBOARD,
    paramValue: CandidateStatusEnum.ONBOARD,
    name: $t('candidateStatusEnum.onboardingManagement'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.MOVETO_TALENT_POOL]: {
    value: BtnTypeEnum.MOVETO_TALENT_POOL,
    paramValue: CandidateStatusEnum.TALENT_POOL,
    name: $t('candidateStatusEnum.talentPool'),
    group: $t('button.moveTo')
  },
  [BtnTypeEnum.SCHEDULE_INTERVIEW]: {
    value: BtnTypeEnum.SCHEDULE_INTERVIEW,
    name: $t('button.scheduleInterview'),
    group: $t('button.scheduleInterview'),
    isParent: true
  },
  [BtnTypeEnum.SCHEDULE_ONE_BY_ONE]: {
    value: BtnTypeEnum.SCHEDULE_ONE_BY_ONE,
    paramValue: ScheduleViewEnum.ONE_BY_ONE,
    name: $t('cv.oneToOneInterview'),
    group: $t('button.scheduleInterview')
  },
  [BtnTypeEnum.SCHEDULE_GROUP]: {
    value: BtnTypeEnum.SCHEDULE_GROUP,
    paramValue: ScheduleViewEnum.GROUP,
    name: $t('cv.groupInterview'),
    group: $t('button.scheduleInterview')
  },
  [BtnTypeEnum.SEND_TEST]: {
    value: BtnTypeEnum.SEND_TEST,
    name: $t('button.sendWrittenTest'),
    group: $t('button.sendWrittenTest'),
    isParent: true
  },
  [BtnTypeEnum.TEST_RESULT]: {
    value: BtnTypeEnum.TEST_RESULT,
    name: $t('button.testResult'),
    group: $t('button.testResult'),
    isParent: true
  },
  [BtnTypeEnum.TEST_RESULT_PASS]: {
    value: BtnTypeEnum.TEST_RESULT_PASS,
    paramValue: true,
    name: $t('WrittenFinalStatusEnum.pass'),
    group: $t('button.testResult')
  },
  [BtnTypeEnum.TEST_RESULT_FAIL]: {
    value: BtnTypeEnum.TEST_RESULT_FAIL,
    paramValue: false,
    name: $t('WrittenFinalStatusEnum.fail'),
    group: $t('button.testResult')
  },
  [BtnTypeEnum.CONTACT_CANDIDATE]: {
    value: BtnTypeEnum.CONTACT_CANDIDATE,
    name: $t('button.contactCandidate'),
    group: $t('button.contactCandidate'),
    isParent: true
  },
  [BtnTypeEnum.BATCH_NOTES]: {
    value: BtnTypeEnum.BATCH_NOTES,
    name: $t('button.batchNote'),
    group: $t('button.batchNote'),
    isParent: true
  },
  [BtnTypeEnum.TALENT_POOL]: {
    value: BtnTypeEnum.TALENT_POOL,
    name: $t('menu.talentPool'),
    group: $t('menu.talentPool'),
    isParent: true
  },
  [BtnTypeEnum.SUITABLE]: {
    value: BtnTypeEnum.SUITABLE,
    name: $t('opt.suitable'),
    group: $t('opt.suitable'),
    isParent: true
  },
  [BtnTypeEnum.NOT_SUITABLE]: {
    value: BtnTypeEnum.NOT_SUITABLE,
    name: $t('opt.notSuitable'),
    group: $t('opt.notSuitable'),
    isParent: true
  },
  [BtnTypeEnum.OFFER_SENT]: {
    value: BtnTypeEnum.OFFER_SENT,
    name: $t('button.offerSent'),
    group: $t('button.offerSent'),
    isParent: true
  },
  [BtnTypeEnum.OFFER_FEEDBACK]: {
    value: BtnTypeEnum.OFFER_FEEDBACK,
    name: $t('button.offerFeedback'),
    group: $t('button.offerFeedback'),
    isParent: true
  },
  [BtnTypeEnum.OFFER_ACCEPT]: {
    value: BtnTypeEnum.OFFER_ACCEPT,
    paramValue: OfferSentStatusEnum.ACCEPT,
    name: $t('cv.acceptOffer'),
    group: $t('button.offerFeedback')
  },
  [BtnTypeEnum.OFFER_REJECT]: {
    value: BtnTypeEnum.OFFER_REJECT,
    paramValue: OfferSentStatusEnum.REJECT,
    name: $t('cv.rejectOffer'),
    group: $t('button.offerFeedback')
  },
  [BtnTypeEnum.ON_BOARDING_DATE]: {
    value: BtnTypeEnum.ON_BOARDING_DATE,
    name: $t('button.updateOnboardingDate'),
    group: $t('button.updateOnboardingDate'),
    isParent: true
  }
}

export const ButtonLists: Record<string, number[]> = {
  'all': [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO
  ],
  [CandidateStatusEnum.UNSCREEN]: [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO,
    BtnTypeEnum.SUITABLE,
    BtnTypeEnum.NOT_SUITABLE
  ],
  [CandidateStatusEnum.RESUME_SCREEN]: [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO,
    BtnTypeEnum.SCHEDULE_INTERVIEW,
    BtnTypeEnum.TALENT_POOL,
    BtnTypeEnum.SEND_TEST
  ],
  [CandidateStatusEnum.ONLINE_WRITTEN]: [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO,
    BtnTypeEnum.SCHEDULE_INTERVIEW,
    BtnTypeEnum.TALENT_POOL,
    BtnTypeEnum.SEND_TEST,
    BtnTypeEnum.TEST_RESULT
  ],
  [CandidateStatusEnum.HR]: [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO,
    BtnTypeEnum.SCHEDULE_INTERVIEW,
    BtnTypeEnum.TALENT_POOL,
    BtnTypeEnum.SEND_TEST
  ],
  [CandidateStatusEnum.PROFESSIONAL]: [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO,
    BtnTypeEnum.SCHEDULE_INTERVIEW,
    BtnTypeEnum.TALENT_POOL,
    BtnTypeEnum.SEND_TEST
  ],
  [CandidateStatusEnum.C_LEVEL]: [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO,
    BtnTypeEnum.SCHEDULE_INTERVIEW,
    BtnTypeEnum.TALENT_POOL,
    BtnTypeEnum.SEND_TEST
  ],
  [CandidateStatusEnum.OFFER_MANAGEMENT]: [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO,
    BtnTypeEnum.OFFER_SENT,
    BtnTypeEnum.OFFER_FEEDBACK
  ],
  [CandidateStatusEnum.ONBOARD]: [
    BtnTypeEnum.CONTACT_CANDIDATE,
    BtnTypeEnum.BATCH_NOTES,
    BtnTypeEnum.FORWARD,
    BtnTypeEnum.MOVETO,
    BtnTypeEnum.ON_BOARDING_DATE
  ]
}

export const ButtonSortMap: any = {
  'all': {
    [BtnTypeEnum.BATCH_NOTES]: 1,
    [BtnTypeEnum.FORWARD]: 2,
    [BtnTypeEnum.MOVETO]: 3,
    [BtnTypeEnum.CONTACT_CANDIDATE]: 4
  },
  [CandidateStatusEnum.UNSCREEN]: {
    [BtnTypeEnum.BATCH_NOTES]: 1,
    [BtnTypeEnum.FORWARD]: 2,
    [BtnTypeEnum.MOVETO]: 3,
    [BtnTypeEnum.CONTACT_CANDIDATE]: 4,
    [BtnTypeEnum.SUITABLE]: 5,
    [BtnTypeEnum.NOT_SUITABLE]: 6
  },
  [CandidateStatusEnum.RESUME_SCREEN]: {
    [BtnTypeEnum.SCHEDULE_INTERVIEW]: 1,
    [BtnTypeEnum.FORWARD]: 2,
    [BtnTypeEnum.MOVETO]: 3,
    [BtnTypeEnum.CONTACT_CANDIDATE]: 4,
    [BtnTypeEnum.BATCH_NOTES]: 5,
    [BtnTypeEnum.SEND_TEST]: 6,
    [BtnTypeEnum.TALENT_POOL]: 7
  },
  [CandidateStatusEnum.ONLINE_WRITTEN]: {
    [BtnTypeEnum.FORWARD]: 1,
    [BtnTypeEnum.MOVETO]: 2,
    [BtnTypeEnum.SEND_TEST]: 3,
    [BtnTypeEnum.SCHEDULE_INTERVIEW]: 4,
    [BtnTypeEnum.BATCH_NOTES]: 5,
    [BtnTypeEnum.CONTACT_CANDIDATE]: 6,
    [BtnTypeEnum.TALENT_POOL]: 7,
    [BtnTypeEnum.TEST_RESULT]: 8
  },
  [CandidateStatusEnum.HR]: {
    [BtnTypeEnum.SCHEDULE_INTERVIEW]: 1,
    [BtnTypeEnum.FORWARD]: 2,
    [BtnTypeEnum.MOVETO]: 3,
    [BtnTypeEnum.CONTACT_CANDIDATE]: 4,
    [BtnTypeEnum.BATCH_NOTES]: 5,
    [BtnTypeEnum.SEND_TEST]: 6,
    [BtnTypeEnum.TALENT_POOL]: 7
  },
  [CandidateStatusEnum.PROFESSIONAL]: {
    [BtnTypeEnum.SCHEDULE_INTERVIEW]: 1,
    [BtnTypeEnum.FORWARD]: 2,
    [BtnTypeEnum.MOVETO]: 3,
    [BtnTypeEnum.CONTACT_CANDIDATE]: 4,
    [BtnTypeEnum.BATCH_NOTES]: 5,
    [BtnTypeEnum.SEND_TEST]: 6,
    [BtnTypeEnum.TALENT_POOL]: 7
  },
  [CandidateStatusEnum.C_LEVEL]: {
    [BtnTypeEnum.SCHEDULE_INTERVIEW]: 1,
    [BtnTypeEnum.FORWARD]: 2,
    [BtnTypeEnum.MOVETO]: 3,
    [BtnTypeEnum.CONTACT_CANDIDATE]: 4,
    [BtnTypeEnum.BATCH_NOTES]: 5,
    [BtnTypeEnum.SEND_TEST]: 6,
    [BtnTypeEnum.TALENT_POOL]: 7
  },
  [CandidateStatusEnum.OFFER_MANAGEMENT]: {
    [BtnTypeEnum.BATCH_NOTES]: 1,
    [BtnTypeEnum.FORWARD]: 2,
    [BtnTypeEnum.MOVETO]: 3,
    [BtnTypeEnum.CONTACT_CANDIDATE]: 4,
    [BtnTypeEnum.OFFER_SENT]: 5,
    [BtnTypeEnum.OFFER_FEEDBACK]: 6
  },
  [CandidateStatusEnum.ONBOARD]: {
    [BtnTypeEnum.CONTACT_CANDIDATE]: 1,
    [BtnTypeEnum.MOVETO]: 2,
    [BtnTypeEnum.ON_BOARDING_DATE]: 3,
    [BtnTypeEnum.FORWARD]: 4,
    [BtnTypeEnum.BATCH_NOTES]: 5
  }
}

