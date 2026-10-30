<template>
  <EspMain :title="state.name">
    <template #left>
      <EspStatus :type="ProjectStatus?.[state.status as number]?.status ?? ''">{{
        ProjectStatus?.[state.status as number]?.name
      }}</EspStatus>
    </template>
    <template
      #right
      v-if="
        globalStore.permissions.includes(UserPermissionEnum.RPTE) &&
        state.status === ProjectStatusEnum.ACTIVE
      "
    >
      <i class="iconfont icon-edit text-primary-gradient" @click="showEdit"></i>
    </template>
    <div class="esp-detail-wrap">
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="step-container">
            <div class="step-block" v-for="(item, index) in state.rounds" :key="item.id">
              <div class="step-tag">{{ `${$t('interviewProcess.step')} ${index + 1}` }}</div>
              <div class="left" v-if="index % 3 !== 0"></div>
              <div class="content">
                <div class="title">{{ roundTypeOf(item.round_type)?.name }}</div>
                <div>{{ roundTypeOf(item.round_type)?.description }}</div>
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
  </EspMain>
</template>
<script setup lang="ts" name="RecruitmentPipelineDetail">
import {
  ROUTER_SETTINGS_RECRUITMENT_PIPELINE,
  ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT
} from '@/router/routerName'
import { UserPermissionEnum } from '@/enums/userPermission'
import { ProjectStatus, ProjectStatusEnum } from '@/enums/projectStatusEnum'
import { cloneDeep } from 'lodash-es'
import { RECRUITMENT_PIPELINE_DETAIL } from './data'
import { useGlobalStore } from '@/store/modules/global'
import {
  getRecruitmentPipelineDetail,
  getRecruitmentPipelineRoundTypes
} from '@/api/modules/recruitmentPipeline'
import RecruitmentPipeline from '@/api/interface/recruitmentPipeline'

const globalStore = useGlobalStore()
const route = useRoute()
const router = useRouter()
const state = reactive<RecruitmentPipeline.DetailInfo>({
  id: '',
  name: '',
  status: 0,
  description: '',
  rounds: []
})
const infoForm = ref<Form.FormItem[]>(cloneDeep(RECRUITMENT_PIPELINE_DETAIL))
const roundTypes = ref<RecruitmentPipeline.RoundType[]>([])

const roundTypeOf = (id: unknown) => roundTypes.value.find(type => type.id === Number(id))

const initData = () => {
  if (route.params?.id) {
    getRecruitmentPipelineDetail(route.params?.id as string).then(res => {
      const result = (res.result ?? {}) as RecruitmentPipeline.DetailInfo
      state.id = result?.id
      state.name = result?.name ?? ''
      state.status = result?.status ?? 0
      state.description = result?.description
      state.rounds = result?.rounds ?? []
      infoForm.value.forEach((d: Form.FormItem) => {
        d.value = (result as any)?.[d.prop as string] ?? ''
      })
    })
  } else {
    router.replace({
      path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE}`
    })
  }
}
const showEdit = () => {
  router.push({
    path: `/${ROUTER_SETTINGS_RECRUITMENT_PIPELINE_EDIT}/${state.id}`
  })
}
onMounted(async () => {
  roundTypes.value = (await getRecruitmentPipelineRoundTypes())?.result ?? []
  initData()
})
</script>
<style lang="less" scoped>
@import './index.less';
</style>
