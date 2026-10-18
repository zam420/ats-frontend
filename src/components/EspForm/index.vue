<template>
  <div class="esp-form-wrap">
    <div v-if="title" class="esp-form-title">
      <h3>{{ title }}</h3>
      <slot name="btn">
        <span v-if="showAdd" class="add" @click="addForm">
          <i class="iconfont icon-add"></i>{{ $t('button.add') }}
        </span>
      </slot>
    </div>
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="curFormRules"
      :validate-on-rule-change="false"
      :require-asterisk-position="asteriskPosition"
    >
      <el-row :gutter="gutter">
        <template v-for="item of itemList" :key="item.prop + item.disabled">
          <template v-if="item.type === FormItemTypeEnum.HORIZONTAL_LINE">
            <el-divider border-style="dashed" />
          </template>
          <template v-else-if="item.type === FormItemTypeEnum.NEW_LINE">
            <div class="new-line"></div>
          </template>
          <template v-else>
            <el-col
              :span="item.col ?? 6"
              :md="item.md ?? item.col ?? 6"
              :lg="item.col ?? 6"
              :xl="item.xl ?? item.col ?? 6"
              v-if="!item.isHide"
            >
              <el-form-item
                :prop="item.prop"
                :label="item.label"
                :label-position="item?.labelPosition ?? 'top'"
                :required="item.required ?? false"
                :class="item.showHistory ? `${item.type} new-value` : item.type"
              >
                <FormItem
                  :change="changeFormItem"
                  :blurCheck="blurCheckItem"
                  :view="view"
                  :refreshForm="refreshForm"
                  :item="item"
                />
              </el-form-item>
              <div v-if="item.showHistory" class="history-txt">
                {{ `${$t('order.beforeChange')}: ${item.historyValue}` }}
              </div>
            </el-col>
          </template>
        </template>
      </el-row>
      <slot name="info"></slot>
    </el-form>
    <slot name="operate"></slot>
  </div>
</template>

<script setup lang="ts" name="EspForm">
import FormItem from './components/FormItem.vue'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { FormInstance, FormRules, FormItemRule } from 'element-plus'
import { useLocale } from '@/hooks/useLocale'
import { getOptionsByGroup, getTreeOptionsByGroup, isEmpty } from '@/utils'

const { $t } = useLocale()

const formRef = ref<FormInstance>()
const formModel = ref<Record<string, any>>({})

interface FormItemProps {
  title?: string
  modelValue: Form.FormItem[] // 表单列表
  formRules?: FormRules // 校验规则
  gutter?: number // 左右填充
  index?: number
  changeForm?: (params: any, index?: number) => void // 表单改变事件
  initOptionCallback?: (params: any) => void // 下拉列表初始化完成的回调
  blurCheck?: (key: string, value?: any) => void
  view?: (key: string, value?: any) => void
  refreshForm?: (key: string, value?: any) => void
  showAdd?: boolean // 是否显示添加按钮
  isWatch?: boolean // 是否监听
  asteriskPosition?: 'left' | 'right' // 必填时星号的位置
}

interface SearchOption {
  index: number
  options: any
  enum?: Record<string, CommonEnum.enumItem>
}

const emit = defineEmits(['add'])

const props = withDefaults(defineProps<FormItemProps>(), {
  modelValue: () => [],
  title: '',
  gutter: 20,
  showAdd: false,
  isWatch: false,
  asteriskPosition: 'right'
})

const filterList = () => {
  return props.modelValue.filter(item => !item.isHide)
}

const curFormRules = ref<FormRules>(props.formRules ?? {})
const itemList = ref<Form.FormItem[]>(filterList())

watch(
  () => props.modelValue,
  () => {
    if (props.isWatch || props.showAdd) {
      itemList.value = filterList()
    }
  },
  { immediate: true, deep: true }
)

// 表单改变事件
const changeFormItem = (item: Form.FormItem) => {
  const { value, prop } = item
  formModel.value[prop] = value
  if (item.associatedKey) {
    for (const { prop, key } of item.associatedKey) {
      const option = item.options?.find((option: Form.FormSelect) => option?.value === item.value)
      const index = itemList.value.findIndex((info: Form.FormItem) => info.prop === prop)
      if (index !== -1) {
        const associatedItem = itemList.value[index]
        if (
          associatedItem?.type === FormItemTypeEnum.SELECT ||
          (associatedItem?.type !== FormItemTypeEnum.SELECT && !associatedItem.options)
        ) {
          itemList.value[index].value = option?.[prop] ?? ''
        } else {
          const associatedOption = associatedItem.options?.find(
            (info: Form.FormSelect) => info?.value === option?.[prop]
          )
          itemList.value[index].value = associatedOption?.[key] ?? ''
        }
      }
    }
  }
  // 更新字段校验状态
  if (formRef.value && prop && !item.switchValue) {
    formRef.value.validateField(prop)
  }
  props.changeForm && props.changeForm(item, props.index)
}

const blurCheckItem = (key: string, value?: any) => {
  if (formRef.value) {
    formRef.value.validateField([key], (validate: boolean) => {
      if (validate) {
        props.blurCheck && props.blurCheck(key, value)
      }
    })
  }
}

const changeFormModel = (
  { prop, value }: { prop: string; value: any },
  noNeedValidate?: boolean
) => {
  formModel.value[prop] = value
  // 更新字段校验状态
  if (formRef.value && prop && !noNeedValidate) {
    formRef.value.validateField(prop)
  }
}

// 初始化下拉框
const initSearchOptions = async () => {
  const model: Record<string, any> = {}
  const arrFun: SearchOption[] = []
  const rules: FormRules = {}
  itemList.value.forEach((item: Partial<Form.FormItem>, index: number) => {
    const prop: string = item.prop!
    const reg = item?.validateRules
    const validateRule = [
      {
        message: $t('form.formatError'),
        trigger: 'change',
        validator: (rule: any, value: string) => {
          if (value) {
            return reg.test(value)
          }
          return true
        }
      }
    ]
    if (item.getOptions && item.isTepRequest !== false) {
      arrFun.push({ index, options: item.getOptions(item?.initOptionParams), enum: item?.enum })
    }
    // 如果有必填校验
    if (item.required) {
      // 判断除必填外是否还有其他校验规则，如果有则加上
      let validateRules: FormItemRule[] = []
      if (item.showToday) {
        validateRules.push({
          required: true,
          message: $t('form.required'),
          trigger: 'change',
          validator: (rule: any, value: string) => {
            if (item.upToNow) {
              return true
            }
            return !isEmpty(value)
          }
        })
      } else {
        validateRules.push({ required: true, message: $t('form.required'), trigger: 'blur' })
      }
      if (item?.validateRules) {
        validateRules = [...validateRules, ...validateRule]
      }
      rules[prop] = validateRules
    }
    // 如果只有其他校验规则，则设置该校验规则
    if (!item.required && item?.validateRules) {
      rules[prop] = validateRule
    }
    model[prop] = item.value ?? null
  })
  if (!props.formRules) {
    curFormRules.value = rules
  }
  formModel.value = model
  const results = await Promise.all(Object.values(arrFun))
  for (const item of results) {
    item.options.then((result: any) => {
      let list = result?.result ?? []
      const column = itemList.value[item.index]
      let options: Form.FormSelect[] = list.map((info: any) => {
        let obj = {} as Form.FormSelect
        if (typeof info === 'string') {
          obj.label = info
          obj.value = info
        } else {
          let label: string = ''
          obj = { ...info }
          const optionNames = column?.optionName
          if (Array.isArray(optionNames)) {
            for (const key of optionNames) {
              label = `${label} ${info[key]}`
            }
          } else {
            label = info[optionNames ?? 'name']
          }
          if (column?.optionExpandName) {
            label = `${label} - ${info?.[column?.optionExpandName]}`
          }
          if (column?.optionSubName) {
            obj.subLabel = info[column?.optionSubName]
          }
          obj.label = label
          obj.value = info[column?.optionKey ?? 'id']
        }
        if (item?.enum) {
          obj.label = item?.enum?.[obj.value as string]?.name ?? obj.label
        }
        return obj
      })
      if (column?.isOptionGroup) {
        options = getOptionsByGroup(options, item?.enum)
      }
      if (column.type === FormItemTypeEnum.TREE_SELECT || column.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT) {
        options = getTreeOptionsByGroup(options, item?.enum)
      }
      if (itemList.value[item.index]) {
        itemList.value[item.index].options = options
      }
      if (column?.isCallback) {
        props.initOptionCallback && props.initOptionCallback(options)
      }
    })
  }
}
// 修改表单的校验规则
const changeModalRule = (item: Form.FormItem) => {
  const prop: string = item.prop!
  const reg = item?.validateRules
  let rule: FormItemRule[] = []
  const validateRule = [
    {
      message: $t('form.formatError'),
      trigger: 'change',
      validator: (rule: any, value: string) => {
        item.isFound = false
        if (value) {
          return reg.test(value)
        }
        return true
      }
    }
  ]
  // 如果有必填校验
  if (item.required) {
    // 判断除必填外是否还有其他校验规则，如果有则加上
    let validateRules: FormItemRule[] = []
    if (item.showToday) {
      validateRules.push({
        required: true,
        message: $t('form.required'),
        trigger: 'change',
        validator: (rule: any, value: string) => {
          if (item.upToNow) {
            return true
          }
          return !isEmpty(value)
        }
      })
    } else {
      validateRules.push({ required: true, message: $t('form.required'), trigger: 'change' })
    }
    if (item?.validateRules) {
      validateRules = [...validateRules, ...validateRule]
    }
    rule = validateRules
  }
  // 如果只有其他校验规则，则设置该校验规则
  if (!item.required && item?.validateRules) {
    rule = validateRule
  }
  if (!props.formRules && curFormRules.value) {
    curFormRules.value[prop] = rule
    if (rule.length === 0) {
      // 更新字段校验状态
      if (formRef.value && prop) {
        formRef.value.clearValidate(prop)
      }
    }
  }
}

nextTick(() => {
  setTimeout(() => {
    initSearchOptions()
    // require做为formitem的配置后，切换item.required数据必填状态会变，但是第一次进form表单会对表单进行校验，这里做清除处理
    formRef.value?.clearValidate()
  })
})
const validateFrom = async (fun: any, errorFun?: any, isShowError: boolean = true) => {
  if (!formRef.value) return
  const valid = await formRef.value.validate((valid: boolean) => {
    if (valid) {
      if (fun) {
        fun()
      }
      return true
    }
    if (errorFun) {
      errorFun()
    } else {
      isShowError && ElMessage.error($t('form.requiredError'))
      return false
    }
  })
  return valid
}

const addForm = () => {
  emit('add')
}
const resetFields = () => {
  itemList.value = itemList.value.map((item: Form.FormItem) => {
    item.value = null
    return item
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
const changeFromModalRule = (formList: Form.FormItem[]) => {
  formList.forEach(item => {
    if (item.isHide !== true) {
      changeModalRule(item)
      if (!isEmpty(item.value)) {
        changeFormModel({ prop: item.prop, value: item.value })
      }
    }
  })
}
// 清除校验错误
const clearValidate = (prop?: string) => {
  formRef.value?.clearValidate(prop)
}
defineExpose({
  validateFrom,
  resetFields,
  changeFormModel,
  changeModalRule,
  changeFromModalRule,
  filterList,
  clearValidate
})
</script>

<style lang="less" scoped>
@import 'index.less';
</style>
