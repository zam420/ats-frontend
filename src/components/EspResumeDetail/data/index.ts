import { CandidateStatus } from '@/enums/candidateStatusEnum'
import { PooledReason } from '@/enums/pooledReasonEnum'
import { RecruitmentType } from '@/enums/recruitmentTypeEnum'
import { ResumeSource } from '@/enums/resumeSourceEnum'
import { useLocale } from '@/hooks/useLocale'

const { $t } = useLocale()

export const RESUME_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.appliedPosition'),
    prop: 'applying_position_title',
    isTitle: true,
    isLink: true,
    col: 24
  },
  {
    label: $t('cv.recruitmentProject'),
    prop: 'project_name',
    col: 8
  },
  {
    label: $t('cv.applicationStatus'),
    prop: 'status',
    propText: 'status_name',
    enum: CandidateStatus,
    col: 8
  },
  {
    label: $t('cv.recruitmentType'),
    prop: 'recruitment_type',
    propText: 'recruitment_type_name',
    enum: RecruitmentType,
    col: 8
  },
  {
    label: $t('cv.hrRecruiter'),
    prop: 'hr_recruiter_name',
    col: 8
  },
  {
    label: $t('cv.resumePortal'),
    prop: 'recruitment_source',
    propText: 'recruitment_source_name',
    enum: ResumeSource,
    col: 8
  },
  {
    label: $t('cv.pooledReason'),
    prop: 'pooled_reason',
    propText: 'pooled_reason',
    enum: PooledReason,
    isHide: true,
    col: 8
  }
]

// 邮件详情
export const EMAIL_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.emailTime'),
    prop: 'send_time',
    col: 9
  },
  {
    label: $t('cv.addresser'),
    prop: 'creator_email',
    col: 9
  },
  {
    label: '',
    prop: '',
    isNewRow: true
  },
  {
    label: $t('cv.addressee'),
    prop: 'to',
    col: 9,
    needTooltip: true
  },
  {
    label: $t('cv.cc'),
    prop: 'bcc',
    col: 15,
    needTooltip: true
  }
]

// 历史操作
export const HISTORY_OPERATE_DETAIL: Form.DetailItem[] = [
  {
    prop: 'operator_name',
    label: $t('cv.operator'),
    isFontBold: true,
    col: 24
  },
  {
    prop: 'log',
    label: '',
    col: 24
  }
]

// 笔试分数详情
export const WRITTEN_TEST_SCORE_DETAIL: Form.DetailItem[] = [
  {
    label: $t('cv.writtenTestPaper'),
    prop: 'paper_name',
    col: 8
  },
  {
    label: $t('cv.testStatus'),
    prop: 'status',
    slotName: 'status',
    col: 8
  },
  {
    label: $t('cv.testDate'),
    prop: 'test_date',
    col: 8
  },
  {
    label: $t('cv.scoreTotal'),
    prop: 'score',
    col: 8
  },
  {
    label: $t('cv.cheatOrNot'),
    prop: 'cheat_status',
    col: 8
  },
  {
    label: $t('cv.writtenTestReport'),
    prop: 'result_file',
    slotName: 'result',
    col: 8
  }
]