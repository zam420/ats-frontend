<template>
  <div class="application-base" :key="index" v-for="(item, index) in dialogData.data">
    <div class="left-base">
      <div class="left-title">{{ $t('cv.appliedAt') }}</div>
      <div>{{ item.applied_at }}</div>
    </div>
    <div class="right-base">
      <div class="right-title-base">
        <div class="right-title">
          {{ $t('cv.appliedPosition') }} {{ item.applying_position_title }}
        </div>
        <div v-if="dialogData.srcResumeId !== item.candidate_resume_id">
          <el-icon
            class="title-link-img"
            size="1.3em"
            @click="candidateResumeClick(item.candidate_resume_id)"
            ><Link
          /></el-icon>
        </div>
      </div>
      <div class="content-first">
        <div class="content-layout">{{ $t('cv.recruitmentProject') }} {{ item.project_name }}</div>
        <div class="content-layout">{{ $t('cv.applicationStatus') }} {{ item.status_name }}</div>
        <div class="content-layout">
          {{ $t('cv.recruitmentType') }} {{ item.recruitment_type_name }}
        </div>
      </div>
      <div class="content-second">
        <div class="content-layout">{{ $t('cv.hrRecruiter') }} {{ item.hr_recruiter_name }}</div>
        <div class="content-layout">
          {{ $t('talentPool.resumePortal') }} {{ item.recruitment_source_name }}
        </div>
        <div class="content-layout" v-if="item.pooled_reason">
          {{ $t('cv.pooledReason') }} {{ item.pooled_reason }}
        </div>
      </div>
      <div class="content-third" v-if="item.application_progress.length > 1">
        <div class="date-base">
          <div
            class="item-base"
            :key="indexT"
            v-for="(timeItem, indexT) in item.application_progress"
          >
            <span class="first">{{ timeItem.date_time }}</span>
            <span class="second">{{ timeItem.state_name }}</span>
          </div>
        </div>
        <div class="option-base">
          <el-button>{{ $t('cv.checkInterviewFeedback') }}</el-button>
          <el-button>{{ $t('cv.checkTestResults') }}</el-button>
          <el-button>{{ $t('cv.checkHistoricalOperations') }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="EspApplication">
import { useLocale } from '@/hooks/useLocale'
import { ref } from 'vue'
import CV from '@/api/interface/cv'

const { $t } = useLocale()

interface DialogProps {
  data?: CV.ApplicationProgress[]
  srcResumeId: string | number
}
const dialogData = ref<DialogProps>({
  srcResumeId: '',
  data: [
    {
      application_progress: [
        { date_time: '2023-10-12 15:47:25', state_name: '23234' },
        { date_time: '2023-10-15 15:47:25', state_name: '23234' }
      ],
      applied_at: '2023-10-12',
      applying_position: 420,
      applying_position_title: 'Backend Developer',
      candidate_resume_id: 1,
      hr_recruiter_id: 4,
      hr_recruiter_name: 'gwy',
      pooled_reason: '',
      project_id: 53,
      project_name: 'Demo1',
      recruitment_source: 0,
      recruitment_source_name: 'liepin',
      recruitment_type: 1,
      recruitment_type_name: 'corporate',
      status: 1,
      status_name: 'Unscreen'
    },
    {
      application_progress: [{ date_time: '2023-10-12 15:47:25', state_name: '23234' }],
      applied_at: '2023-10-12',
      applying_position: 420,
      applying_position_title: 'Backend Developer',
      candidate_resume_id: 2,
      hr_recruiter_id: 4,
      hr_recruiter_name: 'gwy',
      pooled_reason: '',
      project_id: 53,
      project_name: 'Demo1',
      recruitment_source: 0,
      recruitment_source_name: 'liepin',
      recruitment_type: 1,
      recruitment_type_name: 'corporate',
      status: 1,
      status_name: 'Unscreen'
    }
  ]
  // data: []
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps) => {
  console.log('params', params)
  dialogData.value.srcResumeId = params?.srcResumeId
}
const candidateResumeClick = (candidateResumeId: number) => {
  console.log('candidateResumeId: ', candidateResumeId)
}
defineExpose({
  acceptParams
})
</script>

<style lang="less" scoped>
@import 'index';
</style>
