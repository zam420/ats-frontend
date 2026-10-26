<template>
  <EspMain :title="state.name">
    <template #left>
      <EspStatus :type="ProjectStatus?.[state.status as number]?.status ?? ''">{{
        ProjectStatus?.[state.status as number]?.name
      }}</EspStatus>
    </template>
    <template #right v-if="globalStore.permissions.includes(UserPermissionEnum.IPTE)">
      <i
        class="iconfont text-primary-gradient"
        :class="state.status === ProjectStatusEnum.ACTIVE ? 'icon-inactive' : 'icon-active'"
        @click="changeStatus"
      ></i>
      <template v-if="state.status === ProjectStatusEnum.ACTIVE">
        <i class="iconfont icon-edit text-primary-gradient" @click="showEdit"></i>
        <i class="iconfont icon-share text-primary-gradient" @click="shareTemplate"></i>
      </template>
    </template>
    <div class="esp-detail-wrap">
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="step-container">
            <div class="step-block" v-for="(item, index) in state.rounds" :key="item.id">
              <div class="step-tag">{{ `${$t('interviewProcess.step')} ${index + 1}` }}</div>
              <div class="left" v-if="index % 3 !== 0"></div>
              <div class="content">
                <div class="title">{{ InterviewSession?.[item.round_type]?.name }}</div>
                <div>{{ InterviewSession?.[item.round_type]?.subLabel }}</div>
                <div class="subTitle">{{ $t('emailTemplate.interviewer') }}:</div>
                <el-tooltip class="box-item" effect="dark" placement="top-start">
                  <template #content>
                    <div v-for="user in interviewerUsers(item.interviewers)" :key="user.id">
                      {{ `${user.name} (${user.email})` }}
                    </div>
                  </template>
                  <div>
                    <div v-for="user in interviewerUsers(item.interviewers).slice(0, 2)" :key="user.id">
                      {{ `${user.name} (${user.email})` }}
                    </div>
                    <div v-if="item?.interviewers?.length > 2">...</div>
                  </div>
                </el-tooltip>
              </div>
              <div class="right"></div>
            </div>
          </div>
        </el-col>
        <el-col :span="24" class="esp-detail-item">
          <label class="bold">{{ $t('interviewProcess.description') }}: </label>
          <p class="desc high-panel">{{ state.description }}</p>
        </el-col>
      </el-row>
      <div class="info-panel">
        <EspDetail :is-small="true" :gutter="32" :data="infoForm" />
      </div>
    </div>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts" name="InterviewProcessDetail">
import {
  ROUTER_SETTINGS_INTERVIEW_PROCESS,
  ROUTER_SETTINGS_INTERVIEW_PROCESS_EDIT
} from '@/router/routerName'
import { UserPermissionEnum } from '@/enums/userPermission'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash-es'
import { INTERVIEW_PROCESS_DETAIL, USER_FORM } from './data'
import { ResultEnum } from '@/enums/httpEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
import {
  getInterviewProcessDetail,
  shareInterviewProcess,
  changeRowStatusToInactive
} from '@/api/modules/interviewProcess'
import InterviewProcess from '@/api/interface/interviewProcess'
import { InterviewSession } from '@/enums/interviewSessionEnum'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { getUserList } from '@/api/modules/common'
const globalStore = useGlobalStore()
const { $t } = useLocale()
const route = useRoute()
const router = useRouter()
const state = reactive<InterviewProcess.DetailInfo>({
  id: '',
  name: '',
  status: 0,
  description: '',
  rounds: []
})
const share_to_ids = ref<number[]>([])
const infoForm = ref<Form.FormItem[]>(cloneDeep(INTERVIEW_PROCESS_DETAIL))
const espDialogFormRef = ref()
const userMap = ref<Record<string, { id: string | number; name: string; email: string }>>({})

// Backend returns interviewer ids; resolve them to name/email via the user list
const interviewerUsers = (list: InterviewProcess.InterviewRound['interviewers'] = []) =>
  list.map(u => {
    if (typeof u === 'object') return u
    return userMap.value[String(u)] ?? { id: u, name: String(u), email: '' }
  })

const loadUsers = async () => {
  const res = await getUserList(ShareTypeEnum.INTERVIEWER)
  const map: typeof userMap.value = {}
  res?.result?.forEach(user => {
    map[String(user.id)] = user
  })
  userMap.value = map
}
const initData = () => {
  if (route.params?.id) {
    getInterviewProcessDetail(route.params?.id as string).then(res => {
      const result = (res.result ?? {}) as InterviewProcess.DetailInfo
      state.id = result?.id
      state.name = result?.name ?? ''
      state.status = result?.status ?? 0
      state.description = result?.description
      state.rounds = result?.rounds ?? []
      share_to_ids.value = result?.share_to?.map(d => d.id) ?? []
      infoForm.value.forEach((d: Form.FormItem) => {
        d.value = result?.[d.prop as keyof InterviewProcess.DetailInfo] ?? ''
      })
    })
  } else {
    router.replace({
      path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS}`
    })
  }
}
const showEdit = () => {
  router.push({
    path: `/${ROUTER_SETTINGS_INTERVIEW_PROCESS_EDIT}/${state.id}`
  })
}

// 分享模版
const shareTemplate = () => {
  getUserList(ShareTypeEnum.INTERVIEW_PROCESS).then(res => {
    const result = res?.result ?? []
    const options: Form.FormSelect[] = []
    result.forEach(user => {
      options.push({
        label: user.name,
        value: user.id,
        subLabel: user.email,
        disabled: share_to_ids.value?.includes(parseInt(user.id))
      })
    })
    const formData = cloneDeep(USER_FORM)
    const index = formData.findIndex(info => info.prop === 'share_to')
    formData[index].options = [...options]
    espDialogFormRef.value &&
      espDialogFormRef.value.acceptParams({
        title: $t('title.shareInterviewProcess'),
        isView: false,
        formData: formData,
        size: 'middle',
        confirm: (data: any) => {
          const share_to = data?.data?.share_to ?? []
          const param: InterviewProcess.ShareParam = {
            ipt_id: state.id,
            share_to: share_to
          }
          shareInterviewProcess(param).then(res => {
            if (res?.code === ResultEnum.SUCCESS) {
              share_to_ids.value = [...share_to_ids.value, ...share_to]
              espDialogFormRef.value.closeDialog()
              ElMessage.success({ message: $t('message.shareSuc') })
            }
          })
        }
      })
  })
}

// 更改状态
const changeStatus = () => {
  if (state.id) {
    mittBus.emit(OPEN_DIALOG, {
      title:
        state.status === ProjectStatusEnum.ACTIVE
          ? $t('interviewProcess.inactiveInterviewTitle')
          : $t('interviewProcess.activeInterviewTitle'),
      content:
        state.status === ProjectStatusEnum.ACTIVE
          ? `${$t('message.ques')}${$t('interviewProcess.inactiveInterviewMsg')}`
          : `${$t('message.ques')}${$t('interviewProcess.activeInterviewMsg')}`,
      center: 'center',
      size: 'small',
      confirm: () => messageConfirm()
    })
  }
}

// 消息弹窗
const messageConfirm = () => {
  const status =
    state.status === ProjectStatusEnum.ACTIVE
      ? ProjectStatusEnum.INACTIVE
      : ProjectStatusEnum.ACTIVE
  changeRowStatusToInactive(state.id, status)
    .then(res => {
      if (res?.code === ResultEnum.SUCCESS) {
        ElMessage.success({
          message:
            status === ProjectStatusEnum.ACTIVE
              ? $t('message.activeSuc')
              : $t('message.inactiveSuc')
        })
        state.status = status
      } else {
        ElMessage.error({ message: res?.message })
      }
    })
    .catch(res => {
      console.log('res?.message: ', res)
    })
}
onMounted(() => {
  loadUsers()
  initData()
})
</script>
<style lang="less" scoped>
@import './index.less';
</style>
