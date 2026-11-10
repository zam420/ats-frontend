declare namespace InterviewProcess {
  interface ListInfo {
    id: string
    name: string
    owner_id?: string
    description?: string
    is_system_template?: boolean
    is_public?: boolean
    is_shared_within_tenant?: boolean | null
    status: number
    status_name?: string
  }

  interface RoundType {
    id: number
    name: string
    description?: string
  }

  interface Interviews {
    id: number
    name: string
    email: string
  }

  interface InterviewRound {
    id: string | number
    ipt_id: number
    round_type: number | string
    round_type_name: string
    interviewers: (Interviews | string | number)[] | null
    order: number
    name?: string
    description?: string
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
    shared_with_user_ids?: string[]
  }

  interface ShareParam {
    ipt_id: string
    share_to: number[]
  }

  interface RoundParam {
    id?: string | number
    round_type: number | string
    interviewers: (string | number)[]
    name?: string
    description?: string
    order?: number
  }

  interface SaveParam {
    id?: string
    name?: string
    description?: string
    owner_id?: string
    is_public?: boolean
    shared_with_user_ids?: string[] | null
    rounds?: RoundParam[]
  }
}
export default InterviewProcess
