<template>
  <EspTimeline class="resume-application-timeline-wrap">
    <template :key="item.id" v-for="item of list">
      <EspTimelineItem :timestamp="item.timestamp" :data="item.data">
        <template #link="{ curData }">
          <el-link
            v-if="curData?.isLink"
            @click="showDetail(curData.id)"
            :underline="false"
            type="primary"
          >
            <i class="iconfont icon-link"></i>
          </el-link>
        </template>
        <template #progress="" v-if="item.progress?.length > 1">
          <div class="resume-application-progress-wrap">
            <div class="resume-application-progress-item-wrap">
              <template :key="progress.state_name" v-for="progress of item.progress">
                <div class="resume-application-progress-item" :class="{grey: progress.isPending}">
                  <div class="time">{{ progress.time_from }}</div>
                  <div class="name">{{ ApplicationNoteType?.[progress.node_type!]?.name }}</div>
                </div>
              </template>
            </div>
            <!-- <div class="resume-application-progress-btn-wrap">
              <el-button>{{ $t('button.checkInterviewFeedback') }}</el-button>
              <el-button>{{ $t('button.checkTestResults') }}</el-button>
              <el-button>{{ $t('button.checkHistoricalOperations') }}</el-button>
            </div> -->
          </div>
        </template>
      </EspTimelineItem>
    </template>
  </EspTimeline>
</template>

<script setup lang="ts" name="AllApplicationTimeline">
import { cloneDeep } from 'lodash-es'
import CV from '@/api/interface/cv'
import { useLocale } from '@/hooks/useLocale'
import { TimestampDetail } from '@/components/EspTimeline/interface'
import { RESUME_DETAIL } from '@/components/EspResumeDetail/data'
import { getApplicationList } from '@/api/modules/cv'
import { isEmpty, openNewWindow } from '@/utils'
import { CandidateStatusEnum } from '@/enums/candidateStatusEnum'
import { ApplicationNoteType, ApplicationNoteTypeEnum } from '@/enums/applicationNoteTypeEnum'
interface DataProps {
  timestamp: TimestampDetail
  progress: CV.ProgressData[]
  data: Form.DetailItem[]
}

const { $t } = useLocale()

const candidateResumeId = ref<number>()
const detailUrl = ref<string>()

const list = ref<DataProps[]>()

// 接收父组件传过来的参数
const acceptParams = (id: number, resumeId: number, url: string) => {
  candidateResumeId.value = resumeId
  detailUrl.value = url
  showApplication(id)
}

const showApplication = (id: number) => {
  getApplicationList(id).then(res => {
    list.value = initData(res.result ?? [])
  })
}

const initData = (list: CV.ApplicationProgress[] = []) => {
  return list.map(item => {
    let progress = item?.application_progress ?? []
    progress?.forEach(pro => {
      pro.isPending = false
      // 如果是面试环节需要判断面试时间是否开始如果未开始显示灰色，已开始显示绿色
      if (pro.node_type === ApplicationNoteTypeEnum.ONLINE || 
        pro.node_type === ApplicationNoteTypeEnum.VIDEO ||
        pro.node_type === ApplicationNoteTypeEnum.HR ||
        pro.node_type === ApplicationNoteTypeEnum.PROFESSIONAL ||
        pro.node_type === ApplicationNoteTypeEnum.CEO
      ) {
        const timeFrom = new Date(pro?.time_from!)?.getTime()
        const now = new Date()?.getTime()
        pro.isPending = timeFrom > now 
      }
    })
    return {
      timestamp: {
        label: $t('cv.appliedAt'),
        time: item.applied_at
      },
      progress: progress,
      data: initFormData(item)
    }
  })
}
const initFormData = (item: CV.ApplicationProgress) => {
  return cloneDeep(RESUME_DETAIL).map((form: Form.DetailItem) => {
    const prop = form.prop as keyof CV.ApplicationProgress
    form.value = item?.[prop]
    if (form.enum && !isEmpty(form.value)) {
      const propText = form.propText as keyof CV.ApplicationProgress
      form.value = form.enum?.[form.value]?.name ?? item?.[propText]
    }
    if (prop === 'applying_position_title') {
      form.isLink = item.candidate_resume_id !== candidateResumeId.value
      form.id = item.candidate_resume_id
    } else if (prop === 'pooled_reason') {
      form.isHide = item.status !== CandidateStatusEnum.TALENT_POOL
    }
    return form
  })
}
const showDetail = (id: number) => {
  openNewWindow(`${detailUrl.value}/${id}`)
}
defineExpose({
  acceptParams
})
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
