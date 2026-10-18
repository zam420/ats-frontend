import { isArray } from '@/utils/is'
import { TableFormatEnum } from '@/enums/tableFormatEnum'
import { UploadFile } from 'element-plus'
import router from '@/router'
import { useGlobalStore } from '@/store/modules/global'
import { EMAIL_REG, TIME_FORMAT } from '@/config'
import moment from 'moment'

/**
 * @description 获取浏览器默认语言
 * @return {String} 语言
 */
export const getBrowserLang = () => {
  const browserLang = navigator.language ? navigator.language : navigator.browserLanguage
  if (['cn', 'zh', 'zh-cn'].includes(browserLang?.toLowerCase() ?? '')) {
    return 'zh'
  }
  return 'en'
}

/**
 * @description 使用递归扁平化菜单，方便添加动态路由
 * @param {Array} menuList 菜单列表
 * @returns {Array}
 */
export function getFlatMenuList(menuList: Menu.MenuOptions[]): Menu.MenuOptions[] {
  let newMenuList: Menu.MenuOptions[] = JSON.parse(JSON.stringify(menuList))
  return newMenuList.flatMap(item => [
    item,
    ...(item.children ? getFlatMenuList(item.children) : [])
  ])
}

/**
 * @description 生成唯一 uuid
 * @returns {String}
 */
export function generateUUID() {
  let uuid = ''
  for (let i = 0; i < 32; i++) {
    let random = (Math.random() * 16) | 0
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-'
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16)
  }
  return uuid
}

/**
 * @description 使用递归过滤出需要渲染在左侧菜单的列表 (需剔除 isHide == true 的菜单)
 * @param {Array} menuList 菜单列表
 * @returns {Array}
 * */
export function getShowMenuList(menuList: Menu.MenuOptions[], permissions: string[]) {
  let newMenuList: Menu.MenuOptions[] = JSON.parse(JSON.stringify(menuList))
  return newMenuList.filter(item => {
    if (item.meta.isHide) {
      return false
    }
    const permissionCode: string = item.meta.permissionCode ?? ''
    if (!permissionCode || permissions.includes(permissionCode)) {
      item.children?.length && (item.children = getShowMenuList(item.children, permissions))
      return true
    }
    return false
  })
}

/**
 * @description 使用递归找出所有面包屑存储到 pinia/vuex 中
 * @param {Array} menuList 菜单列表
 * @param {Array} parent 父级菜单
 * @param {Object} result 处理后的结果
 * @returns {Object}
 */
export const getAllBreadcrumbList = (
  menuList: Menu.MenuOptions[],
  parent = [],
  result: { [key: string]: any } = {}
) => {
  for (const item of menuList) {
    result[item.path] = [...parent, item]
    if (item.children) getAllBreadcrumbList(item.children, result[item.path], result)
  }
  return result
}

/**
 * @description 格式化表格单元格默认值
 * @param row 行
 * @param col 列
 * @param callValue 当前单元格值
 * @return {String} 格式化后的值
 * */
export function defaultFormat(row: any, col: any, callValue: any) {
  let value = callValue
  // 如果当前值为数组,使用 / 拼接（根据需求自定义）
  if (isArray(callValue)) {
    value = callValue.length ? callValue.join(' / ') : '--'
  }
  if (col?.otherProp) {
    value = row[col?.otherProp] ? row[col?.otherProp] : callValue ?? '--'
  }
  if (col?.enums) {
    value = col.enums?.[value] ?? value
  }
  if (col?.format && value) {
    value = formatData(value, col?.format)
  }
  return value
}

// 获取select对应的文字
export function getSelectText(value: any, item: Table.ColumnProps) {
  let selectName = value
  const options = item?.options ?? []
  options.forEach(data => {
    if (data.value === value) {
      selectName = data.label
    }
  })
  return selectName
}
// 判断字符是否为空
export const isEmpty = (content: string) => {
  return (
    content == null ||
    content
      ?.toString()
      ?.trim()
      .replace(/(^s*)|(s*$)/g, '').length === 0
  )
}
// 转义字符
export const unescapeHTML = (str: string) => {
  if (isEmpty(str)) {
    return
  }

  let doc = new DOMParser().parseFromString(str, 'text/html')
  return doc.documentElement.textContent
}

// formatData
export const formatData = (value: any, type: string) => {
  let formatValue = value
  switch (type) {
    case TableFormatEnum.PERCENT:
      formatValue = Number(value) * 100 + '%'
      break
    case TableFormatEnum.THOUSAND:
      formatValue = toThousands(value)
      break
  }
  return formatValue
}

// 转成千分位
export const toThousands = (num: any) => {
  if (isNaN(num)) {
    return '--'
  } else {
    let a = (num + '').split('.')
    num = a[0]
    let flag = ''
    if (num < 0) {
      flag = '-'
      num = num * -1
    }
    num = (num || 0).toString()
    let result = ''
    while (num.length > 3) {
      result = ',' + num.slice(-3) + result
      num = num.slice(0, num.length - 3)
    }
    if (num) {
      result = num + result
    }
    if (a.length > 1) {
      return flag + '' + result + '.' + a[1]
    } else {
      return flag + '' + result
    }
  }
}

/**
 * @description 处理值无数据情况
 * @param {*} callValue 需要处理的值
 * @returns {String}
 * */
export function formatValue(callValue: any) {
  // 如果当前值为数组，使用 / 拼接（根据需求自定义）
  if (isArray(callValue)) return callValue.length ? callValue.join(' / ') : '--'
  return callValue ?? '--'
}

/**
 * @description 处理 prop 为多级嵌套的情况，返回的数据 (列如: prop: user.name)
 * @param {Object} row 当前行数据
 * @param {String} prop 当前 prop
 * @returns {*}
 * */
export function handleRowAccordingToProp(row: { [key: string]: any }, prop: string) {
  if (!prop.includes('.')) return row[prop] ?? '--'
  prop.split('.').forEach(item => (row = row[item] ?? '--'))
  return row
}

/**
 * @description 递归查找 callValue 对应的 enum 值
 * */
export function findItemNested(enumData: any, callValue: any, value: string, children: string) {
  return enumData.reduce((accumulator: any, current: any) => {
    if (accumulator) return accumulator
    if (current[value] === callValue) return current
    if (current[children]) return findItemNested(current[children], callValue, value, children)
  }, null)
}
/**
 * @description 验证值为数字或小数
 * @param value 验证的值
 * @param toFixed 保留多少位小数
 * @return {boolean} 验证结果
 * */
export const regNumber = (value: any, toFixed?: number) => {
  value = value?.toString()?.replace(/[^0-9.]/g, '')
  let reg: RegExp
  if (toFixed || toFixed === 0) {
    reg = new RegExp(`^(([1-9]\\d*)|0)(\\.\\d{1,${toFixed}})?$`)
  } else {
    reg = new RegExp('^(([1-9]\\d*)|0)(\\.\\d*)?$')
  }
  if (value?.endsWith('.') && value?.indexOf('.') === value.length - 1) {
    return value
  }
  if (!reg.test(value)) {
    value = value?.substring(0, value.length - 1)
  }
  return isNaN(parseFloat(value)) ? null : parseFloat(value)
}

// 判断附件是否是图片类型
export const isImg = (name: string) => {
  // 根据文件名称来获取后缀名
  const fix = name.indexOf('.') !== -1 ? name.split('.').pop() : ''
  if (
    fix &&
    ['png', 'jpg', 'jpeg', '.gif', 'PNG', 'JPG', 'JPEG', 'GIF'].indexOf(fix as string) != -1
  ) {
    // 如果是图片文件则返回true
    return true
  }
  return false
}

/**
 * @description 计算字符串的占宽
 * @param str 需要计算宽度的字符串
 * @param padding 填充
 * @return {number} 返回宽度
 * */
export const getStrWidth = (str: string, padding: number = 0) => {
  console.log(str, padding)
  // const globalStore = useGlobalStore()
  // const fontSize = FONT_SIZE[globalStore.assemblySize]
  // const canvas = document.createElement('canvas') as HTMLCanvasElement
  // const context = canvas.getContext('2d') as CanvasRenderingContext2D
  // // 设置字体样式
  // context.font = `normal ${fontSize} ${FONT_FAMILY}` // 字体一定要写，不能只写一个字体大小，不启用
  // const dimension = context.measureText(str)
  // return dimension.width + padding
}

/**
 * @description 获取图片路径
 * @param {String} url 图片静态路径
 * @returns {String}
 * */
export const getAssetsFile = (url: string) => {
  return new URL(`../assets/${url}`, import.meta.url).href
}

/**
 * @description 获取 form 表单对象
 * @param {Form.FormItem[]} 表单数组
 * @returns {object} 表单对象
 * */
export const getObjectByForms = (forms: Form.FormItem[]) => {
  const obj: Record<string, any> = {} as Record<string, any>
  forms.forEach((item: Form.FormItem) => {
    if (!item.isHide || item.isParam) {
      const prop = item.prop as string
      if (!isEmpty(item.value) && !isEmpty(item.prop)) {
        obj[prop] = item.value
      }
      if (item.showToday) {
        const prop1 = item.prop1 as string
        obj[prop1] = item.upToNow ?? false
      }
    }
  })
  if (Object.keys(obj)?.length === 1 && obj.up_to_now === false) {
    delete obj.up_to_now
  }
  return obj
}

/**
 * @description 组装下拉菜单数据
 * @param {any} data 原始数据
 * @param {string} key 原始数据的key
 * @param {string} name 原始数据的 name
 * @returns {Form.FormSelect[]} 表单对象
 * */
export const getSelectOptionsByData = <T extends {}>(data: T[], key: keyof T, name: keyof T) => {
  const forms: Form.FormSelect[] = []
  data.forEach(item => {
    forms.push({ label: item?.[name] as string, value: item?.[key] })
  })
  return forms
}

/**
 * @description 组装表格 Tabs
 * @param {Record<string, CommonEnum.enumItem> } data 原始数据
 * @returns {Form.FormSelect[]} 表单对象
 * */
export const getTableTabs = (data: Record<string, CommonEnum.enumItem>) => {
  const tableTabs = [
    {
      label: 'All',
      value: 'all',
      count: 0
    }
  ]
  for (const [key, value] of Object.entries(data)) {
    tableTabs.push({
      label: value.name,
      value: key,
      count: 0
    })
  }
  return tableTabs
}

/**
 * @description File 对象 转换为 Blob 对象
 * @param {UploadFile } file
 * @returns { Blob } Blob
 * */
export const fileToBlob = (file: UploadFile) => {
  // 创建 FileReader 对象
  let reader = new FileReader()
  return new Promise<Blob>(resolve => {
    // FileReader 添加 load 事件
    reader.addEventListener('load', e => {
      const result = e.target?.result as BlobPart
      resolve(new Blob([result], { type: file.raw?.type }))
    })
    // FileReader 以 ArrayBuffer 格式 读取 File 对象中数据
    reader.readAsArrayBuffer(file.raw!)
  })
}

/**
 * @description File 对象 转换为 Text
 * @param {UploadFile } file
 * @returns { string } string
 * */
export const fileToText = (file: UploadFile) => {
  // 创建 FileReader 对象
  let reader = new FileReader()
  return new Promise<string>(resolve => {
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.readAsText(file.raw!, 'UTF-8')
  })
}
/**
 * @description blob 转换为 ArrayBuffer
 * @param {Blob }  blob
 * @returns { string } string
 * */
export const blobToArrayBuffer = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = () => {
      reject(new Error('Error reading blob as ArrayBuffer.'))
    }
    reader.readAsArrayBuffer(blob)
  })
}

/**
 * @description blob 转换为 Text
 * @param {blob } blob
 * @returns { string } string
 * */
export const blobToString = (blob: Blob) => {
  // 创建 FileReader 对象
  let reader = new FileReader()
  return new Promise<string>(resolve => {
    reader.onload = () => {
      resolve(reader.result as string)
    }
    reader.readAsText(blob!, 'UTF-8')
  })
}

/**
 * @description string 转换为 blob
 * @param {string } text
 * @returns { Blob } blob
 * */
export const stringToBlob = (text: string) => {
  // 创建 FileReader 对象
  return new Blob([text], {
    type: 'text/html'
  })
}

/**
 * @description 获取文件 URL
 * @param { Blob } blob 文件数据
 * @returns { string } url
 * */
export const getObjectURL = (blob: Blob) => {
  return URL.createObjectURL(blob)
}

export const enum2arr = (valueEnum: any[] | Record<string, any>) => {
  let values = Array.isArray(valueEnum) ? valueEnum : Object.values(valueEnum)
  // 如果 enum 值为 number 类型，ts 生成的 js 对象会同时包含枚举的名称，针对该情形需提出枚举名称
  const hasNum = values.some(v => typeof v === 'number')
  if (hasNum) {
    values = values.filter(v => typeof v === 'number')
  }
  return values
}

/**
 * @description 打开新窗口
 * @param { string } url
 * @returns { string } url
 * */
export const openNewWindow = (url: string) => {
  const { href } = router.resolve({
    path: `/${url}`
  })
  window.open(href, '_blank')
}

export const enumItem2arr = (
  enumItem: Record<string, CommonEnum.enumItem> = {}
): Form.FormSelect[] => {
  const list: Form.FormSelect[] = []
  for (const data of Object.values(enumItem)) {
    const item: Form.FormSelect = { label: data.name, ...data }
    if (data.subLabel) {
      item.subLabel = data.subLabel
    }
    list.push(item)
  }
  return list
}

/**
 * @description 判断用户是否包含权限
 * @param { string } permission
 * @returns { boolean }
 * */
export const isHasPermission = (permission: string) => {
  const globalState = useGlobalStore()
  const permissions = globalState.permissions
  return permissions.includes(permission)
}

// 根据group处理option数据为分组格式
export const getOptionsByGroup = (
  options: Form.FormSelect[],
  optionEnum?: Record<string, CommonEnum.enumItem>
) => {
  const optionGroups: Form.FormSelect[] = []
  const optionGroup: Record<string, Form.FormSelect[]> = {}
  options.forEach((info: Form.FormSelect) => {
    const groupName = optionEnum?.[info.value as string]?.group ?? ''
    if (groupName) {
      if (!optionGroup?.[groupName]) {
        optionGroup[groupName] = []
      }
      optionGroup[groupName].push(info)
    }
  })
  for (const [key, value] of Object.entries(optionGroup)) {
    const obj: Form.FormSelect = {
      label: key,
      value: key,
      options: value
    }
    optionGroups.push(obj)
  }
  // 根据label排序这里主要是为了将china 排在overseas前面做的处理， 后续如果换成中文环境可能要改
  optionGroups.sort((a, b) => (a?.label > b?.label ? 1 : -1))
  return optionGroups
}

// 根据group处理option数据为tree格式
export const getTreeOptionsByGroup = (
  options: Form.FormSelect[],
  optionEnum?: Record<string, CommonEnum.enumItem>,
  showListId?: number[]
) => {
  const optionGroup: Record<string, Form.FormSelect[]> = {}
  const treeNodes: Form.FormSelect[] = []
  options.forEach((info: Form.FormSelect) => {
    const isParent = optionEnum?.[info.value as string]?.isParent ?? false
    const groupName = optionEnum?.[info.value as string]?.group ?? ''
    if (isParent && (!showListId || showListId?.length > 0 && showListId?.includes(info.value))) {
      treeNodes.push({
        ...info,
        sort: info?.sort ? info?.sort : (optionEnum?.[info.value as string]?.sort ?? 0),
        children: []
      })
    }
    if (groupName) {
      if (!optionGroup?.[groupName]) {
        optionGroup[groupName] = []
      }
      if (!isParent) {
        optionGroup[groupName].push(info)
      }
    }
  })
  treeNodes.forEach(data => {
    data.children = optionGroup?.[data.label] ?? []
  })
  treeNodes.sort((a, b) => (a?.sort > b?.sort ? 1 : -1))
  return treeNodes
}

// 获取距离当前时间最近的时间范围，30分钟为一个间隔
export const getThirtyMinutesTimeRange = (time?: string) => {
  // 获取当前时间
  const now = time ? new Date(time) : new Date()
  const currentMinutes = now.getMinutes()

  // 计算距离下一个整30分钟的分钟数
  const minutesToNext30 = 30 - (currentMinutes % 30)

  // 计算下一个整30分钟的时间
  const next30Minutes = new Date(now.getTime() + minutesToNext30 * 60000)

  // 设置下一个整30分钟的秒数和毫秒数为零，以确保获取整点时间
  next30Minutes.setSeconds(0)
  next30Minutes.setMilliseconds(0)

  // 计算时间范围的开始时间和结束时间
  const startTime = next30Minutes
  const endTime = new Date(startTime.getTime() + 30 * 60000)

  return {
    startTime: moment(startTime).format(TIME_FORMAT),
    endTime: moment(endTime).format(TIME_FORMAT)
  }
}

// 获取2个时间内的间隔范围
export const getTimeRange = (startTime: string, endTime: string) => {
  if (!startTime || !endTime) {
    return ''
  }
  const startDate = new Date(startTime).getTime()
  const endDate = new Date(endTime).getTime()

  const timeRangeLengthMillis = endDate - startDate

  // 转换时间范围长度为分钟
  const timeRangeLengthMinutes = timeRangeLengthMillis / (1000 * 60)

  // 提取小时和分钟部分
  const hours = Math.floor(timeRangeLengthMinutes / 60)
  const minutes = Math.floor(timeRangeLengthMinutes % 60)

  // 格式化时间长度
  const formattedTimeLength =
    hours === 0 ? `${minutes}m` : minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
  return formattedTimeLength
}

// 获取字符串的第一个字符并转换为大写
export const getFirstLetterUpperCase = (inputString: string) => {
  if (!inputString) return ''
  const words = inputString.trim().split(' ')

  if (words.length === 1) {
    // 没有空格，返回首字母大写
    return words[0].charAt(0).toUpperCase()
  } else {
    // 有空格，返回第一个词和最后一个词的首字母大写
    const firstLetter = words[0]?.charAt(0)?.toUpperCase() ?? ''
    const lastLetter = words?.[words.length - 1]?.charAt(0)?.toUpperCase() ?? ''
    return `${firstLetter}${lastLetter}`
  }
}

// 获取不同数字对应的英文后缀
export const getSuffix = (number: number) => {
  const suffixes = ["th", "st", "nd", "rd"]
  const lastTwoDigits = number % 100
  const suffixIndex = (lastTwoDigits >= 11 && lastTwoDigits <= 13) ? 0 : ((number % 10 <= 3) ? number % 10 : 0)
  return number + suffixes[suffixIndex]
}

// 获取links
export const getLinks = (link: any) => {
  if (isArray(link)) {
    return link.filter((item: string) => !isEmpty(item))
  }
  return [link]
}

// 判断数组中是否有不是合法的espressif的邮箱
export const hasNotEspressifEmail = (emailList: string[]) => {
  const noEspressifEmail = []
  emailList?.forEach((email: string) => {
    if (!EMAIL_REG.test(email) || (!email.endsWith('@espressif.com') && !email.endsWith('@m5stack.com'))) {
      noEspressifEmail.push(email)
    }
  })
  return noEspressifEmail.length > 0
}