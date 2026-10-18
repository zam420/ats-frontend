import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum CandidateStatusEnum {
  DRAFT,
  UNSCREEN,
  RESUME_SCREEN,
  VIDEO,
  ONLINE_WRITTEN,
  HR,
  PROFESSIONAL,
  CEO,
  OFFER_MANAGEMENT,
  ONBOARD,
  TALENT_POOL = -1,
  DELETED
}
export const CandidateStatus: Record<string, CommonEnum.enumItem> = {
  [CandidateStatusEnum.DRAFT]: {
    value: CandidateStatusEnum.DRAFT,
    name: $t('candidateStatusEnum.draft'),
    status: 'warning'
  },
  [CandidateStatusEnum.UNSCREEN]: {
    value: CandidateStatusEnum.UNSCREEN,
    name: $t('candidateStatusEnum.unscreen'),
    status: 'warning'
  },
  [CandidateStatusEnum.RESUME_SCREEN]: {
    value: CandidateStatusEnum.RESUME_SCREEN,
    name: $t('candidateStatusEnum.resumeScreening'),
    status: 'primary'
  },
  [CandidateStatusEnum.VIDEO]: {
    value: CandidateStatusEnum.VIDEO,
    name: $t('candidateStatusEnum.videoInterview'),
    status: 'primary'
  },
  [CandidateStatusEnum.ONLINE_WRITTEN]: {
    value: CandidateStatusEnum.ONLINE_WRITTEN,
    name: $t('candidateStatusEnum.onlineWrittenTest'),
    status: 'primary'
  },
  [CandidateStatusEnum.HR]: {
    value: CandidateStatusEnum.HR,
    name: $t('candidateStatusEnum.HRInterview'),
    status: 'primary'
  },
  [CandidateStatusEnum.PROFESSIONAL]: {
    value: CandidateStatusEnum.PROFESSIONAL,
    name: $t('candidateStatusEnum.professionalInterview'),
    status: 'primary'
  },
  [CandidateStatusEnum.CEO]: {
    value: CandidateStatusEnum.CEO,
    name: $t('candidateStatusEnum.CEOInterview'),
    status: 'primary'
  },
  [CandidateStatusEnum.OFFER_MANAGEMENT]: {
    value: CandidateStatusEnum.OFFER_MANAGEMENT,
    name: $t('candidateStatusEnum.offerManagement'),
    status: 'success'
  },
  [CandidateStatusEnum.ONBOARD]: {
    value: CandidateStatusEnum.ONBOARD,
    name: $t('candidateStatusEnum.onboardingManagement'),
    status: 'success'
  },
  [CandidateStatusEnum.TALENT_POOL]: {
    value: CandidateStatusEnum.TALENT_POOL,
    name: $t('candidateStatusEnum.talentPool'),
    status: 'default'
  }
}
