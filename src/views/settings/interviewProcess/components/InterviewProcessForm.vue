<template>
  <EspMain :title="title">
    <template #right v-if="!readOnly">
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton v-if="isEdit" @click="saveAs" class="btn-light">{{ $t('interviewProcess.saveAs') }}</ElButton>
      <ElButton @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
    </template>
    <div :class="{ 'read-only': readOnly }">
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
          <div class="title">{{ $t('interviewProcess.addedRounds') }}</div>
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
                              {{ roundTypeOf(item.round_type)?.label }}
                            </div>
                            <div>{{ roundTypeOf(item.round_type)?.subLabel }}</div>
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
          <label class="el-form-item__label">{{ $t('interviewProcess.description') }}</label>
          <el-input
            v-model="state.description"
            :rows="5"
            :clearable="true"
            type="textarea"
            :placeholder="`${$t('form.text')}`"
          />
        </div>
      </el-col>
    </el-row>
    </div>
  </EspMain>
</template>
<script setup lang="ts" name="InterviewProcessForm">
import { cloneDeep } from 'lodash-es'
import { INTERVIEW_PROCESS_FORM } from '../data'
import { generateUUID, getObjectByForms } from '@/utils'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_SETTINGS_INTERVIEW_PROCESS } from '@/router/routerName'
import {
  getInterviewProcessDetail,
  getInterviewRoundTypes,
  createInterviewProcess,
  createInterviewProcessTemplate,
  saveAsInterviewProcess,
  updateInterviewProcess,
  updateInterviewProcessTemplate} from '@/api/modules/interviewProcess'
import InterviewProcess from '@/api/interface/interviewProcess'
import Sortable from 'sortablejs'
import { getUserList } from '@/api/modules/common'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { useGlobalStore } from '@/store/modules/global'
import { UserPermissionEnum } from '@/enums/userPermission'
interface ParamsProps {
  title: string // 标题
  id?: string // 数据ID
  isEdit: boolean // 是否编辑
  readOnly?: boolean // 只读查看
  isTemplate?: boolean // 创建系统模板
}

interface ReactiveParams {
  baseForm: Form.FormItem[]
  processList: InterviewProcess.RoundParam[]
  interviewerList: Form.FormSelect[]
  isDragOver: boolean
  dragIndex: number
  interviewSessionList: Form.FormSelect[]
  description: string
}
const router = useRouter()
const { $t } = useLocale()

const interviewRef = ref()
const processRef = ref()
const interviewSessionRef = ref()

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false,
  readOnly: false,
  isTemplate: false
})
const globalStore = useGlobalStore()
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(INTERVIEW_PROCESS_FORM).map(item => {
    // Only users with the ipta permission can choose the plan owner; system templates have no owner
    if (item.prop === 'owner_id') {
      item.isHide =
        props.isTemplate || !globalStore.permissions.includes(UserPermissionEnum.IPTA)
    }
    return item
  }),
  processList: [],
  interviewerList: [],
  isDragOver: false,
  dragIndex: 0,
  // 面试流程list
  interviewSessionList: [] as Form.FormSelect[],
  description: ''
})

const isSystemTemplate = ref(false)

// Validates the form and builds the request payload; returns null when invalid
const buildPayload = async (): Promise<InterviewProcess.SaveParam | null> => {
  const isBasicPass = interviewRef.value.validateFrom && (await interviewRef.value.validateFrom())
  if (!isBasicPass) return null
  const processList = state.processList
  if (processList.length === 0) {
    ElMessage.error($t('message.processLimit'))
    return null
  }
  const baseForm = getObjectByForms(state.baseForm)
  const formData: InterviewProcess.SaveParam = { ...baseForm }
  // the owner field may be hidden (no ipta permission), so read it from the form item
  const ownerValue = state.baseForm.find(item => item.prop === 'owner_id')?.value
  if (ownerValue && !props.isTemplate) {
    formData.owner_id = ownerValue
  }
  formData.rounds = processList.map((data, index) => ({
    round_type: data.round_type,
    interviewers: data.interviewers,
    order: index
  }))
  formData.description = state.description
  return formData
}

const submit = (
  request: (data: InterviewProcess.SaveParam) => Promise<any>,
  formData: InterviewProcess.SaveParam
) => {
  request(formData).then(res => {
    if (res?.success) {
      ElMessage.success({ message: $t('message.saveSuc') })
      goBack()
      return
    }
    ElMessage.error({ message: res?.message })
  })
}

const save = async () => {
  const formData = await buildPayload()
  if (!formData) return
  if (props.isEdit) {
    formData.id = props.id as string
    submit(isSystemTemplate.value ? updateInterviewProcessTemplate : updateInterviewProcess, formData)
  } else {
    submit(props.isTemplate ? createInterviewProcessTemplate : createInterviewProcess, formData)
  }
}

// Save the current content as a new plan under a name entered in a dialog
const saveAs = async () => {
  const formData = await buildPayload()
  if (!formData) return
  try {
    const { value } = await ElMessageBox.prompt($t('interviewProcess.saveAsName'), $t('interviewProcess.saveAs'), {
      confirmButtonText: $t('button.confirm'),
      cancelButtonText: $t('button.cancel'),
      inputValue: '',
      inputPlaceholder: $t('interviewProcess.interviewName'),
      inputValidator: (val: string) =>
        (val ?? '').trim().length > 0 || $t('form.required'),
      inputErrorMessage: $t('form.required')
    })
    formData.name = value.trim()
    delete formData.id
    submit(saveAsInterviewProcess, formData)
  } catch {
    // dialog cancelled
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
      isSystemTemplate.value = !!result.is_system_template
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
      state.description = result?.description ?? ''
      const processList: InterviewProcess.RoundParam[] = []
      result?.rounds?.forEach(data => {
        const interviewers = data?.interviewers?.map(item => {
          // Backend returns plain user ids; legacy responses returned objects
          return typeof item === 'object' ? item.id : item
        })
        processList.push({
          id: data.id,
          round_type: Number(data.round_type),
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

const roundTypeOf = (value: unknown) =>
  state.interviewSessionList.find(type => type.value === value)

const loadRoundTypes = async () => {
  const res = await getInterviewRoundTypes()
  state.interviewSessionList = (res?.result ?? []).map(type => ({
    value: type.value,
    label: type.display_name,
    subLabel: type.description
  }))
}

onMounted(async () => {
  await loadRoundTypes()
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
  // Plan owner: defaults to the signed-in user when creating
  const ownerItem = state.baseForm.find(item => item.prop === 'owner_id')
  if (ownerItem) {
    ownerItem.options = [...options]
    if (!props.isEdit) {
      const email = (globalStore.userInfo?.email ?? globalStore.email ?? '').toLowerCase()
      const self = result?.result?.find(user => user.email?.toLowerCase() === email)
      if (self) {
        ownerItem.value = self.id
        interviewRef.value?.changeFormModel({ prop: 'owner_id', value: self.id }, true)
      }
    }
  }
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
.btn-light {
  color: var(--el-color-primary);
}
// read-only view: block all interaction and hide the add/remove/drag affordances
.read-only {
  pointer-events: none;
  .icon-delete,
  .plus,
  .order {
    visibility: hidden;
  }
}
</style>
