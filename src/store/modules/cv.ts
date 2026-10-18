// MenuStore
import { defineStore } from 'pinia'
import { CVState } from '@/store/interface'
import piniaPersistConfig from '@/config/piniaPersist'
import { ResultUpload } from '@/api/interface'

export const useCVStore = defineStore({
  id: 'CVState',
  state: (): CVState => ({
    applying_position: undefined,
    curOption: undefined,
    recruitment_source: undefined,
    attachments: [],
    original_resume: [],
    searchParam: {},
    pdf_details: undefined,
    selectedCandidate: []
  }),
  getters: {},
  actions: {
    async setCVInfo({
      applying_position,
      recruitment_source,
      attachments,
      curOption,
      original_resume,
      pdf_details
    }: CVState) {
      this.applying_position = applying_position
      this.recruitment_source = recruitment_source
      this.attachments = attachments
      this.curOption = curOption
      this.original_resume = original_resume
      this.pdf_details = pdf_details
    },
    async setUid({ attachments, original_resume }: ResultUpload) {
      this.attachments = attachments
      this.original_resume = original_resume
    },
    setSearchParam(param: Record<string, any> = {}) {
      this.searchParam = param
    },
    async setSelectedCandidate(data: Form.FormSelect[]) {
      this.selectedCandidate = [...data]
    }
  },
  persist: piniaPersistConfig('CVState')
})
