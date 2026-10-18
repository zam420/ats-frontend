<template>
  <template v-if="item.isNewRow">
    <div class="new-line"></div>
  </template>
  <template v-else>
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
      <template v-if="item.isTitle">
        <h3 class="pdf-row-content">
          {{ item.value }} <span class="time" v-if="item?.hasTime">{{ item.timeValue }}</span>
        </h3>
      </template>
      <template v-else-if="item.isArray">
        <div class="pdf-row-content">
          <span class="line" :key="info" v-for="info in item.value">{{ info }}</span>
        </div>
      </template>
      <template v-else-if="item.isTag">
        <label v-if="item.isLabel !== false" :class="{ fontBold: item?.isFontBold === true }">
          {{ item.label }}:
        </label>
        <el-tag :key="info" v-for="info in item.value">{{ info }}</el-tag>
      </template>
      <template v-else-if="item.isLabel !== false">
        <label :class="{ fontBold: item?.isFontBold === true }">{{ item.label }}: </label>
        <template v-if="item.isFile">
          <p class="desc file">
            <template :key="file.uid" v-for="file in item.value">
              <el-link @click="openFilePreview(file)" href="javascript:void(0)" type="primary">
                {{ file?.file_name }}
              </el-link>
            </template>
          </p>
        </template>
        <template v-else-if="item.isBtn">
          <template :key="link" v-for="link of getLinks(item.value)">
            <p>
              <el-link :href="link" type="primary" target="_blank">{{ item.btnText }}</el-link>
            </p>
          </template>
        </template>
        <template v-else-if="isArray(item.value)">
          <ul class="desc">
            <li class="pdf-row-content" :key="str" v-for="str in item.value">{{ str }}</li>
          </ul>
        </template>
        <template v-else-if="item.isLink">
          <p class="desc pdf-row-content" v-if="item.value">
            <el-link :href="item.value" target="_blank" type="primary">{{ item.value }}</el-link>
          </p>
        </template>
        <template v-else-if="item.needTooltip">
          <el-tooltip :content="item.value" placement="top-start">
            <p class="desc pdf-row-content">
              {{ item.value }}
            </p>
          </el-tooltip>
        </template>
        <template v-else>
          <p class="desc pdf-row-content">
            {{ item.value }}
          </p>
        </template>
      </template>
      <template v-else>
        <template v-if="item.isFile">
          <p class="desc file">
            <template :key="file.uid" v-for="file in item.value">
              <el-link @click="openFilePreview(file)" href="javascript:void(0)" type="primary">
                {{ file?.file_name }}
              </el-link>
            </template>
          </p>
        </template>
        <template v-else-if="isArray(item.value)">
          <ul>
            <li class="pdf-row-content" :key="str" v-for="str in item.value">{{ str }}</li>
          </ul>
        </template>
        <template v-else-if="item.hideValue">
          <label :class="{ fontBold: item?.isFontBold === true, noMargin: item.hideValue }">
          {{ item.value ? item.label : (item.subLabel ? item.subLabel : `Not ${item.label}`) }}
          </label>
        </template>
        <template v-else>
          <p class="pdf-row-content" :class="{ fontBold: item?.isFontBold === true }">
            {{ item.value }}
          </p>
        </template>
      </template>
    </el-col>
  </template>
</template>
<script setup lang="ts" name="EspDetailCol">
import { ResultUploadInfo } from '@/api/interface'
import { OPEN_FILE_PREVIEW } from '@/config'
import { isEmpty } from '@/utils'
import { isArray } from '@/utils/is'
import mittBus from '@/utils/mittBus'

interface ParamsProps {
  labelPosition?: '' | 'left' | 'top'
  item: Form.DetailItem
}
defineProps<ParamsProps>()

const openFilePreview = (file: ResultUploadInfo) => {
  mittBus.emit(OPEN_FILE_PREVIEW, file)
}

const getLinks = (link: any) => {
  if (isArray(link)) {
    return link.filter((item: string) => !isEmpty(item))
  }
  return [link]
}
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
