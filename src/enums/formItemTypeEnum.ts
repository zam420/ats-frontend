// * 表单的类型
/**
 * @description：表单的类型
 */
export enum FormItemTypeEnum {
  TEXT = 'text', // 文本
  INPUT = 'input', // 输入框
  EMAIL = 'email', // 邮件框
  PASSWORD = 'password', // 密码框
  SELECT = 'select', // 下拉框
  SELECT_V2 = 'select_v2', // 虚拟下拉框
  MULTIPLE_SELECT = 'multiple_select', // 多选下拉框
  MULTIPLE_SELECT_V2 = 'multiple_select_v2', // 虚拟多选下拉框
  TREE_SELECT = 'treeSelect', // 树下拉框
  TREE_MULTIPLE_SELECT = 'multipleTreeSelect', // 多选树下拉框
  SWITCH = 'switch', // 开关
  FILE = 'file', // 文件上传框
  FILE_BTN = 'file_btn', // 文件上传按钮
  FILE_ICON = 'file_icon', // 文件上传 ICON
  TAG = 'tag', // 标签
  NUMBER = 'number', // 数字输入框
  DATE = 'date', // 日期选择框
  TIME = 'time', // 时间选择框
  MONTH = 'month', // 月份选择
  DATE_TIME = 'dateTime', // 日期时间选择框
  TEXTAREA = 'textarea', // 文本框
  RADIO_BTN = 'radio_btn', // 单选 button
  DOWNLOAD = 'download', // 下载
  NEW_LINE = 'newLine', // 换行
  HORIZONTAL_LINE = 'horizontalLine', //横线
  INPUT_WITH_SWITCH = 'input_with_switch', // input后面放switch
  DATE_TIME_RANGE = 'date_time_range', // 日期+时分秒范围选择
  RADIO = 'radio', // 单选
  DATE_RANGE = 'date_range', // 日期范围选择
  NUMBER_RANGE = 'number_range', //数字范围选择
  YEAR_RANGE = 'year_range', // 年范围选择
  SELECT_WITH_SWITCH = 'select_with_switch' // select后面放switch
}
