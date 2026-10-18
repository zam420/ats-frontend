import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

export enum JobStatusEnum {
  Draft,
  Published,
  Closed
}

export const JobStatus: Record<string, CommonEnum.enumItem> = {
  [JobStatusEnum.Draft]: {
    value: JobStatusEnum.Draft,
    name: $t('jobStatusEnum.draft'),
    status: 'warning'
  },
  [JobStatusEnum.Published]: {
    value: JobStatusEnum.Published,
    name: $t('jobStatusEnum.published'),
    status: 'success'
  },
  [JobStatusEnum.Closed]: {
    value: JobStatusEnum.Closed,
    name: $t('jobStatusEnum.closed'),
    status: 'default'
  }
}
