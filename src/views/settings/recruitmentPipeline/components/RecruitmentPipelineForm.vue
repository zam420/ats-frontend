<template>
  <EspMain :title="title">
    <template #right v-if="!readOnly">
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton v-if="isEdit" @click="saveAs" class="btn-light">{{ $t('interviewProcess.saveAs') }}</ElButton>
      <ElButton @click="save" class="btn-primary-gradient">{{ $t('button.save') }}</ElButton>
    </template>
    <div :class="{ 'read-only': readOnly }">
      <EspForm ref="formRef" v-model="state.baseForm" />
      <el-row :gutter="20" class="view-content">
        <el-col :span="6">
          <div class="step-panel">
            <div class="title">{{ $t('interviewProcess.interviewSessions') }}</div>
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
        <el-col :span="18">
          <div class="process-panel">
            <div class="title">{{ $t('interviewProcess.addedRounds') }}</div>
            <div>{{ $t('recruitmentPipeline.dragProcess') }}</div>
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
  </EspMain>
</template>
<script setup lang="ts" name="RecruitmentPipelineForm">
import { cloneDeep } from 'lodash-es'
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

interface ParamsProps {
  title: string
  id?: string
  isEdit: boolean
  readOnly?: boolean
  isTemplate?: boolean // create a system template
}

interface ReactiveParams {
  baseForm: Form.FormItem[]
  processList: RecruitmentPipeline.RoundParam[]
  isDragOver: boolean
  dragIndex: number
  roundTypeList: Form.FormSelect[]
}
const router = useRouter()
const { $t } = useLocale()

const formRef = ref()
const processRef = ref()
const roundTypeRef = ref()

const props = withDefaults(defineProps<ParamsProps>(), {
  isEdit: false,
  readOnly: false,
  isTemplate: false
})
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(RECRUITMENT_PIPELINE_FORM),
  processList: [],
  isDragOver: false,
  dragIndex: 0,
  roundTypeList: [] as Form.FormSelect[]
})

const isSystemTemplate = ref(false)

// Validates the form and builds the request payload; returns null when invalid
const buildPayload = async (): Promise<RecruitmentPipeline.SaveParam | null> => {
  const isBasicPass = formRef.value.validateFrom && (await formRef.value.validateFrom())
  if (!isBasicPass) return null
  const processList = state.processList
  if (processList.length === 0) {
    ElMessage.error($t('message.processLimit'))
    return null
  }
  const formData: RecruitmentPipeline.SaveParam = { ...getObjectByForms(state.baseForm) }
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

const initData = () => {
  if (props.id) {
    getRecruitmentPipelineDetail(props.id).then(res => {
      const result = (res.result ?? {}) as RecruitmentPipeline.DetailInfo
      isSystemTemplate.value = !!result.is_system_template
      state.baseForm.forEach((item: Form.FormItem) => {
        item.value = (result as any)?.[item.prop as string]
        formRef.value?.changeFormModel({ prop: item.prop, value: item.value })
      })
      state.processList = (result?.rounds ?? []).map(data => ({
        id: data.id,
        round_type: Number(data.round_type),
        name: data.name,
        description: data.description,
        order: data.order
      }))
    })
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

// A new round's name starts as the type's description; the round description starts empty
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
    state.processList.push(newRound(value))
    return
  }
  changeRoundType(item, value)
}

const deleteRound = (index: number) => {
  state.processList.splice(index, 1)
}

const roundTypeOf = (value: unknown) => state.roundTypeList.find(type => type.value === value)

const loadRoundTypes = async () => {
  const res = await getRecruitmentPipelineRoundTypes()
  state.roundTypeList = (res?.result ?? []).map(type => ({
    value: type.id,
    label: type.name,
    subLabel: type.description
  }))
}

onMounted(async () => {
  await loadRoundTypes()
  // Drag to reorder the added rounds
  const listWithHandle = processRef.value
  if (!Sortable.get(listWithHandle)) {
    Sortable.create(listWithHandle, {
      handle: '.order',
      ghostClass: 'blue-background-class',
      onEnd(evt: Sortable.SortableEvent) {
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
        if (state.isDragOver) {
          const newIndex = evt.newIndex as number
          const round_type = state.roundTypeList?.[newIndex]?.value
          if (state.dragIndex === -1) {
            state.processList.push(newRound(round_type as number))
          } else {
            changeRoundType(state.processList[state.dragIndex], round_type as number)
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
  .icon-delete,
  .plus,
  .order {
    visibility: hidden;
  }
}
</style>
