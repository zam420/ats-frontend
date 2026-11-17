import { createI18n } from 'vue-i18n'
import zh from './modules/zh'
import en from './modules/en'
import { getLanguage, getSelectedLocale } from './locale'

const i18n = createI18n({
  legacy: false,
  locale: getLanguage(getSelectedLocale()),
  globalInjection: true,
  messages: {
    zh,
    en
  }
})
export default i18n
