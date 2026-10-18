import { useLocale } from '@/hooks/useLocale'
/**
 * @description: 校验状态码
 * @param {number} status
 */
export const checkStatus = (status: number): void => {
  const { $t } = useLocale()
  switch (status) {
    case 400:
      ElMessage.error($t('message.400Text'))
      break
    case 401:
      ElMessage.error($t('message.401Text'))
      break
    case 403:
      ElMessage.error($t('message.403Text'))
      break
    case 404:
      ElMessage.error($t('message.404Text'))
      break
    case 405:
      ElMessage.error($t('message.405Text'))
      break
    case 408:
      ElMessage.error($t('message.408Text'))
      break
    case 500:
      ElMessage.error($t('message.500Text'))
      break
    case 502:
      ElMessage.error($t('message.502Text'))
      break
    case 503:
      ElMessage.error($t('message.503Text'))
      break
    case 504:
      ElMessage.error($t('message.504Text'))
      break
    default:
      ElMessage.error($t('message.defaultText'))
  }
}
