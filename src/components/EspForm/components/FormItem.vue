<template>
  <template v-if="item.type === FormItemTypeEnum.TEXTAREA">
    <el-input
      :disabled="item.disabled"
      v-model="item.value"
      :rows="item.rows ?? 5"
      :clearable="item.clearable ?? false"
      :resize="item?.resize ?? 'none'"
      type="textarea"
      :maxlength="item?.maxlength"
      :placeholder="
        item.disabled ? '' : item?.placeholder ?? `${$t('form.text')} ${item.label?.toLowerCase()}`
      "
      show-word-limit
      @change="changeValue"
    />
  </template>
  <template
    v-else-if="
      item.type === FormItemTypeEnum.SELECT || item.type === FormItemTypeEnum.MULTIPLE_SELECT
    "
  >
    <el-select
      ref="elSelectRef"
      v-model="item.value"
      :multiple="item.type == FormItemTypeEnum.MULTIPLE_SELECT"
      :collapse-tags="item?.collapseTag ?? true"
      collapse-tags-tooltip
      :options="item.options ?? []"
      :disabled="item.disabled"
      :allow-create="item.allowCreate ?? false"
      :multiple-limit="item?.multipleLimit ?? 0"
      :teleported="item?.teleported ?? true"
      filterable
      :clearable="item.clearable ?? false"
      :max-collapse-tags="item?.maxTags ?? 1"
      :placeholder="
        item.disabled
          ? ' '
          : item?.placeholder ?? `${$t('form.select')} ${item.label?.toLowerCase()}`
      "
      @change="changeValue"
    >
      <template v-if="item.type == FormItemTypeEnum.MULTIPLE_SELECT">
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
              <el-checkbox
                :value="item.value?.includes(option.value)"
                :label="option.label"
                style="pointer-events: none"
              ></el-checkbox>
            </el-option>
          </el-option-group>
        </template>
        <template v-else>
          <el-option
            v-for="option in item.options"
            :key="option.value"
            :label="option.subLabel ? `${option.label} (${option.subLabel})` : option.label"
            :value="option.value"
            :class="option.subLabel ? 'form-select-li' : ''"
            :disabled="option.disabled"
          >
            <el-checkbox
              v-if="option.subLabel"
              :value="item.value?.includes(option.value)"
              style="pointer-events: none"
              :disabled="option.disabled"
            >
              <span class="title">{{ option.label }}</span>
              <span>{{ option.subLabel }}</span></el-checkbox
            >
            <el-checkbox
              v-else
              :value="item.value?.includes(option.value)"
              :label="option.label"
              style="pointer-events: none"
            ></el-checkbox>
          </el-option>
        </template>
      </template>
      <template v-else>
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
      </template>
    </el-select>
    <div v-if="item.isFound" class="el-form-item__error el-form-item__found">
      <el-tooltip :content="item.text" placement="top" v-if="item.value?.length > 10">
        <div>{{ item.text }}
          <span @click="refresh" v-if="item.showBtn">{{ $t('button.refreshEmail') }}</span>
        </div>
      </el-tooltip>
      <template v-else>{{ item.text }}
        <span @click="refresh" v-if="item.showBtn">{{ $t('button.refreshEmail') }}</span>
      </template>
    </div>
  </template>
  <template
    v-else-if="
      item.type === FormItemTypeEnum.SELECT_V2 || item.type === FormItemTypeEnum.MULTIPLE_SELECT_V2
    "
  >
    <el-select-v2
      ref="elSelectV2Ref"
      v-model="item.value"
      :multiple="item.type == FormItemTypeEnum.MULTIPLE_SELECT_V2"
      collapse-tags
      collapse-tags-tooltip
      :options="item.options ?? []"
      :disabled="item.disabled"
      :allow-create="item.allowCreate ?? false"
      filterable
      :multiple-limit="item?.multipleLimit ?? 0"
      popper-class="custom-select-wrap"
      :clearable="item.clearable ?? false"
      :placeholder="
        item.disabled
          ? ' '
          : item?.placeholder ?? `${$t('form.select')} ${item.label?.toLowerCase()}`
      "
      @change="changeValue"
    >
      <template #default="{ item: option }" v-if="item.type == FormItemTypeEnum.MULTIPLE_SELECT_V2">
        <el-checkbox
          :value="item.value?.includes(option.value)"
          :label="option.label"
          style="pointer-events: none"
        ></el-checkbox>
      </template>
      <template #default="{ item: option }" v-if="item.needTooltip">
        <el-tooltip :content="option.label" placement="top">
          <div class="ellipsis">{{ option.label }}</div>
        </el-tooltip>
      </template>
    </el-select-v2>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.TAG">
    <el-select
      ref="elSelectRef"
      v-model="item.value"
      :multiple="true"
      collapse-tags
      collapse-tags-tooltip
      :options="[]"
      allow-create
      class="select-tag-wrap"
      popper-class="select-tag-dropdown-wrap"
      default-first-option
      filterable
      :max-collapse-tags="item?.maxTags ?? 10"
      :clearable="item.clearable ?? false"
      :placeholder="$t('form.tag')"
      @change="changeValue"
    >
    </el-select>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.NUMBER">
    <el-input-number
      v-model="item.value"
      :disabled="item.disabled"
      :clearable="item.clearable ?? false"
      :min="item.min"
      :max="item.max"
      controls-position="right"
      :placeholder="
        item.disabled ? '' : item?.placeholder ?? `${$t('form.text')} ${item.label?.toLowerCase()}`
      "
      @change="changeNumberValue"
    />
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.SWITCH">
    <el-switch v-model="item.value" :disabled="item.disabled" @change="changeValue" />
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.DATE || item.type === FormItemTypeEnum.MONTH">
    <el-date-picker
      v-model="item.value"
      :type="item.type"
      :format="item.format ?? item.type !== FormItemTypeEnum.MONTH ? DATE_FORMAT : MONTH_FORMAT"
      :value-format="
        item.format ?? item.type !== FormItemTypeEnum.MONTH ? DATE_FORMAT : MONTH_FORMAT
      "
      :clearable="item.clearable ?? false"
      :disabled="item.disabled"
      :disabled-date="disabledDate"
      :class="{ 'to-this-day': item.upToNow }"
      :placeholder="
        item.upToNow
          ? $t('button.toThisDay')
          : item.disabled
          ? ''
          : item?.placeholder ?? `${$t('form.select')} ${item.label?.toLowerCase()}`
      "
      :shortcuts="item?.showToday ? shortcuts : []"
      @change="changeDateValue"
    />
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.DATE_TIME">
    <div class="time-range-panel">
      <div class="time-range">
        <el-date-picker
          v-model="item.startDate"
          type="date"
          :format="DATE_FORMAT"
          :value-format="DATE_FORMAT"
          :clearable="item.clearable ?? false"
          :disabled="item.disabled"
          :disabled-date="disabledDate"
          :class="{ 'to-this-day': item.upToNow }"
          :placeholder="
            item.upToNow
              ? $t('button.sendNow')
              : item.disabled
                ? ''
                : item?.placeholder ?? `${$t('form.select')} ${item.label?.toLowerCase()}`
          "
          :shortcuts="item?.showToday ? shortDateCuts : []"
          @change="changeTime"
        />
        <el-time-select
          v-model="item.startTime"
          :min-time="item?.disableStartTime ?? ''"
          :disabled="item.disableTime"
          start="00:00"
          step="00:30"
          end="23:30"
          @change="changeTime"
        />
      </div>
    </div>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.DATE_TIME_RANGE">
    <div class="time-range-panel">
      <div class="time-range">
        <el-date-picker
          v-model="item.startDate"
          type="date"
          :format="DATE_FORMAT"
          :value-format="DATE_FORMAT"
          :clearable="item.clearable ?? false"
          :disabled="item.disabled"
          :disabled-date="disabledStartDate"
          :placeholder="
            item.disabled ? '' : item?.minPlaceholder ?? `${$t('form.select')} ${item.label}`
          "
          @change="changeTimeRange('startDate')"
        />
        <el-time-select
          v-model="item.startTime"
          start="00:00"
          step="00:15"
          end="23:30"
          :clearable="item.clearable ?? false"
          :min-time="item?.disableStartTime ?? ''"
          :max-time="item.endTime"
          @change="changeTimeRange()"
        />
      </div>
      <div class="seg"></div>
      <div class="time-range">
        <el-date-picker
          v-model="item.endDate"
          type="date"
          :format="DATE_FORMAT"
          :value-format="DATE_FORMAT"
          :clearable="item.clearable ?? false"
          :disabled="item.disabled"
          :disabled-date="disabledEndDate"
          :placeholder="
            item.disabled ? '' : item?.maxPlaceholder ?? `${$t('form.select')} ${item.label}`
          "
          @change="changeTimeRange('endDate')"
        />
        <el-time-select
          v-model="item.endTime"
          start="00:00"
          step="00:15"
          end="23:30"
          :clearable="item.clearable ?? false"
          :min-time="item.startTime"
          :max-time="item?.disableEndTime ?? ''"
          @change="changeTimeRange()"
        />
      </div>
      <div class="detail">{{ item.timeRange }}</div>
    </div>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.DATE_RANGE || item.type === FormItemTypeEnum.YEAR_RANGE">
    <div class="time-range-panel">
      <div class="time-range">
        <el-date-picker
          v-model="item.startDate"
          :type="item.type === FormItemTypeEnum.DATE_RANGE ? 'date' : 'year'"
          :value-format="DATE_FORMAT"
          :clearable="item.clearable ?? false"
          :disabled="item.disabled"
          :disabled-date="disabledStartDate"
          :placeholder="
            item.disabled ? '' : item?.minPlaceholder ?? `${$t('form.select')} ${item.label}`
          "
          @change="changeDateRangeValue()"
        />
      </div>
      <div class="interval"></div>
      <div class="time-range">
        <el-date-picker
          v-model="item.endDate"
          :type="item.type === FormItemTypeEnum.DATE_RANGE ? 'date' : 'year'"
          :value-format="DATE_FORMAT"
          :clearable="item.clearable ?? false"
          :disabled="item.disabled"
          :disabled-date="disabledEndDate"
          :placeholder="
            item.disabled ? '' : item?.maxPlaceholder ?? `${$t('form.select')} ${item.label}`
          "
          @change="changeDateRangeValue('endYear')"
        />
      </div>
    </div>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.NUMBER_RANGE">
    <div class="time-range-panel">
      <div class="time-range">
        <el-input-number
          v-model="item.min"
          :disabled="item.disabled"
          :max="item?.max ?? Infinity"
          :clearable="item.clearable ?? false"
          controls-position="right"
          :value-on-clear="null"
          :placeholder="
            item.disabled ? '' : item?.minPlaceholder ?? `${$t('form.text')} ${item.label}`
          "
          @change="changeNumberValue"
        />
      </div>
      <div class="interval"></div>
      <div class="time-range">
        <el-input-number
          v-model="item.max"
          :disabled="item.disabled"
          :clearable="item.clearable ?? false"
          controls-position="right"
          :min="item?.min ?? -Infinity"
          :value-on-clear="null"
          :placeholder="
            item.disabled ? '' : item?.maxPlaceholder ?? `${$t('form.text')} ${item.label}`
          "
          @change="changeNumberValue"
        />
      </div>
    </div>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.TIME">
    <el-time-picker
      v-model="item.value"
      :format="item.format ?? DATE_TIME"
      :value-format="item.format ?? DATE_TIME"
      :clearable="item.clearable ?? false"
      :placeholder="
        item.disabled
          ? ''
          : item?.placeholder ?? `${$t('form.select')} ${item.label?.toLowerCase()}`
      "
      @change="changeValue"
    />
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.FILE">
    <el-upload
      v-model:file-list="fileList"
      :accept="item.accept"
      class="upload-wrap"
      :show-file-list="false"
      :auto-upload="false"
      drag
      :disabled="item.disabled"
      action=""
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        <template v-if="fileList?.length > 0">
          {{ fileList?.[0]?.name }}
        </template>
        <template v-else> {{ $t('form.image') }} </template>
      </div>
      <template #tip v-if="item.desc">
        <div class="el-upload__tip">{{ item.desc }}</div>
      </template>
    </el-upload>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.FILE_BTN">
    <el-upload v-model:file-list="fileList" action="" :auto-upload="false" list-type="picture">
      <el-button plain type="primary">
        {{ item.label }}
      </el-button>
    </el-upload>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.FILE_ICON">
    <el-upload
      ref="uploadIconRef"
      class="upload-icon-wrap"
      :class="item.class"
      v-model:file-list="item.value"
      action=""
      :auto-upload="false"
      :limit="item.fileNum ?? 1"
      :multiple="item.fileNum && item.fileNum > 1"
      :on-exceed="handleExceed"
      :accept="getAccept(item.accept!)"
      :on-preview="filePreview"
      :on-change="handChange"
    >
      <el-button link class="upload-icon-btn">
        <i class="iconfont icon-upload"></i>{{ $t('button.upload') }}
      </el-button>
    </el-upload>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.RADIO_BTN">
    <el-radio-group v-model="item.value" @change="changeValue">
      <template :key="option.value" v-for="option in item.options">
        <el-radio-button :label="option.value">{{ option.label }}</el-radio-button>
      </template>
    </el-radio-group>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.RADIO">
    <el-radio-group v-model="item.value" @change="changeValue" :class="item?.labelPosition ?? ''" :disabled="item?.disabled ?? false">
      <template :key="option.value" v-for="option in item.options">
        <el-radio :label="option.value">{{ option.label }}</el-radio>
      </template>
    </el-radio-group>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.TEXT">
    <template v-if="isArray(item.text)">
      <ul class="desc">
        <li class="pdf-row-content" :key="str" v-for="str in item.text">{{ str }}</li>
      </ul>
    </template>
    <div class="pre-wrap" v-else>{{ item.text }}</div>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.SELECT_WITH_SWITCH">
    <div class="select-switch">
      <el-select
        ref="elSelectRef"
        v-model="item.value"
        :multiple="false"
        collapse-tags
        collapse-tags-tooltip
        :options="item.options ?? []"
        :disabled="item.disabled"
        :allow-create="item.allowCreate ?? false"
        :multiple-limit="item?.multipleLimit ?? 0"
        filterable
        :clearable="item.clearable ?? false"
        :max-collapse-tags="item?.maxTags ?? 1"
        :placeholder="
          item.disabled
            ? ' '
            : item?.placeholder ?? `${$t('form.select')} ${item.label?.toLowerCase()}`
        "
        @change="changeValue"
      >
        <el-option
          v-for="option in item.options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        >
        </el-option>
      </el-select>
      <div class="switch-panel">
        <label>{{ item.switchText }}</label>
        <el-switch
          v-model="item.switchValue"
          @change="(val: any) => changeValue(val, 'switchValue')"
        />
      </div>
    </div>
  </template>
  <template v-else-if="item.type === FormItemTypeEnum.TREE_SELECT || item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT">
    <el-tree-select
      v-model="item.value"
      :data="item.options"
      :render-after-expand="false"
      node-key="value"
      :teleported="item?.teleported ?? true"
      collapse-tags
      collapse-tags-tooltip
      :max-collapse-tags="item?.maxTags ?? 1"
      :multiple="item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT"
      :show-checkbox="item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT"
      check-strictly
      expand-on-click-node
      :default-expanded-keys="item?.defaultExpendKeys ?? []"
      filterable
      :filter-node-method="filterNodeMethod"
      :disabled="item.disabled"
      :clearable="item.clearable ?? false"
      :placeholder="
        item.disabled
          ? ' '
          : item?.placeholder ?? `${$t('form.select')} ${item.label?.toLowerCase()}`
      "
      @change="changeValue(item)"
    />
  </template>
  <template v-else>
    <el-input
      v-model="item.value"
      :disabled="item.disabled"
      :clearable="item.clearable ?? false"
      :type="item.type === FormItemTypeEnum.PASSWORD ? 'password' : ''"
      :placeholder="
        item.disabled ? '' : item?.placeholder ?? `${$t('form.text')} ${item.label?.toLowerCase()}`
      "
      :show-password="item.type === FormItemTypeEnum.PASSWORD"
      :maxlength="item?.maxlength"
      @blur="trimValue"
      @input="changeValue"
    >
      <template v-if="item.type === FormItemTypeEnum.INPUT_WITH_SWITCH" #append>
        <div class="switch-panel">
          <label>{{ item.switchText }}</label
          ><el-switch
            v-model="item.switchValue"
            @change="(val: any) => changeValue(val, 'switchValue')"
          />
        </div>
      </template>
    </el-input>
    <div v-if="item.isFound" class="el-form-item__error el-form-item__found">
      {{ item.text }}
      <span @click="showView">
        {{ $t('button.view').toLowerCase() }}
      </span>
    </div>
  </template>
</template>

<script setup lang="ts" name="EspFormItem">
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { DATE_FORMAT, DATE_TIME, MONTH_FORMAT, OPEN_FILE_PREVIEW } from '@/config'
import { UploadFile, UploadFiles, UploadProps, UploadRawFile, genFileId } from 'element-plus'
import { getStrWidth, getTimeRange, regNumber } from '@/utils'
import { useLocale } from '@/hooks/useLocale'
import mittBus from '@/utils/mittBus'
import { isArray } from '@/utils/is'
const { $t } = useLocale()
const uploadIconRef = ref()
const elSelectV2Ref = ref()

interface FormItem {
  item: Form.FormItem // 具体每一个表单项的配置
  change?: (formItem: Form.FormItem) => void // 表单改变
  blurCheck?: (key: string, value?: any) => void
  view?: (key: string, value?: any) => void
  refreshForm?: (key: string, value?: any) => void
}
const props = defineProps<FormItem>()

const fileList = ref<UploadFile[]>(props.item?.value ?? [])

const shortcuts = [
  {
    text: $t('button.toThisDay'),
    onClick: (vm: any) => {
      vm.emit('pick', '')
      props.item.upToNow = true
    }
  }
]

const shortDateCuts = [
  {
    text: $t('button.sendNow'),
    onClick: (vm: any) => {
      vm.emit('pick', '')
      props.item.upToNow = true
    }
  }
]
// 筛选tree select node函数
const filterNodeMethod = (value: any, data: Form.FormSelect) => { 
  return data.label?.toLocaleLowerCase().includes(value?.toLocaleLowerCase())
}
// 下拉框change之前的value
const previousValue = ref<any>()
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

const changeNumberValue = (val: any) => {
  changeValue(regNumber(val, props.item?.toFixed))
}
// 去除首尾空格
const trimValue = () => {
  if (props.item.value && typeof props.item.value === 'string') {
    props.item.value = props.item.value.trim()
    props.change && props.change(props.item)
  }
  props.blurCheck && props.blurCheck(props.item.prop, props.item.value)
}

const showView = () => {
  props.view && props.view(props.item.prop, props.item.value)
}

const refresh = () => {
  props.refreshForm && props.refreshForm(props.item.prop, props.item.value)
}
const changeValue = (val: any, prop?: string) => {
  const valueProp = prop ? prop : 'value'
  if (props.item?.type === FormItemTypeEnum.TREE_SELECT || props.item?.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT) {
    props.change && props.change(props.item)
    return
  }
  
  props.item[valueProp] = val
  if (props.item?.validateFun) {
    props.item[valueProp] = props.item?.validateFun(val) ? val?.slice(0, -1) : val
    if (props.item?.validateFun(val)) {
      ElMessage.warning(props?.item?.text ?? $t('form.formatError'))
    }
  }
  props.change && props.change(props.item)
}

const initSelectV2Width = () => {
  if (
    (props.item.type === FormItemTypeEnum.SELECT ||
      props.item.type === FormItemTypeEnum.MULTIPLE_SELECT) &&
    elSelectV2Ref.value
  ) {
    const clientWidth = elSelectV2Ref.value?.selectRef.clientWidth
    previousValue.value = elSelectV2Ref.value.modelValue
    const options: Form.FormSelect[] = props.item.options ?? []
    let maxLenStr = ''
    options.forEach((item: Form.FormSelect) => {
      if (maxLenStr.length < item.label?.length) {
        maxLenStr = item.label
      }
    })
    elSelectV2Ref.value.popperRef.style.minWidth = `${elSelectV2Ref.value.popperSize}px`
    const strWidth = getStrWidth(maxLenStr, 90)
    const popWidth = strWidth > clientWidth ? strWidth : clientWidth
    if (popWidth > 90) {
      elSelectV2Ref.value.popperRef.style.width = `${popWidth}px`
    } else {
      elSelectV2Ref.value.popperRef.style.width = 'auto'
    }
  }
}

const getAccept = (accept: string) => {
  const accepts: string[] = accept?.toLowerCase()?.split('/') ?? []
  return accepts.map(item => `.${item}`).join(',')
}

const handleExceed: UploadProps['onExceed'] = files => {
  if (!props.item?.fileNum || props.item?.fileNum === 1) {
    uploadIconRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadIconRef.value!.handleStart(file)
  }
}

const handChange: UploadProps['onChange'] = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log(uploadFile)
  changeValue(uploadFiles)
}
const filePreview = (uploadFile: UploadFile) => {
  if (uploadFile.status === 'success') {
    mittBus.emit(OPEN_FILE_PREVIEW, { uid: uploadFile.uid, file_name: uploadFile.name })
  }
}
const changeDateValue = (val: any) => {
  if (val) {
    props.item.showToday && (props.item.upToNow = false)
  }
  props.item.value = val
  props.change && props.change(props.item)
}

// 修改日期范围
const changeTimeRange = (type?: string) => {
  // 如果面试时间规定在一天内的，切换开始/结束时间，另一个时间跟着变成同一天
  if (props.item.withinOneDay) {
    if (type === 'startDate') {
      props.item.endDate = props.item.startDate
    } else if (type === 'endDate') {
      props.item.startDate = props.item.endDate
    }
  } else {
    props.item.disableEndDate = props.item?.endDate ?? props.item.disableEndDate
    props.item.disableStartDate = props.item?.startDate ?? props.item.disableStartDate
  }
 
  const startFullDate = props.item.startDate && props.item.startTime ? `${props.item.startDate} ${props.item.startTime}:00` : ''
  const endFullDate = props.item.endDate && props.item.endTime ? `${props.item.endDate} ${props.item.endTime}:00` : ''
  props.item.value = startFullDate && endFullDate ? [startFullDate, endFullDate] : undefined
  props.item.timeRange = getTimeRange(startFullDate, endFullDate)
  props.change && props.change(props.item)
}

// 修改日期范围
const changeTime = (val: any) => {
  if (val) {
    props.item.showToday && (props.item.upToNow = false)
  }
  const fullTime = `${props.item.startDate} ${props.item.startTime}:00`
  props.item.value = fullTime
  props.change && props.change(props.item)
}

// 修改日期范围
const changeDateRangeValue = (type?: string) => {
  // 如果是年份选择的结束时间默认设置为该年度的12月31号
  if (type === 'endYear' && props.item.type === FormItemTypeEnum.YEAR_RANGE) {
    props.item.endDate = props.item.endDate ? props.item.endDate?.substring(0, 5) + '12-31' : ''
  }
  props.item.disableEndDate = props.item.endDate
  props.item.disableStartDate = props.item.startDate
  props.change && props.change(props.item)
}
// 分开设置日期开始时间和结束时间限制
const disabledStartDate = (date: Date) => {
  // 禁止选择结束时间之后的时间以及默认配置的最小开始时间
  if (props.item.disableStartTimeDate && props.item.disableEndDate) {
    return new Date(props.item.disableEndDate!).getTime() <= date.getTime() || date.getTime() < new Date(new Date(props.item.disableStartTimeDate!).setHours(0, 0, 0, 0)).getTime()
  } else if (props.item.disableEndDate) {
    return new Date(props.item.disableEndDate!).getTime() <= date.getTime()
  } else if (props.item.disableStartTimeDate) {
    return date.getTime() < new Date(new Date(props.item.disableStartTimeDate!).setHours(0, 0, 0, 0)).getTime()
  }
}
// 分开设置日期开始时间和结束时间限制
const disabledEndDate = (date: Date) => {
  // 禁止选择开始时间之前的时间以及默认配置的最大结束时间
  if (props.item.disableEndTimeDate && props.item.disableEndDate) {
    return new Date(props.item.disableStartDate!).getTime() >= new Date(new Date(date).setHours(9, 0, 0, 0)).getTime() 
        || new Date(props.item.disableEndTimeDate!).getTime() <= date.getTime()
  } else if (props.item.disableStartDate) {
    return (
      new Date(props.item.disableStartDate!).getTime() >=
      new Date(new Date(date).setHours(9, 0, 0, 0)).getTime()
    )
  } else if (props.item.disableEndTimeDate) {
    return new Date(props.item.disableEndTimeDate!).getTime() <= date.getTime()
  }
}
watch(
  () => props.item.options,
  val => {
    if (val) {
      setTimeout(() => {
        initSelectV2Width()
      })
    }
  },
  { immediate: true, deep: true }
)
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
