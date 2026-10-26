/* Menu */
declare namespace Menu {
  interface MenuOptions {
    path: string // 路径
    name: string // 名称
    component?: () => Promise<any> // 文件路径
    redirect?: string // 重定向地址
    meta: MetaProps // 信息
    children?: MenuOptions[] // 子菜单
  }
  interface MetaProps {
    icon?: string // 显示的图标
    title: string // 标题
    activeMenu?: string
    isLink?: string // 外部链接
    isHide?: boolean // 是否隐藏
    isFull?: boolean // 是否全屏
    isAffix?: boolean // 是否固定在 tabs nav
    isKeepAlive?: boolean // 是否缓存
    permissionCode?: string // 权限码
    index?: number // 排序
  }
}
/* Form 表单 */
declare namespace Form {
  // 下拉框
  interface FormSelect {
    label: string // 标签
    value: any // 键
    disabled?: boolean // 是否禁用该选项
    children?: OptionsProps[] // 为树形选择时，可以通过 children 属性指定子选项
    [propName: string]: any // 扩展
  }
  // 表单
  interface FormItem {
    label: string // 标签
    prop: string // 键
    desc?: string // 描述
    type?: string // 表单类型
    placeholder?: string // 占位内容
    validateRules?: any // 校验规则
    options?: FormSelect[] // 下拉列表
    isOptionGroup?: boolean // 下拉是否分组
    maxlength?: number // 能输入的最大长度
    multipleLimit?: number // 多选时最多可以选择多少个
    getOptions?: any // 获取下拉列表的方法
    initOptionParams?: Record<string, any> //获取下拉列表需要穿的参数
    optionKey?: string // 获取到的数据的id (对应下拉框的 value) 默认为id
    optionName?: string | string[] // 获取到的数据的name (对应下拉框的 label)默认为name
    optionExpandName?: string //
    optionSecondName?: string | string[] // 获取到的数据的name (对应下拉框的 label)默认为name--second language
    associatedKey?: { prop: string; key: string }[] // 与之有关联的 key
    enum?: Record<string, CommonEnum.enumItem>
    min?: number // 当表单为数字时的最小值
    max?: number // 当表单为数字时的最大值
    fileSize?: number // 当表单为文件时的文件大小
    fileNum?: number // 当表单为文件时的文件数量
    accept?: string // 当表单为文件时的文件格式
    step?: number // 当表单为数字时的步长
    value?: any // 字段值
    required?: boolean // 表单是否必填
    disabled?: boolean // 表单是否禁用
    disableStartDate?: string | Date // 若为日期选择，赋值该字段则禁止选择该值之前的日期
    disableEndDate?: string | Date // 若为日期选择，赋值该字段则禁止选择该值之后的日期
    readonly?: boolean // 是否只读
    clearable?: boolean // 是否显示清除按钮
    isHide?: boolean // 是否隐藏
    accept?: string // 当表单为文件上传时，上传文件的格式
    toFixed?: number // 如果表单为数字时, 保留几位小数
    startDate?: string // 当表单为日期范围时的开始日期
    endDate?: string // 当表单为日期范围时的结束日期
    showToday?: boolean // 是否显示至今按钮
    upToNow?: boolean // 至今
    col?: number // 列宽 总宽度分 24 份(默认为6)
    md?: number // 屏幕 >= 992px的列宽
    lg?: number // 屏幕 >= 1200px的列宽
    xl?: number // 屏幕 >= 1920px的列宽
    disableTime?: boolean // 是否禁用date+time select中的time select
    [propName: string]: any
  }
  // 详情
  interface DetailItem {
    label: string // 标签
    prop: string // 键
    propText?: string // 名字的key
    value?: any // 值
    enum?: Record<string, CommonEnum.enumItem>
    col?: number // 列宽 总宽度分 24 份
    isNewRow?: boolean // 是否换行
    isTitle?: boolean // 是否是标题
    isLine?: boolean // 是否有分割线
    isLabel?: boolean // 是否显示
    isFontBold?: boolean // 文字是否加粗
    isArray?: boolean // 是否是数组
    isTag?: boolean // 是否是标签
    isLink?: boolean // 是否是超链接
    isFile?: boolean // 是否是文件
    isHide?: boolean // 是否隐藏
    isBtn?: boolean // 是否是按钮
    btnText?: string // 如果是按钮，按钮文本
    hasTime?: boolean // 是否包含时间
    labelPosition?: '' | 'top' | 'left' // label 显示的位置
    timeValue?: string // 如果 hasTime = true, 则该值必填
    class?: string
    isPaddingTop?: boolean
    associatedField?: string // 关联字段
    [propName: string]: any
  }
}

// status

declare namespace CommonEnum {
  interface enumItem {
    value: number | string
    name: string
    group?: string
    status?: '' | 'default' | 'success' | 'warning' | 'danger' | 'primary' | 'black'
    [propName: string]: any
  }
}

// table
declare namespace Table {
  // 单元格
  interface ColumnProps {
    columnType?: 'selection' | 'operation' | 'expand' | 'index' // selection | expand（特殊类型）//单元格类型
    prop?: string // 单元格数据（非特殊类型必填）
    otherProp?: string // 单元格数据类型(除了默认以外备选)
    label?: string // 单元格标题（非特殊类型必填）
    width?: number | string | object // 列宽
    minWidth?: number // 最小列宽，剩余空间按比例分配
    isShow?: boolean // 是否显示
    sortable?: boolean // 是否可排序（静态排序）
    fixed?: 'left' | 'right' // 固定列
    tag?: boolean // 是否是标签展示
    image?: boolean // 是否是图片展示
    type?: any // 搜索框类型 or 表单类型
    initSearchParam?: string | number | boolean | any[] // 搜索项初始值
    renderHeader?: (params: any) => any // 自定义表头,
    export?: boolean // 该单元是否支持导出，默认为true
    edit?: boolean // 该单元格是否为表单， 默认为false, 如果为true，根据设置type来定表单类型
    filter?: boolean // 该列是否支持过滤
    showFilter?: boolean // 是否显示过滤窗口
    filterValue?: any // 过滤值
    options?: Form.FormSelect[] // 如果表单为下拉框时，该字段为下拉列表
    getOptions?: (params?: any) => void // 如果表单为下拉框时，设置方法以获取下拉列表
    optionKey?: string // 获取到的数据的id (对应下拉框的 value) 默认为id
    optionName?: string | string[] // 获取到的数据的name (对应下拉框的 label)默认为name
    value?: any
    hideHeader?: Boolean // 是否隐藏在表头显示
    index?: number // 排序字段
    required?: boolean // 是否是必填字段
    clearable?: boolean // 是否可清除
    validateRule?: RegExp
    format?: any // 数据格式
    toFixed?: number // 如果表单为数字时, 保留几位小数
    slotName?: string // slot名称
    disabled?: boolean
    placeholder?: string
    disableStartDate?: string | Date // 若为日期选择，赋值该字段则禁止选择该值之前的日期
    disableEndDate?: string | Date // 若为日期选择，赋值该字段则禁止选择该值之后的日期
    isFixedShow?: boolean // 是否固定显示在表头不支持对其进行col setting
    status?: Record<string, Status.StatusItem>
    link?: string // 该列是超链接,传入跳转到的链接
    countKey?: string // 汇总的键值
    key?: string | string[] // 对应后端的key
    [propName: string]: any
  }
  // 分页信息
  interface Pageable {
    page_num: number
    page_size: number
    total_count: number
  }

  // useTable
  interface TableStateProps {
    tableTotalOdlData: any[]
    tableTotalData: any[]
    tableData: any[]
    searchShow: boolean
    pageable: Pageable
    searchParam: {
      [key: string]: any
    }
    initSearchParam: {
      [key: string]: any
    }
    totalParam: {
      [key: string]: any
    }
    icon?: {
      [key: string]: any
    }
    sortColumn: any
    tableTabs: Form.FormSelect[]
  }
}
/* FileType */
declare namespace File {
  type ImageMimeType =
    | 'image/apng'
    | 'image/bmp'
    | 'image/gif'
    | 'image/jpeg'
    | 'image/pjpeg'
    | 'image/png'
    | 'image/svg+xml'
    | 'image/tiff'
    | 'image/webp'
    | 'image/x-icon'

  type ExcelMimeType =
    | 'application/vnd.ms-excel'
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

/* 可编辑且含有合并单元格的表格 */
declare namespace EditTable {
  interface TableColumns {
    prop: string,  // 键
    label: string,  // label单元格对应的标签
    isTitle?: boolean,  // 是否是第一栏标题栏
    span?: number // 分成几列
    type?: any // 编辑的组件类别
    value?: number | string // 编辑状态组件对应的值
    text?: number | string | string[] // 详情状态显示的text
    textLabel?: string // text对应的label
    required?: boolean // 是否是必填字段
    class?: string // 单元格样式
    options?: Form.FormSelect[] // 当类型为下拉或者radio的时候需要的选项列表
    columns?: TableColumns[]  // 子列
    isError?: boolean // 是否校验不通过
    isParam?: boolean // 是否作为参数
    resize?: string // 是否可以resize textarea
    maxlength?: number // 文本最大长度
    remark?: string // 标签备注
    isHide?: boolean // 是否隐藏
    sort?: number
  }
}

// * Vite
declare type Recordable<T = any> = Record<string, T>

declare interface ViteEnv {
  VITE_API_URL: string
  VITE_PORT: number
  VITE_OPEN: boolean
  VITE_GLOB_APP_TITLE: string
  VITE_DROP_CONSOLE: boolean
  VITE_PROXY_URL: string
  VITE_BUILD_GZIP: boolean
  VITE_REPORT: boolean
}
interface ImportMetaEnv extends ViteEnv {
  __: unknown
}

/* __APP_INFO__ */
declare const __APP_INFO__: {
  pkg: {
    name: string
    version: string
    dependencies: Recordable<string>
    devDependencies: Recordable<string>
  }
  lastBuildTime: string
}

/* Generic Tools */
type ObjToKeyValUnion<T> = {
  [K in keyof T]: { key: K; value: T[K] }
}[keyof T]

type ObjToKeyValArray<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T]
