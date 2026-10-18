import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum WorkLocationEnum {
  //0: Remote
  REMOTE,
  // [1,499] : China
  CHINA,
  CHINA_SHANGHAI,
  CHINA_WUXI,
  CHINA_HEFEI,
  CHINA_SUZHOU,
  CHINA_SHENZHEN,
  // 0, >= 500 : Overseas
  CZECH = 500,
  CZECH_BRNO = 501,
  INDIA = 600,
  INDIA_PUNE = 601,
  SINGAPORE = 700,
  BRAZIL = 800,
  BRAZIL_CAMPINAS = 801,
  JAPAN = 900,
  JAPAN_TOKYO = 901,
  JAPAN_OSAKA = 902,
  JAPAN_YOKOHAMA = 903
}

export const WorkLocation: Record<string, CommonEnum.enumItem> = {
  [WorkLocationEnum.CHINA]: {
    value: WorkLocationEnum.CHINA,
    name: $t('workLocationEnum.china'),
    group: $t('workLocationEnum.china'),
    isParent: true,
    sort: 1
  },
  [WorkLocationEnum.CHINA_SHANGHAI]: {
    value: WorkLocationEnum.CHINA_SHANGHAI,
    name: $t('workLocationEnum.shanghai'),
    group: $t('workLocationEnum.china')
  },
  [WorkLocationEnum.CHINA_WUXI]: {
    value: WorkLocationEnum.CHINA_WUXI,
    name: $t('workLocationEnum.wuxi'),
    group: $t('workLocationEnum.china')
  },
  [WorkLocationEnum.CHINA_HEFEI]: {
    value: WorkLocationEnum.CHINA_HEFEI,
    name: $t('workLocationEnum.hefei'),
    group: $t('workLocationEnum.china')
  },
  [WorkLocationEnum.CHINA_SUZHOU]: {
    value: WorkLocationEnum.CHINA_SUZHOU,
    name: $t('workLocationEnum.suzhou'),
    group: $t('workLocationEnum.china')
  },
  [WorkLocationEnum.CHINA_SHENZHEN]: {
    value: WorkLocationEnum.CHINA_SHENZHEN,
    name: $t('workLocationEnum.shenzhen'),
    group: $t('workLocationEnum.china')
  },
  [WorkLocationEnum.CZECH]: {
    value: WorkLocationEnum.CZECH,
    name: $t('workLocationEnum.czech'),
    group: $t('workLocationEnum.czech'),
    isParent: true,
    sort: 4
  },
  [WorkLocationEnum.CZECH_BRNO]: {
    value: WorkLocationEnum.CZECH_BRNO,
    name: $t('workLocationEnum.brno'),
    group: $t('workLocationEnum.czech')
  },
  [WorkLocationEnum.INDIA]: {
    value: WorkLocationEnum.INDIA,
    name: $t('workLocationEnum.india'),
    group: $t('workLocationEnum.india'),
    isParent: true,
    sort: 3
  },
  [WorkLocationEnum.INDIA_PUNE]: {
    value: WorkLocationEnum.INDIA_PUNE,
    name: $t('workLocationEnum.pune'),
    group: $t('workLocationEnum.india')
  },
  [WorkLocationEnum.SINGAPORE]: {
    value: WorkLocationEnum.SINGAPORE,
    name: $t('workLocationEnum.singapore'),
    group: $t('workLocationEnum.singapore'),
    isParent: true,
    sort: 2
  },
  [WorkLocationEnum.BRAZIL]: {
    value: WorkLocationEnum.BRAZIL,
    name: $t('workLocationEnum.brazil'),
    group: $t('workLocationEnum.brazil'),
    isParent: true,
    sort: 5
  },
  [WorkLocationEnum.BRAZIL_CAMPINAS]: {
    value: WorkLocationEnum.BRAZIL_CAMPINAS,
    name: $t('workLocationEnum.campinas'),
    group: $t('workLocationEnum.brazil')
  },
  [WorkLocationEnum.JAPAN]: {
    value: WorkLocationEnum.JAPAN,
    name: $t('workLocationEnum.japan'),
    group: $t('workLocationEnum.japan'),
    isParent: true,
    sort: 6
  },
  [WorkLocationEnum.JAPAN_TOKYO]: {
    value: WorkLocationEnum.JAPAN_TOKYO,
    name: $t('workLocationEnum.tokyo'),
    group: $t('workLocationEnum.japan')
  },
  [WorkLocationEnum.JAPAN_OSAKA]: {
    value: WorkLocationEnum.JAPAN_OSAKA,
    name: $t('workLocationEnum.osaka'),
    group: $t('workLocationEnum.japan')
  },
  [WorkLocationEnum.JAPAN_YOKOHAMA]: {
    value: WorkLocationEnum.JAPAN_YOKOHAMA,
    name: $t('workLocationEnum.yokohama'),
    group: $t('workLocationEnum.japan')
  },
  [WorkLocationEnum.REMOTE]: {
    value: WorkLocationEnum.REMOTE,
    name: $t('workLocationEnum.remote'),
    group: $t('workLocationEnum.remote'),
    isParent: true,
    sort: 7
  }
}

export const isWorkLocationUnderChina = (wordLocationId: number) => {
  return [
    WorkLocationEnum.CHINA,
    WorkLocationEnum.CHINA_SHANGHAI,
    WorkLocationEnum.CHINA_WUXI,
    WorkLocationEnum.CHINA_HEFEI,
    WorkLocationEnum.CHINA_SUZHOU,
    WorkLocationEnum.CHINA_SHENZHEN
  ].includes(wordLocationId)
}

export const isWorkLocationUnderCzech = (wordLocationId: number) => {
  return [
    WorkLocationEnum.CZECH,
    WorkLocationEnum.CZECH_BRNO
  ].includes(wordLocationId)
}

export const isWorkLocationUnderIndia = (wordLocationId: number) => {
  return [
    WorkLocationEnum.INDIA,
    WorkLocationEnum.INDIA_PUNE
  ].includes(wordLocationId)
}

export const isWorkLocationUnderBrazil = (wordLocationId: number) => {
  return [
    WorkLocationEnum.BRAZIL,
    WorkLocationEnum.BRAZIL_CAMPINAS
  ].includes(wordLocationId)
}

export const isWorkLocationUnderJapan = (wordLocationId: number) => {
  return [
    WorkLocationEnum.JAPAN,
    WorkLocationEnum.JAPAN_TOKYO,
    WorkLocationEnum.JAPAN_OSAKA,
    WorkLocationEnum.JAPAN_YOKOHAMA,
  ].includes(wordLocationId)
}

export const getWorkLocationIdsUnderChina = () => {
  return [
    WorkLocationEnum.CHINA,
    WorkLocationEnum.CHINA_SHANGHAI,
    WorkLocationEnum.CHINA_WUXI,
    WorkLocationEnum.CHINA_HEFEI,
    WorkLocationEnum.CHINA_SUZHOU,
    WorkLocationEnum.CHINA_SHENZHEN
  ]
}
