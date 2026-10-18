<template>
  <div class="notes-editor">
    <div class="header">
      <div class="left">
        <div class="label">{{ $t('cv.notify') }}</div>
        <el-select
          ref="elSelectRef"
          v-model="noticeUsers"
          :multiple="true"
          collapse-tags
          collapse-tags-tooltip
          :disabled="isPublic"
          filterable
          :clearable="true"
          :max-collapse-tags="1"
          :placeholder="$t('cv.userPlaceHolder')"
        >
          <el-option
            v-for="option in userList"
            :key="option.value"
            :label="option.subLabel ? `${option.label} (${option.subLabel})` : option.label"
            :value="option.value"
            :class="option.subLabel ? 'form-select-li' : ''"
            :disabled="option.disabled"
          >
            <el-checkbox
              :value="noticeUsers?.includes(option.value)"
              style="pointer-events: none"
              :disabled="option.disabled"
            >
              <span class="title">{{ option.label }}</span>
              <span>{{ option.subLabel }}</span></el-checkbox
            >
          </el-option>
        </el-select>
      </div>
      <div>
        <el-checkbox v-model="isPublic" :label="$t('cv.public')" @change="changePublic" />
      </div>
    </div>   
    <div class="nodes-content">
      <el-input
        v-model="notes"
        :rows="6"
        :clearable="true"
        resize="none"
        type="textarea"
        :maxlength="10000"
        :placeholder="`${$t('form.text')} ${$t('cv.notes')?.toLowerCase()}`"
        show-word-limit
      />
    </div>
    <div class="footer" v-if="showFooter">
      <el-button @click="cancelClick">{{ $t('button.cancel') }}</el-button>
      <el-button type="primary" @click="confirmClick"> {{ $t('button.confirm') }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts" name="NotesEditor">
import CV from '@/api/interface/cv'
import { useLocale } from '@/hooks/useLocale'
import { batchCommentResume, commentResume } from '@/api/modules/cv'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { getUserList } from '@/api/modules/common'

const { $t } = useLocale()

const isPublic = ref<boolean>(false)
const noticeUsers = ref<number[]>([])
const userList = ref<Form.FormSelect[]>([])
const notes = ref<string>()

const emit = defineEmits(['cancel', 'confirm'])
interface DialogProps {
  resumeId: number
  resumeIds?: number[]
  showFooter?: boolean
}

const props = withDefaults(defineProps<DialogProps>(), {
  resumeId: 0,
  showFooter: true
})

const changePublic = () => {
  // 切换是否public时选择清空
  noticeUsers.value = []
}

// 清空数据
const clearData = () => {
  notes.value = ''
  noticeUsers.value = []
  isPublic.value = false
}

const cancelClick = () => {
  clearData()
  emit('cancel')
}

const confirmClick = () => {
  if (!notes.value) {
    ElMessage.error({ message: `${$t('form.text')} ${$t('cv.notes')?.toLowerCase()}` })
    return
  }
  // is public的时候传-1
  const noticeUser = isPublic.value ? [-1] : noticeUsers.value
  const param: CV.CommentParam = props.resumeId ? {
    candidate_resume_id: props.resumeId,
    comment: notes.value,
    share_to: noticeUser
  } : {
    candidate_resume_ids: props.resumeIds,
    comment: notes.value,
    share_to: noticeUser
  }

  const actions = props.resumeId ? commentResume(param) : batchCommentResume(param)
  actions.then(res => {
    if (res.success) {
      ElMessage.success({ message: $t('message.addSuc') })
      clearData()
      emit('confirm', res?.result)
    }
  })
  
}

onMounted(async () => {
  // 获取notice user下拉的值
  const result = await getUserList(ShareTypeEnum.EMAIL_TEMPLATE)
  const options: Form.FormSelect[] = []
  result?.result?.forEach(user => {
    options.push({
      label: user.name,
      value: user.id,
      subLabel: user.email
    })
  })
  userList.value = [...options]
})

defineExpose({
  clearData,
  confirmClick
})
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
