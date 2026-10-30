declare namespace RecruitmentPipeline {
  interface ListInfo {
    id: string
    name: string
    owner_id?: string
    description?: string
    is_system_template?: boolean
    is_public?: boolean
    status: number
    status_name?: string
    round_sequence?: string
  }

  interface RoundType {
    id: number
    name: string
    description?: string
  }

  interface PipelineRound {
    id: number
    round_type: number
    round_type_name?: string
    order: number
    name?: string
    description?: string
  }

  interface DetailInfo extends ListInfo {
    created_at?: string
    created_by_name?: string
    modified_at?: string
    modified_by_name?: string
    rounds: PipelineRound[]
  }

  interface RoundParam {
    id?: string | number
    round_type: number | string
    name?: string
    description?: string
    order?: number
  }

  interface SaveParam {
    id?: string
    name?: string
    description?: string
    rounds?: RoundParam[]
  }
}
export default RecruitmentPipeline
