import i18n from '@/language/index'
import { LanguageType } from '@/store/interface'

export const useLocale = () => {
  const currentLocale = computed(() => {
    return i18n.global.locale.value // 固定写法 获取当前语言设置
  })
  // 切换语言
  const changeLanguage = (lang: LanguageType) => {
    i18n.global.locale.value = lang // 赋值切换语言
  }
  const $t = (name: string, params: Record<string, any> = {}) => {
    return i18n.global.t(name, params)
  }
  return {
    i18n,
    currentLocale,
    changeLanguage,
    $t
  }
}
