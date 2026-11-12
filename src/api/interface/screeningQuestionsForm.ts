export interface ScreeningQuestionType {
  id: number
  code: string
  name: string
  description?: string
}

export interface ScreeningQuestion {
  id?: string
  label: string
  description: string
  screening_question_type: number
  order: number
  options: string[] | null
  default_option: string | null
  is_mandatory: boolean | null
  is_drop_down_multi_select: boolean | null
  max_chars: number | null
  heading_level?: number | null
}

export interface ScreeningFormListItem {
  id: string
  name: string
  description?: string
  owner_id?: string | null
  is_public: boolean
  is_shared_within_tenant?: boolean | null
  is_system_template: boolean
  question_sequence?: string
}

export interface ScreeningFormDetail extends ScreeningFormListItem {
  questions: ScreeningQuestion[]
  shared_with_user_ids: string[]
}

export interface ScreeningFormRequest {
  id?: string
  name: string
  description: string
  owner_id?: string
  is_public?: boolean
  shared_with_user_ids?: string[] | null
  questions: Array<Omit<ScreeningQuestion, 'id' | 'screening_question_type'> & {
    screening_question_type_id: number
  }>
}
