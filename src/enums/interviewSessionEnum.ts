import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

export enum InterviewSessionEnum {
  ONLINE,
  VIDEO,
  HR,
  PROFESSIONAL,
  C_LEVEL
}

export const InterviewSession: Record<string, CommonEnum.enumItem> = {
  [InterviewSessionEnum.HR]: {
    value: InterviewSessionEnum.HR,
    name: $t('interviewProcess.HRInterview'),
    // subLabel: $t('interviewProcess.HRInterviewZh'),
    status: 'success'
  },
  [InterviewSessionEnum.PROFESSIONAL]: {
    value: InterviewSessionEnum.PROFESSIONAL,
    name: $t('interviewProcess.functionalInterview'),
    // subLabel: $t('interviewProcess.functionalInterviewZh'),
    status: 'success'
  },
  [InterviewSessionEnum.C_LEVEL]: {
    value: InterviewSessionEnum.C_LEVEL,
    name: $t('interviewProcess.executiveInterview'),
    // subLabel: $t('interviewProcess.executiveInterviewZh'),
    status: 'success'
  }
}
