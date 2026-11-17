import type { LanguageType } from '@/store/interface'

export type AppLocale = 'en-US' | 'zh-CN'

const readSelectedLocale = (): AppLocale => {
  const locale = localStorage.getItem('locale')
  return locale === 'zh-CN' || locale === 'zh' ? 'zh-CN' : 'en-US'
}

const selectedLocale = readSelectedLocale()

export const getSelectedLocale = (): AppLocale => selectedLocale

export const getLanguage = (locale: AppLocale): LanguageType =>
  locale === 'zh-CN' ? 'zh' : 'en'

export const isCreateOrEditRoute = (path: string): boolean =>
  !/\/preview\//i.test(path) && /\/(?:create|edit)(?:\/:[^/]+)?\/?$/i.test(path)
