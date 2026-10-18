import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

export enum PooledReasonEnum {
  CV_FAIL = 0,
  COLD_CALL_FAIL = 1,
  TEST_FAIL = 2,
  INTERVIEW_FAIL = 3,
  REJECT_OFFER = 4,
  CANCEL_OFFER = 5,
  FUTURE_CONTACT = 6,
  NO_SUITABLE_POSITION = 7,
  CANCEL_ONBOARDING = 8,
  BLACK_LIST = 9,
  ARCHIVED_RESUMES = 10,
  CANDIDATE_WITHDRAWN = 11
}

export const PooledReason: Record<string, CommonEnum.enumItem> = {
  [PooledReasonEnum.CV_FAIL]: {
    value: PooledReasonEnum.CV_FAIL,
    name: $t('PooledReasonEnum.CVFail'),
    status: 'default'
  },
  [PooledReasonEnum.COLD_CALL_FAIL]: {
    value: PooledReasonEnum.COLD_CALL_FAIL,
    name: $t('PooledReasonEnum.coldCallFail'),
    status: 'default'
  },
  [PooledReasonEnum.TEST_FAIL]: {
    value: PooledReasonEnum.TEST_FAIL,
    name: $t('PooledReasonEnum.testFail'),
    status: 'default'
  },
  [PooledReasonEnum.INTERVIEW_FAIL]: {
    value: PooledReasonEnum.INTERVIEW_FAIL,
    name: $t('PooledReasonEnum.interviewFail'),
    status: 'default'
  },
  [PooledReasonEnum.REJECT_OFFER]: {
    value: PooledReasonEnum.REJECT_OFFER,
    name: $t('PooledReasonEnum.rejectOffer'),
    status: 'warning'
  },
  [PooledReasonEnum.CANCEL_OFFER]: {
    value: PooledReasonEnum.CANCEL_OFFER,
    name: $t('PooledReasonEnum.cancelOffer'),
    status: 'warning'
  },
  [PooledReasonEnum.FUTURE_CONTACT]: {
    value: PooledReasonEnum.FUTURE_CONTACT,
    name: $t('PooledReasonEnum.futureContact'),
    status: 'success'
  },
  [PooledReasonEnum.NO_SUITABLE_POSITION]: {
    value: PooledReasonEnum.NO_SUITABLE_POSITION,
    name: $t('PooledReasonEnum.noSuitablePosition'),
    status: 'success'
  },
  [PooledReasonEnum.CANCEL_ONBOARDING]: {
    value: PooledReasonEnum.CANCEL_ONBOARDING,
    name: $t('PooledReasonEnum.cancelOnboarding'),
    status: 'warning'
  },
  [PooledReasonEnum.BLACK_LIST]: {
    value: PooledReasonEnum.BLACK_LIST,
    name: $t('PooledReasonEnum.blackList'),
    status: 'black'
  },
  [PooledReasonEnum.ARCHIVED_RESUMES]: {
    value: PooledReasonEnum.ARCHIVED_RESUMES,
    name: $t('PooledReasonEnum.archivedResumes'),
    status: 'primary'
  },
  [PooledReasonEnum.CANDIDATE_WITHDRAWN]: {
    value: PooledReasonEnum.CANDIDATE_WITHDRAWN,
    name: $t('PooledReasonEnum.candidateWithdraw'),
    status: 'default'
  }
}
