<template>
  <EspTimeline class="resume-application-timeline-wrap" v-if="timeList?.length > 0">
    <template :key="item.id" v-for="item of timeList">
      <EspTimelineItem :timestamp="item.timestamp" :data="item.data">
      </EspTimelineItem>
    </template>
  </EspTimeline>
  <EspNoData :title="$t('table.noData')" v-else />
</template>

<script setup lang="ts" name="HistoricalOperations">
import { cloneDeep } from 'lodash-es'
import CV from '@/api/interface/cv'
import { TimestampDetail } from '@/components/EspTimeline/interface'
import { getHistoricalOperations } from '@/api/modules/cv'
import { HISTORY_OPERATE_DETAIL } from '../data'
interface DataProps {
  timestamp: TimestampDetail
  data: Form.DetailItem[]
}

const timeList = ref<DataProps[]>([])

// 接收父组件传过来的参数
const acceptParams = (resumeId: number) => {
  getHistoricalOperations(resumeId).then(res => {
    const list = res?.result ?? []
    const historyList: DataProps[] = []
    list.sort((a, b) => (b?.operate_at > a?.operate_at ? 1 : -1))
    const labelList: string[] = []
    list.forEach(data => {
      const date = data.operate_at?.substring(0, 10)
      const timestamp: TimestampDetail = {
        time: data.operate_at?.substring(11)
      }
      if (!labelList.includes(date)) {
        labelList.push(date)
        timestamp.label = date
        timestamp.isFontBold = true
      } else {
        timestamp.class = 'mrt'
      }
      const columns = cloneDeep(HISTORY_OPERATE_DETAIL)
      columns.forEach(col => {
        col.value = data?.[col.prop as keyof CV.OperateHistory] ?? ''
      })
      const operate = {
        timestamp: timestamp,
        data: columns
      }
      historyList.push(operate)
    })
    timeList.value = [...historyList]
  })
}

defineExpose({
  acceptParams
})
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
