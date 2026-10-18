/**
 * @description：请求配置
 */
export enum ResultEnum {
  NO_AUTH = 401,
  ERROR = 500,
  SUCCESS = 1000,
  ACTIVE_ERROR = 1002,
  UNAUTHORIZED = 1002,
  ERROR_PARAMS = 1005,
  OVERDUE = 2000,
  OVERDUE_1 = 2001,
  NOT_EXIST_USER = 2003,
  AUTH_ERROR = 11000,
  TIMEOUT = 60000,
  LOGIN_ERROR = 10020001,
  CANCEL_REASON = 10030014
}

/**
 * @description：请求方法
 */
export enum RequestEnum {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

/**
 * @description：常用的 contentTyp 类型
 */
export enum ContentTypeEnum {
  // json
  JSON = 'application/json;charset=UTF-8',
  // text
  TEXT = 'text/plain;charset=UTF-8',
  // form-data 一般配合qs
  FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data 上传
  FORM_DATA = 'multipart/form-data;charset=UTF-8',
  OCTET_STEAM = 'application/octet-stream' // 文件下载
}
