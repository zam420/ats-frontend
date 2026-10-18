# Vue 3 + TypeScript + Vite + Element-plus + pinia + less


## node 版本
    请升级到16以上

## 项目初始化
  
    yarn / yarn install / npm i(install)


## 项目启动

    yarn dev / npm run dev

## 项目打包

  本地环境打包

    yarn build / npm run build

  QA 环境打包

    yarn build:qa / npm run build:qa

  线上环境打包

    yarn build:prod / npm run build:prod

## 项目结构

 src: 

  --api: 主要存放与后端接口相关

    --interface: 数据类型
 
    ---modules: 存放不同模块定义的后端API信息

  --assets: 存放图片
 
    ----imgs:

    ----svgs:

  --components: 公用组件目录

    --EspDialogForm: 弹窗表单组件

    --EspErrorMessage: 错误页面组件， 包含403、404、500

    --EspForm: 基础表单组件，根据传入的数据生成不同的表单

    --EspMain: 样式组件

    --EspNoData: 空数据公用组件

    -- EspStatus: 状态组件

    --EspTable: 表格组件，根据传入的类型可生成基础表格、带选择框的表格、树形表格、可编辑表格。 

    --EsoUpload: 文件上传组件


  --config: 配置目录

    --index.ts: 存放一些配置常量

    --nprogress.ts: 顶部页面加载进度配置

    --piniaPersist.ts: 前端数据管理的一些持久化配置

    --serviceLoading.ts: 全局 loading 状态的方法配置

  --enums: 枚举目录

    --formItemTypeEnum.ts: 表单类型（输入框、下拉框、日期、文本等）

    --httpEnum.ts: http请求状态码和常用的contentType类型

    --tableColumnFixedEnum.ts: 表格列固定

    --tableColumnTypeEnum.ts: 表格类型

    --tableFormatEnum.ts: 表格数据类型

  --hooks: 

    --useDownload.ts: 封装了下载相关的方法

    --useHandleData.ts: 封装了操作数据确认弹窗

    --useLocale.ts: 封装的国际化

    --useSelection.ts: 封装了表格多选数据操作

    --useTable.ts: 封装了表格的一些的方法，(初始化、分页、搜索、重置、排序等)

  --language: 国际化
    
    --modules: 存放多语言相关的文件（zh.ts、en.ts）

    --index.ts: 初始化

  --layout: 页面公共的header、 menu等


    --Header: 显示头部相关的文件

      Avatar.vue: 头像、下拉操作（个人信息、修改密码、退出）

      Language.vue: 多语言切换

      Notification.vue: 显示通知

      PasswordDialog.vue: 修改密码

      Search.vue: 全局查询

    --Menu: 左侧菜单栏

  --router: 路由
  
    --modules: 存放各个模块的路由信息, 只需直接点击对应的路由模块，已有方法会自动将新增的路由加入菜单
 
    --index.ts: 配置路由跳转过滤，权限，页面不存在等

    --routerName.ts: 用于声明页面路由名字，以便多个地方调用

    --staticRouter.ts: 静态路由

  --store: 全局存储

    --interface: 数据类型

    --modules: 存放各个模块的存储信息

  --styles: 全局样式

    --common.less: 公用样式
  
    --element.less: 第三方UI框架的样式

    --var.less: 样式变量和公用方法（建议通过修改常量改变Element的部分样式）

  --types: 全局类型

     --global.d.ts: 存放全局的类型（menu, form, table等）

  --utils: 工具目录

  --views: 页面

    --name(一级菜单名称)：

      --subName (二级菜单名称)

        --data: 存放定义数据文件

        --components：存放当前功能组件

        --index.less: 当前功能样式

 .env.development: 存放开发环境的信息

 .env.production: 存放线上环境的信息

 .env.qa: 存放 QA 环境的信息

 .auto-imports.d.ts: 该文件不需要修改，会自动引入需要的功能（'vue', 'vue-router', 'vue-i18n', '@vueuse/core'）

 .components.d.ts: 该文件不需要修改，会自动引入需要的组件


  注意：可查看类型中字段对应注释，以便了解该字段的含义
 
