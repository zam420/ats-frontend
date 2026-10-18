<template>
  <EspMain :title="state.name">
    <template #left>
      <EspStatus :type="ProjectStatus?.[state.status as number]?.status ?? ''">{{
        ProjectStatus?.[state.status as number]?.name
      }}</EspStatus>
    </template>
    <template #right v-if="globalStore.permissions.includes(UserPermissionEnum.ETE)">
      <el-tooltip :content="state.status ===ProjectStatusEnum.ACTIVE ? $t('opt.inActive') : $t('opt.active')" placement="top">
        <i
          class="iconfont text-primary-gradient"
          :class="state.status === ProjectStatusEnum.ACTIVE ? 'icon-inactive' : 'icon-active'"
          @click="changeStatus"
        ></i>
      </el-tooltip>
      <template v-if="state.status === ProjectStatusEnum.ACTIVE">
        <el-tooltip :content="$t('opt.edit')" placement="top">
          <i class="iconfont icon-edit text-primary-gradient" @click="showEdit"></i>
        </el-tooltip>
        <el-tooltip :content="$t('opt.share')" placement="top">
          <i class="iconfont icon-share text-primary-gradient" @click="shareTemplate"></i>
        </el-tooltip>
      </template>
    </template>
    <div class="esp-detail-wrap">
      <el-row :gutter="20">
        <el-col :span="6" class="esp-detail-item left">
          <label>{{ $t('jobPosition.recruitmentType') }}: </label>
          <p class="desc">{{ state.recruitment_type_name }}</p>
        </el-col>
        <el-col :span="12" class="esp-detail-item left">
          <label>{{ $t('jobPosition.workLocation') }}: </label>
          <p class="desc">{{ state.work_location_name }}</p>
        </el-col>
        <el-col :span="24" class="esp-detail-item">
          <div class="content">{{ state.subject }}</div>
        </el-col>
        <el-col :span="24" class="esp-detail-item">
          <div class="content high">
            <EspQuillEditor v-model:content="state.content" :select-options="[]" :readOnly="true" />
          </div>
        </el-col>
      </el-row>
      <EspDetail :is-small="true" :gutter="32" :data="infoForm" />
    </div>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts" name="EmailTemplateDetail">
import {
  ROUTER_SETTINGS_EMAIL_TEMPLATE,
  ROUTER_SETTINGS_EMAIL_TEMPLATE_EDIT
} from '@/router/routerName'
import { UserPermissionEnum } from '@/enums/userPermission'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import {
  changeRowStatusToInactive,
  getEmailTemplateDetail,
  shareEmailTemplate
} from '@/api/modules/emailTemplate'
import EmailTemplate from '@/api/interface/emailTemplate'
import { WorkLocation } from '@/enums/workLocationEnum'
import { RecruitmentType } from '@/enums/recruitmentTypeEnum'
import { useLocale } from '@/hooks/useLocale'
import { cloneDeep } from 'lodash-es'
import { EMAIL_TEMPLATE_DETAIL, USER_FORM } from './data'
import { ResultEnum } from '@/enums/httpEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
import { getUserList } from '@/api/modules/common'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'

const globalStore = useGlobalStore()
const { $t } = useLocale()
const route = useRoute()
const router = useRouter()
const state = reactive<EmailTemplate.DetailInfo>({
  id: 0,
  name: '',
  status: 0,
  recruitment_type_name: '',
  work_location_name: '',
  subject: '',
  content: '',
  sharing_list: []
})
const infoForm = ref<Form.FormItem[]>(cloneDeep(EMAIL_TEMPLATE_DETAIL))
const share_to_ids = ref<number[]>([])
const espDialogFormRef = ref()
const initData = () => {
  if (route.params?.id) {
    getEmailTemplateDetail(Number(route.params?.id as string)).then(res => {
      const result = (res.result ?? {}) as EmailTemplate.DetailInfo
      state.id = result?.id
      state.name = result?.name ?? ''
      state.subject = result?.subject ?? ''
      state.status = result?.status ?? 0
      const workLocationNames: string[] = []
      result?.work_location?.forEach(data => {
        workLocationNames.push(WorkLocation?.[data]?.name ?? '')
      })
      state.work_location_name = workLocationNames?.join(', ')
      const recruitmentTypeNames: string[] = []
      result?.recruitment_type?.forEach(data => {
        recruitmentTypeNames.push(RecruitmentType?.[data]?.name ?? '')
      })
      state.recruitment_type_name = recruitmentTypeNames?.join(', ')
      state.content = result?.content
      share_to_ids.value = result?.sharing_list?.map(d => d.to_id) ?? []
      infoForm.value.forEach((d: Form.FormItem) => {
        d.value = result?.[d.prop as keyof EmailTemplate.DetailInfo] ?? ''
      })
    })
  } else {
    router.replace({
      path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE}`
    })
  }
}
const showEdit = () => {
  router.push({
    path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE_EDIT}/${state.id}`
  })
}

// 分享模版
const shareTemplate = () => {
  getUserList(ShareTypeEnum.EMAIL_TEMPLATE).then(res => {
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
    const index = formData.findIndex(info => info.prop === 'share_to_ids')
    formData[index].options = [...options]
    espDialogFormRef.value &&
      espDialogFormRef.value.acceptParams({
        title: $t('title.shareTemplate'),
        isView: false,
        formData: formData,
        size: 'middle',
        confirm: (data: any) => {
          const share_to = data?.data?.share_to_ids ?? []
          const param: EmailTemplate.ShareParam = {
            template_id: state.id,
            share_to_ids: share_to
          }
          shareEmailTemplate(param).then(res => {
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
          ? $t('emailTemplate.inactiveTemplateTitle')
          : $t('emailTemplate.activeTemplateTitle'),
      content:
        state.status === ProjectStatusEnum.ACTIVE
          ? `${$t('message.ques')}${$t('emailTemplate.inactiveTemplateMsg')}`
          : `${$t('message.ques')}${$t('emailTemplate.activeTemplateMsg')}`,
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
  initData()
})
</script>
<style lang="less" scoped>
@import 'index.less';
</style>
