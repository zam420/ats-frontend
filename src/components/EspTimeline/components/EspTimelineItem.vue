<template>
  <div class="esp-timeline-item" :class="placement">
    <div class="esp-timeline-item-time">
      <p class="label" v-if="timestamp?.label" :class="{ fontBold: timestamp?.isFontBold }">{{ timestamp?.label }}</p>
      <p class="value" :class="timestamp?.class">{{ timestamp?.time }}</p>
    </div>
    <div class="esp-timeline-item-content">
      <slot>
        <el-row :gutter="gutter" class="esp-timeline-item-row">
          <template :key="item.prop" v-for="item of itemList">
            <el-col :span="item.col ?? -1" class="esp-detail-item">
              <template v-if="item.isTitle">
                <h2 :class="item?.class ?? 'title'">
                  {{ item.value }}
                  <slot name="link" :cur-data="item"></slot>
                </h2>
              </template>
              <template v-else>
                <label v-if="item.label" :class="{ fontBold: item?.isFontBold }">{{ item.label }}: </label>
                <p :class="{ fontBold: item?.isFontBold }">{{ item.value }}</p>
              </template>
            </el-col>
          </template>
        </el-row>
      </slot>
      <slot name="progress"></slot>
    </div>
  </div>
</template>
<script setup lang="ts" name="EspTimelineItem">
import { isEmpty } from '@/utils'
import { TimestampDetail } from '../interface'
interface ParamsProps {
  timestamp: TimestampDetail
  gutter?: number
  placement?: 'left' | 'top'
  data?: Form.DetailItem[]
}
const props = withDefaults(defineProps<ParamsProps>(), {
  gutter: 30,
  placement: 'left'
})

const initData = () => {
  return props.data?.filter(item => !isEmpty(item.value) && item.isHide !== true) ?? []
}

const itemList = ref<Form.DetailItem[]>(initData())
</script>
<style scoped lang="less">
@import '../index.less';
</style>
