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

test('student monthly availability requires a month and rejects duplicate or invalid slots', () => {
  const valid = {
    availabilityMonth: '2026-10',
    availabilityTimezone: 'Asia/Riyadh',
    availabilitySlots: [{ dayOfWeek: 1, startMinute: 1020, durationMinutes: 60 }],
  }
  assert.equal(studentProfilePatchSchema.safeParse(valid).success, true)
  assert.equal(studentProfilePatchSchema.safeParse({ availabilitySlots: valid.availabilitySlots }).success, false)
  assert.equal(studentProfilePatchSchema.safeParse({
    ...valid,
    availabilitySlots: [...valid.availabilitySlots, ...valid.availabilitySlots],
  }).success, false)
  assert.equal(studentProfilePatchSchema.safeParse({
    ...valid,
    availabilitySlots: [{ dayOfWeek: 1, startMinute: 1430, durationMinutes: 60 }],
  }).success, false)
  assert.equal(studentProfilePatchSchema.safeParse({ ...valid, availabilityTimezone: 'not/a-time-zone' }).success, false)
})