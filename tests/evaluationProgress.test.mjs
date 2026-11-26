import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { evaluationColor, evaluationPercentage } from '../src/views/jobPosition/evaluationProgress.ts'

const progress = (strong_yes, yes, no, strong_no, completed_rounds = 0, total_rounds = 4) =>
  ({ strong_yes, yes, no, strong_no, completed_rounds, total_rounds })

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
