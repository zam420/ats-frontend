export enum PerformanceRankEnum {
  TOP_TEN = 0,
  TEN_TO_THIRTY = 1,
  THIRTY_TO_FIFTY = 2,
  FIFTY_TO_SEVENTY = 3,
  SEVENTY_TO_HUNDRED = 4
}

export const PerformanceRank: Record<string, CommonEnum.enumItem> = {
  [PerformanceRankEnum.TOP_TEN]: {
    value: PerformanceRankEnum.TOP_TEN,
    name: 'Top 10%'
  },
  [PerformanceRankEnum.TEN_TO_THIRTY]: {
    value: PerformanceRankEnum.TEN_TO_THIRTY,
    name: '10%-30%'
  },
  [PerformanceRankEnum.THIRTY_TO_FIFTY]: {
    value: PerformanceRankEnum.THIRTY_TO_FIFTY,
    name: '30%-50%'
  },
  [PerformanceRankEnum.FIFTY_TO_SEVENTY]: {
    value: PerformanceRankEnum.FIFTY_TO_SEVENTY,
    name: '50%-70%'
  },
  [PerformanceRankEnum.SEVENTY_TO_HUNDRED]: {
    value: PerformanceRankEnum.SEVENTY_TO_HUNDRED,
    name: '70%-100%'
  }
}
