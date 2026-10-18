// Interview Store
import { defineStore } from 'pinia'
import { InterviewState } from '@/store/interface'
import piniaPersistConfig from '@/config/piniaPersist'

export const useInterviewStore = defineStore({
  id: 'InterviewState',
  state: (): InterviewState => ({
    interviewMode: '',
    interviewTime: '',
    interviewers: '',
    interviewType: 0,
    interviewRoundId: 0,
    candidateResumeId: 0,
    readOnly: false,
    isIndiaPosition: false,
    candidateName: ''
  }),
  getters: {},
  actions: {
    async setInterviewInfo(data: InterviewState) {
      this.interviewMode = data.interviewMode
      this.interviewTime = data.interviewTime
      this.interviewers = data.interviewers
      this.interviewType = data.interviewType
      this.interviewRoundId = data.interviewRoundId
      this.candidateResumeId = data.candidateResumeId
      this.readOnly = data.readOnly
      this.isIndiaPosition = data.isIndiaPosition
      this.candidateName = data.candidateName
    }
  },
  persist: piniaPersistConfig('InterviewState')
})
