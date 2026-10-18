import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum ProjectStatusEnum {
  ACTIVE,
  INACTIVE
}

export const ProjectStatus: Record<string, CommonEnum.enumItem> = {
  [ProjectStatusEnum.ACTIVE]: {
    value: ProjectStatusEnum.ACTIVE,
    name: $t('projectStatusEnum.active'),
    status: 'success'
  },
  [ProjectStatusEnum.INACTIVE]: {
    value: ProjectStatusEnum.INACTIVE,
    name: $t('projectStatusEnum.inactive')
  }
}
