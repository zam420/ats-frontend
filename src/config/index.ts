// ? 全局默认配置项

// 表头设置
export const CV_MANAGEMENT_HEADER = 'CV_MANAGEMENT_HEADER'
export const TALENT_POOL_HEADER = 'TALENT_POOL_HEADER'

// 打开 dialog
export const OPEN_DIALOG = 'open_dialog'

export const OPEN_FILE_PREVIEW = 'open_file_preview'

export const OPEN_BLOB_PREVIEW = 'open_blob_preview'

export const OPEN_EMAIL_PREVIEW = 'open_email_preview'

export const FILE_BLOB_DOWNLOAD = 'file_blob_download'

// 路由白名单地址（必须是本地存在的路由 staticRouter.ts 中）
export const ROUTER_WHITE_LIST: string[] = ['/500', '/404', '/403', '/login', '/register', '/forgot-password']

// 表格默认 Page Sizes
export const PAGE_SIZES: number[] = [100, 200, 300, 500]

// 默认触发折叠菜单的宽度
export const COLLAPSE_MENU_WIDTH = 1320

export const LARGE_WIDTH = 1600

//Dialog 默认宽度
export const DIALOG_DEFAULT_WIDTH = '500px'

// Popover 默认宽度
export const POPOVER_DEFAULT_WIDTH = 400

// Drawer 的默认宽度
export const DRAWER_DEFAULT_WIDTH = '300px'

// Collapse width
export const COLLAPSE_LG_WIDTH = '17em'
export const COLLAPSE_SM_WIDTH = '80px'

// 日期格式
export const DATE_FORMAT: string = 'YYYY-MM-DD'
export const DATE_TIME: string = 'hh:mm:ss'
export const DATE_TIME_FORMAT: string = 'YYYY-MM-DD hh:mm:ss'
export const MONTH_FORMAT: string = 'YYYY-MM'
export const MONTH_DOTTED: string = 'YYYY.MM'
export const TIME_FORMAT: string = 'HH:mm'
export const DATE_TIME_FORMAT_24HOUR: string = 'YYYY-MM-DD HH:mm:ss'
// 不同size对应的字体大小
export const FONT_SIZE: { [unit: string]: string } = {
  large: '16px',
  default: '14px',
  small: '12px'
}
// 不同size表头计算宽度需要增加的padding宽度
export const TABLE_HEADER_PADDING: { [unit: string]: number } = {
  large: 70,
  default: 68,
  small: 50
}

// 邮箱验证正则
export const EMAIL_REG =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

// url 验证正则
export const URL_REG = /(http|https):\/\/\S*/

// 默认字体样式
export const FONT_FAMILY: string =
  'HelveticaNeueBold, HelveticaNeue-Bold, "Helvetica Neue Bold", HelveticaNeue, "Helvetica Neue", Helvetica, Arial, PingFangSC-Medium, "PingFang SC Medium", 黑体, sans-serif'

// liepin
export const LIEPIN_URL: string = 'https://jump.liepin.com/pc/mailclick?params='
export const LIEPIN_LPT_URL: string = 'https://lpt.liepin.com/cvview/showresumedetail'

// 需要从邮箱外部跳转进来的路径
export const JUMP_FROM_EMAIL: string[] = ['ROUTER_CV_MANAGEMENT_DETAIL', 'ROUTER_INTERVIEWER_MY_REVIEW', 'ROUTER_INTERVIEWER_RESUME_REVIEW', 'ROUTER_INTERVIEWER_TEST_REVIEW']

