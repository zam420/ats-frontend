import { HandleData } from './interface'
import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

/**
 * @description 操作单条数据信息 (二次确认【删除、禁用、启用、重置密码】)
 * @param {Function} api 操作数据接口的api方法 (必传)
 * @param {Object} params 携带的操作数据参数 {id,params} (必传)
 * @param {String} message 提示信息 (必传)
 * @param {String} confirmType icon类型 (不必传,默认为 warning)
 * @returns {Promise}
 */
export const useHandleData = (
  api: (params: any) => Promise<any> | any,
  params: any = {},
  message: string,
  sucMessage: string,
  confirmType: HandleData.MessageType = 'warning'
) => {
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(message, $t('message.tips'), {
      confirmButtonText: $t('button.confirm'),
      cancelButtonText: $t('button.cancel'),
      type: confirmType,
      center: true,
      draggable: true
    }).then(async () => {
      const res = await api(params)
      if (res?.success) {
        ElMessage.success({ message: sucMessage })
        return resolve(true)
      }
      ElMessage.error({ message: res?.message })
      reject(false)
    })
  })
}
