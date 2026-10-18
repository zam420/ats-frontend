import { useLocale } from '@/hooks/useLocale'
const { $t } = useLocale()

export const EmailTemplateParamEnum = [
  { value: 'name', label: $t('emailTemplate.name') },
  { value: 'applying_position_title', label: $t('emailTemplate.position') },
  { value: 'phone_number', label: $t('emailTemplate.phone') },
  { value: 'writtenTestLink', label: $t('emailTemplate.writtenTestLink') },
  { value: 'writtenTestTime', label: $t('emailTemplate.writtenTestTime') },
  { value: 'AIInterviewLink', label: $t('emailTemplate.AIInterviewLink') },
  { value: 'onlineInterviewLink', label: $t('emailTemplate.onlineInterviewLink') },
  { value: 'interviewTime', label: $t('emailTemplate.interviewTime') },
  { value: 'interviewLocation', label: $t('emailTemplate.interviewLocation') },
  { value: 'interviewers', label: $t('emailTemplate.interviewer') },
  { value: 'sendDate', label: $t('emailTemplate.sendDate') },
  { value: 'userName', label: $t('emailTemplate.HRName') },
  { value: 'expectedOnboardingDate', label: $t('emailTemplate.expectedOnboardingDate') },
  { value: 'accept', label: $t('emailTemplate.accept') },
  { value: 'reject', label: $t('emailTemplate.reject') },
  { value: 'fit', label: $t('emailTemplate.fit') },
  { value: 'unfit', label: $t('emailTemplate.unfit') },
  { value: 'applied_at', label: $t('emailTemplate.applyTime') },
  { value: 'writtenTestScore', label: $t('emailTemplate.writtenTestScore') },
  { value: 'AIInterviewRecord', label: $t('emailTemplate.AIInterviewRecord') },
  { value: 'note', label: $t('emailTemplate.note') }
]
