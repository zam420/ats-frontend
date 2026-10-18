<template>
  <EspMain :title="$t('title.jobPosition')">
    <template #left>
      <el-select-v2
        class="title-select-wrap"
        v-model="projectId"
        :options="projectList"
        @change="searchTable"
        clearable
        :placeholder="$t('form.selectProject')"
      />
    </template>
    <EspTable
      ref="espTable"
      :request-api="getJobPositionList"
      :columns="JOB_POSITION_TABLE"
      :is-front-pagination="true"
      :is-set-col="false"
      :formatTable="initTable"
      :initParam="{}"
      :tabs="tabs"
    >
      <template #header="{ ids }">
        <EspButton :permission="UserPermissionEnum.JPC" :is-gradient="false" @click="showBatch">
          {{ $t('button.upload') }}
        </EspButton>
        <EspButton :permission="UserPermissionEnum.JPC" @click="createJob">
          {{ $t('button.create') }}
        </EspButton>
        <!-- <el-button :disabled="!ids?.length" class="btn-primary-gradient">
          {{ $t('button.publish') }}
        </el-button> -->
      </template>
      <template #operation="{ row }">
        <el-tooltip :content="$t('opt.edit')" placement="top">
          <span class="operation-icon">
            <i @click="showEdit(row.id)" class="iconfont icon-edit text-primary-gradient"></i>
          </span>
        </el-tooltip>
        <!-- <el-tooltip :content="$t('opt.delete')" placement="top">
          <span class="operation-icon disabled">
            <i @click="showDelete(row.id)" class="iconfont icon-delete text-primary-gradient"></i>
          </span>
        </el-tooltip> -->
      </template>
    </EspTable>
    <EspUpload ref="espUploadRef" />
  </EspMain>
</template>
<script setup lang="ts" name="JobPositionTable">
import { JOB_POSITION_TABLE } from './data'
import { ROUTER_JOB_POSITION_CREATE, ROUTER_JOB_POSITION_EDIT } from '@/router/routerName'
import { useLocale } from '@/hooks/useLocale'
// 删除接口 deleteJobPosition
import { getJobPositionList, uploadJobPosition } from '@/api/modules/jobPosition'
import JobPosition from '@/api/interface/jobPosition'
import { RecruitmentType } from '@/enums/recruitmentTypeEnum'
import { WorkLocation } from '@/enums/workLocationEnum'
import { JobStatus } from '@/enums/jobStatusEnum'
import { isArray } from '@/utils/is'
import { getProjectList } from '@/api/modules/project'
import { getSelectOptionsByData, getTableTabs, openNewWindow } from '@/utils'
import Project from '@/api/interface/project'
import mittBus from '@/utils/mittBus'
import { OPEN_DIALOG } from '@/config'
import { UserPermissionEnum } from '@/enums/userPermission'

const route = useRoute()
const router = useRouter()
const { $t } = useLocale()

const espTable = ref()
const espUploadRef = ref()
const projectId = ref<any>()
const projectList = ref<Form.FormSelect[]>([])
// const curId = ref<number>()

const tabs = ref<Form.FormSelect[]>(getTableTabs(JobStatus))

const initProject = () => {
  getProjectList().then(res => {
    projectList.value = getSelectOptionsByData<Project.ProjectInfo>(
      res?.result ?? [],
      'project_id',
      'project_name'
    )
    console.log(projectList.value)
    projectId.value = route.query?.project_id ? Number(route.query?.project_id) : null
  })
}

// 上传
const showBatch = () => {
  espUploadRef.value &&
    espUploadRef.value.acceptParams({
      title: $t('dialog.uploadJobPosition'),
      subTitle: $t('jobPosition.downloadTemplate'),
      accept: 'XLSX',
      templateUrl: 'template/job_position_template.xlsx',
      templateName: 'Job Position Template',
      confirm: uploadJob
    })
}
const uploadJob = (formData: FormData) => {
  uploadJobPosition(formData).then(res => {
    if (res?.success) {
      ElMessage.success({ message: $t('message.uploadSuc') })
      espUploadRef.value.closeDialog && espUploadRef.value.closeDialog()
      projectId.value = undefined
      espTable.value.refresh && espTable.value.refresh(null, true)
      espTable.value.clearSelection && espTable.value.clearSelection()
      return
    }
    if (isArray(res?.result)) {
      const list = res?.result ?? []
      const msgs = list.map((item: Record<string, string[]>) => {
        const obj: string[] = []
        for (const [key, value] of Object.entries(item)) {
          obj.push(`Line ${parseInt(key) + 2}: ${value?.join(',')}`)
        }
        return obj
      })
      mittBus.emit(OPEN_DIALOG, {
        title: $t('message.uploadFailed'),
        showCancelButton: false,
        content: msgs?.join('<br>'),
        type: 'error'
      })
      return
    }
    ElMessage.error({ message: res?.message })
  })
}
const initTable = (tables: JobPosition.JobPositionDetail[]) => {
  searchTable()
  return tables.map(item => {
    item.recruitment_type_name =
      RecruitmentType?.[item?.recruitment_type]?.name ?? item.recruitment_type_name
    let work_location = item.work_location as CommonEnum.enumItem[]
    const work_locations = work_location.map((info: CommonEnum.enumItem) => {
      return WorkLocation?.[info.value]?.name ?? info.name
    })
    item.work_location = work_locations.join(', ')
    return item
  })
}

// 添加
const createJob = () => {
  router.push({
    path: `/${ROUTER_JOB_POSITION_CREATE}`
  })
}
const searchTable = () => {
  nextTick(() => {
    const param = { project_id: projectId.value }
    espTable.value && espTable.value.changeSearch(param, param)
  })
}

const showEdit = (id: number) => {
  openNewWindow(`${ROUTER_JOB_POSITION_EDIT}/${id}`)
}
// const showDelete = (id: number) => {
//   curId.value = id
//   mittBus.emit(OPEN_DIALOG, {
//     title: $t('message.tips'),
//     content: $t('message.deleteQues'),
//     center: 'center',
//     size: 'small',
//     confirm: deleteInfo
//   })
// }
// const deleteInfo = () => {
//   deleteJobPosition(curId.value as number).then(res => {
//     if (res?.success) {
//       ElMessage.success({ message: $t('message.deleteSuc') })
//       espTable.value && espTable.value.changeSearch(null, null, true)
//       return
//     }
//     ElMessage.error({ message: res?.message })
//   })
// }

onMounted(() => {
  initProject()
})
</script>
