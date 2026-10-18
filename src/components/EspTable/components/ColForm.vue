<template>
  <template v-if="item?.type === FormItemTypeEnum.PASSWORD">
    <el-input
      v-model.trim="itemValue"
      :placeholder="
        item?.disabled
          ? ''
          : item?.placeholder ?? `${$t('form.text')} ${item?.label?.toLocaleLowerCase()}`
      "
      :disabled="item?.disabled ?? false"
      @input="changeValue"
    >
      <template #prefix>
        <el-icon class="el-input__icon"><Lock /></el-icon>
      </template>
    </el-input>
  </template>
  <template
    v-else-if="
      item?.type === FormItemTypeEnum.SELECT || item?.type === FormItemTypeEnum.MULTIPLE_SELECT
    "
  >
    <el-select
      ref="elSelectRef"
      v-model="itemValue"
      :multiple="item?.type == FormItemTypeEnum.MULTIPLE_SELECT"
      :options="item?.options ?? []"
      :clearable="item?.clearable ?? false"
      :allow-create="item?.allowCreate ?? false"
      :placeholder="
        item?.disabled
          ? ' '
          : item?.placeholder ?? `${$t('form.select')} ${item?.label?.toLocaleLowerCase()}`
      "
      :disabled="item?.disabled ?? false"
      popper-class="custom-select-wrap"
      :teleported="teleported"
      filterable
      @change="changeValue"
    >
      <template v-if="item.isOptionGroup">
        <el-option-group
          :disabled="group.disabled"
          v-for="group in item.options"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="option in group.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          >
          </el-option>
        </el-option-group>
      </template>
      <template v-else>
        <el-option
          v-for="option in item.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        >
        </el-option>
      </template>
    </el-select>
  </template>
  <template v-else-if="item?.type === FormItemTypeEnum.SWITCH">
    <el-switch v-model="itemValue" @change="changeValue" />
  </template>
  <template v-else-if="item?.type === FormItemTypeEnum.NUMBER">
    <el-input
      v-model="itemValue"
      :placeholder="
        item?.disabled
          ? ''
          : item?.placeholder ?? `${$t('form.text')} ${item?.label?.toLocaleLowerCase()}`
      "
      :disabled="item?.disabled ?? false"
      @input="changeNumberValue"
      @blur="validateValue()"
    />
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.TREE_SELECT || item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT">
    <el-tree-select
      v-model="itemValue"
      :data="item.options"
      :render-after-expand="false"
      :expand-on-click-node="false"
      node-key="value"
      :teleported="teleported"
      collapse-tags
      collapse-tags-tooltip
      :max-collapse-tags="item?.maxTags ?? 1"
      :multiple="item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT"
      :show-checkbox="item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT"
      check-strictly
      check-on-click-node
      filterable
      :filter-node-method="filterNodeMethod"
      :disabled="item.disabled"
      :clearable="item.clearable ?? false"
      :placeholder="
        item.disabled
          ? ' '
          : item?.placeholder ?? `${$t('form.select')} ${item.label?.toLowerCase()}`
      "
      @change="changeValue"
    />
  </template>
  <template v-else-if="item?.type === FormItemTypeEnum.DATE">
    <el-date-picker
      v-model="itemValue"
      type="date"
      :format="DATE_FORMAT"
      :value-format="DATE_FORMAT"
      :placeholder="
        item?.disabled
          ? ''
          : item?.placeholder ?? `${$t('form.select')} ${item?.label?.toLocaleLowerCase()}`
      "
      :disabled="item?.disabled ?? false"
      :disabled-date="disabledDate"
      :clearable="item?.clearable ?? false"
      :teleported="teleported"
      @change="changeValue"
      @blur="validateValue()"
    />
  </template>
  <template v-else>
    <el-input
      v-model="itemValue"
      :placeholder="
        item?.disabled
          ? ''
          : item?.placeholder ?? `${$t('form.text')} ${item?.label?.toLocaleLowerCase()}`
      "
      :disabled="item?.disabled ?? false"
      @input="changeValue"
      @blur="validateValue(true)"
    />
  </template>
</template>

<script setup lang="ts" name="EspColForm">
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { useLocale } from '@/hooks/useLocale'
import { DATE_FORMAT } from '@/config'
import { regNumber } from '@/utils'
const { $t } = useLocale()
interface FormItem {
  item: Table.ColumnProps // 具体每一项的配置
  index: number //
  modelValue: any
  teleported?: boolean //
}
const props = withDefaults(defineProps<FormItem>(), {
  teleported: true
})
const itemValue = ref<any>(props.modelValue)
// 监听值变化更新绑定值
watch(
  (): any => props.modelValue,
  (val: any) => {
    itemValue.value = val
  },
  { immediate: true }
)

// 筛选tree select node函数
const filterNodeMethod = (value: any, data: Form.FormSelect) => { 
  return data.label?.toLocaleLowerCase().includes(value?.toLocaleLowerCase())
}

const elSelectRef = ref()
const emit = defineEmits(['update:modelValue', 'change'])
const changeNumberValue = (val: any) => {
  val = regNumber(val, props.item?.toFixed)
  props.item.value = val
  itemValue.value = val
  changeValue(val)
}
const changeValue = (val: any) => {
  emit('update:modelValue', val)
  emit('change', { ...props.item, value: val, index: props.index })
  if (
    props.item?.type === FormItemTypeEnum.SELECT ||
    props.item?.type === FormItemTypeEnum.MULTIPLE_SELECT
  ) {
    validateValue()
  }
}
// 校验输入框
const validateValue = (needTrim?: boolean) => {
  // 需要去除首尾空格的去空格
  if (needTrim && typeof itemValue.value === 'string') {
    itemValue.value = itemValue.value.trim()
    changeValue(itemValue.value)
  }
}
// 限制时间
const disabledDate = (date: Date) => {
  // 禁止选择开始时间之前的时间
  // 因为选了开始时间后默认获取的是该时间8点的时间，而日期选择器默认的是当天的确切时间所以会限制到当天不可选，但是因为需求要求可以同一天，这里将选择的时间默认设置成当天9点，就可以选择同一天了
  if (props.item.disableStartDate) {
    return (
      new Date(props.item.disableStartDate!).getTime() >=
      new Date(new Date(date).setHours(9, 0, 0, 0)).getTime()
    )
  }
  // 禁止选择结束时间之后的时间
  if (props.item.disableEndDate) {
    return new Date(props.item.disableEndDate!).getTime() <= date.getTime()
  }
}
</script>

<style lang="less" scoped></style>
