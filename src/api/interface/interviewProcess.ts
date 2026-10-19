declare namespace InterviewProcess {
  interface ListInfo {
    id: string
    name: string
    work_location?: number | string
    work_location_name: string
    notes: string
    status: number
    status_name?: string
  }

  interface Interviews {
    id: number
    name: string
    email: string
  }

  interface InterviewRound {
    id: number
    ipt_id: number
    round_type: number
    round_type_name: string
    interviewers: Interviews[]
    order: number
  }

  interface DetailInfo extends ListInfo {
    created_at?: string
    create_by?: number
    create_by_name?: string
    modified_at?: string
    modified_by?: number
    modified_by_name?: string
    rounds: InterviewRound[]
    share_to?: Interviews[]
  }

  interface ShareParam {
    ipt_id: string
    share_to: number[]
  }

  interface RoundParam {
    id?: string | number
    round_type: number | string
    interviewers: number[]
    order?: number
  }

  interface SaveParam {
    id?: string
    name?: string
    work_location?: number
    notes?: string
    rounds?: RoundParam[]
  }
}
export default InterviewProcess
