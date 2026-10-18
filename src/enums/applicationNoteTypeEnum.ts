import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

export enum ApplicationNoteTypeEnum {
  RESUME_ENTRY,
  RESUME_REVIEW,
  ONLINE,
  VIDEO,
  HR,
  PROFESSIONAL,
  CEO,
  OFFER_MANAGEMENT,
  ONBOARD,
  TALENT_POOL
}

export const ApplicationNoteType: Record<string, CommonEnum.enumItem> = {
  [ApplicationNoteTypeEnum.RESUME_ENTRY]: {
    value: ApplicationNoteTypeEnum.RESUME_ENTRY,
    name: $t('candidateStatusEnum.resumeEntry')
  },
  [ApplicationNoteTypeEnum.RESUME_REVIEW]: {
    value: ApplicationNoteTypeEnum.RESUME_REVIEW,
    name: $t('candidateStatusEnum.resumeScreening')
  },
  [ApplicationNoteTypeEnum.ONLINE]: {
    value: ApplicationNoteTypeEnum.ONLINE,
    name: $t('candidateStatusEnum.onlineWrittenTest')
  },
  [ApplicationNoteTypeEnum.VIDEO]: {
    value: ApplicationNoteTypeEnum.VIDEO,
    name: $t('candidateStatusEnum.videoInterview')
  },
  [ApplicationNoteTypeEnum.HR]: {
    value: ApplicationNoteTypeEnum.HR,
    name: $t('candidateStatusEnum.HRInterview')
  },
  [ApplicationNoteTypeEnum.PROFESSIONAL]: {
    value: ApplicationNoteTypeEnum.PROFESSIONAL,
    name: $t('candidateStatusEnum.professionalInterview')
  },
  [ApplicationNoteTypeEnum.CEO]: {
    value: ApplicationNoteTypeEnum.CEO,
    name: $t('candidateStatusEnum.CEOInterview')
  },
  [ApplicationNoteTypeEnum.OFFER_MANAGEMENT]: {
    value: ApplicationNoteTypeEnum.OFFER_MANAGEMENT,
    name: $t('candidateStatusEnum.offerManagement')
  },
  [ApplicationNoteTypeEnum.ONBOARD]: {
    value: ApplicationNoteTypeEnum.ONBOARD,
    name: $t('candidateStatusEnum.onboardingManagement')
  },
  [ApplicationNoteTypeEnum.TALENT_POOL]: {
    value: ApplicationNoteTypeEnum.TALENT_POOL,
    name: $t('candidateStatusEnum.talentPool')
  }
}
