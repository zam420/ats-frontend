import { getUserList } from '@/api/modules/common'
import { getInnerUserList } from '@/api/modules/user'
import { Adress } from '@/enums/adressEnum'
import { FormItemTypeEnum } from '@/enums/formItemTypeEnum'
import { ShareTypeEnum } from '@/enums/shareTypeEnum'
import { useLocale } from '@/hooks/useLocale'
import { enumItem2arr, hasNotEspressifEmail } from '@/utils'
const { $t } = useLocale()
export const INTERVIEW_INFORMATION_FORM: Form.FormItem[] = [
  {
    label: $t('cv.selectedCandidate'),
    prop: 'candidates',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    required: true,
    // disabled: true,
    maxTags: 5,
    col: 24
  },
  {
    label: $t('scheduleInterview.interviewers'),
    prop: 'interviewers',
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: () => {
      return getUserList(ShareTypeEnum.INTERVIEWER)
    },
    allowCreate: true,
    optionKey: 'email',
    validateFun: (data: any) => {
      return hasNotEspressifEmail(data)
    },
    text: $t('message.emailFormatError'),
    collapseTag: false,
    optionName: 'name',
    optionSubName: 'email',
    required: true,
    col: 24
  },
  {
    label: $t('scheduleInterview.cc'),
    type: FormItemTypeEnum.MULTIPLE_SELECT,
    getOptions: getInnerUserList,
    optionKey: 'email',
    optionName: 'email',
    prop: 'email_bcc',
    col: 24
  },
  {
    label: $t('emailTemplate.interviewTime'),
    prop: 'interviewTime',
    type: FormItemTypeEnum.DATE_TIME_RANGE,
    withinOneDay: true,
    required: true,
    col: 24
  }, 
  {
    label: $t('scheduleInterview.interviewAddress'),
    prop: 'interview_location',
    type: FormItemTypeEnum.SELECT_WITH_SWITCH,
    options: enumItem2arr(Adress),
    allowCreate: true,
    switchText: $t('scheduleInterview.onlineMeeting'),
    switchValue: false,
    required: true,
    col: 24
  },
  // {
  //   label: $t('scheduleInterview.onlineMeeting'),
  //   prop: 'is_online',
  //   type: FormItemTypeEnum.SWITCH,
  //   value: false,
  //   required: false,
  //   labelPosition: 'left',
  //   col: 4
  // },
  {
    label: $t('scheduleInterview.informInterviewer'),
    prop: 'info_interviewer',
    type: FormItemTypeEnum.SWITCH,
    value: false,
    isHide: true,
    labelPosition: 'left',
    col: 6
  },
  {
    label: $t('scheduleInterview.informCandidate'),
    prop: 'info_candidate',
    type: FormItemTypeEnum.SWITCH,
    value: true,
    labelPosition: 'left',
    col: 6
  }
]

export const INTERVIEW_EMAIL_TEMPLATE_FORM: Form.FormItem[] = [
  {
    label: '',
    prop: '',
    type: FormItemTypeEnum.HORIZONTAL_LINE
  },
  {
    label: $t('menu.emailTemplate'),
    type: FormItemTypeEnum.SELECT,
    prop: 'email_template',
    required: true,
    col: 24
  }
]

export const INTERVIEW_INFORMATION_DETAIL_FORM: Form.FormItem[] = [
  {
    label: $t('cv.selectedCandidate'),
    prop: 'candidates',
    isFontBold: true,
    slotName: 'candidates',
    labelPosition: 'top',
    col: 24
  },
  {
    label: $t('scheduleInterview.interviewers'),
    prop: 'interviewers',
    slotName: 'interviewers',
    isFontBold: true,
    isPaddingTop: true,
    col: 24
  },
  {
    label: $t('scheduleInterview.cc'),
    prop: 'email_bcc',
    isTag: true,
    isPaddingTop: true,
    isFontBold: true,
    col: 24
  },
  {
    label: $t('emailTemplate.interviewTime'),
    prop: 'interviewTime',
    isPaddingTop: true,
    isFontBold: true,
    col: 24
  },
  {
    label: $t('scheduleInterview.interviewAddress'),
    prop: 'interview_location',
    isFontBold: true,
    isPaddingTop: true,
    col: 24
  },
  {
    label: $t('scheduleInterview.onlineMeeting'),
    prop: 'is_online',
    subLabel: $t('scheduleInterview.faceToFaceMeeting'),
    isPaddingTop: true,
    labelPosition: 'left',
    isLabel: false,
    hideValue: true,
    isLine: true
  },
  {
    label: $t('scheduleInterview.informCandidate'),
    prop: 'info_candidate',
    isPaddingTop: true,
    labelPosition: 'left',
    isLabel: false,
    hideValue: true,
    isLine: true
  }
]

export const INTERVIEW_EMAIL_TEMPLATE_DETAIL_FORM: Form.FormItem[] = [
  {
    label: $t('menu.emailTemplate'),
    prop: 'email_template',
    isFontBold: true,
    col: 24
  }
]