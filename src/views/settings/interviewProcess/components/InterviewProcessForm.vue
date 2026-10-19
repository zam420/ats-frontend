<template>
  <EspMain :title="title">
    <template #right>
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
    </template>
    <EspForm ref="interviewRef" v-model="state.baseForm" />
    <el-row :gutter="20" class="view-content">
      <el-col :span="6">
        <div class="step-panel">
          <div class="title">{{ $t('interviewProcess.interviewSessions') }}</div>
          <div class="content" ref="interviewSessionRef">
            <div class="step" v-for="item in state.interviewSessionList" :key="item.value">
              <div class="left-border"></div>
              <div class="step-content">
                <div class="step-title">{{ item.label }}</div>
                <div>{{ item.subLabel }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="process-panel">
          <div class="title">{{ $t('menu.interviewProcess') }}</div>
          <div>{{ $t('interviewProcess.dragProcess') }}</div>
          <div class="content">
            <div ref="processRef">
              <div
                class="process-box"
                v-for="(item, index) in state.processList"
                :key="`${item.id} ${index}`"
              >
                <el-row :gutter="20">
                  <el-col :span="1" class="center">
                    <div class="order" v-if="item.round_type !== ''"></div>
                  </el-col>
                  <el-col :span="8">
                    <el-dropdown trigger="click" :teleported="false">
                      <div
                        class="add-select"
                        @drop="evt => handleDragOver(evt, index)"
                        @dragover.prevent="evt => handleDragOver(evt, index)"
                        @dragleave="handleDragLeave"
                        :class="{
                          'no-border': item.round_type !== '',
                          active: state.isDragOver && state.dragIndex === index
                        }"
                      >
                        <div class="stepAdded">
                          <div class="left-border"></div>
                          <div class="step-content">
                            <div class="step-title">
                              {{ InterviewSession?.[item.round_type]?.name }}
                            </div>
                            <div>{{ InterviewSession?.[item.round_type]?.subLabel }}</div>
                          </div>
                        </div>
                      </div>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            v-for="session in state.interviewSessionList"
                            :key="session.value"
                            :class="session.value === item.round_type ? 'active' : ''"
                            @click="setRoundType(item, session.value)"
                            >{{ session.label }}</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </el-col>
                  <el-col :span="14" v-if="item.round_type !== ''">
                    <div class="select-title">{{ $t('interviewProcess.interviewers') }}</div>
                    <el-select
                      v-model="item.interviewers"
                      multiple
                      collapse-tags
                      collapse-tags-tooltip
                      filterable
                      :clearable="true"
                    >
                      <el-option
                        v-for="option in state.interviewerList"
                        :key="option.value"
                        :label="`${option.label} (${option.subLabel})`"
                        :value="option.value"
                        :class="option.subLabel ? 'form-select-li' : ''"
                      >
                        <el-checkbox
                          :value="item.interviewers?.includes(option.value)"
                          style="pointer-events: none"
                        >
                          <span class="title">{{ option.label }}</span>
                          <span>{{ option.subLabel }}</span></el-checkbox
                        >
                      </el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="1" class="center" v-if="item.round_type !== ''">
                    <i class="iconfont icon-delete" @click="deleteRound(index)"></i>
                  </el-col>
                </el-row>
              </div>
            </div>
            <div class="process-box">
              <el-row :gutter="20">
                <el-col :span="1" class="center"> </el-col>
                <el-col :span="8">
                  <el-dropdown trigger="click" :teleported="false">
                    <div
                      class="add-select"
                      @drop="evt => handleDragOver(evt, -1)"
                      @dragover.prevent="evt => handleDragOver(evt, -1)"
                      @dragleave="handleDragLeave"
                      :class="{
                        active: state.isDragOver && state.dragIndex === -1
                      }"
                    >
                      <div class="plus"></div>
                    </div>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="session in state.interviewSessionList"
                          :key="session.value"
                          @click="setRoundType(null, session.value)"
                          >{{ session.label }}</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div class="esp-form-wrap">
          <label class="el-form-item__label">{{ $t('cv.notes') }}</label>
          <el-input
            v-model="state.notes"
            :rows="5"
            :clearable="true"
            type="textarea"
            :placeholder="`${$t('form.text')}`"
          />
        </div>
      </el-col>
    </el-row>
  </EspMain>
</template>
<script setup lang="ts" name="InterviewProcessForm">
import { cloneDeep } from 'lodash-es'
import { INTERVIEW_PROCESS_FORM } from '../data'
import { enumItem2arr, generateUUID, getObjectByForms } from '@/utils'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_SETTINGS_INTERVIEW_PROCESS } from '@/router/routerName'
import {
  getInterviewProcessDetail,
  createInterviewProcess,
  updateInterviewProcess
} from '@/api/modules/interviewProcess'
import InterviewProcess from '@/api/interface/interviewProcess'
import Sortable from 'sortablejs'
import { getUserList } from '@/api/modules/common'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { InterviewSession } from '@/enums/interviewSessionEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
interface ParamsProps {
  title: string // 标题
  id?: string // 数据ID
  isEdit: boolean // 是否编辑
}

interface ReactiveParams {
  baseForm: Form.FormItem[]
  processList: InterviewProcess.RoundParam[]
  interviewerList: Form.FormSelect[]
  isDragOver: boolean
  dragIndex: number
  interviewSessionList: Form.FormSelect[]
  notes: string
}
const router = useRouter()
const { $t } = useLocale()

const interviewRef = ref()
const processRef = ref()
const interviewSessionRef = ref()

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false
})
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(INTERVIEW_PROCESS_FORM),
  processList: [],
  interviewerList: [],
  isDragOver: false,
  dragIndex: 0,
  // 面试流程list
  interviewSessionList: enumItem2arr(InterviewSession),
  notes: ''
})

const save = async () => {
  const isBasicPass = interviewRef.value.validateFrom && (await interviewRef.value.validateFrom())
  const processList = state.processList
  if (isBasicPass) {
    if (processList.length === 0) {
      ElMessage.error($t('message.processLimit'))
      return
    }
    const baseForm = getObjectByForms(state.baseForm)
    const formData: InterviewProcess.SaveParam = { ...baseForm }
    if (props.isEdit) {
      formData.id = props.id as string
    }
    const rounds: InterviewProcess.RoundParam[] = []
    processList.forEach((data, index) => {
      rounds.push({
        round_type: data.round_type,
        interviewers: data.interviewers,
        order: index
      })
    })
    formData.rounds = [...rounds]
    formData.notes = state.notes
    const request = props.isEdit ? updateInterviewProcess : createInterviewProcess
    request(formData).then(res => {
      if (res?.success) {
        ElMessage.success({ message: $t('message.saveSuc') })
        goBack()
        return
      }
      ElMessage.error({ message: res?.message })
    })
  }
}

const goBack = () => {
  if (router?.options?.history?.state?.back) {
    router.go(-1)
    return
  }
  router.replace({
    path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS}`
  })
}

const initData = () => {
  if (props.id) {
    getInterviewProcessDetail(props.id).then(res => {
      const result = (res.result ?? {}) as InterviewProcess.DetailInfo
      state.baseForm.map((item: Form.FormItem) => {
        let prop = item.prop as keyof InterviewProcess.DetailInfo
        item.value = result?.[prop]
        if (item.type === FormItemTypeEnum.TREE_SELECT) {
          item.defaultExpendKeys = item?.value ? [item?.value] : []
        }
        interviewRef.value &&
          interviewRef.value.changeFormModel({
            prop: item.prop,
            value: item.value
          })
        return item
      })
      state.notes = result?.notes ?? ''
      const processList: InterviewProcess.RoundParam[] = []
      result?.rounds?.forEach(data => {
        const interviewers = data?.interviewers?.map(item => {
          // Backend returns plain user ids; legacy responses returned objects
          return typeof item === 'object' ? item.id : item
        })
        processList.push({
          id: data.id,
          round_type: data.round_type,
          interviewers: interviewers ?? [],
          order: data.order
        })
      })
      state.processList = [...processList]
    })
  }
}
// 拖拽物移入/放下事件
const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  state.isDragOver = true
  state.dragIndex = index
}
// 拖拽物移出事件
const handleDragLeave = () => {
  state.isDragOver = false
}

// 设置面试环节类型
const setRoundType = (item: InterviewProcess.RoundParam | null, value: number) => {
  if (!item) {
    state.processList.push({
      id: generateUUID(),
      round_type: value,
      interviewers: []
    })
    return
  }
  item.round_type = value
}

// 删除已添加的流程
const deleteRound = (index: number) => {
  state.processList.splice(index, 1)
}

onMounted(async () => {
  // 获取interviewer下拉的值
  const result = await getUserList(ShareTypeEnum.INTERVIEWER)
  const options: Form.FormSelect[] = []
  result?.result?.forEach(user => {
    options.push({
      label: user.name,
      value: user.id,
      subLabel: user.email
    })
  })
  state.interviewerList = [...options]
  // 初始化process步骤间的拖拽事件
  const interviewSessionHtml = interviewSessionRef.value
  const listWithHandle = processRef.value
  if (!Sortable.get(listWithHandle)) {
    Sortable.create(listWithHandle, {
      handle: '.order', // 按住按钮进行拖拽
      ghostClass: 'blue-background-class',
      onEnd(evt: Sortable.SortableEvent) {
        const newIndex = evt.newIndex as number
        const oldIndex = evt.oldIndex as number
        const currRow = state.processList?.splice(oldIndex, 1)[0]
        state.processList?.splice(newIndex, 0, currRow)
      }
    })
  }

  // 初始化session到process步骤的拖拽事件
  if (!Sortable.get(interviewSessionHtml)) {
    Sortable.create(interviewSessionHtml, {
      handle: '.step',
      group: {
        name: 'shared',
        pull: 'clone',
        put: false // Do not allow items to be put into this list
      },
      sort: false,
      ghostClass: 'blue-background-class',
      onStart() {
        state.isDragOver = false
      },
      onEnd(evt: Sortable.SortableEvent) {
        if (state.isDragOver) {
          const newIndex = evt.newIndex as number
          const round_type = state.interviewSessionList?.[newIndex]?.value
          if (state.dragIndex === -1) {
            state.processList.push({
              id: generateUUID(),
              round_type: round_type,
              interviewers: []
            })
          } else {
            state.processList[state.dragIndex].round_type = round_type
          }
          state.isDragOver = false
        }
      }
    })
  }

  if (props.isEdit) {
    setTimeout(() => {
      initData()
    }, 100)
    return
  }
})
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
