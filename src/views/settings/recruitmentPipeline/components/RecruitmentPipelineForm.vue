<template>
  <component :is="stagesOnly ? 'div' : EspMain" :title="stagesOnly ? undefined : isReadOnly ? $t('recruitmentPipeline.pipelineDetail') : title">
    <template #right v-if="!stagesOnly && accessReady && !isReadOnly">
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton v-if="isEdit" @click="saveAs" class="btn-light">{{ $t('interviewProcess.saveAs') }}</ElButton>
      <ElButton @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
    </template>
    <div :class="{ 'read-only': isReadOnly }">
      <EspForm v-if="!stagesOnly" ref="formRef" v-model="state.baseForm" />
      <el-row v-if="!stagesOnly && !isTemplate && !isSystemTemplate && accessReady && !isReadOnly" :gutter="20" class="share-section">
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
        <el-col :span="18">
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
      <p v-if="stagesOnly && previewError" role="alert">{{ $t('recruitmentPipeline.previewLoadError') }}</p>
      <el-row v-else :gutter="20" class="view-content" v-loading="stagesOnly && previewLoading">
        <el-col v-if="!stagesOnly" :span="6">
          <div class="step-panel">
            <div class="title">{{ $t('recruitmentPipeline.stageTypes') }}</div>
            <div class="content" ref="roundTypeRef">
              <div class="step" v-for="item in state.roundTypeList" :key="item.value">
                <div class="left-border"></div>
                <div class="step-content">
                  <div class="step-title">{{ item.label }}</div>
                  <div>{{ item.subLabel }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="stagesOnly ? 24 : 18">
          <div class="process-panel">
            <div class="title">{{ $t(stagesOnly ? 'recruitmentPipeline.recruitmentPlanStages' : 'recruitmentPipeline.addedStages') }}</div>
            <div v-if="!stagesOnly">{{ $t('recruitmentPipeline.dragProcess') }}</div>
            <div class="content">
              <div ref="processRef">
                <div
                  class="process-box"
                  :class="{
                    'fixed-round': !isCustomRound(item),
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
                      <div class="order" v-if="item.round_type !== '' && isCustomRound(item)"></div>
                    </el-col>
                    <el-col :span="8">
                      <el-dropdown trigger="click" :teleported="false" :disabled="isReadOnly || !isCustomRound(item)">
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
                                :readonly="isReadOnly"
                                class="inline-input inline-title"
                                maxlength="30"
                                :placeholder="roundTypeOf(item.round_type)?.subLabel"
                              />
                              <el-input
                                v-if="!stagesOnly || item.description?.trim()"
                                v-model="item.description"
                                :readonly="isReadOnly"
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
                              v-for="session in state.roundTypeList"
                              :key="session.value"
                              :class="session.value === item.round_type ? 'active' : ''"
                              @click="setRoundType(item, session.value)"
                              >{{ session.label }}</el-dropdown-item
                            >
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </el-col>
                    <el-col :span="14" v-if="item.round_type !== ''"></el-col>
                    <el-col :span="1" class="center" v-if="item.round_type !== '' && isCustomRound(item)">
                      <i class="iconfont icon-delete" @click="deleteRound(index)"></i>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <div v-if="!isReadOnly" class="process-box">
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
                            v-for="session in state.roundTypeList"
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
  </component>
</template>
<script setup lang="ts" name="RecruitmentPipelineForm">
import { cloneDeep } from 'lodash-es'
import EspMain from '@/components/EspMain/index.vue'
import { RECRUITMENT_PIPELINE_FORM } from '../data'
import { generateUUID, getObjectByForms } from '@/utils'
import { useLocale } from '@/hooks/useLocale'
import { ROUTER_SETTINGS_RECRUITMENT_PIPELINE } from '@/router/routerName'
import {
  getRecruitmentPipelineDetail,
  getRecruitmentPipelineRoundTypes,
  createRecruitmentPipeline,
  createRecruitmentPipelineTemplate,
  saveAsRecruitmentPipeline,
  updateRecruitmentPipeline,
  updateRecruitmentPipelineTemplate
} from '@/api/modules/recruitmentPipeline'
import RecruitmentPipeline from '@/api/interface/recruitmentPipeline'
import Sortable from 'sortablejs'
import { getUserList } from '@/api/modules/common'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { useGlobalStore } from '@/store/modules/global'
import { UserPermissionEnum } from '@/enums/userPermission'
interface ParamsProps {
  title: string
  id?: string
  isEdit: boolean
  readOnly?: boolean
  stagesOnly?: boolean
  isTemplate?: boolean // create a system template
}

interface ReactiveParams {
  baseForm: Form.FormItem[]
  processList: RecruitmentPipeline.RoundParam[]
  isDragOver: boolean
  dragIndex: number
  dropAfter: boolean
  roundTypeList: Form.FormSelect[] // custom types only: the ones users may add
  allRoundTypes: Form.FormSelect[]
  userList: Form.FormSelect[]
  shareMode: 'none' | 'everyone' | 'users'
  shareUserIds: (string | number)[]
}
const router = useRouter()
const { $t } = useLocale()

const formRef = ref()
const processRef = ref()
const roundTypeRef = ref()

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false,
  readOnly: false,
  isTemplate: false,
  stagesOnly: false
})
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(RECRUITMENT_PIPELINE_FORM),
  processList: [],
  isDragOver: false,
  dragIndex: 0,
  dropAfter: false,
  roundTypeList: [] as Form.FormSelect[],
  allRoundTypes: [] as Form.FormSelect[],
  userList: [] as Form.FormSelect[],
  shareMode: 'none',
  shareUserIds: []
})

const isSystemTemplate = ref(false)
const previewLoading = ref(false)
const previewError = ref(false)

// A pipeline opened for editing is read-only unless the signed-in user is its owner
const planOwnerId = ref<string | number | null>(null)
// In edit mode the buttons stay hidden until the plan and user list have loaded, so they don't flash on read-only pages
const detailLoaded = ref(false)
const usersLoaded = ref(false)
const accessReady = computed(() => !props.isEdit || (detailLoaded.value && usersLoaded.value))
const globalStore = useGlobalStore()
const selfUserId = computed(() => {
  const email = (globalStore.userInfo?.email ?? globalStore.email ?? '').toLowerCase()
  return state.userList.find(u => (u.subLabel ?? '').toLowerCase() === email)?.value
})
const isReadOnly = computed(() => {
  if (props.readOnly) return true
  if (!props.isEdit || planOwnerId.value == null || selfUserId.value == null) return false
  if (String(planOwnerId.value) === String(selfUserId.value)) return false
  // Admins may edit pipelines they don't own: rpta for normal pipelines, rptsa for system templates
  const admin = isSystemTemplate.value ? UserPermissionEnum.RPTSA : UserPermissionEnum.RPTA
  return !globalStore.permissions.includes(admin)
})

const shareUserOptions = computed(() => state.userList)

const onShareModeChange = () => {
  state.shareUserIds = []
}

// Truncated tags show their full text as a native tooltip on hover
const showFullTagText = (e: MouseEvent) => {
  const el = (e.target as HTMLElement)?.closest?.('.el-select__tags-text') as HTMLElement | null
  if (el && !el.title) el.title = el.textContent?.trim() ?? ''
}

// Validates the form and builds the request payload; returns null when invalid
const buildPayload = async (): Promise<RecruitmentPipeline.SaveParam | null> => {
  const isBasicPass = formRef.value.validateFrom && (await formRef.value.validateFrom())
  if (!isBasicPass) return null
  const processList = state.processList
  if (processList.length === 0) {
    ElMessage.error($t('message.processLimit'))
    return null
  }
  if (processList.length > MAX_ROUNDS) {
    ElMessage.error($t('message.stagesMaxLimit'))
    return null
  }
  const sharing = !props.isTemplate && !isSystemTemplate.value
  if (sharing && state.shareMode === 'users' && state.shareUserIds.length === 0) {
    ElMessage.error($t('interviewProcess.shareUsersRequired'))
    return null
  }
  const formData: RecruitmentPipeline.SaveParam = { ...getObjectByForms(state.baseForm) }
  if (sharing) {
    formData.is_public = state.shareMode === 'everyone'
    formData.shared_with_user_ids =
      state.shareMode === 'users' ? state.shareUserIds.map(String) : null
  }
  formData.rounds = processList.map((data, index) => ({
    round_type: data.round_type,
    name: data.name,
    description: data.description,
    order: index
  }))
  return formData
}

const submit = (
  request: (data: RecruitmentPipeline.SaveParam) => Promise<any>,
  formData: RecruitmentPipeline.SaveParam
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
    submit(
      isSystemTemplate.value ? updateRecruitmentPipelineTemplate : updateRecruitmentPipeline,
      formData
    )
  } else {
    submit(
      props.isTemplate ? createRecruitmentPipelineTemplate : createRecruitmentPipeline,
      formData
    )
  }
}

// Save the current content as a new pipeline under a name entered in a dialog
const saveAs = async () => {
  const formData = await buildPayload()
  if (!formData) return
  try {
    const { value } = await ElMessageBox.prompt(
      $t('recruitmentPipeline.saveAsName'),
      $t('interviewProcess.saveAs'),
      {
        confirmButtonText: $t('button.confirm'),
        cancelButtonText: $t('button.cancel'),
        inputValue: '',
        inputPlaceholder: $t('interviewProcess.interviewName'),
        inputValidator: (val: string) => (val ?? '').trim().length > 0 || $t('form.required'),
        inputErrorMessage: $t('form.required')
      }
    )
    formData.name = value.trim()
    delete formData.id
    submit(saveAsRecruitmentPipeline, formData)
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
    path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE}`
  })
}

const initData = async () => {
  if (props.id) {
    const res = await getRecruitmentPipelineDetail(props.id)
    if (!res.success || !res.result) {
      throw new Error(res.message || 'Recruitment pipeline detail is missing')
    }
    const result = res.result
    isSystemTemplate.value = !!result.is_system_template
    planOwnerId.value = result.owner_id ?? null
    detailLoaded.value = true
    const sharedIds = (result.shared_with_user_ids ?? result.share_to ?? []).map(u =>
      typeof u === 'object' ? u.id : u
    ) as (string | number)[]
    state.shareUserIds = result.is_public ? [] : sharedIds
    state.shareMode = result.is_public ? 'everyone' : sharedIds.length ? 'users' : 'none'
    state.baseForm.forEach((item: Form.FormItem) => {
      item.value = (result as any)?.[item.prop as string]
      formRef.value?.changeFormModel({ prop: item.prop, value: item.value })
    })
    state.processList = (result.rounds ?? []).map(data => ({
      id: data.id,
      round_type: Number(data.round_type),
      name: data.name,
      description: data.description,
      order: data.order
    }))
  }
}
const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  state.isDragOver = true
  state.dragIndex = index
}
const handleDragLeave = () => {
  state.isDragOver = false
}
// Over an added stage: the upper half inserts before it, the lower half after it
const handleRoundDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  state.isDragOver = true
  state.dragIndex = index
  state.dropAfter = event.clientY > rect.top + rect.height / 2
}

// A new round's name starts as the type's description; the round description starts empty
const MAX_ROUNDS = 10
// Shows a warning and returns true when no more stages can be added
const isAtMaxRounds = () => {
  if (state.processList.length < MAX_ROUNDS) return false
  ElMessage.warning($t('message.stagesMaxLimit'))
  return true
}

const newRound = (value: number): RecruitmentPipeline.RoundParam => ({
  id: generateUUID(),
  round_type: value,
  name: roundTypeOf(value)?.subLabel,
  description: ''
})

// Changes the type of a round; the name follows the type's description only if the user hasn't customised it
const changeRoundType = (item: RecruitmentPipeline.RoundParam, value: number) => {
  const oldType = roundTypeOf(item.round_type)
  if (!item.name || item.name === oldType?.subLabel) item.name = roundTypeOf(value)?.subLabel
  item.round_type = value
}

const setRoundType = (item: RecruitmentPipeline.RoundParam | null, value: number) => {
  if (!item) {
    if (isAtMaxRounds()) return
    state.processList.push(newRound(value))
    return
  }
  changeRoundType(item, value)
}

const deleteRound = (index: number) => {
  state.processList.splice(index, 1)
}

const roundTypeOf = (value: unknown) => state.allRoundTypes.find(type => type.value === value)

// Only custom stages can be removed, reordered or have their type changed
const isCustomRound = (item: RecruitmentPipeline.RoundParam) =>
  !!(roundTypeOf(item.round_type) as any)?.isCustom

const loadRoundTypes = async () => {
  const res = await getRecruitmentPipelineRoundTypes()
  const types = (res?.result ?? []).map(type => ({
    value: type.id,
    label: type.name,
    subLabel: type.description,
    isCustom: !!(type.is_custom ?? type.isCustom)
  }))
  state.allRoundTypes = types
  state.roundTypeList = types.filter(type => type.isCustom)
  // New pipelines start with every core (non-custom) stage in place
  if (!props.isEdit) {
    state.processList = types
      .filter(type => !type.isCustom)
      .map(type => newRound(type.value as number))
  }
}

onMounted(async () => {
  if (props.stagesOnly) {
    previewLoading.value = true
    try {
      await Promise.all([loadRoundTypes(), initData()])
    } catch (error) {
      previewError.value = true
      console.error('Failed to load recruitment pipeline stages', error)
    } finally {
      previewLoading.value = false
    }
    return
  }
  await loadRoundTypes()
  const userRes = await getUserList(ShareTypeEnum.INTERVIEWER)
  state.userList = (userRes?.result ?? []).map(user => ({
    label: user.name,
    value: user.id,
    subLabel: user.email
  }))
  usersLoaded.value = true
  // Drag to reorder the added rounds
  const listWithHandle = processRef.value
  if (!Sortable.get(listWithHandle)) {
    Sortable.create(listWithHandle, {
      handle: '.order',
      // core stages never move themselves, but custom stages can be dropped anywhere
      filter: '.fixed-round',
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

  // Drag a round type onto the added rounds
  const roundTypeHtml = roundTypeRef.value
  if (!Sortable.get(roundTypeHtml)) {
    Sortable.create(roundTypeHtml, {
      handle: '.step',
      group: {
        name: 'shared',
        pull: 'clone',
        put: false
      },
      sort: false,
      ghostClass: 'blue-background-class',
      onStart() {
        state.isDragOver = false
      },
      onEnd(evt: Sortable.SortableEvent) {
        if (state.isDragOver && !isAtMaxRounds()) {
          const newIndex = evt.newIndex as number
          const round_type = state.roundTypeList?.[newIndex]?.value
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
// Insertion line shown while dragging a stage type over an added stage
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
