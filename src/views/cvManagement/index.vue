<template>
  <EspMain :title="$t('menu.cvManagement')">
    <EspTable
      ref="espTable"
      :request-api="getCVPage"
      :table-key="CV_MANAGEMENT_HEADER"
      :columns="tableColumns"
      :initParam="initParam"
      :is-front-pagination="false"
      :formatTable="initTable"
      status-key="recruitment_type"
      :isSetCol="true"
      :needFilter="true"
      :isCustomHeader="true"
      :tabs="tabs"
      :showLeftFilter="showLeftFilter"
      :page-search="false"
      :refreshCallback="searchCallback"
    >
      <template #tabHeader>
        <div class="opt-container">
          <div class="tab-panel">
            <div
              class="tab-box"
              v-for="item in cvStepList"
              :key="item.value"
              :class="{ active: selectTab === item.value }"
              @click="searchTable('status', item.value)"
            >
              <div class="triangle"></div>
              <el-tooltip :content="item.label" placement="top-start">
                <div>{{ item.label }}</div>
              </el-tooltip>
              <div class="total">{{ item.count }}</div>
            </div>
          </div>
          <div class="btn-panel">
            <div class="filter-panel">
              <AdvancedFilters ref="advancedFilterRef" :filter-list="filterList" :jobFilterList="jobPositionFilterList" @confirm="searchForTableAndJob" />
              <el-select-v2
                class="title-select-wrap long"
                v-model="selectJobPosition"
                :placeholder="$t('cv.jobPosition')"
                :options="jobPositionList"
                @remove-tag="changeJobPositionFilter(false, true)"
                @clear="changeJobPositionFilter(false, true)"
                @visible-change="changeFilterVisible"
                @change="changeJob"
                :multiple="true"
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="1"
                :height="350"
                filterable
                clearable
                popper-class="filter-select-popper"
              >
                <template #default="{ item }">
                  <div class="item-select">
                    <el-checkbox
                      :value="selectJobPosition?.includes(item.value)"
                      style="pointer-events: none"
                    >
                    </el-checkbox>
                    <el-tooltip :content="`${item.title} - ${item.project_name}`" placement="right" :hide-after="0" transition="-" :offset="getTooltipOffset(item.resume_count)">
                      <div class="ellipsis">{{ item.label }}</div>
                    </el-tooltip>
                    <div>{{ item.resume_count }}</div>
                  </div>
                </template>
              </el-select-v2>
              <template v-if="selectResume.length === 0">
                <el-select-v2
                  v-if="isShowSubStatusFilter"
                  class="title-select-wrap"
                  v-model="subStatus"
                  :options="subStatusList"
                  @change="searchTable('sub_status')"
                />
                <el-select-v2
                  v-if="isShowThirdStatusFilter"
                  class="title-select-wrap"
                  v-model="thirdStatus"
                  :options="thirdStatusList"
                  @change="searchTable('third_status')"
                />
                <el-select-v2
                  v-if="
                    Number(thirdStatus) === OnlineTestCompletedStatusEnum.EVALUATED &&
                    selectTab === CandidateStatusEnum.ONLINE_WRITTEN
                  "
                  class="title-select-wrap"
                  v-model="forthStatus"
                  :options="forthStatusList"
                  @change="searchTable('forth_status')"
                />
                <el-select-v2
                  v-if="Number(subStatus) === OnlineTestStatusEnum.COMPLETED"
                  class="title-select-wrap"
                  v-model="finalStatus"
                  :options="finalStatusList"
                  @change="searchTable('fifth_status')"
                />
              </template>
            </div>
            <div class="header-btn" v-if="selectResume.length > 0">
              <template v-for="(item, index) in buttons?.slice(0, 3)" :key="index">
                <el-dropdown v-if="item?.children?.length">
                  <el-button type="primary">
                    {{ item.label }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-for="child in item?.children"
                        :key="child.value"
                        :disabled="
                          (item.value === BtnTypeEnum.SCHEDULE_INTERVIEW && 
                          (
                          (child.paramValue === ScheduleViewEnum.ONE_BY_ONE && selectUserList.length > 1) ||
                          (child.paramValue === ScheduleViewEnum.GROUP && selectUserList.length === 1)
                          )) ||
                          (
                            item.value === BtnTypeEnum.OFFER_SENT && Number(subStatus) !== OfferStatusEnum.OFFER_NOT_SENT
                          ) || 
                          (
                            item.value === BtnTypeEnum.OFFER_FEEDBACK && Number(subStatus) !== OfferStatusEnum.OFFER_SENT
                          ) || 
                          (
                            item.value === BtnTypeEnum.TEST_RESULT && Number(subStatus) !== OnlineTestStatusEnum.COMPLETED
                          )
                        "
                        @click="clickButton(child)"
                        >{{ child.label }}</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button
                  v-else
                  :class="{ 'btn-primary-gradient': true }"
                  @click="clickButton(item)"
                  :disabled="
                  (
                    item.value === BtnTypeEnum.OFFER_SENT && Number(subStatus) !== OfferStatusEnum.OFFER_NOT_SENT
                  )
                  "
                >
                  {{ item.label }}
                </el-button>
              </template>
              <el-dropdown ref="btnDropdown" popper-class="btn-dropdown-popper" :teleported="true">
                <ElButton :class="{ 'btn-primary-gradient': false, 'btn-primary': true, 'btn-light': true, 'btn-small': true }">
                  <i class="iconfont icon-more text-primary-gradient"></i>
                </ElButton>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-menu @click.stop>
                        <template v-for="(item, index) in buttons?.slice(3)" :key="index">
                          <el-sub-menu v-if="item?.children?.length" :index="`p${index}`">
                            <template #title>
                              <span>{{item.label}}</span>
                            </template>
                            <el-menu-item v-for="(child, childIndex) in item?.children" @click="clickButton(child)" :index="`c${childIndex}`"
                            :disabled="
                              (item.value === BtnTypeEnum.SCHEDULE_INTERVIEW && 
                              (
                              (child.paramValue === ScheduleViewEnum.ONE_BY_ONE && selectUserList.length > 1) ||
                              (child.paramValue === ScheduleViewEnum.GROUP && selectUserList.length === 1)
                              )) ||
                              (
                                item.value === BtnTypeEnum.OFFER_SENT && Number(subStatus) !== OfferStatusEnum.OFFER_NOT_SENT
                              ) || 
                              (
                                item.value === BtnTypeEnum.OFFER_FEEDBACK && Number(subStatus) !== OfferStatusEnum.OFFER_SENT
                              ) || 
                              (
                                item.value === BtnTypeEnum.TEST_RESULT && Number(subStatus) !== OnlineTestStatusEnum.COMPLETED
                              )
                            "
                            >{{child.label}}</el-menu-item>
                          </el-sub-menu>
                          <el-menu-item :index="`p${index}`" v-else  @click="clickButton(item)"
                            :disabled="(
                              item.value === BtnTypeEnum.OFFER_SENT && Number(subStatus) !== OfferStatusEnum.OFFER_NOT_SENT
                            )
                            ">
                            <span>{{ item.label }}</span>
                          </el-menu-item>
                        </template>
                      </el-menu>
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="configButton" class="config">
                      <span>{{ $t('button.buttonSetting') }}</span>
                      <div class="set-icon">
                        <img src="@/assets/imgs/config.png" />
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="header-btn" v-else>
              <el-tooltip :content="$t('opt.fields')" placement="top">
                <el-badge>
                  <div class="set-icon" @click="openSetting">
                    <img src="@/assets/imgs/config2.png" />
                  </div>
                </el-badge>
              </el-tooltip>
              <EspButton :permission="UserPermissionEnum.CRC" @click="showBatch">
                {{ $t('button.uploadResume') }}
              </EspButton>
            </div>
          </div>
        </div>
      </template>
      <template #name="scope">
        <div class="name-warp">
          <!-- UN_SCREEN+has_viewed 将链接字段置灰 -->
          <a
            class="link"
            :class="{ viewed: selectTab === CandidateStatusEnum.UNSCREEN && scope.row.has_viewed }"
            @click="jumpToResumeDetail(scope.row)"
          >
            {{ scope.row.name }}
          </a>
        </div>
      </template>
      <template #status="scope">
        <div class="status-warp">
          <div
            v-if="
              (selectTab === CandidateStatusEnum.HR ||
                selectTab === CandidateStatusEnum.PROFESSIONAL ||
                selectTab === CandidateStatusEnum.C_LEVEL) &&
              !scope.row?.interview?.interview_id
            "
            class="status"
          ></div>
          <div v-else class="status" :class="CandidateStatus[scope.row.status]?.status ?? ''"></div>
          <a
            class="link"
            v-if="scope.row?.interview?.interview_id"
            @click="jumpToScheduleInterviewPage(ScheduleViewEnum.ONE_BY_ONE, true, scope.row)"
          >
            {{ CandidateStatus[scope.row.status]?.name ?? '' }}
          </a>
          <span v-else>
            {{ CandidateStatus[scope.row.status]?.name ?? '' }}
          </span>
        </div>
      </template>
      <template #screeningFeedback="scope">
        <div class="round-panel" v-if="scope.row.screening_feedbacks?.length > 0">
          <el-tooltip
            v-for="(item, index) in scope.row.screening_feedbacks"
            :key="index"
            placement="bottom-start"
          >
            <template #content>
              <div class="result">{{ InterviewerStatus?.[item.status]?.name }}</div>
              <div class="user">{{ `${$t('cv.from')} ${item.feedback_user_name}` }}</div>
              <div>{{ item.notes }}</div>
            </template>
            <div class="round-user" :class="`status${item.status}`">
              {{ getFirstLetterUpperCase(item.feedback_user_name) }}
            </div>
          </el-tooltip>
        </div>
      </template>
      <template #testFeedback="scope">
        <div class="round-panel" v-if="scope.row?.exam?.exam_forwards?.length > 0">
          <el-tooltip
            v-for="item in scope.row?.exam?.exam_forwards ?? []"
            :key="item.forward_id"
            placement="bottom-start"
          >
            <template #content>
              <div class="result">{{ TestInterviewStatus?.[item.status]?.name }}</div>
              <div class="user">{{ `${$t('cv.from')} ${item.interviewer_name}` }}</div>
              <div>{{ item.feedback_notes }}</div>
            </template>
            <div class="round-user" :class="`status${item.status}`">
              {{ getFirstLetterUpperCase(item.interviewer_name) }}
            </div>
          </el-tooltip>
        </div>
      </template>
      <template #interviewResult="scope">
        <div class="round-panel" v-if="scope.row?.interview?.feedbacks?.length > 0">
          <el-tooltip
            v-for="item in scope.row?.interview?.feedbacks ?? []"
            :key="item.feedback_id"
            placement="bottom-start"
          >
            <template #content>
              <div class="result">{{ FeedbackResult?.[item.interview_result]?.name }}</div>
              <div class="user">{{ `${$t('cv.from')} ${item.operator_name}` }}</div>
            </template>
            <div class="round-user" :class="`result${item.interview_result}`">
              {{ getFirstLetterUpperCase(item.operator_name) }}
            </div>
          </el-tooltip>
        </div>
      </template>
      <template #tags="scope">
        <el-tooltip placement="top">
          <template #content>
            <div v-for="info in scope.row?.tags ?? []" :key="info.tag_id">
              <span>{{ info.tag_name }}: </span>
              <span>{{ info.match_count }}</span>
            </div>
          </template>
          <div class="cell-tag">
            <div
              class="tag-item"
              v-for="info in scope.row?.tags ?? []"
              :key="info.tag_id"
              :class="info.match_type === TagMatchEnum.PARTIAL_MATCH ? 'tag-gray' : ''"
            >
              <div class="tag-text">{{ info.tag_name }}</div>
              <div class="tag-num">{{ info.match_count }}</div>
            </div>
          </div>
        </el-tooltip>
      </template>
      <template #operation="{ row }">
        <el-tooltip :content="$t('opt.edit')" placement="top">
          <span class="operation-icon">
            <i @click="showEdit(row.id)" class="iconfont icon-edit text-primary-gradient"></i>
          </span>
        </el-tooltip>
        <el-tooltip :content="$t('opt.comment')" placement="top">
          <span class="operation-icon">
            <i @click="addQuickNotes(row)" class="iconfont icon-comment text-primary-gradient"></i>
          </span>
        </el-tooltip>
        <el-dropdown
          v-if="selectTab === CandidateStatusEnum.UNSCREEN"
        >
          <span class="dropdown-icon">
            <i class="iconfont icon-more text-primary-gradient"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="batchMoveToResumeScreen(row.id)">{{ $t('opt.suitable') }}</el-dropdown-item>
              <el-dropdown-item @click="batchCvFail(row.id)">{{ $t('opt.notSuitable') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template #notes="{ row }">
        <template v-if="row.notes?.startsWith(LIEPIN_URL)">
          <template :key="link" v-for="link of getLinks(row.notes)">
            <p>
              <el-link :href="link" type="primary" target="_blank">{{
                $t('button.checkContactInfoInLiePin')
              }}</el-link>
            </p>
          </template>
        </template>
        <el-tooltip :content="row.notes" placement="top" v-else popper-class="notes-tip">
          <div class="notes">{{ row.notes }}</div>
        </el-tooltip>
      </template>
    </EspTable>
    <EspUpload ref="espUploadRef" class="upload-resume-wrap" />
    <ResumePreview ref="resumePreviewRef" />
    <EspDialogForm ref="forwardResumeRef" />
    <EspDialogForm ref="forwardWrittenTestRef" />
    <TalentPoolDialog ref="talentPoolRef" @close="updateTableDataAndTotalByFilter()" />
    <ContactCandidateDialog ref="contactCandidateRef" @close="closeContactCandidateDialog" />
    <OnboardingDialog ref="onboardingDialogRef" @close="refreshTable" />
    <QuickNotesDialog ref="quickNotesDialogRef" @close="refreshTable(true)" />
    <SendWrittenTest ref="sendWrittenTestRef" @close="refreshTable" />
    <ButtonSettingDialog ref="buttonSettingRef" @close="getButtonByStatus" />
  </EspMain>
</template>
<script setup lang="ts">
import {
  CV_TABLE,
  FORWARD_RESUME_FORM,
  FILTER_FORM,
  JOBPOSITION_FILTER_FORM,
  FORWARD_TEST_FORM
} from './data'
import { useLocale } from '@/hooks/useLocale'
import { RecruitmentType } from '@/enums/recruitmentTypeEnum'
import {
  enumItem2arr,
  getTableTabs,
  getFirstLetterUpperCase,
  getLinks,
  getOptionsByGroup,
  getTreeOptionsByGroup,
  openNewWindow
} from '@/utils'
import { CV_MANAGEMENT_HEADER, OPEN_DIALOG, LIEPIN_URL } from '@/config/index'
import ResumePreview from './components/ResumePreview.vue'
import TalentPoolDialog from './components/TalentPoolDialog.vue'
import ContactCandidateDialog from './components/ContactCandidateDialog.vue'
import QuickNotesDialog from './components/QuickNotesDialog.vue'
import OnboardingDialog from './components/OnboardingDialog.vue'
import AdvancedFilters from './components/AdvancedFilters.vue'
import SendWrittenTest from './components/SendWrittenTest.vue'
import ButtonSettingDialog from './components/ButtonSettingDialog.vue'
import { UploadFile } from 'element-plus'
import { FeedbackResult } from '@/enums/myInterviewStatusEnum'

import {
  forwardResumes,
  getCVPage,
  moveTo,
  getStatusTotal,
  offerSent,
  editOfferSent,
  getJobPositionList,
  forwardTest,
  HRfeedback,
  moveToPool
} from '@/api/modules/cv'
import CV from '@/api/interface/cv'
import { Gender } from '@/enums/genderEnum'
import { EmploymentStatus } from '@/enums/employmentStatusEnum'
import { Degree } from '@/enums/degreeEnum'
import { ResumeSource } from '@/enums/resumeSourceEnum'
import { TagMatchEnum } from '@/enums/tagMatchEnum'
import {
  ROUTER_CV_MANAGEMENT_DETAIL,
  ROUTER_CV_MANAGEMENT_EDIT,
  ROUTER_CV_MANAGEMENT_SCHEDULE_INTERVIEW
} from '@/router/routerName'
import { CandidateStatus, CandidateStatusEnum } from '@/enums/candidateStatusEnum'
import mittBus from '@/utils/mittBus'
import { useCVStore } from '@/store/modules/cv'
import { UserPermissionEnum } from '@/enums/userPermission'
import { cloneDeep } from 'lodash-es'
import { ResultEnum } from '@/enums/httpEnum'
import { ScheduleViewEnum } from '@/enums/scheduleViewEnum'
import { InterviewerStatus } from '@/enums/interviewerEnum'
import { TestInterviewStatus } from '@/enums/testInterviewStatusEnum'
import {
  OfferSentStatus,
  OfferStatusEnum,
  OfferStatus,
  ReceivedFeedbackStatus,
  ResumeScreenReviewedStatus,
  ResumeScreenStatus,
  ResumeScreenStatusEnum,
  ScheduleInterviewStatusEnum,
  ScheduleInterviewStatusPro,
  ScheduleInterviewStatusCLevel,
  ScheduleInterviewStatusHr,
  OnboardingStatusEnum,
  OnlineTestStatus,
  OnlineTestStatusEnum,
  OnlineTestCompletedStatus,
  OnlineTestCompletedStatusEnum,
  OnlineTestCompleteEvaluatedStatus,
  WrittenFinalStatus,
  WrittenFinalStatusEnum
} from '@/enums/cvStatusEnum'
import { SearchOption } from '@/api/interface'
import { getWorkLocationIdsUnderChina, WorkLocationEnum } from '@/enums/workLocationEnum'
import { getUserSettings, saveUserSettings } from '@/api/modules/user'
import { UserSettingTypeEnum } from '@/enums/userSettingTypeEnum'
import { useCVFilterStore } from '@/store/modules/cvFilter'
import { PooledReasonEnum } from '@/enums/pooledReasonEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { BtnTypeEnum, ButtonLists, ButtonSettings, ButtonSortMap } from '@/enums/btnTypeEnum'
import { getTableButtonConfig } from '@/api/modules/common'
import { ProjectStatusEnum } from '@/enums/projectStatusEnum'
const { $t } = useLocale()

const cvStore = useCVStore()
const cvFilterStore = useCVFilterStore()
const router = useRouter()
const espTable = ref()
const espUploadRef = ref()
const resumePreviewRef = ref()
const forwardResumeRef = ref()
const forwardWrittenTestRef = ref()
const talentPoolRef = ref()
const contactCandidateRef = ref()
const onboardingDialogRef = ref()
const quickNotesDialogRef = ref()
const sendWrittenTestRef = ref()
const advancedFilterRef = ref()
const buttonSettingRef = ref()
const btnDropdown = ref()
const initParam = ref<Record<string, any>>(cvStore.searchParam ?? {})
const selectTab = ref<string | number>('all')
const tabs = ref<Form.FormSelect[]>(getTableTabs(RecruitmentType))
const buttons = ref<Form.FormSelect[]>([])
// 列表字段
const tableColumns = ref<Table.ColumnProps[]>()
// 筛选字段列表
const filterList = ref<Form.FormItem[]>([])
// 选中的列表数据对应的user数据列表
const selectUserList = ref<Form.FormSelect[]>([])
// 选中的列表数据对应的简历id列表
const selectResume = ref<number[]>([])
// 选中的列表数据对应的job position列表
const selectJobPositionIds = ref<number[]>([])
const cvStepList = ref<Form.FormSelect[]>([])
const cvStepMoveToList = ref<Form.FormSelect[]>([])
// 当前有job修改了
const jobHasChange = ref<boolean>(false)
const changeJob = () => {
  jobHasChange.value = true
}

const changeFilterVisible = (visible: boolean) => {
  if (!visible && jobHasChange.value) {
    changeJobPositionFilter(false, true)
  }
}
// 是否显示左边搜索
const showLeftFilter = ref<boolean>(false)
// 搜索position
const searchPosition = ref<string>('')
// job position列表
const jobPositionList = ref<Form.FormSelect[]>([])
const allPositionList = ref<Form.FormSelect[]>([])
const filterPositionIds = ref<number[]>([])
// 当前选择的job position筛选
const selectJobPosition = ref<number[]>([])
// job position过滤form
const jobPositionFilterList = ref<Form.FormItem[]>([])
// job position search param数据
const jobPositionSearchParam = ref<any>({project_status: [ProjectStatusEnum.ACTIVE]})

// 选中的二级状态
const subStatus = ref<number | string>()
const subStatusList = ref<Form.FormSelect[]>([])
// 选中的三级状态
const thirdStatus = ref<number | string>()
const thirdStatusList = ref<Form.FormSelect[]>([])
// 选中的四级状态
const forthStatus = ref<number | string>()
const forthStatusList = ref<Form.FormSelect[]>([])
// 选中的final状态-completed下
const finalStatus = ref<number | string>()
const finalStatusList = ref<Form.FormSelect[]>([])
// 是否显示二级状态查询
const isShowSubStatusFilter = ref<boolean>(false)
// 是否显示三级状态查询
const isShowThirdStatusFilter = ref<boolean>(false)

const clickButton = (item: Form.FormSelect) => {
  btnDropdown.value.handleClose()
  switch(item.value){
    case BtnTypeEnum.BATCH_NOTES:
      batchNote()
      break
    case BtnTypeEnum.CONTACT_CANDIDATE:
      contactCandidate()
      break
    case BtnTypeEnum.FORWARD_RESUME:
      forwardResume()
      break
    case BtnTypeEnum.FORWARD_TEST:
      forwardWrittenTest()
      break
    case BtnTypeEnum.MOVETO_UNSCREEN:
    case BtnTypeEnum.MOVETO_RESUME_SCREEN:
    case BtnTypeEnum.MOVETO_ONLINE_WRITTEN:
    case BtnTypeEnum.MOVETO_HR:
    case BtnTypeEnum.MOVETO_PROFESSIONAL:
    case BtnTypeEnum.MOVETO_C_LEVEL:
    case BtnTypeEnum.MOVETO_OFFER_MANAGEMENT:
    case BtnTypeEnum.MOVETO_ONBOARD:
    case BtnTypeEnum.MOVETO_TALENT_POOL:
      changeStatus(item.paramValue)
      break
    case BtnTypeEnum.SUITABLE:
      batchMoveToResumeScreen()
      break
    case BtnTypeEnum.NOT_SUITABLE:
      batchCvFail()
      break
    case BtnTypeEnum.TALENT_POOL:
      openTalentPoolDialog()
      break
    case BtnTypeEnum.SEND_TEST:
      sendWrittenTest()
      break
    case BtnTypeEnum.ON_BOARDING_DATE:
      updateOnboardingDate()
      break
    case BtnTypeEnum.SCHEDULE_GROUP:
    case BtnTypeEnum.SCHEDULE_ONE_BY_ONE:
      openScheduleView(item.paramValue)
      break
    case BtnTypeEnum.OFFER_SENT:
      changeOfferStatus()
      break
    case BtnTypeEnum.OFFER_ACCEPT:
    case BtnTypeEnum.OFFER_REJECT:
      changeOfferStatus(item.paramValue)
      break
    case BtnTypeEnum.TEST_RESULT_PASS:
    case BtnTypeEnum.TEST_RESULT_FAIL:
      hrFeedback(item.paramValue)
      break
  }
}

const getTooltipOffset = (count: number) => {
  if (count < 10) {
    return 20
  } else if (count < 100) {
    return 25
  } else if (count < 1000) {
    return 32
  } else {
    return 40
  }
}
// 不合适的话批量cv fail
const batchCvFail = (resumeId?: number) => {
  let resumes: CV.EmailInfo[] = []
  if (resumeId) {
    resumes = [{
      resume_id: resumeId,
      email_subject: '',
      email_content: ''
    }]
  } else {
    selectResume.value?.forEach(data => {
      resumes.push({
        resume_id: data,
        email_subject: '',
        email_content: ''
      })
    })
  }
  const param: CV.MoveTalentPoolInfo = {
    pooled_reason: PooledReasonEnum.CV_FAIL,
    send_thanks_letter: false,
    resumes: resumes
  }
  moveToPool(param).then(res => {
    if (res?.success) {
      ElMessage.success({ message: $t('message.moveSuc') })
      updateTableDataAndTotalByFilter()
    }
  })
}
// 合适的话批量移动到“Resume Screening”状态
const batchMoveToResumeScreen = (resumeId?: number) => {
  changeStatus(CandidateStatusEnum.RESUME_SCREEN, resumeId)
}

const openTalentPoolDialog = () => {
  talentPoolRef.value &&
      talentPoolRef.value.acceptParams({
        userList: selectUserList.value
      })
}
const initTable = (tables: CV.CVDetail[]) => {
  cvStore.setSearchParam()
  return tables.map(item => {
    item.gender_name = Gender?.[item?.gender]?.name ?? item.gender
    item.employment_status_name =
      EmploymentStatus?.[item?.employment_status]?.name ?? item.employment_status_name
    item.highest_degree_name = Degree?.[item?.highest_degree]?.name ?? item.highest_degree
    item.recruitment_source_name =
      ResumeSource?.[item?.recruitment_source]?.name ?? item.recruitment_source_name
    const placeOfBirth: string[] = []
    if (item?.native_place_province) {
      placeOfBirth.push(item?.native_place_province)
    }
    if (item?.native_place_city) {
      placeOfBirth.push(item?.native_place_city)
    }
    item.placeOfBirth = placeOfBirth.join('-')
    item.test_score = item?.exam?.score || item?.exam?.score === 0 ? item?.exam?.score : ''
    item.exam_result = WrittenFinalStatus?.[item?.exam?.hr_feedback]?.name ?? ''
    return item
  })
}
const searchCallback = async (
  pageable: { page_num: number; page_size: number; total_count: number },
  searchParam: { [key: string]: any }
) => {
  if (pageable?.page_size && pageable?.page_num) {
    await cvFilterStore.setPage(pageable.page_num)
    await cvFilterStore.setPageSize(pageable.page_size)
  }
  const param = cloneDeep(searchParam)
  for (const key in param) {
    if (param[key] === '' || param[key] === null || param[key]?.length === 0) {
      delete param[key]
    }
  }
  // 更新顶部的total数据
  const result = await getStatusTotal(param)
  updateStatusTotal(result?.result ?? [])
}

const showBatch = () => {
  espUploadRef.value &&
    espUploadRef.value.acceptParams({
      title: $t('button.uploadResume'),
      accept: 'PDF/DOC/DOCX/HTML',
      showBtn: false,
      changeFile: showFileDetail
    })
}
const showFileDetail = (file: UploadFile) => {
  resumePreviewRef.value &&
    resumePreviewRef.value.acceptParams({
      title: $t('dialog.resumePreview'),
      file
    })
}
const showEdit = (id: number) => {
  const { href } = router.resolve({
    path: `/${ROUTER_CV_MANAGEMENT_EDIT}/${id}`
  })
  window.open(href, '_blank')
}

// 转发简历
const forwardResume = () => {
  const formData = cloneDeep(FORWARD_RESUME_FORM)
  const index = formData.findIndex(info => info.prop === 'candidate_resume_ids')
  formData[index].options = selectUserList.value
  formData[index].value = selectResume.value
  forwardResumeRef.value &&
    forwardResumeRef.value.acceptParams({
      title: $t('cv.forwardResumes'),
      isView: false,
      apiUrl: forwardResumes,
      formData: formData,
      size: 'middle',
      message: $t('message.forwardSuc'),
      getTableList: () => {
        espTable.value.clearSelection()
      }
    })
}

// 转发笔试成绩
const forwardWrittenTest = () => {
  const hasNoScoreTest = selectUserList.value?.find(
    info => !info.test_score && info.test_score !== 0
  )
  if (hasNoScoreTest) {
    ElMessage.warning($t('message.forwardTestLimit'))
    return
  }
  const formData = cloneDeep(FORWARD_TEST_FORM)
  const index = formData.findIndex(info => info.prop === 'resume_ids')
  formData[index].options = selectUserList.value
  formData[index].value = selectResume.value
  forwardWrittenTestRef.value &&
    forwardWrittenTestRef.value.acceptParams({
      title: $t('cv.forwardTest'),
      isView: false,
      apiUrl: forwardTest,
      formData: formData,
      size: 'middle',
      message: $t('message.forwardSuc'),
      getTableList: () => {
        espTable.value.clearSelection()
      }
    })
}
// 修改状态
const changeStatus = (status: number, resumeId?: number) => {
  const param: CV.MoveToParam = {
    candidate_resume_ids: resumeId ? [resumeId] : selectResume.value,
    move_to_status: status
  }
  const onboardedData = selectUserList.value?.filter(
    data => data.sub_status === OnboardingStatusEnum.ONBOARDED
  )
  if (onboardedData.length > 0) {
    ElMessage.warning($t('message.moveFromOnboardLimit'))
    return
  }
  // const activeInterviewData = selectUserList.value?.filter(data => data.has_active_interview === true || data.has_active_exam == true)
  // if (activeInterviewData.length > 0 && (status === CandidateStatusEnum.OFFER_MANAGEMENT || status === CandidateStatusEnum.ONBOARD)) {
  //   ElMessage.warning($t('message.moveToLimit'))
  //   return
  // }
  if (status === CandidateStatusEnum.TALENT_POOL) {
    openTalentPoolDialog()
    return
  }
  if (status === CandidateStatusEnum.ONBOARD) {
    onboardingDialogRef.value &&
      onboardingDialogRef.value.acceptParams({
        userList: selectUserList.value
      })
    return
  }
  moveTo(param).then(async res => {
    if (res?.code === ResultEnum.SUCCESS) {
      ElMessage.success({ message: $t('message.moveSuc') })
      changeJobPositionFilter()
    }
  })
}

const updateTableDataAndTotalByFilter = async () => {
  await getAllPositionList()
  // 修改job filter侧边栏的值并搜索
  searchJobPosition(null, false, true)
}

// 更新 onboard date
const updateOnboardingDate = () => {
  const onboardingDate =
    selectUserList.value?.length === 1
      ? selectUserList.value?.[0]?.expect_onboarding_date ?? ''
      : ''
  onboardingDialogRef.value &&
    onboardingDialogRef.value.acceptParams({
      userList: selectUserList.value,
      isUpdate: true,
      onboardingDate: onboardingDate
    })
}

// 添加quick notes
const addQuickNotes = (row: CV.CVInfo) => {
  quickNotesDialogRef.value &&
    quickNotesDialogRef.value.acceptParams({
      id: row.id,
      candidate: row.name
    })
}

// 刷新列表和顶部tab的数字
const refreshTable = async (isUpdate?: boolean) => {
  const param = selectTab.value === 'all' ? { status: '' } : { status: selectTab.value }
  espTable.value && espTable.value.changeSearch(param, param)
  espTable.value.clearSelection()
  if (!isUpdate) {
    // 更新顶部的total数据
    const result = await getStatusTotal()
    updateStatusTotal(result?.result ?? [])
  }
}

// 关闭contact candidate窗口
const closeContactCandidateDialog = () => {
  espTable.value.clearSelection()
}

// 查询数据
const searchTable = async (type: string, status?: number | string) => {
  let statusValue: number | string = ''
  switch (type) {
    case 'status':
      selectTab.value = status!
      statusValue = status!
      setSubFilterList(statusValue)
      isShowThirdStatusFilter.value = false
      break
    case 'sub_status':
      statusValue = subStatus.value!
      switch (Number(statusValue)) {
        case ResumeScreenStatusEnum.REVIEWED:
        case ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_HR:
        case ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_PRO:
        case ScheduleInterviewStatusEnum.RECEIVED_FEEDBACK_C_LEVEL:
        case OfferStatusEnum.OFFER_SENT:
          isShowThirdStatusFilter.value = true
          break
        case OnlineTestStatusEnum.COMPLETED:
          isShowThirdStatusFilter.value = true
          finalStatus.value = 'all'
          finalStatusList.value = getTableTabs(WrittenFinalStatus)
          break
        default:
          isShowThirdStatusFilter.value = false
          break
      }
      thirdStatus.value = 'all'
      break
    case 'third_status':
      statusValue = thirdStatus.value!
      if (
        Number(thirdStatus.value) === OnlineTestCompletedStatusEnum.EVALUATED &&
        selectTab.value === CandidateStatusEnum.ONLINE_WRITTEN
      ) {
        forthStatus.value = 'all'
        forthStatusList.value = getTableTabs(OnlineTestCompleteEvaluatedStatus)
      }
      break
    case 'forth_status':
      statusValue = forthStatus.value!
      break
    case 'fifth_status':
      statusValue = finalStatus.value!
      break
    default:
      break
  }
  const columns = espTable.value.getTableColumns()
  const index = columns?.findIndex((data: Table.ColumnProps) => data.prop === 'expect_onboarding_date')
  if (index != -1) {
    columns[index].isShow = selectTab.value === CandidateStatusEnum.ONBOARD
  }
  const param = statusValue === 'all' ? { [type]: '' } : { [type]: parseInt(statusValue as string) }
  // tab切换时清空全部sub status和third status数据
  if (type === 'status') {
    param.sub_status = ''
    param.third_status = ''
    param.forth_status = ''
    param.fifth_status = ''
  }
  // sub status切换清空后面status数据
  if (type === 'sub_status') {
    param.third_status = ''
    param.forth_status = ''
    param.fifth_status = ''
  }
  // third status切换清空forth status数据
  if (type === 'third_status') {
    param.forth_status = ''
  }
  param.page_num = 1
  if (cvFilterStore.pageSize) {
    param.page_size = cvFilterStore.pageSize
  }
  espTable.value && espTable.value.changeSearch(param, param)
  espTable.value.clearSelection()
  // 获取定制的button列表
  getButtonByStatus()
  // 缓存tab
  await cvFilterStore.setSelectTab(selectTab.value)
}

// 设置每个状态对应的子筛选器
const setSubFilterList = (statusValue: number | string) => {
  subStatus.value = 'all'
  thirdStatus.value = 'all'
  switch (statusValue) {
    case CandidateStatusEnum.RESUME_SCREEN:
      isShowSubStatusFilter.value = true
      subStatusList.value = getTableTabs(ResumeScreenStatus)
      thirdStatusList.value = getTableTabs(ResumeScreenReviewedStatus)
      break
    case CandidateStatusEnum.ONLINE_WRITTEN:
      isShowSubStatusFilter.value = true
      subStatusList.value = getTableTabs(OnlineTestStatus)
      thirdStatusList.value = getTableTabs(OnlineTestCompletedStatus)
      break
    case CandidateStatusEnum.PROFESSIONAL:
      isShowSubStatusFilter.value = true
      subStatusList.value = getTableTabs(ScheduleInterviewStatusPro)
      thirdStatusList.value = getTableTabs(ReceivedFeedbackStatus)
      break
    case CandidateStatusEnum.C_LEVEL:
      isShowSubStatusFilter.value = true
      subStatusList.value = getTableTabs(ScheduleInterviewStatusCLevel)
      thirdStatusList.value = getTableTabs(ReceivedFeedbackStatus)
      break
    case CandidateStatusEnum.HR:
      isShowSubStatusFilter.value = true
      subStatusList.value = getTableTabs(ScheduleInterviewStatusHr)
      thirdStatusList.value = getTableTabs(ReceivedFeedbackStatus)
      break
    case CandidateStatusEnum.OFFER_MANAGEMENT:
      isShowSubStatusFilter.value = true
      subStatusList.value = getTableTabs(OfferStatus)
      thirdStatusList.value = getTableTabs(OfferSentStatus)
      break
    default:
      isShowSubStatusFilter.value = false
      break
  }
}

// 打开field setting
const openSetting = () => {
  espTable.value.openColSetting()
}

// 打开filter
const openFilterPanel = () => {
  espTable.value.openFilterPanel()
}

//跳转简历详情页面
const jumpToResumeDetail = (data: CV.CVInfo) => {
  console.log(data)
  // 跳转到详情页面
  openNewWindow(`${ROUTER_CV_MANAGEMENT_DETAIL}/${data.id}`)
}

// 跳转Schedule Interview页面
const jumpToScheduleInterviewPage = async (type: number, isFromList: boolean, data?: any) => {
  const id = isFromList ? data?.interview?.interview_id : data
  const interviewType = data && isFromList ? data?.interview?.interview_type : type
  const query = data && isFromList ? { id, isDetail: 'true' } : { id }
  const jobPositionId =
    data && isFromList ? data.applying_position : selectJobPositionIds.value?.[0]
  if (data && data.applying_position && isFromList) {
    selectUserList.value = [{ value: data.id, label: data.name, ...data }]
    await cvStore.setSelectedCandidate(selectUserList.value)
  }
  const routerPath = id
    ? {
        path: `/${ROUTER_CV_MANAGEMENT_SCHEDULE_INTERVIEW}/${interviewType}/${jobPositionId}`,
        query: query
      }
    : {
        path: `/${ROUTER_CV_MANAGEMENT_SCHEDULE_INTERVIEW}/${interviewType}/${jobPositionId}`
      }
  const { href } = router.resolve(routerPath)
  window.open(href, '_blank')
}
// 打开schedule view页面
const openScheduleView = async (type: number) => {
  if (type === ScheduleViewEnum.GROUP && selectJobPositionIds.value.length > 1) {
    ElMessage.warning($t('message.groupInterviewLimit'))
    return
  }
  await cvStore.setSelectedCandidate(selectUserList.value)
  let hasEmptyName: boolean = false
  const interviewIds: number[] = []
  const interviewTypes: number[] = []
  selectUserList.value?.forEach(data => {
    if (data.label === undefined || data.label === null || data.label === '') {
      hasEmptyName = true
    }
    // 如果hr面试/专业面试/ceo面试已经全部进入received状态，则schedule interview约面试的时候是新增面试
    if (data.has_active_interview) {
      if (data?.interview?.interview_id) {
        interviewIds.push(data?.interview?.interview_id)
      }
      if (
        data?.interview?.interview_type ||
        data?.interview?.interview_type === ScheduleViewEnum.ONE_BY_ONE
      ) {
        interviewTypes.push(data?.interview?.interview_type)
      }
    }
  })
  let uniqueInterviewIds = [...new Set(interviewIds)]
  // 如果出现多选的2个面试存在不同的面试id(一个有id，一个没有id；2个都有id但是id不一样),则不允许进入
  if (
    (selectUserList.value.length !== interviewIds.length && interviewIds.length !== 0) ||
    uniqueInterviewIds.length > 1
  ) {
    ElMessage.warning($t('message.sameInterviewLimit'))
    return
  }
  const interviewType = interviewIds.length > 0 ? interviewTypes?.[0] : type
  // 如果存在名称为空的情况
  if (hasEmptyName) {
    ElMessageBox.confirm($t('message.emptyNameLimit'), $t('message.tips'), {
      confirmButtonText: $t('button.confirm'),
      cancelButtonText: $t('button.cancel'),
      type: 'warning'
    }).then(() => {
      jumpToScheduleInterviewPage(interviewType, false, uniqueInterviewIds?.[0])
    })
    return
  }
  jumpToScheduleInterviewPage(interviewType, false, uniqueInterviewIds?.[0])
}

// 修改offer状态
const changeOfferStatus = (type?: number) => {
  const param: any = type
    ? {
        resume_ids: selectResume.value,
        feedback_status: type
      }
    : selectResume.value
  const action = type ? editOfferSent(param) : offerSent(param)
  action.then(res => {
    if (res?.success) {
      espTable.value.clearSelection()
      searchTable('third_status')
    }
  })
}

// 联系候选人
const contactCandidate = () => {
  if (selectUserList.value?.length > 100) {
    ElMessage.warning({ message: $t('message.contactLimit') })
    return
  }
  contactCandidateRef.value &&
    contactCandidateRef.value.acceptParams({
      userList: selectUserList.value
    })
}

// 批量添加notes
const batchNote = () => {
  const ids =
    selectUserList.value?.map(d => {
      return d.value
    }) ?? []
  quickNotesDialogRef.value &&
    quickNotesDialogRef.value.acceptParams({
      ids: ids
    })
}

// 打开发送笔试窗口
const sendWrittenTest = () => {
  const activeExamData = selectUserList.value?.filter(data => data.has_active_exam == true)
  if (activeExamData.length > 0) {
    ElMessage.warning({ message: $t('message.sendTestLimit') })
    return
  }
  sendWrittenTestRef.value &&
    sendWrittenTestRef.value.acceptParams({
      userList: selectUserList.value
    })
}

// 自定义button
const configButton = () => {
  buttonSettingRef.value &&
    buttonSettingRef.value.acceptParams({
      table: CV_MANAGEMENT_HEADER,
      state: selectTab.value,
      buttons: buttons.value
    })
}
const searchForTableAndJob = async (searchParam: any, param: any) => {
  await cvFilterStore.setFilterParam(searchParam)
  // 搜索job
  searchJobPosition(param)
}

// 修改选中的job position筛选
const changeJobPositionFilter = async (isInit?: boolean, isJobChange?: boolean) => {
  // 每次job filter修改完更新之后把状态设置成false，为了控制不每次关闭下拉选项的时候都刷新
  if (isJobChange) {
    jobHasChange.value = false
  }
  // 如果筛选出来的jobposition列表为空，则传一个查不出数据的id，查空列表
  const filterIds =
    jobPositionList.value?.length === 0
      ? [-1]
      : filterPositionIds.value?.length === 0
      ? null
      : filterPositionIds.value
  let param: any =
    selectJobPosition.value?.length === 0
      ? { applying_position_id: filterIds }
      : { applying_position_id: selectJobPosition.value }
  if (cvFilterStore.selectTab) {
    param.status = cvFilterStore.selectTab
    if (isInit) {
      selectTab.value = cvFilterStore.selectTab
      setSubFilterList(selectTab.value)
    }
  }
  if (cvFilterStore.page) {
    param.page_num = cvFilterStore.page
  }
  if (cvFilterStore.pageSize) {
    param.page_size = cvFilterStore.pageSize
  }
  if (cvFilterStore.filterParam) {
    param = { ...param, ...cvFilterStore.filterParam }
    filterList.value.forEach(data => {
      data.value = cvFilterStore.filterParam?.[data.prop] ?? null
      if (data.prop === 'graduation_year' || data.prop === 'applied_at') {
        data.startDate = cvFilterStore.filterParam?.[data.minProp] ?? undefined
        data.endDate = cvFilterStore.filterParam?.[data.maxProp] ?? undefined
      }
      if (data.prop === 'written_exam_score') {
        data.min = cvFilterStore.filterParam?.[data.minProp] || cvFilterStore.filterParam?.[data.minProp] === 0 ? parseInt(cvFilterStore.filterParam?.[data.minProp]) : undefined
        data.max = cvFilterStore.filterParam?.[data.maxProp] || cvFilterStore.filterParam?.[data.maxProp] === 0 ? parseInt(cvFilterStore.filterParam?.[data.maxProp]) : undefined
      }
    })
  }
  espTable.value && espTable.value.changeSearch(param, param)
  espTable.value.clearSelection()
}

// update status total
const updateStatusTotal = (totalList: CV.StatusTotalResult[]) => {
  let total: number = 0
  const statusTotalMap: any = {}
  totalList.forEach(data => {
    total += data.count
    statusTotalMap[data.status] = data.count
  })
  cvStepList.value.forEach(data => {
    data.count = data.value === 'all' ? total : statusTotalMap[data.value] ?? 0
  })
}

// 搜索job position
const searchJobPosition = (param?: any, isInit?: boolean, isUpdate?: boolean) => {
  jobPositionSearchParam.value = param || isInit ? { ...param } : { ...jobPositionSearchParam.value }
  jobPositionSearchParam.value.title = searchPosition.value
  jobPositionFilterList.value.forEach((item: Form.FormItem) => {
    item.value = jobPositionSearchParam.value?.[item.prop] ?? []
    if (item.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT) {
      item.defaultExpendKeys = item?.value ?? []
    }
  })
  const searchParam = cloneDeep(jobPositionSearchParam.value)
  let list: Form.FormSelect[] = []
  let jobPositionIds: number[] = []
  const props = Object.keys(searchParam)
  if (props.length === 0 || (props.length === 1 && props?.[0] === 'title' && !searchPosition.value)) {
    list = cloneDeep(allPositionList.value)
    jobPositionIds = []
  } else {
    allPositionList.value?.forEach((data: any) => {
      data.work_location_ids = data?.work_location?.map((info: CV.WorkLocation) => info.value)
      if (
        props.every(
          prop =>
            (prop !== 'work_location_ids' &&
              (data[prop]
                ?.toString()
                ?.toLowerCase()
                .indexOf(searchParam[prop]?.toString()?.toLowerCase()) > -1 ||
                searchParam[prop]?.includes(data[prop]))) ||
            (prop === 'work_location_ids' && hasContainLocation(data[prop], searchParam[prop]))
        )
      ) {
        list.push(data)
        jobPositionIds.push(data.id)
      }
    })
  }
  jobPositionList.value = [...list]
  filterPositionIds.value = [...jobPositionIds]
  if (!isUpdate) {
    selectJobPosition.value = []
  }
  changeJobPositionFilter(isInit)
  // 初始化的时候不用保存而是获取上次保存的筛选
  if (!isInit) {
    // 筛选查询的时候保存筛选项
    saveUserSettings({ type: UserSettingTypeEnum.CV_MANAGEMENT_QUERY, settings: searchParam })
  }
}

// 有相同或者下级location数据
const hasContainLocation = (locations: any, searchLocations: any) => {
  if (!Array.isArray(locations) || !Array.isArray(searchLocations)) {
    return false
  }
  let actualLoaction = [...searchLocations]
  // 查china需要查询下级
  if (searchLocations?.includes(WorkLocationEnum.CHINA)) {
    actualLoaction = [...actualLoaction, ...getWorkLocationIdsUnderChina()]
  }
  // 查india需要查询下级
  if (searchLocations?.includes(WorkLocationEnum.INDIA)) {
    actualLoaction = [...actualLoaction, WorkLocationEnum.INDIA_PUNE]
  }
  // 查czech需要查询下级
  if (searchLocations?.includes(WorkLocationEnum.CZECH)) {
    actualLoaction = [...actualLoaction, WorkLocationEnum.CZECH_BRNO]
  }
  return locations.some(item => actualLoaction.includes(item))
}

// 初始化下拉框
const initFilterOptions = async () => {
  const arrFun: SearchOption[] = []
  jobPositionFilterList.value.forEach((item: Form.FormItem, index: number) => {
    if (item.getOptions) {
      arrFun.push({ index, options: item.getOptions(item?.initOptionParams), enum: item?.enum })
    }
  })
  const results = await Promise.all(Object.values(arrFun))
  for (const item of results) {
    item.options.then((result: any) => {
      let list = result?.result ?? []
      const column = jobPositionFilterList.value?.[item.index]
      column.options = list.map((info: any) => {
        let obj = {} as Form.FormSelect
        let label: string = ''
        obj = { ...info }
        const optionNames = column?.optionName
        if (Array.isArray(optionNames)) {
          for (const key of optionNames) {
            label = `${label} ${info[key]}`
          }
        } else {
          label = info[optionNames ?? 'name']
        }
        obj.label = label
        obj.value = info[column?.optionKey ?? 'id']
        if (item?.enum) {
          obj.label = item?.enum?.[obj.value as string]?.name ?? obj.label
        }
        return obj
      })
      if (column?.isOptionGroup) {
        column.options = getOptionsByGroup(column.options!, item?.enum)
      }
      if (column?.type === FormItemTypeEnum.TREE_SELECT || column?.type === FormItemTypeEnum.TREE_MULTIPLE_SELECT) {
        column.options = getTreeOptionsByGroup(column.options!, item?.enum)
      }
    })
  }
}

// hr 反馈
const hrFeedback = (isPass: boolean) => {
  const hasAlreadyFeedbackData = selectUserList.value?.find(
    info => !info.has_active_exam && info?.exam?.hr_feedback_name
  )
  if (hasAlreadyFeedbackData) {
    ElMessage.warning($t('message.hrFeedbackLimit'))
    return
  }
  mittBus.emit(OPEN_DIALOG, {
    title: $t('button.testResult'),
    content: `${$t('message.ques')}${
      isPass ? $t('WrittenFinalStatusEnum.pass') : $t('WrittenFinalStatusEnum.fail')
    }?`,
    center: 'center',
    size: 'small',
    confirm: () => {
      const feedback = isPass ? WrittenFinalStatusEnum.PASS : WrittenFinalStatusEnum.FAIL
      HRfeedback({ resume_ids: selectResume.value, hr_feedback: feedback }).then(res => {
        if (res.success) {
          espTable.value.clearSelection()
          searchTable('fifth_status')
        }
      })
    }
  })
}

// 监控选中的列表数据获取当前选中的简历和人员信息
watch(
  () => espTable.value?.selection?.list,
  (list: any) => {
    if (list?.value) {
      const options: Form.FormSelect[] = []
      const values: number[] = []
      const jobPositionIds: number[] = []
      list?.value?.forEach((data: any) => {
        // 如果hr面试/专业面试/ceo面试已经全部进入received状态，则schedule interview约面试的时候是新增面试
        if (!data.has_active_interview) {
          data.received = true
        }
        values.push(data.id)
        options.push({ value: data.id, label: data.name, ...data })
        if (!jobPositionIds.includes(data.applying_position)) {
          jobPositionIds.push(data.applying_position)
        }
      })
      selectUserList.value = [...options]
      selectResume.value = [...values]
      selectJobPositionIds.value = [...jobPositionIds]
    }
  },
  { deep: true }
)

const handleClickOutside = (event: any) => {
  const filterEl = advancedFilterRef.value?.$el
  const popoverEl = document.querySelector('.filter-popover')
  if ((filterEl && !filterEl.contains(event.target)) && !(event.target.classList?.contains('filter-icon')) &&
    (popoverEl && !popoverEl.contains(event.target))) {
    advancedFilterRef.value.hidePanel()
  }
}

onMounted(async () => {
  filterList.value = cloneDeep(FILTER_FORM)
  jobPositionFilterList.value = cloneDeep(JOBPOSITION_FILTER_FORM)
  // 在页面加载时先判断一下store的数据是否已过期，更新一下数据
  await cvFilterStore.restoreState()
  // 设置step 顶部数据和moveto列表数据
  const statusList = enumItem2arr(CandidateStatus)
  const list = statusList?.filter(
    data =>
      data.value !== CandidateStatusEnum.DRAFT &&
      data.value !== CandidateStatusEnum.VIDEO &&
      data.value !== CandidateStatusEnum.TALENT_POOL
  )
  list?.unshift({ value: 'all', label: $t('cv.all') })
  cvStepList.value = [...list]
  cvStepMoveToList.value = statusList?.filter(
    data => data.value !== CandidateStatusEnum.DRAFT && data.value !== CandidateStatusEnum.VIDEO
  )
  // 设置表头
  const columns = cloneDeep(CV_TABLE)
  const index = columns?.findIndex((data: Table.ColumnProps) => data.prop === 'expect_onboarding_date')
  if (index != -1) {
    columns[index].isShow = cvFilterStore?.selectTab === CandidateStatusEnum.ONBOARD
  }
  tableColumns.value = [...columns]
  // 获取job position 列表数据
  await getAllPositionList()
  const userSetting = await getUserSettings(UserSettingTypeEnum.CV_MANAGEMENT_QUERY)
  let param = userSetting?.result?.settings ?? {}
  if (param.title) {
    searchPosition.value = param.title
  }
  const keys = Object.keys(param)
  const params = keys?.length === 0 || (keys?.length === 1 && keys[0] === 'title' && !param.title) ? {} : param
  // 默认查询active的数据
  searchJobPosition(params, true)
  // 获取定制的button列表
  getButtonByStatus()
  // 加载job position筛选form里的表单数据
  // 数据之所以在这里获取是因为popover在左侧栏目关闭后数据会被销毁，因此在父组件这里管理数据
  initFilterOptions()
  // 监听事件
  document.addEventListener('mousedown', handleClickOutside)
})
// 获取定制的button列表
const getButtonByStatus = async () => {
  const buttonResult = await getTableButtonConfig(CV_MANAGEMENT_HEADER, selectTab.value?.toString())
  const buttonConfigs = buttonResult?.result?.buttons ?? []
  let buttonSortMap: any = {}
  if (buttonConfigs?.length > 0) {
    buttonConfigs.forEach(data => {
      buttonSortMap[data.button_id] = data.sort
    })
  }
  else {
    buttonSortMap = ButtonSortMap?.[selectTab.value] ?? {}
  }
  
  const buttonSettings: Form.FormSelect[] = enumItem2arr(ButtonSettings)
  buttonSettings.forEach(data => {
    data.sort = buttonSortMap?.[data.value?.toString()] ?? 0
  })
  buttons.value = getTreeOptionsByGroup(buttonSettings, ButtonSettings, ButtonLists[selectTab.value])
}

const getAllPositionList = async () => {
  const jobPositionResult = await getJobPositionList()
  const positionList = jobPositionResult?.result ?? []
  const positionOptions: Form.FormSelect[] = []
  positionList.forEach(data => {
    const option = {
      label: data.title,
      value: data.id,
      ...data
    }
    positionOptions.push(option)
  })
  allPositionList.value = cloneDeep(positionOptions)
}
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
<style lang="less" scoped>
@import './index.less';
</style>
