import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()
export enum ChannelTypeEnum {
  LIE_PIN,
  OFFICIAL_WEBSITE_CN,
  OFFICIAL_WEBSITE_EN,
  LINKED_IN
}

export const ChannelType: Record<string, CommonEnum.enumItem> = {
  [ChannelTypeEnum.LIE_PIN]: {
    value: ChannelTypeEnum.LIE_PIN,
    name: $t('channelTypeEnum.liePin')
  },
  [ChannelTypeEnum.OFFICIAL_WEBSITE_CN]: {
    value: ChannelTypeEnum.OFFICIAL_WEBSITE_CN,
    name: $t('channelTypeEnum.officialWebsiteCn')
  },
  [ChannelTypeEnum.OFFICIAL_WEBSITE_EN]: {
    value: ChannelTypeEnum.OFFICIAL_WEBSITE_EN,
    name: $t('channelTypeEnum.officialWebsiteEn')
  },
  [ChannelTypeEnum.LINKED_IN]: {
    value: ChannelTypeEnum.LINKED_IN,
    name: $t('channelTypeEnum.linkedin')
  }
}
