<template>
  <EspMain :title="$t('menu.emailTemplate')">
    <EspTable
      ref="espTable"
      :columns="state.emailTemplateData"
      :is-set-col="false"
      :page-search="true"
      :tabs="tabs"
      :request-api="getEmailTemplateList"
      rowKey="id"
      :initParam="initParam"
      :activeTab="ProjectStatusEnum.ACTIVE.toString()"
      :formatTable="initTable"
      :is-front-pagination="false"
    >
      <template #header="">
        <ElButton v-if="hasPermission" @click="showCreate" class="btn-primary-gradient">{{
          $t('button.create')
        }}</ElButton>
      </template>
      <!-- 表格操作 -->
      <template #operation="{ row }">
        <el-tooltip :content="$t('opt.edit')" placement="top">
          <span
            class="operation-icon"
            :class="row.status === ProjectStatusEnum.ACTIVE ? '' : 'disabled'"
          >
            <i @click="showEdit(row.id)" class="iconfont icon-edit text-primary-gradient"></i>
          </span>
        </el-tooltip>
        <el-tooltip :content="row.status === ProjectStatusEnum.ACTIVE ? $t('opt.inActive') : $t('opt.active')" placement="top">
          <span class="operation-icon">
            <i
              @click="changeStatus(row)"
              class="iconfont text-primary-gradient"
              :class="row.status === ProjectStatusEnum.ACTIVE ? 'icon-inactive' : 'icon-active'"
            ></i>
          </span>
        </el-tooltip>
        <el-tooltip :content="$t('opt.share')" placement="top">
          <span
            class="operation-icon"
            :class="row.status === ProjectStatusEnum.ACTIVE ? '' : 'disabled'"
          >
            <i @click="shareTemplate(row)" class="iconfont icon-share text-primary-gradient"></i>
          </span>
        </el-tooltip>
      </template>
    </EspTable>
    <EspDialogForm ref="espDialogFormRef" />
  </EspMain>
</template>
<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { useLocale } from '@/hooks/useLocale'
import { getEmailTemplateList, changeRowStatusToInactive, shareEmailTemplate } from '@/api/modules/emailTemplate'
import { getTableTabs, openNewWindow } from '@/utils'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { ResultEnum } from '@/enums/httpEnum'
import { useGlobalStore } from '@/store/modules/global'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
import { EMAIL_TEMPLATE_TABLE, USER_FORM } from './data'
import router from '@/router'
import {
  ROUTER_SETTINGS_EMAIL_TEMPLATE_CREATE,
  ROUTER_SETTINGS_EMAIL_TEMPLATE_EDIT
} from '@/router/routerName'
import EmailTemplate from '@/api/interface/emailTemplate'
import { WorkLocation } from '@/enums/workLocationEnum'
import { RecruitmentType } from '@/enums/recruitmentTypeEnum'
import { UserPermissionEnum } from '@/enums/userPermission'
import { getUserList } from '@/api/modules/common'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'

const initParam = ref<Record<string, any>>({status: ProjectStatusEnum.ACTIVE})
const espTable = ref()
const globalStore = useGlobalStore()
// 是否有按钮操作权限
const hasPermission = ref(false)
const { $t } = useLocale()
const tabs = ref<Form.FormSelect[]>(getTableTabs(ProjectStatus))
// 列表表单
interface StateObj {
  emailTemplateData: Table.ColumnProps[]
  id: number
}
const state = reactive<StateObj>({
  emailTemplateData: cloneDeep(EMAIL_TEMPLATE_TABLE),
  id: 0
})
const espDialogFormRef = ref()
onMounted(() => {
  // 有操作权限才显示表格操作栏
  if (globalStore.permissions.includes(UserPermissionEnum.ETC)) {
    hasPermission.value = true
    state.emailTemplateData[0].isShow = true
  }
})
// 更改状态
const changeStatus = (row: EmailTemplate.EmailInfo) => {
  if (row.id) {
    mittBus.emit(OPEN_DIALOG, {
      title:
        row.status === ProjectStatusEnum.ACTIVE
          ? $t('emailTemplate.inactiveTemplateTitle')
          : $t('emailTemplate.activeTemplateTitle'),
      content:
        row.status === ProjectStatusEnum.ACTIVE
          ? `${$t('message.ques')}${$t('emailTemplate.inactiveTemplateMsg')}`
          : `${$t('message.ques')}${$t('emailTemplate.activeTemplateMsg')}`,
      center: 'center',
      size: 'small',
      confirm: () => messageConfirm(row)
    })
  }
}

// 消息弹窗
const messageConfirm = (row: EmailTemplate.EmailInfo) => {
  const status =
    row.status === ProjectStatusEnum.ACTIVE ? ProjectStatusEnum.INACTIVE : ProjectStatusEnum.ACTIVE
  changeRowStatusToInactive(row.id, status)
    .then(res => {
      if (res?.code === ResultEnum.SUCCESS) {
        ElMessage.success({
          message:
            status === ProjectStatusEnum.ACTIVE
              ? $t('message.activeSuc')
              : $t('message.inactiveSuc')
        })
      } else {
        ElMessage.error({ message: res?.message })
      }
      refreshTable()
    })
    .catch(res => {
      console.log('res?.message: ', res)
    })
}
// 处理work location和recruitment_type名称
const initTable = (tables: EmailTemplate.EmailInfo[]) => {
  return tables.map(item => {
    const workLocationNames: string[] = [];
    (item?.work_location as number[])?.forEach((data: number) => {
      workLocationNames.push(WorkLocation?.[data]?.name ?? '')
    })
    item.work_location = workLocationNames?.join(', ')
    const recruitmentTypeNames: string[] = [];
    (item?.recruitment_type as number[])?.forEach((data: number) => {
      recruitmentTypeNames.push(RecruitmentType?.[data]?.name ?? '')
    })
    item.recruitment_type = recruitmentTypeNames?.join(', ')
    return item
  })
}
// 打开编辑页面
const showEdit = (id: number) => {
  openNewWindow(`${ROUTER_SETTINGS_EMAIL_TEMPLATE_EDIT}/${id}`)
}
// 打开新增页面
const showCreate = () => {
  router.push({
    path: `/${ROUTER_SETTINGS_EMAIL_TEMPLATE_CREATE}`
  })
}
// 刷新表格
const refreshTable = () => {
  espTable.value.refresh(null, true)
}

// 分享模版
const shareTemplate = (emailData: EmailTemplate.EmailInfo) => {
  getUserList(ShareTypeEnum.EMAIL_TEMPLATE).then(res => {
    const result = res?.result ?? []
    const options: Form.FormSelect[] = []
    result.forEach(user => {
      options.push({
        label: user.name,
        value: user.id,
        subLabel: user.email,
        disabled: emailData.share_to_ids?.includes(parseInt(user.id))
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
            template_id: emailData.id,
            share_to_ids: share_to
          }
          shareEmailTemplate(param).then(res => {
            if (res?.code === ResultEnum.SUCCESS) {
              espDialogFormRef.value.closeDialog()
              ElMessage.success({ message: $t('message.shareSuc') })
              refreshTable()
            }
          })
        }
      })
  })
}
</script>
<style lang="less" scoped></style>
