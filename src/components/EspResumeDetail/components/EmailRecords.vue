<template>
  <div class="collapse-panel">
    <el-collapse v-model="activeNames" class="esp-collapse">
      <el-collapse-item :name="1">
        <template #title>
          <div class="opt-panel">
            <el-icon><CaretRight /></el-icon>
            <div class="roundName">{{ $t('cv.toTheCandidate') }}</div>
          </div>
        </template>
        <template v-if="state.candidateEmailList.length > 0">
          <div class="email-panel" v-for="item in state.candidateEmailList" :key="item.emailId">
            <div class="subject">{{ item.subjectName }}</div>
            <EspDetail :data="item.emailForm" />
            <div class="email-content">
              <div class="content ql-editor" v-html="item.emailContent" v-if="!item.collapse"></div>
              <div class="arrow-panel" @click="changeCollapseStatus(item)">
                <span class="text">{{ !item.collapse ? $t('cv.collapseContent') : $t('cv.expandContent') }}</span>
                <div :class="item.collapse ? 'arrow down' : 'arrow'"></div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <EspNoData :title="$t('table.noData')" />
        </template>
      </el-collapse-item>
      <el-collapse-item :name="2">
        <template #title>
          <div class="opt-panel">
            <el-icon><CaretRight /></el-icon>
            <div class="roundName">{{ $t('cv.toInternalEmployees') }}</div>
          </div>
        </template>
        <template v-if="state.employeeEmailList.length > 0">
          <div class="email-panel" v-for="item in state.employeeEmailList" :key="item.emailId">
            <div class="subject">{{ item.subjectName }}</div>
            <EspDetail :data="item.emailForm" />
            <div class="email-content">
              <div class="content ql-editor" v-html="item.emailContent" v-if="!item.collapse"></div>
              <div class="arrow-panel" @click="changeCollapseStatus(item)">
                <span class="text">{{ !item.collapse ? $t('cv.collapseContent') : $t('cv.expandContent') }}</span>
                <div :class="item.collapse ? 'arrow down' : 'arrow'"></div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <EspNoData :title="$t('table.noData')" />
        </template>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script setup lang="ts" name="EmailRecords">
import CV from '@/api/interface/cv'
import { getEmailRecords } from '@/api/modules/cv'
import { generateUUID } from '@/utils'
import { cloneDeep } from 'lodash'
import { EMAIL_DETAIL } from '../data'
interface EmailInfo {
  subjectName: string
  emailId: string
  emailForm: Form.FormItem[]
  emailContent: string
  collapse: boolean
}
interface StateProps {
  candidateEmailList: EmailInfo[]
  employeeEmailList: EmailInfo[]
}

const activeNames = ref<number[]>([])

const state = reactive<StateProps>({
  candidateEmailList: [],
  employeeEmailList: []
})

// 接收父组件传过来的参数
const acceptParams = (resumeId: number) => {
  getEmailRecords(resumeId).then(res => {
    const to_candidate = res?.result?.to_candidate ?? []
    const to_employee = res?.result?.to_employee ?? []
    state.candidateEmailList = getEmailData(to_candidate)
    state.employeeEmailList = getEmailData(to_employee)
    // 默认将有数据的展开，都无数据或者都有数据的话全部展开
    if (state.candidateEmailList.length > 0) {
      activeNames.value.push(1)
    }
    if (state.employeeEmailList.length > 0) {
      activeNames.value.push(2)
    }
    if (state.candidateEmailList.length === 0 && state.employeeEmailList.length === 0) {
      activeNames.value = [1, 2]
    }
  })
}

// 处理邮件数据
const getEmailData = (emailList: CV.EmailRecords[]) => {
  const list: EmailInfo[] = []
  emailList.forEach(data => {
    const form = cloneDeep(EMAIL_DETAIL)
    form?.forEach(formData => {
      formData.value = data?.[formData.prop as keyof CV.EmailRecords] ?? ''
      if (formData.prop === 'to' || formData.prop === 'bcc') {
        formData.value = formData.value?.join(', ')
      }
    })
    const emailData = {
      subjectName: data?.subject ?? '',
      emailId: generateUUID(),
      emailForm: form,
      emailContent: data?.content ?? '',
      collapse: false
    }
    list.push(emailData)
  })
  return list
}

// 修改邮件内容展开收起状态
const changeCollapseStatus = (item: EmailInfo) => {
  item.collapse = !item.collapse
}

defineExpose({
  acceptParams
})
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
