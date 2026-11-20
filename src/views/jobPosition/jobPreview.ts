import type { ScreeningQuestion, ScreeningQuestionType } from '@/api/interface/screeningQuestionsForm'

export type ScreeningDisplayMode = 'description' | 'tab'

export interface PreviewQuestion {
  id?: string
  code: string
  label: string
  description: string
  options: string[]
  defaultOption: string | null
  mandatory: boolean
  multiSelect: boolean
  maxChars: number | null
}
export interface JobPreview {
  title: string
  description: string
  employmentType: string
  workArrangement: string
  workLocation: string[]
  screeningDisplayMode: ScreeningDisplayMode
  questions: PreviewQuestion[]
}

export const toPreviewQuestions = (questions: ScreeningQuestion[], types: ScreeningQuestionType[]): PreviewQuestion[] =>
  questions.map(question => {
    const type = types.find(item => item.id === question.screening_question_type)
    if (!type) throw new Error(`Unknown screening question type: ${question.screening_question_type}`)
    return {
      code: type.code,
      id: question.id,
      label: question.label,
      description: question.description ?? '',
      options: [...(question.options ?? [])],
      defaultOption: question.default_option ?? null,
      mandatory: !!question.is_mandatory,
      multiSelect: !!question.is_drop_down_multi_select,
      maxChars: question.max_chars && question.max_chars > 0 ? question.max_chars : null
    }
  })

export const previewStorageKey = (id: string) => `job-preview:${id}`

export const newPreviewStorageKey = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return previewStorageKey(Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(''))
}

export const readJobPreview = (key: unknown): JobPreview | null => {
  if (typeof key !== 'string' || !/^job-preview:[0-9a-f]{32}$/i.test(key)) return null
  const value = sessionStorage.getItem(key)
  if (!value) return null
  try {
    const data: unknown = JSON.parse(value)
    if (typeof data !== 'object' || data === null || !('title' in data) || !('description' in data)) return null
    if (typeof data.title !== 'string' || typeof data.description !== 'string') return null
    const mode = 'screeningDisplayMode' in data ? data.screeningDisplayMode : 'description'
    if (mode !== 'description' && mode !== 'tab') return null
    const questions = 'questions' in data ? data.questions : []
    if (!Array.isArray(questions) || !questions.every((question: unknown) => {
      if (typeof question !== 'object' || question === null) return false
      const q = question as Record<string, unknown>
      return typeof q.code === 'string' && typeof q.label === 'string' && typeof q.description === 'string'
        && Array.isArray(q.options) && q.options.every((option: unknown) => typeof option === 'string')
        && (q.defaultOption === null || typeof q.defaultOption === 'string')
        && typeof q.mandatory === 'boolean' && typeof q.multiSelect === 'boolean'
        && (q.maxChars === null || (typeof q.maxChars === 'number' && Number.isInteger(q.maxChars) && q.maxChars > 0))
    })) return null
    return {
      title: data.title,
      description: data.description,
      employmentType: 'employmentType' in data && typeof data.employmentType === 'string' ? data.employmentType : '',
      workArrangement: 'workArrangement' in data && typeof data.workArrangement === 'string' ? data.workArrangement : '',
      workLocation: 'workLocation' in data && Array.isArray(data.workLocation) && data.workLocation.every((location: unknown) => typeof location === 'string')
        ? data.workLocation : 'workLocation' in data && typeof data.workLocation === 'string' && data.workLocation ? [data.workLocation] : [],
      screeningDisplayMode: mode,
      questions
    }
  } catch (error) {
    console.error('Invalid job preview data', error)
    return null
  }
}

