<template>
  <EspMain :title="isReadOnly ? $t('interviewProcess.interviewDetail') : title">
    <template #right v-if="accessReady && !isReadOnly">
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton v-if="isEdit" @click="saveAs" class="btn-light">{{ $t('interviewProcess.saveAs') }}</ElButton>
      <ElButton @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
    </template>
    <div :class="{ 'read-only': isReadOnly }">
    <EspForm ref="interviewRef" v-model="state.baseForm" />
    <el-row v-if="!isTemplate && !isSystemTemplate" :gutter="20" class="share-section">
      <el-col :span="6" class="share-controls">
      <div class="share-label">{{ $t('interviewProcess.shareWith') }}</div>
      <el-radio-group v-model="state.shareMode" @change="onShareModeChange">
        <el-tooltip :content="$t('interviewProcess.shareNoneHint')" placement="top">
          <el-radio label="none">{{ $t('interviewProcess.shareNone') }}</el-radio>
        </el-tooltip>
        <el-tooltip :content="$t('interviewProcess.shareEveryoneHint')" placement="top">
          <el-radio label="everyone">{{ $t('interviewProcess.shareEveryone') }}</el-radio>
        </el-tooltip>
        <el-tooltip :content="$t('interviewProcess.shareUsersHint')" placement="top">
          <el-radio label="users">{{ $t('interviewProcess.shareUsers') }}</el-radio>
        </el-tooltip>
      </el-radio-group>
      </el-col>
      <el-col :span="ownerVisible ? 12 : 18">
      <el-select
        v-model="state.shareUserIds"
        class="share-users interviewer-select"
        popper-class="share-users-popper"
        :disabled="state.shareMode !== 'users'"
        @mouseover="showFullTagText"
        multiple
        collapse-tags
        :max-collapse-tags="2"
        collapse-tags-tooltip
        filterable
        clearable
        :placeholder="$t('interviewProcess.shareUsersPlaceholder')"
      >
        <el-option
          v-for="option in shareUserOptions"
          :key="option.value"
          :label="`${option.label} (${option.subLabel})`"
          :value="option.value"
          :class="option.subLabel ? 'form-select-li' : ''"
        >
          <el-checkbox
            :value="state.shareUserIds.includes(option.value)"
            style="pointer-events: none"
          >
            <span class="title">{{ option.label }}</span>
            <span>{{ option.subLabel }}</span></el-checkbox
          >
        </el-option>
      </el-select>
      </el-col>
    </el-row>
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
                :class="{
                  'drop-before': state.isDragOver && state.dragIndex === index && !state.dropAfter,
                  'drop-after': state.isDragOver && state.dragIndex === index && state.dropAfter
                }"
                v-for="(item, index) in state.processList"
                :key="`${item.id} ${index}`"
                @drop="evt => handleRoundDragOver(evt, index)"
                @dragover.prevent="evt => handleRoundDragOver(evt, index)"
                @dragleave="handleDragLeave"
              >
                <el-row :gutter="20">
                  <el-col :span="1" class="center">
                    <div class="order" v-if="item.round_type !== ''"></div>
                  </el-col>
                  <el-col :span="8">
                    <el-dropdown trigger="click" :teleported="false">
                      <div
                        class="add-select"
                        :class="{
                          'no-border': item.round_type !== ''
                        }"
                      >
                        <div class="stepAdded">
                          <div class="left-border"></div>
                          <div class="step-content round-content" @click.stop @keydown.stop>
                            <div class="round-type-label">
                              {{ roundTypeOf(item.round_type)?.label }}
                            </div>
                            <el-input
                              v-model="item.name"
                              class="inline-input inline-title"
                              maxlength="30"
                              :placeholder="roundTypeOf(item.round_type)?.subLabel"
                            />
                            <el-input
                              v-model="item.description"
                              class="inline-input"
                              maxlength="100"
                              :placeholder="$t('interviewProcess.roundDescPlaceholder')"
                            />
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
                    <template v-if="!isTemplate && !isSystemTemplate">
                    <div class="select-title">{{ $t('interviewProcess.interviewers') }}</div>
                    <el-select
                      v-model="item.interviewers"
                      class="interviewer-select"
                      @mouseover="showFullTagText"
                      multiple
                      collapse-tags
                      :max-collapse-tags="2"
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
                    </template>
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
import { ROUTER_SETTINGS_EVALUATION_PLAN } from '@/router/routerName'
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
  dropAfter: boolean
  interviewSessionList: Form.FormSelect[]
  shareMode: 'none' | 'everyone' | 'users'
  shareUserIds: (string | number)[]
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
  dropAfter: false,
  // 面试流程list
  interviewSessionList: [] as Form.FormSelect[],
  shareMode: 'none',
  shareUserIds: []
})

const isSystemTemplate = ref(false)

// A plan opened for editing is read-only unless the signed-in user is its owner
const planOwnerId = ref<string | number | null>(null)
// In edit mode the buttons stay hidden until the plan and user list have loaded, so they don't flash on read-only pages
const detailLoaded = ref(false)
const usersLoaded = ref(false)
const accessReady = computed(() => !props.isEdit || (detailLoaded.value && usersLoaded.value))
const selfUserId = computed(() => {
  const email = (globalStore.userInfo?.email ?? globalStore.email ?? '').toLowerCase()
  return state.interviewerList.find(u => (u.subLabel ?? '').toLowerCase() === email)?.value
})
const isReadOnly = computed(() => {
  if (props.readOnly) return true
  if (!props.isEdit || planOwnerId.value == null || selfUserId.value == null) return false
  if (String(planOwnerId.value) === String(selfUserId.value)) return false
  // Admins may edit plans they don't own: ipta for normal plans, iptsa for system templates
  const admin = isSystemTemplate.value ? UserPermissionEnum.IPTSA : UserPermissionEnum.IPTA
  return !globalStore.permissions.includes(admin)
})

// Description takes the Plan Owner's space when the owner dropdown is hidden; the users dropdown follows it
const ownerVisible = computed(() => !state.baseForm.find(item => item.prop === 'owner_id')?.isHide)
watch(
  ownerVisible,
  visible => {
    const desc = state.baseForm.find(item => item.prop === 'description')
    if (desc) desc.col = visible ? 12 : 18
  },
  { immediate: true }
)

// The current owner already has access, so they are not offered as a share target
const shareUserOptions = computed(() => {
  const ownerId = state.baseForm.find(item => item.prop === 'owner_id')?.value
  return state.interviewerList.filter(user => user.value !== ownerId)
})

const onShareModeChange = () => {
  state.shareUserIds = []
}

// Validates the form and builds the request payload; returns null when invalid
const buildPayload = async (): Promise<InterviewProcess.SaveParam | null> => {
  const isBasicPass = interviewRef.value.validateFrom && (await interviewRef.value.validateFrom())
  if (!isBasicPass) return null
  const processList = state.processList
  if (processList.length === 0) {
    ElMessage.error($t('message.processLimit'))
    return null
  }
  if (processList.length > MAX_ROUNDS) {
    ElMessage.error($t('message.roundsMaxLimit'))
    return null
  }
  const sharing = !props.isTemplate && !isSystemTemplate.value
  if (sharing && state.shareMode === 'users' && state.shareUserIds.length === 0) {
    ElMessage.error($t('interviewProcess.shareUsersRequired'))
    return null
  }
  const baseForm = getObjectByForms(state.baseForm)
  const formData: InterviewProcess.SaveParam = { ...baseForm }
  if (sharing) {
    formData.is_public = state.shareMode === 'everyone'
    formData.shared_with_user_ids =
      state.shareMode === 'users' ? state.shareUserIds.map(String) : null
  }
  // the owner field may be hidden (no ipta permission), so read it from the form item
  const ownerValue = state.baseForm.find(item => item.prop === 'owner_id')?.value
  if (ownerValue && !props.isTemplate && !isSystemTemplate.value) {
    formData.owner_id = ownerValue
  }
  formData.rounds = processList.map((data, index) => ({
    round_type: data.round_type,
    interviewers: data.interviewers,
    name: data.name,
    description: data.description,
    order: index
  }))
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
    path: `/${ROUTER_SETTINGS_EVALUATION_PLAN}`
  })
}

// Truncated interviewer tags show their full text as a native tooltip on hover
const showFullTagText = (e: MouseEvent) => {
  const el = (e.target as HTMLElement)?.closest?.('.el-select__tags-text') as HTMLElement | null
  if (el && !el.title) el.title = el.textContent?.trim() ?? ''
}

const initData = () => {
  if (props.id) {
    getInterviewProcessDetail(props.id).then(res => {
      const result = (res.result ?? {}) as InterviewProcess.DetailInfo
      isSystemTemplate.value = !!result.is_system_template
      planOwnerId.value = result.owner_id ?? null
      detailLoaded.value = true
      if (isSystemTemplate.value) {
        const ownerItem = state.baseForm.find(item => item.prop === 'owner_id')
        if (ownerItem) ownerItem.isHide = true
      }
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
      const sharedIds = (result.shared_with_user_ids ?? result.share_to ?? []).map(u =>
        typeof u === 'object' ? u.id : u
      ) as (string | number)[]
      state.shareUserIds = result.is_public ? [] : sharedIds
      state.shareMode = result.is_public ? 'everyone' : sharedIds.length ? 'users' : 'none'
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
          name: data.name,
          description: data.description,
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
// Over an added round: the upper half inserts before it, the lower half after it
const handleRoundDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  state.isDragOver = true
  state.dragIndex = index
  state.dropAfter = event.clientY > rect.top + rect.height / 2
}

// A new round's name starts as the type's description; the round description starts empty
const MAX_ROUNDS = 10
// Shows a warning and returns true when no more rounds can be added
const isAtMaxRounds = () => {
  if (state.processList.length < MAX_ROUNDS) return false
  ElMessage.warning($t('message.roundsMaxLimit'))
  return true
}

const newRound = (value: number): InterviewProcess.RoundParam => ({
  id: generateUUID(),
  round_type: value,
  interviewers: [],
  name: roundTypeOf(value)?.subLabel,
  description: ''
})

// Changes the type of a round; the name follows the type's description only if the user hasn't customised it
const changeRoundType = (item: InterviewProcess.RoundParam, value: number) => {
  const oldType = roundTypeOf(item.round_type)
  if (!item.name || item.name === oldType?.subLabel) item.name = roundTypeOf(value)?.subLabel
  item.round_type = value
}

// 设置面试环节类型
const setRoundType = (item: InterviewProcess.RoundParam | null, value: number) => {
  if (!item) {
    if (isAtMaxRounds()) return
    state.processList.push(newRound(value))
    return
  }
  changeRoundType(item, value)
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
    value: type.id,
    label: type.name,
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
  usersLoaded.value = true
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
        state.isDragOver = false
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
        if (state.isDragOver && !isAtMaxRounds()) {
          const newIndex = evt.newIndex as number
          const round_type = state.interviewSessionList?.[newIndex]?.value
          if (state.dragIndex === -1) {
            state.processList.push(newRound(round_type as number))
          } else {
            state.processList.splice(
              state.dragIndex + (state.dropAfter ? 1 : 0),
              0,
              newRound(round_type as number)
            )
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
// Inline editable round name/description inside the round card (no borders, left aligned with the title)
.inline-input {
  :deep(.el-input__wrapper) {
    padding: 0 !important;
    background: transparent;
    box-shadow: none !important;
    border: none;
    border-radius: 0;
  }
  :deep(.el-input__inner) {
    text-align: left;
    padding: 0 !important;
    height: 22px;
    line-height: 22px;
  }
}
.inline-title :deep(.el-input__inner) {
  font-weight: bold;
  font-size: var(--el-font-size-medium);
}
// Added rounds: 100px panel with title / name / description evenly spaced
.process-box .add-select.no-border {
  height: 100px !important;
  .stepAdded {
    height: 100px;
    padding: 0.7rem 1.8rem;
  }
  .round-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
  }
}
// Interviewers: keep selected tags on a single line, truncating long names
.interviewer-select {
  :deep(.el-select__tags) {
    flex-wrap: nowrap;
  }
  :deep(.el-select-tags-wrapper) {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    max-width: 100%;
    min-width: 0;
  }
  :deep(.el-select-tags-wrapper .el-tag) {
    flex: 0 1 auto;
    min-width: 0;
    max-width: 45%;
    overflow: hidden;
  }
  :deep(.el-select-tags-wrapper .el-tag .el-tag__content) {
    min-width: 0;
    overflow: hidden;
  }
  :deep(.el-select-tags-wrapper .el-tag .el-select__tags-text) {
    display: block;
    max-width: 100% !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  // the "+ n" tag keeps its full width
  :deep(.el-select-tags-wrapper .el-tag:last-child) {
    flex-shrink: 0;
    max-width: none;
  }
}
// Added rounds: smaller round type label above the editable name
// Insertion line shown while dragging a round type over an added round
.process-box.drop-before {
  box-shadow: 0 -3px 0 0 var(--el-color-primary);
}
.process-box.drop-after {
  box-shadow: 0 3px 0 0 var(--el-color-primary);
}
.round-type-label {
  padding-bottom: 3px;
  font-size: 12px;
  font-weight: bold;
  line-height: 16px;
  color: var(--el-color-primary);
}
// read-only view: block all interaction and hide the add/remove/drag affordances
.read-only {
  pointer-events: none;
  // Name and description look disabled
  :deep(.esp-form-wrap .el-input__wrapper),
  :deep(.esp-form-wrap .el-textarea__inner) {
    background-color: var(--el-disabled-bg-color);
  }
  :deep(.esp-form-wrap .el-input__inner),
  :deep(.esp-form-wrap .el-textarea__inner) {
    color: var(--el-text-color-placeholder);
    -webkit-text-fill-color: var(--el-text-color-placeholder);
  }
  .icon-delete,
  .plus,
  .order {
    visibility: hidden;
  }
}
</style>
