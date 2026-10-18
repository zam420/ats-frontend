<template>
  <EspMain :title="$t('title.talentPool')">
    <template #right>
      <div class="set-icon" @click="openSetting">
        <img src="@/assets/imgs/set.png" /> {{ $t('button.fields') }}
      </div>
    </template>
    <EspTable
      ref="espTable"
      :columns="TALENT_POOL_TABLE"
      :request-api="getTalentPoolList"
      :table-key="TALENT_POOL_HEADER"
      :is-front-pagination="false"
      :page-search="true"
      :hide-col-button="true"
      :formatTable="initListData"
    >
      <!-- 表格操作 -->
      <template #operation="{ row }">
        <el-tooltip :content="$t('opt.active')" placement="top">
          <span class="operation-icon">
            <i @click="changeStatus(row)" class="iconfont icon-active text-primary-gradient"></i>
          </span>
        </el-tooltip>
      </template>
      <template #pooledReason="scope">
        <div class="status-warp">
          <div
            class="status"
            :class="PooledReason[scope.row.pooled_reason]?.status ?? ''"
          ></div>
          <template v-if="scope.row.comments">
            <el-tooltip :content="`${$t('cv.notes')}: ${scope.row.comments}`" placement="top-start">
              <span>{{ PooledReason[scope.row.pooled_reason]?.name ?? '' }}</span>
            </el-tooltip>
          </template>
          <span v-else>
            {{ PooledReason[scope.row.pooled_reason]?.name ?? '' }}
          </span>
        </div>
      </template>
    </EspTable>
  </EspMain>
</template>
<script setup lang="ts" name="TalentPool">
import { TALENT_POOL_TABLE } from './data'
import { getTalentPoolList, resetTalent } from '@/api/modules/talentPool'
import { OPEN_DIALOG, TALENT_POOL_HEADER } from '@/config/index'
import TalentPool from '@/api/interface/talentPool'
import { Degree } from '@/enums/degreeEnum'
import { PooledReason } from '@/enums/pooledReasonEnum'
import mittBus from '@/utils/mittBus'
import { useLocale } from '@/hooks/useLocale'
const espTable = ref()
const { $t } = useLocale()
onMounted(() => {})
const initListData = (tables: TalentPool.TalentPoolInfo[]) => {
  return tables.map(item => {
    item.highest_degree_name = Degree?.[item?.highest_degree]?.name ?? item.highest_degree
    return item
  })
}
// 重置简历到unscreen状态
const changeStatus = (row: TalentPool.TalentPoolInfo) => {
  mittBus.emit(OPEN_DIALOG, {
    title: $t('talentPool.resetResume'),
    content: `${$t('message.ques')}${$t('talentPool.resetResumeMsg')}`,
    center: 'center',
    size: 'small',
    confirm: () => {
        resetTalent([row.id]).then(res => {
        if (res.result) {
          espTable.value.refresh()
        }
      })
    }
  })
}
// 打开field setting
const openSetting = () => {
  espTable.value.openColSetting()
}
</script>
<style lang="less" scoped>
@import 'index.less';
</style>
