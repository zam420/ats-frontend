import { ElLoading } from 'element-plus'

/* 全局请求 loading */
let loadingInstance: ReturnType<typeof ElLoading.service>

/**
 * @description 开启 Loading
 * */
const startLoading = (text: string) => {
  loadingInstance = ElLoading.service({
    fullscreen: true,
    lock: true,
    text: text,
    customClass: 'app-fullscreen-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

/**
 * @description 结束 Loading
 * */
const endLoading = () => {
  loadingInstance.close()
}

/**
 * @description 显示全屏加载
 * */
let needLoadingRequestCount = 0
let navigationLoadingCount = 0
export const showFullScreenLoading = (text: string = 'Loading') => {
  if (needLoadingRequestCount === 0 && navigationLoadingCount === 0) {
    startLoading(text)
  }
  needLoadingRequestCount++
}

/**
 * @description 隐藏全屏加载
 * */
export const tryHideFullScreenLoading = () => {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0 && navigationLoadingCount === 0) {
    endLoading()
  }
}

export const showNavigationLoading = () => {
  if (needLoadingRequestCount === 0 && navigationLoadingCount === 0) {
    startLoading('Loading')
  }
  navigationLoadingCount++
}

export const hideNavigationLoading = () => {
  if (navigationLoadingCount <= 0) return
  navigationLoadingCount--
  if (needLoadingRequestCount === 0 && navigationLoadingCount === 0) {
    endLoading()
  }
}
