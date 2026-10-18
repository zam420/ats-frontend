export interface ApplicationInfo {
  title?: string // 标题
  isSmall?: boolean // 是否是小号字体
  labelPosition?: '' | 'left' | 'top'
  gutter?: number // 左右填充
  data: Form.DetailItem[] | Form.DetailItem[][]
  className?: string
}
