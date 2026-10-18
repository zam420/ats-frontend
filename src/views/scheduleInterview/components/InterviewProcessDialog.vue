<template>
  <div class="dialog-form-wrap small">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="$t('interviewProcess.modifyInterview')"
      close-icon="CircleClose"
      @close="closeDialog()"
    >
      <div class="process-panel">
        <div class="process-drag-panel" ref="processRef">
          <div
            class="process-box"
            v-for="(item, index) in interviewProcessList"
            :key="`${item.id} ${index}`"
          >
            <el-row :gutter="20">
              <el-col :span="2" class="center">
                <div class="order" v-if="item.value !== ''"></div>
              </el-col>
              <el-col :span="20">
                <el-dropdown trigger="click" :disabled="item.status !== ScheduleViewStatusEnum.DRAFT">
                  <div
                    class="add-select"
                    @drop="evt => handleDragOver(evt, index)"
                    @dragover.prevent="evt => handleDragOver(evt, index)"
                    @dragleave="handleDragLeave"
                    :class="{
                      'no-border': item.value !== '',
                      active: isDragOver && dragIndex === index
                    }"
                  >
                    <div class="step">
                      <div class="left-border"></div>
                      <div class="step-content">
                        <div class="step-title">
                          {{ item.label }}
                        </div>
                        <div>{{ item.subLabel }}</div>
                      </div>
                    </div>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="session in interviewSessionList"
                        :key="session.value"
                        :class="session.value === item.value ? 'active' : ''"
                        @click="setRoundType(item, session.value)"
                        >{{ session.label }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-col>
              <el-col :span="2" class="center" v-if="item.value !== '' && item.status === ScheduleViewStatusEnum.DRAFT">
                <i class="iconfont icon-delete" @click="deleteRound(index)"></i>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="process-box">
          <el-row :gutter="20">
            <el-col :span="1" class="center"> </el-col>
            <el-col :span="8">
              <el-dropdown trigger="click">
                <div
                  class="add-select"
                  @drop="evt => handleDragOver(evt, -1)"
                  @dragover.prevent="evt => handleDragOver(evt, -1)"
                  @dragleave="handleDragLeave"
                  :class="{
                    active: isDragOver && dragIndex === -1
                  }"
                >
                  <div class="plus"></div>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="session in interviewSessionList"
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
      <template #footer>
        <ElButton @click="closeDialog()">
          {{ $t('button.cancel') }}
        </ElButton>
        <ElButton class="btn-primary-gradient" @click="confirm">
          {{ $t('button.confirm') }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="InterviewProcessDialog">
import { useLocale } from '@/hooks/useLocale'
import { InterviewSession } from '@/enums/interviewSessionEnum'
import { cloneDeep } from 'lodash'
import { enumItem2arr, generateUUID } from '@/utils'
import Sortable from 'sortablejs'
import { changeScheduleInterviewStep } from '@/api/modules/scheduleInterview'
import ScheduleInterview from '@/api/interface/scheduleInterview'
import { ResultEnum } from '@/enums/httpEnum'
import { ScheduleViewStatusEnum } from '@/enums/scheduleViewEnum'
interface DialogProps {
  interviewId?: number
  templateId?: number
  interviewType?: number
  jobId?: number
  selectUserResumeId?: number
  processList: any
  visible: boolean
}

const { $t } = useLocale()
const props = withDefaults(defineProps<DialogProps>(), {
  processList: [],
  visible: false
})
const emit = defineEmits(['close'])
// dialog框状态
const dialogVisible = ref<boolean>(false)
const interviewProcessList = ref<Form.FormSelect[]>(cloneDeep(props.processList))
const interviewSessionList = ref<Form.FormSelect[]>(enumItem2arr(InterviewSession))
const processRef = ref()

const isDragOver = ref<boolean>(false)
const dragIndex = ref<number>()

// 拖拽物移入/放下事件
const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  isDragOver.value = true
  dragIndex.value = index
}
// 拖拽物移出事件
const handleDragLeave = () => {
  isDragOver.value = false
}
const confirm = () => {
  if (interviewProcessList.value.length === 0) {
    ElMessage.error($t('message.processLimit'))
    return
  }
  const roundSetting: ScheduleInterview.RoundSetting[] = []
  interviewProcessList.value.forEach((data: Form.FormSelect, index) => {
    const info: ScheduleInterview.RoundSetting = {
      round_type: data.value,
      round_order: index
    }
    if (data.id && typeof data.id === 'number') {
      info.round_id = data.id
    }
    roundSetting.push(info)
  })
  const param: ScheduleInterview.StepParam = {
    candidate_resume_id: props.selectUserResumeId,
    interview_type: props.interviewType as number,
    target_job: props.jobId as number,
    round_settings: [...roundSetting],
    interview_template: props.templateId as number
  }
  if (props.interviewId) {
    param.interview_id = props.interviewId
  }
  changeScheduleInterviewStep(param).then(res => {
    if (res?.code === ResultEnum.SUCCESS) {
      const id = res?.result?.interview_id
      const rounds = res?.result?.rounds?.sort(
        (a: ScheduleInterview.RoundSetting, b: ScheduleInterview.RoundSetting) => {
          return (a.order as number) - (b.order as number)
        }
      )
      const roundIds = rounds?.map(info => info.round_id) ?? []
      interviewProcessList.value.forEach((data, index) => {
        data.id = roundIds[index]
        data.status = data?.status ?? ScheduleViewStatusEnum.DRAFT
        data.cancelable = data.status === ScheduleViewStatusEnum.DRAFT ? false : true
        data.modifiable = data.status === ScheduleViewStatusEnum.DRAFT ? true : false
      })
      closeDialog(id, interviewProcessList.value)
    }
  })
}

const closeDialog = (id?: number, processList?: Form.FormSelect[]) => {
  dialogVisible.value = false
  emit('close', id, processList)
}

// 删除已添加的流程
const deleteRound = (index: number) => {
  interviewProcessList.value.splice(index, 1)
}

// 设置面试环节类型
const setRoundType = (item: Form.FormSelect | null, value: number) => {
  const label = InterviewSession?.[value]?.name ?? ''
  const subLabel = InterviewSession?.[value]?.subLabel ?? ''
  if (!item) {
    interviewProcessList.value.push({
      id: generateUUID(),
      label: label,
      subLabel: subLabel,
      value: value,
      interviewers: [],
      status: ScheduleViewStatusEnum.DRAFT
    })
    return
  }
  item.value = value
  item.label = label
  item.subLabel = subLabel
}

watch(
  () => props.visible,
  val => {
    if (val) {
      dialogVisible.value = val
      nextTick(() => {
        const listWithHandle = processRef.value
        if (!Sortable.get(listWithHandle)) {
          Sortable.create(listWithHandle, {
            handle: '.order', // 按住按钮进行拖拽
            ghostClass: 'blue-background-class',
            onEnd(evt: Sortable.SortableEvent) {
              const newIndex = evt.newIndex as number
              const oldIndex = evt.oldIndex as number
              const currRow = interviewProcessList.value?.splice(oldIndex, 1)[0]
              interviewProcessList.value?.splice(newIndex, 0, currRow)
            }
          })
        }
      })
    }
  },
  { immediate: true }
)
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
