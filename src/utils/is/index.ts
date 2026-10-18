const toString = Object.prototype.toString

/**
 * @description: 判断值是否未某个类型
 */
export function index(val: unknown, type: string) {
  return toString.call(val) === `[object ${type}]`
}

/**
 * @description:  是否为函数
 */
export function isFunction<T = Function>(val: unknown): val is T {
  return index(val, 'Function')
}

/**
 * @description: 是否已定义
 */
export const isDef = <T = unknown>(val?: T): val is T => {
  return typeof val !== 'undefined'
}

export const isUnDef = <T = unknown>(val?: T): val is T => {
  return !isDef(val)
}
/**
 * @description: 是否为对象
 */
export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && index(val, 'Object')
}

/**
 * @description:  是否为时间
 */
export function isDate(val: unknown): val is Date {
  return index(val, 'Date')
}

/**
 * @description:  是否为数值
 */
export function isNumber(val: unknown): val is number {
  return index(val, 'Number')
}

/**
 * @description:  是否为AsyncFunction
 */
export function isAsyncFunction<T = any>(val: unknown): val is Promise<T> {
  return index(val, 'AsyncFunction')
}

/**
 * @description:  是否为promise
 */
export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return index(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

/**
 * @description:  是否为字符串
 */
export function isString(val: unknown): val is string {
  return index(val, 'String')
}

/**
 * @description:  是否为boolean类型
 */
export function isBoolean(val: unknown): val is boolean {
  return index(val, 'Boolean')
}

/**
 * @description:  是否为数组
 */
export function isArray(val: any): val is Array<any> {
  return val && Array.isArray(val)
}

/**
 * @description: 是否为浏览器
 */
export const isWindow = (val: any): val is Window => {
  return typeof window !== 'undefined' && index(val, 'Window')
}

export const isElement = (val: unknown): val is Element => {
  return isObject(val) && !!val.tagName
}
