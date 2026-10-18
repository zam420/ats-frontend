import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse
} from 'axios'
import qs from 'qs'
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/config/serviceLoading'
import { ElMessage } from 'element-plus'
import { Result, ResultData } from '@/api/interface'
import { ResultEnum } from '@/enums/httpEnum'
import { checkStatus } from './helper/checkStatus'
import { useGlobalStore } from '@/store/modules/global'
import router from '@/router'
import { unescapeHTML } from '@/utils'
import { ROUTER_403, ROUTER_500, ROUTER_LOGIN } from '@/router/routerName'
import { useMenuStore } from '@/store/modules/menu'

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  noLoading?: boolean
  loadingText?: string
}

const config = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: import.meta.env.VITE_API_URL as string,
  // 设置超时时间
  timeout: ResultEnum.TIMEOUT as number,
  // 跨域时候允许携带凭证
  withCredentials: true
}


// Session is invalid or expired: drop credentials and go back to the login page
const toLogin = () => {
  useGlobalStore().clearUserInfo()
  useMenuStore().setMenuList([])
  if (router.currentRoute.value.path !== ROUTER_LOGIN) {
    router.replace({ path: ROUTER_LOGIN })
  }
}

class RequestHttp {
  service: AxiosInstance
  public constructor(config: AxiosRequestConfig) {
    // instantiation
    this.service = axios.create(config)

    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        const globalStore = useGlobalStore()
        // 当前请求不需要显示 loading 或者改变显示文字，在 api 服务中通过指定的第三个参数: { noLoading: true, loadingText: string } 来控制
        config.noLoading || showFullScreenLoading(config.loadingText)
        if (config.headers && typeof config.headers.set === 'function') {
          config.headers.set('Authorization', globalStore.accessToken)
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      async (response: AxiosResponse) => {
        let { data } = response
        tryHideFullScreenLoading()
        const globalStore = useGlobalStore()
        globalStore.setIsNotExistUser(false)
        if (data.code === ResultEnum.NOT_EXIST_USER) {
          globalStore.setIsNotExistUser(true)
          router.replace({
            path: `/${ROUTER_403}`
          })
          return
        }
        if (
          data?.code === ResultEnum.OVERDUE ||
          data?.code === ResultEnum.OVERDUE_1 ||
          data?.code === ResultEnum.UNAUTHORIZED ||
          response?.status === ResultEnum.NO_AUTH
        ) {
          toLogin()
          return Promise.reject(data)
        }
        if (
          data?.code !== ResultEnum.SUCCESS &&
          !Array.isArray(data?.result) &&
          response?.config?.responseType?.toLowerCase() !== 'blob'
        ) {
          ElMessage.error(data?.message)
          return Promise.reject(data)
        }
        if (
          data &&
          response?.config?.method?.toLowerCase() === 'get' &&
          response?.config?.responseType?.toLowerCase() !== 'blob'
        ) {
          try {
            const dataString: string = JSON.stringify(data)
            data = JSON.parse(
              unescapeHTML(dataString.replace(new RegExp('&quot;', 'gm'), '\\"')) as string
            )
          } catch (e) {
            console.log(e)
          }
        }
        return Promise.resolve(data)
      },
      async (error: AxiosError) => {
        const { response } = error
        tryHideFullScreenLoading()
        if (response) {
          const data = response.data as Result
          if (data.code === ResultEnum.LOGIN_ERROR) {
            return Promise.reject(data)
          }
          if (data.code === ResultEnum.NOT_EXIST_USER) {
            router.replace({
              path: `/${ROUTER_403}`
            })
          }
          if (
            data?.code === ResultEnum.OVERDUE ||
            data?.code === ResultEnum.OVERDUE_1 ||
            data?.code === ResultEnum.UNAUTHORIZED ||
            response?.status === ResultEnum.NO_AUTH
          ) {
            toLogin()
            return Promise.reject(data)
          }
          if (data?.code === ResultEnum.ERROR_PARAMS) {
            return Promise.reject(data)
          }
          checkStatus(response?.status)
        }
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        if (!window.navigator.onLine) {
          router.replace({
            path: `/${ROUTER_500}`
          })
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(url, {
      params,
      ..._object,
      paramsSerializer: params => {
        return qs.stringify(params, { indices: false })
      }
    })
  }
  post<T>(url: string, params?: object | string, _object = {}): Promise<ResultData<T>> {
    return this.service.post(url, params, _object)
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object)
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object })
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: 'blob' })
  }
  getFile<T>(url: string, params?: object, _object = {}): Promise<Blob | ResultData<T>> {
    return this.service.get(url, { params, ..._object, responseType: 'blob' })
  }
}

export default new RequestHttp(config)
