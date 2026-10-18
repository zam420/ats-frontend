import { useLocale } from '@/hooks/useLocale'
import { TableColumnTypeEnum } from '@/enums/tableColumnTypeEnum'
import { TableColumnFixedEnum } from '@/enums/tableColumnFixedEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { MyInterviewQueryTypeEnum, MyInterviewStatus, FeedbackResult } from '@/enums/myInterviewStatusEnum'
import { enumItem2arr } from '@/utils'
import { AbilityEvaluation } from '@/enums/abilityEvaluationEnum'
import { OverallTechRating } from '@/enums/overallTechRatingEnum'
const { $t } = useLocale()

export const INTERVIEWER_TABLE: Table.ColumnProps[] = [
  {
    columnType: TableColumnTypeEnum.OPERATION,
    label: $t('table.operate'),
    width: 80,
    fixed: TableColumnFixedEnum.LEFT,
    isShow: true
  },
  {
    prop: 'candidate_name',
    label: $t('interviewer.candidate'),
    slotName: 'link',
    filter: false
  },
  {
    prop: 'applying_position_title',
    label: $t('interviewer.jobPosition'),
    filter: false
  },
  {
    prop: 'interview_time',
    label: $t('emailTemplate.interviewTime'),
    filter: false,
    width: 160
  },
  {
    prop: 'interviewerNames',
    label: $t('emailTemplate.interviewer'),
    filter: false,
    width: 200
  },
  {
    prop: 'interview_mode',
    label: $t('interviewer.interviewMode'),
    filter: false
  },
  {
    prop: 'interview_type',
    label: $t('interviewer.interviewType'),
    filter: false
  },
  {
    prop: 'status',
    label: $t('interviewer.status'),
    status: MyInterviewStatus,
    width: 150,
    filter: false
  },
  {
    prop: 'recruiter_name',
    label: $t('interviewer.recruiterName'),
    filter: false
  }
]

export const TAB_LIST: Form.FormSelect[] = [
  {
    label: $t('interviewer.todayInterview'),
    value: MyInterviewQueryTypeEnum.TODAY,
    count: 0
  },
  {
    label: $t('interviewer.awaitingInterview'),
    value: MyInterviewQueryTypeEnum.AWAITING_INTERVIEW,
    count: 0
  },
  {
    label: $t('interviewer.interviewHistory'),
    value: MyInterviewQueryTypeEnum.HISTORY,
    count: 0
  }
]

export const HR_INTERVIEW_FEEDBACK_TABLE: EditTable.TableColumns[] = [
  { 
    prop: 'interviewer',
    label: $t('emailTemplate.interviewer'),
    textLabel: $t('interviewer.evaluationTime'),
    isTitle: true
  },
  { 
    prop: 'overall_evaluation',
    label: $t('interviewer.comprehensiveEvaluation'),
    type: FormItemTypeEnum.TEXTAREA,
    resize: 'vertical',
    isParam: true,
    required: true,
    maxlength: 5000,
    span: 2
  },
  { 
    prop: 'interview_result',
    label: $t('interviewer.interviewResult'),
    required: true,
    type: FormItemTypeEnum.RADIO,
    options: enumItem2arr(FeedbackResult),
    isParam: true,
    span: 2
  }
]

export const PROFESSIONAL_CEO_INTERVIEW_FEEDBACK_TABLE: EditTable.TableColumns[] = [
  { 
    prop: 'interviewer',
    label: $t('emailTemplate.interviewer'),
    textLabel: $t('interviewer.evaluationTime'),
    isTitle: true
  },
  { 
    prop: 'skills',
    label: $t('interviewer.professionalSkills'),
    required: true,
    span: 3,
    columns: [
      { 
        prop: 'ability_score',
        label: $t('interviewer.ability'),
        type: FormItemTypeEnum.RADIO,
        options: enumItem2arr(AbilityEvaluation),
        isParam: true
      },
      { 
        prop: 'experience_score',
        label: $t('interviewer.experience'),
        type: FormItemTypeEnum.RADIO,
        options: enumItem2arr(AbilityEvaluation),
        isParam: true
      },
      { 
        prop: 'potential_score',
        label: $t('interviewer.potential'),
        type: FormItemTypeEnum.RADIO,
        options: enumItem2arr(AbilityEvaluation),
        isParam: true
      }
    ]
  },
  { 
    prop: 'overall_evaluation',
    label: $t('interviewer.overallEvaluation'),
    type: FormItemTypeEnum.TEXTAREA,
    required: true,
    resize: 'vertical',
    isParam: true,
    maxlength: 5000,
    span: 2
  },
  { 
    prop: 'work_arrangement',
    label: $t('interviewer.workArrangement'),
    type: FormItemTypeEnum.TEXTAREA,
    maxlength: 5000,
    resize: 'vertical',
    required: true,
    isParam: true,
    span: 2
  },
  { 
    prop: 'interview_result',
    label: $t('interviewer.interviewResult'),
    type: FormItemTypeEnum.RADIO,
    options: enumItem2arr(FeedbackResult),
    required: true,
    isParam: true,
    span: 2
  }
]

export const INDIA_INTERVIEW_FEEDBACK_TABLE: EditTable.TableColumns[] = [
  { 
    prop: 'interviewer',
    label: $t('emailTemplate.interviewer'),
    textLabel: $t('interviewer.evaluationTime'),
    isTitle: true,
    sort: 0
  },
  { 
    prop: 'technical_language_skills',
    label: $t('interviewer.technicalLanguage'),
    type: FormItemTypeEnum.TEXTAREA,
    resize: 'vertical',
    isParam: true,
    required: true,
    maxlength: 5000,
    class: 'child',
    span: 2,
    sort: 3
  },
  { 
    prop: 'domain_knowledge',
    label: $t('interviewer.domainKnowledge'),
    type: FormItemTypeEnum.TEXTAREA,
    resize: 'vertical',
    isParam: true,
    required: true,
    maxlength: 5000,
    class: 'child',
    span: 2,
    sort: 4
  },
  { 
    prop: 'behavioural_competence',
    label: $t('interviewer.behaviouralCompetence'),
    type: FormItemTypeEnum.TEXTAREA,
    resize: 'vertical',
    isParam: true,
    maxlength: 5000,
    class: 'child',
    span: 2,
    sort: 5
  },
  { 
    prop: 'adaptability',
    label: $t('interviewer.scalabilityAdaptability'),
    type: FormItemTypeEnum.TEXTAREA,
    resize: 'vertical',
    isParam: true,
    maxlength: 5000,
    class: 'child',
    span: 2,
    sort: 6
  },
  { 
    prop: 'leadership',
    label: $t('interviewer.abilityMentorLead'),
    type: FormItemTypeEnum.TEXTAREA,
    resize: 'vertical',
    isParam: true,
    maxlength: 5000,
    class: 'child',
    span: 2,
    sort: 7
  },
  { 
    prop: 'behavioral_cultural_fit',
    label: $t('interviewer.behaviouralAspectCulturalFit'),
    type: FormItemTypeEnum.TEXTAREA,
    resize: 'vertical',
    isParam: true,
    maxlength: 5000,
    class: 'child',
    span: 2,
    sort: 8
  },
  { 
    prop: 'tech_remark',
    label: $t('interviewer.techPanelRemarks'),
    remark: $t('interviewer.specificRemarks'),
    type: FormItemTypeEnum.TEXTAREA,
    resize: 'vertical',
    isParam: true,
    maxlength: 5000,
    class: 'short',
    span: 2,
    sort: 9
  },
  { 
    prop: 'overall_tech_rating',
    label: $t('interviewer.overallTechRating'),
    required: true,
    type: FormItemTypeEnum.RADIO,
    options: enumItem2arr(OverallTechRating),
    isParam: true,
    class: 'short',
    span: 2,
    sort: 10
  },
  { 
    prop: 'interview_result',
    label: $t('interviewer.interviewResult'),
    required: true,
    type: FormItemTypeEnum.RADIO,
    options: enumItem2arr(FeedbackResult),
    isParam: true,
    class: 'short',
    span: 2,
    sort: 11
  }
]