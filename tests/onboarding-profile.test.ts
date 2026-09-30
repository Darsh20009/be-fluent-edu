import assert from 'node:assert/strict'
import test from 'node:test'
import { studentProfilePatchSchema } from '../lib/phase4'

test('student profile accepts age, gender, and optional learning goal', () => {
  const result = studentProfilePatchSchema.safeParse({
    age: 25,
    gender: 'PREFER_NOT_TO_SAY',
    goal: 'Improve speaking confidence',
  })
  assert.equal(result.success, true)
})

test('student profile rejects unsupported gender values and out-of-range ages', () => {
  assert.equal(studentProfilePatchSchema.safeParse({ gender: 'OTHER' }).success, false)
  assert.equal(studentProfilePatchSchema.safeParse({ age: 121, gender: 'FEMALE' }).success, false)
})