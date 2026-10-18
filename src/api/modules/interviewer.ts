import http from '@/api'
import Interviewer from '../interface/interviewer'
import { ResultCreate } from '../interface'
import { ForwardTypeEnum } from '@/enums/forwardTypeEnum'

/**
 * @name Interviewer 模块
 */

// 获取 Interviewer Resume Screening 的列表
export const getInterviewerResumeList = () => {
  return http.get<Interviewer.InterviewerInfo[]>('api/recruitment/listForward', {
    forward_type: ForwardTypeEnum.BE_SHARED
  })
}

// 面试官反馈简历 合适 / 不合适
export const postInterviewerFeedbackForward = (data: Interviewer.InterviewerFeedback) => {
  return http.post<ResultCreate>('api/recruitment/feedbackForward', data)
}


// 获取 test review 的列表
export const getTestReviewList = () => {
  return http.get<Interviewer.InterviewerInfo[]>('api/exam/listForward')
}

// 反馈 test review 的列表
export const submitTestFeedback = (data: Interviewer.TestFeedback) => {
  return http.post<boolean>('api/exam/submitForwordFeedback', data)
}