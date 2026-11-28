export interface EvaluationProgress {
  completed_rounds: number
  total_rounds: number
  strong_yes: number
  yes: number
  no: number
  strong_no: number
}

export const evaluationEnumKey = (name: string) =>
  `candidatePipeline.${name.toLowerCase().replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())}`

export const evaluationPercentage = (evaluation: EvaluationProgress) =>
  evaluation.total_rounds ? Math.round(evaluation.completed_rounds / evaluation.total_rounds * 100) : 0

export const evaluationColor = (evaluation: EvaluationProgress) => {
  const { strong_yes, yes, no, strong_no } = evaluation
  const rated = strong_yes + yes + no + strong_no
  if (!rated) return '#909399'
  const score = 2 * strong_yes + yes - no - 2 * strong_no
  if (score > rated) return '#166534'
  if (score > 0) return '#4caf50'
  if (score < -rated) return '#991b1b'
  if (score < 0) return '#e57373'
  return '#b88a00'
}

export const evaluationResultColor = (result: 0 | 1 | 2 | 3 | 4) => evaluationColor({
  total_rounds: 1,
  completed_rounds: 1,
  strong_yes: result === 0 ? 1 : 0,
  strong_no: result === 1 ? 1 : 0,
  yes: result === 3 ? 1 : 0,
  no: result === 4 ? 1 : 0
})
