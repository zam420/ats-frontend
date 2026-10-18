<template>
  <div class="esp-detail-wrap">
    <div v-if="title" class="esp-detail-title pdf-row-content">
      <h3>{{ title }}</h3>
      <slot name="title"></slot>
    </div>
    <div class="esp-detail-content" :class="{ small: isSmall }">
      <slot :data="data">
        <el-row :gutter="gutter">
          <template :key="item.prop" v-for="item in data">
            <template v-if="isArray(item)">
              <div class="array-wrap">
                <template :key="index" v-for="(info, index) of item">
                  <Col
                    v-if="info.value || info.value === false || info.value?.length || info?.isNewRow || isAssociatedField(info, item as Form.DetailItem[])"
                    :item="info"
                    :label-position="labelPosition"
                  />
                </template>
              </div>
            </template>
            <template v-else-if="item.slotName">
              <el-col
                :span="item.col ?? -1"
                class="esp-detail-item"
                :class="[
                  item.isLine ? 'line' : '',
                  item?.labelPosition ?? labelPosition,
                  item.class,
                  item.isTitle ? 'title' : '',
                  item.isPaddingTop ? 'paddingTop' : ''
                ]"
              >
                <slot :name="item.slotName" :item="item"></slot>
              </el-col>
            </template>
            <template v-else>
              <Col
                v-if="item.value || item.value === false || item.value?.length || item?.isNewRow || isAssociatedField(item, data as Form.DetailItem[])"
                :item="item"
                :label-position="labelPosition"
              />
            </template>
          </template>
        </el-row>
      </slot>
    </div>
  </div>
</template>
<script setup lang="ts" name="EspDetail">
import { isArray } from '@/utils/is'
interface ParamsProps {
  title?: string // 标题
  isSmall?: boolean // 是否是小号字体
  labelPosition?: '' | 'left' | 'top'
  gutter?: number // 左右填充
  data: Form.DetailItem[] | Form.DetailItem[][]
}
withDefaults(defineProps<ParamsProps>(), {
  title: '',
  isUser: false,
  isSmall: false,
  labelPosition: 'left',
  gutter: 40
})

const isAssociatedField = (item: Form.DetailItem, list: Form.DetailItem[]) => {
  const associatedField = item?.associatedField ?? ''
  if (!associatedField) {
    return false
  }
  return list.some(
    (info: Form.DetailItem) => info.prop === associatedField && info.value && info.value?.length
  )
}
</script>
<style lang="less" scoped>
@import 'index.less';
</style>
