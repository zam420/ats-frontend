<template>
  <EspMain :title="title">
    <template #right>
      <ElButton @click="goBack">{{ $t('button.cancel') }}</ElButton>
      <ElButton v-if="ready && canWrite && isEdit && has(SQTC)" class="btn-light" @click="saveAs">{{ $t('interviewProcess.saveAs') }}</ElButton>
      <ElButton v-if="ready && canWrite" class="btn-primary-gradient" :loading="saving" @click="save">{{ $t('button.save') }}</ElButton>
    </template>
    <div v-loading="loading">
      <template v-if="ready">
        <el-form ref="formRef" class="screening-form" :model="form" label-position="top" require-asterisk-position="right" :disabled="!canWrite">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="$t('screeningForms.name')" prop="name" :rules="[{ required: true, whitespace: true, message: $t('form.required'), trigger: 'blur' }]">
                <el-input v-model="form.name" maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="ownerVisible ? 12 : 18">
              <el-form-item :label="$t('interviewProcess.description')">
                <el-input v-model="form.description" maxlength="300" />
              </el-form-item>
            </el-col>
            <el-col v-if="ownerVisible" :span="6">
              <el-form-item :label="$t('interviewProcess.planOwner')">
                <el-select v-model="form.owner_id" filterable>
                  <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="!isTemplate && canWrite" :gutter="20" class="share-section">
            <el-col :span="6" class="share-controls">
              <div class="share-label">{{ $t('interviewProcess.shareWith') }}</div>
              <el-radio-group v-model="shareMode" @change="form.shared_with_user_ids = []">
                <el-tooltip :content="$t('interviewProcess.shareNoneHint')" placement="top"><el-radio label="none">{{ $t('interviewProcess.shareNone') }}</el-radio></el-tooltip>
                <el-tooltip :content="$t('interviewProcess.shareEveryoneHint')" placement="top"><el-radio label="everyone">{{ $t('interviewProcess.shareEveryone') }}</el-radio></el-tooltip>
                <el-tooltip :content="$t('interviewProcess.shareUsersHint')" placement="top"><el-radio label="users">{{ $t('interviewProcess.shareUsers') }}</el-radio></el-tooltip>
              </el-radio-group>
            </el-col>
            <el-col :span="ownerVisible ? 12 : 18">
              <el-select v-model="form.shared_with_user_ids" class="share-users" multiple filterable collapse-tags collapse-tags-tooltip
                :disabled="!canWrite || shareMode !== 'users'" :placeholder="$t('interviewProcess.shareUsersPlaceholder')">
                <el-option v-for="user in shareableUsers" :key="user.id" :label="`${user.name} (${user.email})`" :value="user.id" />
              </el-select>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="view-content">
            <el-col v-if="canWrite" :span="6">
              <div class="step-panel">
                <div class="title">{{ $t('screeningForms.questionTypes') }}</div>
                <div ref="typeList" class="content">
                  <div v-for="type in types" :key="type.id" class="step">
                    <div class="left-border"></div>
                    <div class="step-content">
                      <div class="step-title"><el-icon><component :is="typeIcon(type.code)" /></el-icon> {{ type.name }}</div>
                      <div>{{ type.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="canWrite ? 18 : 24">
              <div class="process-panel">
                <div class="title">{{ $t('screeningForms.questions') }}</div>
                <div v-if="canWrite">{{ $t('screeningForms.dragQuestions') }}</div>
                <div ref="questionList" class="content">
                  <div v-for="(question, index) in form.questions" :key="question.key" class="process-box"
                    :data-question-key="question.key"
                    :class="{ 'drop-before': dropTarget?.key === question.key && !dropTarget.after, 'drop-after': dropTarget?.key === question.key && dropTarget.after }">
                    <el-row :gutter="20">
                      <el-col :span="1" class="center">
                        <div v-if="canWrite" class="order"></div>
                      </el-col>
                      <el-col :span="canWrite ? 22 : 23" class="question-preview">
                        <div class="question-label">
                          <span class="question-label-field">
                            <span class="question-label-measure" aria-hidden="true">{{ question.label || $t('screeningForms.questionLabelPlaceholder') }}</span>
                            <el-input v-model="question.label" class="inline-input inline-title" maxlength="100" :placeholder="$t('screeningForms.questionLabelPlaceholder')" />
                          </span>
                          <span v-if="question.is_mandatory && !forcedReadOnly" class="required-marker" :title="$t('screeningForms.mandatory')" :aria-label="$t('screeningForms.mandatory')">*</span>
                        </div>
                        <el-input v-if="typeOf(question)?.code === 'INPUT'" disabled :placeholder="$t('screeningForms.answerPreview')" />
                        <el-input v-else-if="typeOf(question)?.code === 'INPUTAREA'" type="textarea" disabled :placeholder="$t('screeningForms.answerPreview')" />
                        <ChoiceOptions v-else-if="isInlineChoice(question)" :options="question.options ?? []" :default-option="question.default_option"
                          :marker="typeOf(question)?.code === 'CHK' ? 'checkbox' : 'radio'" :can-write="canWrite" :require-one="true"
                          @rename="(index, value) => renameOption(question, index, value)" @remove="index => removeOption(question, index)"
                          @toggle-default="option => toggleDefault(question, option)" />
                        <el-select v-else-if="typeOf(question)?.code === 'DD'" disabled :multiple="!!question.is_drop_down_multi_select"
                          :model-value="question.is_drop_down_multi_select ? (question.default_option == null ? [] : [question.default_option]) : question.default_option"
                          :placeholder="$t('screeningForms.answerPreview')">
                          <el-option v-for="(option, optionIndex) in question.options ?? []" :key="optionIndex" :label="option" :value="option" />
                        </el-select>
                        <p v-else role="alert">{{ $t('screeningForms.unsupportedType') }}</p>
                        <ChoiceOptions v-if="typeOf(question)?.code === 'DD'" :options="question.options ?? []" :default-option="question.default_option"
                          :can-write="canWrite" :require-one="true" @rename="(index, value) => renameOption(question, index, value)"
                          @remove="index => removeOption(question, index)" @toggle-default="option => toggleDefault(question, option)" />
                        <el-input v-model="question.description" class="inline-input inline-description" maxlength="200" :placeholder="$t('interviewProcess.roundDescPlaceholder')" />
                        <ElButton v-if="isChoiceQuestion(question) && canWrite" text type="primary" :disabled="(question.options?.length ?? 0) >= 20" @click="addOption(question)">{{ $t('screeningForms.addOption') }}</ElButton>
                      </el-col>
                      <el-col v-if="canWrite" :span="1" class="center question-actions">
                        <button v-if="typeOf(question)?.code === 'DD'" type="button" class="multi-select-toggle" :class="{ 'is-on': question.is_drop_down_multi_select }"
                          :aria-label="$t('screeningForms.multiSelect')" :title="$t('screeningForms.multiSelect')"
                          :aria-pressed="!!question.is_drop_down_multi_select" @click="question.is_drop_down_multi_select = !question.is_drop_down_multi_select">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="m3 6 1.5 1.5L7 5m3 1.5h11M3 13l1.5 1.5L7 12m3 1.5h11M4 20h3m3 0h11" />
                          </svg>
                        </button>
                        <button type="button" class="default-switch" role="switch" :class="{ 'is-on': question.is_mandatory }"
                          :aria-label="$t('screeningForms.mandatory')" :title="$t('screeningForms.mandatory')"
                          :aria-checked="!!question.is_mandatory" @click="question.is_mandatory = !question.is_mandatory"><span></span></button>
                        <i class="iconfont icon-delete" role="button" tabindex="0" :aria-label="$t('opt.delete')" :title="$t('opt.delete')" @click="form.questions.splice(index, 1)" @keydown.enter.prevent="form.questions.splice(index, 1)" @keydown.space.prevent="form.questions.splice(index, 1)"></i>
                      </el-col>
                    </el-row>
                  </div>
                </div>
                <div v-if="canWrite" ref="addQuestionBox" class="process-box add-question-box" :class="{ 'drop-append': dropOnAdd }">
                  <el-dropdown trigger="click" :teleported="false">
                    <div class="add-select" :aria-label="$t('screeningForms.add')" tabindex="0"><div class="plus"></div></div>
                    <template #dropdown><el-dropdown-menu><el-dropdown-item v-for="type in types" :key="type.id" @click="addQuestion(type.id)"><el-icon><component :is="typeIcon(type.code)" /></el-icon>{{ type.name }}</el-dropdown-item></el-dropdown-menu></template>
                  </el-dropdown>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </template>
    </div>
  </EspMain>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import Sortable from 'sortablejs'
import { EditPen, Document, Select, CircleCheck, ArrowDown, More } from '@element-plus/icons-vue'
import ChoiceOptions from './ChoiceOptions.vue'
import type User from '@/api/interface/user'
import type { ScreeningFormRequest, ScreeningQuestion, ScreeningQuestionType } from '@/api/interface/screeningQuestionsForm'
import { getUserList } from '@/api/modules/common'
import { getScreeningForm, getScreeningQuestionTypes, createScreeningForm, createScreeningFormTemplate, updateScreeningForm, updateScreeningFormTemplate, saveAsScreeningForm } from '@/api/modules/screeningQuestionsForm'
import { UserPermissionEnum } from '@/enums/userPermission'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { useLocale } from '@/hooks/useLocale'
import { useGlobalStore } from '@/store/modules/global'
import { ROUTER_SETTINGS_SCREENING_FORMS } from '@/router/routerName'

type Question = ScreeningQuestion & { key: number }
const { SQTC, SQTE, SQTA, SQTSA } = UserPermissionEnum
const { $t } = useLocale()
const route = useRoute()
const router = useRouter()
const store = useGlobalStore()
const has = (permission: UserPermissionEnum) => store.permissions.includes(permission)
const isEdit = computed(() => route.name !== 'ROUTER_SETTINGS_SCREENING_FORMS_CREATE')
const forcedReadOnly = computed(() => route.name === 'ROUTER_SETTINGS_SCREENING_FORMS_VIEW' || route.query.readonly === '1')
const systemTemplate = ref(route.query.template === '1')
const isTemplate = computed(() => systemTemplate.value)
const ownerVisible = computed(() => has(SQTA) && !isTemplate.value)
const canWrite = computed(() => {
  if (forcedReadOnly.value) return false
  if (!isEdit.value) return isTemplate.value ? has(SQTSA) : has(SQTC)
  if (isTemplate.value) return has(SQTSA)
  return has(SQTE) && (has(SQTA) || (!!store.userInfo?.id && store.userInfo.id === originalOwner.value))
})
const title = computed(() => $t(!isEdit.value ? 'screeningForms.create' : canWrite.value ? 'screeningForms.edit' : 'screeningForms.view'))
const formRef = ref<FormInstance>()
const questionList = ref<HTMLElement>()
const typeList = ref<HTMLElement>()
const addQuestionBox = ref<HTMLElement>()
let sortable: Sortable | undefined
let typeSortable: Sortable | undefined
const dropTarget = ref<{ key: number; after: boolean } | null>(null)
const dropOnAdd = ref(false)
const startDrag = () => {
  dropTarget.value = null
  document.body.classList.add('screening-question-dragging')
}
const endDrag = () => {
  dropTarget.value = null
  dropOnAdd.value = false
  document.removeEventListener('mousemove', trackTypeDrag)
  document.removeEventListener('touchmove', trackTypeDrag)
  document.body.classList.remove('screening-question-dragging')
}
const trackTypeDrag = (event: MouseEvent | TouchEvent) => {
  const point = 'touches' in event ? event.touches[0] : event
  if (!point) return
  const element = document.elementFromPoint(point.clientX, point.clientY)
  const target = element?.closest<HTMLElement>('.process-box[data-question-key]')
  const key = target?.dataset.questionKey
  dropOnAdd.value = !!element && !!addQuestionBox.value?.contains(element)
  dropTarget.value = target && questionList.value?.contains(target) && key != null
    ? { key: Number(key), after: point.clientY > target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2 }
    : null
}
const showDropTarget = (event: Sortable.MoveEvent) => {
  const target = event.related.closest<HTMLElement>('.process-box[data-question-key]')
  const key = target?.dataset.questionKey
  dropTarget.value = target && questionList.value?.contains(target) && key != null
    ? { key: Number(key), after: event.willInsertAfter === true }
    : null
}
const loading = ref(true)
const ready = ref(false)
const saving = ref(false)
const types = ref<ScreeningQuestionType[]>([])
const users = ref<User.UserInfo[]>([])
const originalOwner = ref<string | null>(null)
const shareMode = ref<'none' | 'everyone' | 'users'>('none')
const shareableUsers = computed(() => users.value.filter(user => user.id !== form.owner_id))
let nextKey = 0
const form = reactive({
  name: '',
  description: '',
  owner_id: '',
  shared_with_user_ids: [] as string[],
  questions: [] as Question[]
})

const typeOf = (question: Question) => types.value.find(type => type.id === question.screening_question_type)
const typeIcon = (code: string) => ({
  INPUT: EditPen, INPUTAREA: Document, CHK: Select, RDO: CircleCheck, DD: ArrowDown
}[code] ?? More)
const isChoiceQuestion = (question: Question) => ['CHK', 'RDO', 'DD'].includes(typeOf(question)?.code ?? '')
const isInlineChoice = (question: Question) => ['CHK', 'RDO'].includes(typeOf(question)?.code ?? '')
const addOption = (question: Question) => {
  if (!question.options) question.options = []
  if (question.options.length >= 20) return
  let number = question.options.length + 1
  while (question.options.includes(`Option${number}`)) number++
  question.options.push(`Option${number}`)
}
const removeOption = (question: Question, index: number) => {
  if (isChoiceQuestion(question) && (question.options?.length ?? 0) <= 1) return
  const removed = question.options?.[index]
  question.options?.splice(index, 1)
  if (removed != null && question.default_option === removed) question.default_option = null
}
const renameOption = (question: Question, index: number, value: string) => {
  if (!question.options) return
  const oldValue = question.options[index]
  question.options[index] = value
  if (question.default_option === oldValue) question.default_option = value
}
const toggleDefault = (question: Question, option: string) => {
  question.default_option = question.default_option === option ? null : option
}
const addQuestion = (typeId: number, index = form.questions.length) => {
  if (!canWrite.value) return
  if (form.questions.length >= 10) {
    ElMessage.warning($t('screeningForms.maxQuestions'))
    return
  }
  const type = types.value.find(item => item.id === typeId)
  if (!type) return
  form.questions.splice(index, 0, {
    key: nextKey++, screening_question_type: type.id,
    label: '', description: '', order: index,
    options: ['CHK', 'RDO', 'DD'].includes(type.code) ? ['Option1'] : null,
    default_option: null, is_mandatory: false, is_drop_down_multi_select: false, max_chars: null
  })
}
const goBack = () => router.replace(`/${ROUTER_SETTINGS_SCREENING_FORMS}`)

const buildPayload = async (): Promise<ScreeningFormRequest | null> => {
  if (!canWrite.value || !formRef.value || !(await formRef.value.validate().catch(() => false))) return null
  if (!form.questions.length) {
    ElMessage.error($t('screeningForms.minQuestions'))
    return null
  }
  if (form.questions.length > 10) {
    ElMessage.error($t('screeningForms.maxQuestions'))
    return null
  }
  if (form.questions.some(question => !question.label?.trim())) {
    ElMessage.error($t('screeningForms.questionLabelRequired'))
    return null
  }
  if (form.questions.some(question => isChoiceQuestion(question) && question.options?.some(option => !option.trim()))) {
    ElMessage.error($t('screeningForms.optionRequired'))
    return null
  }
  if (form.questions.some(question => isChoiceQuestion(question) && question.options && new Set(question.options).size !== question.options.length)) {
    ElMessage.error($t('screeningForms.duplicateOptions'))
    return null
  }
  if (!isTemplate.value && shareMode.value === 'users' && !form.shared_with_user_ids.length) {
    ElMessage.error($t('interviewProcess.shareUsersRequired'))
    return null
  }
  return {
    name: form.name.trim(),
    description: form.description,
    ...(!isTemplate.value ? {
      owner_id: form.owner_id,
      is_public: shareMode.value === 'everyone',
      shared_with_user_ids: shareMode.value === 'users' ? form.shared_with_user_ids : null
    } : {}),
    questions: form.questions.map((question, index) => ({
      label: question.label.trim(),
      description: question.description,
      screening_question_type_id: question.screening_question_type,
      order: index,
      options: question.options,
      default_option: question.default_option,
      is_mandatory: question.is_mandatory,
      is_drop_down_multi_select: question.is_drop_down_multi_select,
      max_chars: question.max_chars
    }))
  }
}
const submit = async (payload: ScreeningFormRequest, saveCopy = false) => {
  if (saving.value) return
  saving.value = true
  try {
    const request = saveCopy ? saveAsScreeningForm : isEdit.value
      ? isTemplate.value ? updateScreeningFormTemplate : updateScreeningForm
      : isTemplate.value ? createScreeningFormTemplate : createScreeningForm
    const result = await request(payload)
    if (!result?.success) throw new Error(result?.message || 'Save failed')
    ElMessage.success($t('message.saveSuc'))
    await goBack()
  } catch (error) {
    console.error('Failed to save screening questions form', error)
    ElMessage.error($t('screeningForms.saveError'))
  } finally {
    saving.value = false
  }
}
const save = async () => {
  const payload = await buildPayload()
  if (!payload) return
  if (isEdit.value && typeof route.params.id === 'string') payload.id = route.params.id
  await submit(payload)
}
const saveAs = async () => {
  const payload = await buildPayload()
  if (!payload) return
  let name: string
  try {
    const result = await ElMessageBox.prompt($t('screeningForms.saveAsName'), $t('interviewProcess.saveAs'), {
      confirmButtonText: $t('button.confirm'), cancelButtonText: $t('button.cancel'),
      inputValidator: (value: string) => !!value?.trim() || $t('form.required')
    })
    name = result.value.trim()
  } catch {
    return
  }
  payload.name = name
  payload.owner_id = store.userInfo?.id
  payload.is_public = false
  payload.shared_with_user_ids = null
  await submit(payload, true)
}
onMounted(async () => {
  try {
    const [typesResult, usersResult] = await Promise.all([getScreeningQuestionTypes(), getUserList(ShareTypeEnum.INTERVIEWER)])
    if (!typesResult?.result || !usersResult?.result) throw new Error('Question types or users are missing')
    types.value = typesResult.result
    users.value = usersResult.result
    form.owner_id = store.userInfo?.id ?? ''
    if (isEdit.value) {
      if (typeof route.params.id !== 'string') throw new Error('Form ID is missing')
      const result = await getScreeningForm(route.params.id)
      const detail = result?.result
      if (!detail || !Array.isArray(detail.questions)) throw new Error('Form details are missing')
      if (detail.questions.some(question => !Object.prototype.hasOwnProperty.call(question, 'default_option'))) {
        throw new Error('Question default options are missing from the response')
      }
      originalOwner.value = detail.owner_id ?? null
      systemTemplate.value = detail.is_system_template
      form.name = detail.name
      form.description = detail.description ?? ''
      form.owner_id = detail.owner_id ?? ''
      form.shared_with_user_ids = detail.shared_with_user_ids ?? []
      shareMode.value = detail.is_public ? 'everyone' : form.shared_with_user_ids.length ? 'users' : 'none'
      form.questions = [...detail.questions].sort((a, b) => a.order - b.order).map(question => {
        const code = types.value.find(type => type.id === question.screening_question_type)?.code
        const options = ['CHK', 'RDO', 'DD'].includes(code ?? '') && !question.options?.length
          ? ['Option1'] : question.options
        return { ...question, options, description: question.description ?? '', key: nextKey++ }
      })
    }
    ready.value = true
    await nextTick()
    if (canWrite.value && questionList.value) {
      sortable = Sortable.create(questionList.value, {
        group: { name: 'screening-questions', pull: false, put: false },
        handle: '.order',
        forceFallback: true,
        onStart: startDrag,
        onMove: showDropTarget,
        onEnd(event) {
          endDrag()
          if (event.oldIndex == null || event.newIndex == null || event.oldIndex === event.newIndex) return
          const [question] = form.questions.splice(event.oldIndex, 1)
          form.questions.splice(event.newIndex, 0, question)
        }
      })
      if (typeList.value) {
        typeSortable = Sortable.create(typeList.value, {
          group: { name: 'screening-types', pull: 'clone', put: false },
          sort: false,
          forceFallback: true,
          onStart() {
            startDrag()
            document.addEventListener('mousemove', trackTypeDrag)
            document.addEventListener('touchmove', trackTypeDrag)
          },
          onEnd(event) {
            const type = event.oldIndex == null ? undefined : types.value[event.oldIndex]
            const target = dropTarget.value
            const index = target ? form.questions.findIndex(question => question.key === target.key) : -1
            if (type && (dropOnAdd.value || index >= 0)) {
              addQuestion(type.id, dropOnAdd.value ? form.questions.length : index + (target?.after ? 1 : 0))
            }
            endDrag()
          }
        })
      }
    }
  } catch (error) {
    console.error('Failed to load screening questions form', error)
    ElMessage.error($t('screeningForms.loadingError'))
  } finally {
    loading.value = false
  }
})
onBeforeUnmount(() => {
  endDrag()
  sortable?.destroy()
  typeSortable?.destroy()
})
</script>
<style lang="less" scoped>
@import '../evaluationPlan/index.less';
.screening-form :deep(.el-form-item) { display: block; margin: 1em 0 0; }
.screening-form :deep(.el-form-item__label) { justify-content: flex-start; height: 2em; line-height: 2em; }
.screening-form :deep(.el-select) { width: 100%; }
.step-title .el-icon { vertical-align: middle; }
.inline-input :deep(.el-input__wrapper) { padding: 0 !important; background: transparent; box-shadow: none; }
.inline-title :deep(.el-input__inner), .question-label-measure { font-family: var(--font-family-body); font-size: var(--el-font-size-base); font-weight: bold; letter-spacing: normal; }
.question-label { display: flex; align-items: center; }
.question-label-field { position: relative; display: inline-block; max-width: calc(100% - 12px); }
.question-label-measure { display: block; overflow: hidden; padding-right: 4px; white-space: pre; visibility: hidden; }
.question-label-field .inline-title { position: absolute; inset: 0; width: 100%; }
.required-marker { color: var(--el-color-danger); margin-left: 4px; }
.inline-description :deep(.el-input__inner) { font-size: 12px; }
.question-preview > * { margin-bottom: 6px; }
.question-preview > :has(+ .inline-description) { margin-bottom: 0px; }
.process-panel > .content { min-height: 50px; }
.step-panel .step, .process-box .order { user-select: none; }
:global(body.screening-question-dragging), :global(body.screening-question-dragging *) { user-select: none !important; }
.process-box.drop-before { box-shadow: 0 -3px 0 0 var(--el-color-primary); }
.process-box.drop-after { box-shadow: 0 3px 0 0 var(--el-color-primary); }
.add-question-box.drop-append .add-select { border-color: var(--el-color-primary); }
.default-switch { position: relative; width: 38px; height: 22px; padding: 0; border: 0; border-radius: 11px; background: var(--el-border-color); cursor: pointer; }
.default-switch.is-on { background: var(--el-color-primary); }
.default-switch span { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; }
.default-switch.is-on span { transform: translateX(16px); }
.default-switch:focus-visible, .multi-select-toggle:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
.multi-select-toggle { display: flex; align-items: center; justify-content: center; width: 38px; height: 22px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: var(--el-text-color-placeholder); font-size: 22px; cursor: pointer; }
.multi-select-toggle svg { width: 22px; height: 22px; }
.multi-select-toggle.is-on { color: var(--el-color-primary); }
.view-content .process-panel .process-box .question-actions { flex-direction: column; gap: 10px; }
.add-question-box .el-dropdown { width: 35%; }
.btn-light { color: var(--el-color-primary); }
</style>
