import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

export enum InterviewSessionEnum {
  ONLINE,
  VIDEO,
  HR,
  PROFESSIONAL,
  CEO
}

export const InterviewSession: Record<string, CommonEnum.enumItem> = {
  // [InterviewSessionEnum.ONLINE]: {
  //   value: InterviewSessionEnum.ONLINE,
  //   name: $t('interviewProcess.onlineWrittenTest'),
  //   subLabel: $t('interviewProcess.onlineWrittenTestZh'),
  //   status: 'success'
  // },
  // [InterviewSessionEnum.VIDEO]: {
  //   value: InterviewSessionEnum.VIDEO,
  //   name: $t('interviewProcess.videoInterview'),
  //   subLabel: $t('interviewProcess.videoInterviewZh'),
  //   status: 'success'
  // },
  [InterviewSessionEnum.HR]: {
    value: InterviewSessionEnum.HR,
    name: $t('interviewProcess.HRInterview'),
    subLabel: $t('interviewProcess.HRInterviewZh'),
    status: 'success'
  },
  [InterviewSessionEnum.PROFESSIONAL]: {
    value: InterviewSessionEnum.PROFESSIONAL,
    name: $t('interviewProcess.professionalInterview'),
    subLabel: $t('interviewProcess.professionalInterviewZh'),
    status: 'success'
  },
  [InterviewSessionEnum.CEO]: {
    value: InterviewSessionEnum.CEO,
    name: $t('interviewProcess.CEOInterview'),
    subLabel: $t('interviewProcess.CEOInterviewZh'),
    status: 'success'
  }
}
