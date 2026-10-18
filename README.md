# Vue 3 + TypeScript + Vite + Element-plus + pinia + less


## Node version
    Please upgrade to version 16 or above.

## Project initialization
  
    yarn / yarn install / npm i(install)


## Project start

    yarn dev / npm run dev

## Project build

  Dev environment build

    yarn build / npm run build

  QA environment build

    yarn build:qa / npm run build:qa

  Production environment build

    yarn build:prod / npm run build:prod

## Project structure
 src: 

  --api: Mainly stores backend API-related files

    --interface: Data types
 
    ---modules: Stores API information defined for different modules

  --assets: Stores images
 
    ----imgs:

    ----svgs:

  --components: Directory for reusable components

    --EspDialogForm: Dialog form component

    --EspErrorMessage: Error page component, including 403, 404, 500 errors

    --EspForm: Base form component that generates different forms based on input data

    --EspMain: Styling component

    --EspNoData: Empty data component

    -- EspStatus: Status component

    --EspTable: Table component, generates basic tables, tables with selection checkboxes, tree tables, and editable tables based on the provided type. 

    --EsoUpload: File upload component


  --config: Configuration directory

    --index.ts: Stores configuration constants

    --nprogress.ts: Configuration for top page loading progress

    --piniaPersist.ts: Configuration for frontend data persistence

    --serviceLoading.ts: Configuration for global loading state

  --enums: Enums directory

    --formItemTypeEnum.ts: Form field types (input, select, date, text, etc.)

    --httpEnum.ts: HTTP request status codes and commonly used content types

    --tableColumnFixedEnum.ts: Table column fixed options

    --tableColumnTypeEnum.ts: Table types

    --tableFormatEnum.ts: Table data formats 

  --hooks: 

    --useDownload.ts: Encapsulates download-related methods

    --useHandleData.ts: Encapsulates data manipulation confirmation dialogs

    --useLocale.ts: Encapsulates internationalization (i18n)

    --useSelection.ts: Encapsulates multiple selection operations in tables

    --useTable.ts: Encapsulates table-related methods (initialization, pagination, search, reset, sorting, etc.)


  --language: Internationalization
    
    --modules: Stores language-related files (zh.ts, en.ts)

    --index.ts: Initialization file

  --layout: Common header, menu, and other components for pages


    --Header: Files related to the header

      Avatar.vue: Avatar and dropdown actions (personal information, change password, logout)

      Language.vue: Language switcher

      Notification.vue: Notification display

      PasswordDialog.vue: Change password dialog

      Search.vue: Global search

    --Menu: Left-side menu

  --router: Router
  
    --modules: Stores routing information for each module. Clicking on a specific route module automatically adds the new route to the menu.
 
    --index.ts: Configuration for route redirection filtering, permission control, page not found, etc.

    --routerName.ts: Declares page route names for easy reference in multiple places

    --staticRouter.ts: Static routes

  --store: Global state management

    --interface: Data types

    --modules: Stores state information for each module

  --styles: Global styles

    --common.less: Common styles
  
    --element.less: Styles for the third-party UI framework

    --var.less: Style variables and shared methods (recommend modifying constants to change Element styles)

  --types:  Global types

     --global.d.ts: Stores global types (menu, form, table, etc.)

  --utils: Utility directory

  --views: Pages

    --name(Primary menu name)：

      --subName (Secondary menu name)

        --data: Stores data definition files

        --components: Stores components related to the current feature

        --index.less: Styles for the current feature

  .env.development: Stores development environment information

  .env.production: Stores production environment information

  .env.qa: Stores QA environment information

  .auto-imports.d.ts: This file should not be modified and automatically imports required features ('vue', 'vue-router', 'vue-i18n', '@vueuse/core')

  .components.d.ts: This file should not be modified and automatically imports required components


  Note: You can refer to comments in the type definitions to understand the meaning of each field.
 
