import http from '@/api'
import { ResultCreate, ResultUpload, SearchStatusInfo } from '../interface'
import { ContentTypeEnum } from '@/enums/httpEnum'
import CV from '../interface/cv'
import InterviewProcess from '../interface/interviewProcess'
import MyInterview from '../interface/myInterview'

/**
 * @name CV 模块
 */

// 获取 CV 的分页列表
export const getCVPage = (params: SearchStatusInfo) => {
  return http.post<CV.CVInfo[]>('api/recruitment/candidateResumePage', params)
}

// 保存 Job Position
export const saveCV = (data: CV.CVInfo) => {
  return http.post<ResultCreate>('api/recruitment/saveCandidateResume', data)
}

// 提交 Job Position
export const submitCV = (data: CV.CVInfo) => {
  return http.post<ResultCreate>('api/recruitment/submitCandidateResume', data)
}

// 获取 CV 的详情
export const getCVDetail = (id: string | number) => {
  return http.get<CV.CVDetail>('api/recruitment/getCandidateDetailById', { id })
}

// 删除 CV 的详情
export const deleteCV = (candidate_resume_id: number) => {
  return http.post<CV.CVDetail>('api/recruitment/deleteCandidateResume', { candidate_resume_id })
}

export const existResumes = (data: any) => {
  return http.get<CV.CVExist>('api/recruitment/existResumes', data, { noLoading: true })
}

// 上传 CV
export const uploadCV = (data: FormData) => {
  return http.post<ResultUpload>('api/recruitment/uploadCandidateResumeFile', data, {
    headers: {
      'Content-Type': ContentTypeEnum.FORM_DATA
    }
  })
}

// 简历匹配 DuplicationInfo
export const duplicationInfoList = (id: string | number, loadingText?: string) => {
  return http.post<CV.DuplicationInfo[]>(
    'api/recruitment/checkResumeDuplication',
    { id },
    { loadingText }
  )
}

// 建立覆盖
export const coverDuplicateResumes = (data: CV.coverDuplicateResumesInfo) => {
  return http.post<boolean>('api/recruitment/coverDuplicateResumes', data)
}

// 查重历史数据
export const duplicationHistorical = (id: string | number) => {
  return http.get<CV.CVExist>('api/recruitment/getResumeDuplication', { id })
}

// 查看候选人 application 接口
export const getApplicationList = (candidate_id: string | number) => {
  return http.get<CV.ApplicationProgress[]>('api/recruitment/listApplicationByCandidate', {
    candidate_id
  })
}

// 转发简历接口
export const forwardResumes = (data: CV.ForwardResumeParam) => {
  return http.post<boolean>('api/recruitment/forward', data)
}

// move to
export const moveTo = (data: CV.MoveToParam) => {
  return http.post<boolean>('api/recruitment/moveTo', data)
}

// get interview process template
export const getInterviewProcessTemplate = (job_position_id: number) => {
  return http.get<InterviewProcess.ListInfo[]>('api/interview/processTemp/listByJob', {
    job_position_id
  })
}
// 获取所有状态的总条数
export const getStatusTotal = (params?: any) => {
  return http.post<CV.StatusTotalResult[]>('/api/recruitment/statusCount', params ?? {})
}

// move to talent pool
export const moveToPool = (data: CV.MoveTalentPoolInfo) => {
  return http.post<boolean>('api/talentPool/saveTalent', data)
}

// 获取邮件转发记录
export const getEmailRecords = (resume_id: number) => {
  return http.get<CV.EmailRecord>('api/recruitment/listEmailRecords', { resume_id })
}

// 获取interview feedbacks
export const getInterviewFeedbacks = (candidate_resume_id: number) => {
  return http.get<MyInterview.DetailInfo[]>('api/interview/feedback/listByResume', { candidate_resume_id })
}

// 获取test feedbacks
export const getTestFeedbacks = (resume_id: number) => {
  return http.get<CV.TestFeedback[]>('api/exam/listForwardFeedback', { resume_id })
}

// 获取Screen feedbacks
export const getScreenFeedbacks = (candidate_resume_id: number) => {
  return http.get<CV.ScreenFeedback[]>('api/recruitment/listScreenFeedback', { candidate_resume_id })
}

// 获取Historical Operations
export const getHistoricalOperations = (candidate_resume_id: number) => {
  return http.get<CV.OperateHistory[]>('api/recruitment/listHistoricalOperations', { candidate_resume_id })
}

// offer sent
export const offerSent = (resume_ids: number) => {
  return http.post<boolean>('api/recruitment/createOffer', { resume_ids })
}

// edit offer
export const editOfferSent = (data: {resume_ids: number, feedback_status: number}) => {
  return http.post<boolean>('api/recruitment/editOffer', data)
}

// send Mail To Cantidate
export const sendMailToCantidate = (data: CV.ContactCandidateParam) => {
  return http.post<boolean>('api/recruitment/sendMailToCantidate', data)
}

// get all interviewers list
export const getInterviewers = () => {
  return http.get<CV.PrivacyInterviewer[]>('api/recruitment/listInterviewers')
}

// add quick notes for candidate
export const quickSaveNotes = (data: CV.QuickNote) => {
  return http.post<boolean>('api/recruitment/quickSaveResume', data)
}

// get job position list
export const getJobPositionList = () => {
  return http.get<CV.JobPosition[]>('api/recruitment/listJobPostionForCV')
}

// 获取笔试paper list
export const getTestPapper = () => {
  return http.get<CV.TestPapper[]>('api/exam/nowcoder/getPapers')
}

// 获取笔试paper list
export const getWrittenTestScore = (resume_id: number) => {
  return http.get<CV.TestScore[]>('api/exam/nowcoder/listTest', { resume_id })
}

// 发送笔试
export const sendWrittenTest = (data: CV.WrittenTest) => {
  return http.post<ResultCreate>('api/exam/nowcoder/createTest', data)
}

// 评论
export const commentResume = (data: CV.CommentParam) => {
  return http.post<CV.CommentResult>('api/recruitment/commentResume', data)
}

// 批量评论
export const batchCommentResume = (data: CV.CommentParam) => {
  return http.post<CV.CommentResult>('api/recruitment/commentResumeInBulk', data)
}

// 删除评论
export const deleteComment = (data: {id: number, id_type: number}) => {
  return http.post<boolean>('api/recruitment/deleteComment', data)
}

// 转发笔试
export const forwardTest = (data: CV.ForwardTestParam) => {
  return http.post<boolean>('api/exam/createForward', data)
}
 
// hr 反馈
export const HRfeedback = (data: CV.HRFeedbackParam) => {
  return http.post<boolean>('api/exam/submitHRFeedback', data)
}

// 取消笔试
export const cancelWrittenExam = (exam_id: number) => {
  return http.post<boolean>('api/exam/cancelExam', { exam_id })
}

//查看简历记录
export const viewCandidateResumeRecord = (id: number) => {
  return http.post<boolean>('api/recruitment/candidateResumeViewRecord', { id })
}
