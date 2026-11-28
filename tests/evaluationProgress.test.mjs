import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { evaluationColor, evaluationEnumKey, evaluationPercentage, evaluationResultColor } from '../src/views/jobPosition/evaluationProgress.ts'
import en from '../src/language/modules/en.ts'
import zh from '../src/language/modules/zh.ts'

const progress = (strong_yes, yes, no, strong_no, completed_rounds = 0, total_rounds = 4) =>
  ({ strong_yes, yes, no, strong_no, completed_rounds, total_rounds })

test('backend result names resolve to translated hire labels', () => {
  for (const [name, english, chinese] of [
    ['STRONG_HIRE', 'Strong Hire', '强烈录用'],
    ['HIRE', 'Hire', '录用'],
    ['NO_HIRE', 'No Hire', '不录用'],
    ['STRONG_NO_HIRE', 'Strong No Hire', '强烈不录用']
  ]) {
    const key = evaluationEnumKey(name).split('.')[1]
    assert.equal(en.candidatePipeline[key], english)
    assert.equal(zh.candidatePipeline[key], chinese)
  }
})

test('progress reports completed rounds, including cancelled ones', () => {
  assert.equal(evaluationPercentage(progress(1, 0, 0, 0, 2)), 50)
  assert.equal(evaluationPercentage(progress(0, 0, 0, 0, 0, 0)), 0)
})

test('colors distinguish strong, ordinary, balanced and unrated results', () => {
  assert.equal(evaluationColor(progress(2, 0, 0, 0)), '#166534')
  assert.equal(evaluationColor(progress(0, 2, 0, 0)), '#4caf50')
  assert.equal(evaluationColor(progress(0, 0, 2, 0)), '#e57373')
  assert.equal(evaluationColor(progress(0, 0, 0, 2)), '#991b1b')
  assert.equal(evaluationColor(progress(1, 0, 0, 1)), '#b88a00')
  assert.equal(evaluationColor(progress(0, 1, 1, 0)), '#b88a00')
  assert.equal(evaluationColor(progress(0, 0, 0, 0)), '#909399')
})

test('mixed results use the weighted average, not just the most frequent rating', () => {
  assert.equal(evaluationColor(progress(2, 1, 0, 0)), '#166534')
  assert.equal(evaluationColor(progress(1, 0, 2, 0)), '#b88a00')
  assert.equal(evaluationColor(progress(0, 0, 1, 2)), '#991b1b')
  assert.equal(evaluationColor(progress(1, 0, 0, 2)), '#e57373')
})

test('individual result colors match a progress bar for the same result', () => {
  assert.equal(evaluationResultColor(0), evaluationColor(progress(1, 0, 0, 0)))
  assert.equal(evaluationResultColor(1), evaluationColor(progress(0, 0, 0, 1)))
  assert.equal(evaluationResultColor(2), evaluationColor(progress(0, 0, 0, 0)))
  assert.equal(evaluationResultColor(3), evaluationColor(progress(0, 1, 0, 0)))
  assert.equal(evaluationResultColor(4), evaluationColor(progress(0, 0, 1, 0)))
})
