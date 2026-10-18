<template>
  <div class="dialog-form-wrap small-dialog" v-if="dialogVisible">
    <ElDialog
      :destroy-on-close="true"
      :center="true"
      v-model="dialogVisible"
      :title="$t('cv.moveToOnboard')"
      :close-on-click-modal="false"
      close-icon="CircleClose"
      @close="closeDialog()"
    >
      <EspForm
        ref="espFormRef"
        v-model="state.baseForm"
        class="info-form-wrap"
      />
      <template #footer>
        <ElButton @click="closeDialog()">{{ $t('button.cancel') }}</ElButton>
        <ElButton class="btn-primary-gradient" @click="confirm">
          {{ $t('button.confirm') }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts" name="OnboardingDialog">
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash'
import { MOVE_ONBOARDING_FORM } from '../data'
import { getObjectByForms } from '@/utils'
import { moveTo } from '@/api/modules/cv'
import CV from '@/api/interface/cv'
import { CandidateStatusEnum } from '@/enums/candidateStatusEnum'

interface ReactiveParams {
  baseForm: Form.FormItem[]
  isUpdate: boolean
}

interface DialogProps {
  userList: Form.FormSelect[]
  isUpdate?: boolean
  onboardingDate?: string
}

const { $t } = useLocale()
const espFormRef = ref()
const state = reactive<ReactiveParams>({
  baseForm: cloneDeep(MOVE_ONBOARDING_FORM),
  isUpdate: false
})
const emit = defineEmits(['close'])
// dialog框状态
const dialogVisible = ref<boolean>(false)

const confirm = async () => {
  const isBasicPass = espFormRef.value.validateFrom && (await espFormRef.value.validateFrom())
  if (isBasicPass) {
    const baseParam = getObjectByForms(state.baseForm)
    const formData: CV.MoveToParam = {
      candidate_resume_ids: baseParam?.resumes_ids ?? [],
      move_to_status: CandidateStatusEnum.ONBOARD,
      additional_params: {
        expect_onboarding_date: baseParam?.expect_onboarding_date ?? ''
      }
    }
    moveTo(formData).then(async res => {
      if (res?.success) {
        ElMessage.success({ message: state.isUpdate ? $t('message.updateSuc') : $t('message.moveSuc') })
        // 关闭弹窗
        closeDialog(true)
      }
    })
  }
}

// 接收父组件传过来的参数
const acceptParams = async (params: DialogProps) => {
  const userList = params?.userList ?? []
  const candidates: number[] = []
  userList.forEach(data => {
    candidates.push(data.value)
  })
  const resumesIdIndex = state.baseForm.findIndex(info => info.prop === 'resumes_ids')
  state.baseForm[resumesIdIndex].options = [...userList]
  state.baseForm[resumesIdIndex].value = [...candidates]
  if (params?.onboardingDate){
    const dateIndex = state.baseForm.findIndex(info => info.prop === 'expect_onboarding_date')
    state.baseForm[dateIndex].value = params?.onboardingDate ?? ''
  }
  state.isUpdate = params?.isUpdate ?? false
  dialogVisible.value = true
}

// 关闭并清空弹窗数据
const closeDialog = (needCallback?: boolean) => {
  dialogVisible.value = false
  // 清空弹窗数据恢复初始值
  state.baseForm.forEach(data => {
    data.value = undefined
  })
  if (needCallback) {
    emit('close', state.isUpdate)
  }
}
defineExpose({
  acceptParams
})
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
