import assert from 'node:assert/strict'
import test from 'node:test'
import {
  enrollmentCreateSchema,
  groupCreateSchema,
  matchingSchema,
  packageCreateSchema,
  phase5DatabaseGuard,
  rankMatchingGroups,
  subscriptionStatusSchema,
} from '@/lib/phase5'
import { roleHasPermission } from '@/lib/authorization'

test('package contracts validate type, capacity, duration, features, and price', () => {
  const pkg = packageCreateSchema.parse({
    title: 'Private learning',
    titleAr: 'تعلم خاص',
    subscriptionType: 'PRIVATE',
    capacity: 1,
    durationDays: 30,
    lessonsCount: 8,
    price: 100,
    features: ['Weekly progress'],
  })
  assert.equal(pkg.subscriptionType, 'PRIVATE')
  assert.throws(() => packageCreateSchema.parse({ ...pkg, capacity: 2 }))
  assert.throws(() => packageCreateSchema.parse({ ...pkg, discountPrice: 120 }))
})

test('subscription lifecycle accepts only explicit states', () => {
  assert.equal(subscriptionStatusSchema.parse({ status: 'APPROVED' }).status, 'APPROVED')
  assert.throws(() => subscriptionStatusSchema.parse({ status: 'CANCELLED' }))
})

test('enrollment requires a student, subscription, and supported type', () => {
  const value = enrollmentCreateSchema.parse({
    studentId: 'student-1',
    subscriptionId: 'subscription-1',
    subscriptionType: 'GROUP',
  })
  assert.equal(value.subscriptionType, 'GROUP')
  assert.throws(() => enrollmentCreateSchema.parse({ studentId: 'student-1', subscriptionType: 'GROUP' }))
})

test('group capacity and subscription type inputs are bounded', () => {
  assert.equal(groupCreateSchema.parse({ name: 'A1 Morning', subscriptionType: 'SMALL_GROUP', capacity: 6 }).capacity, 6)
  assert.throws(() => groupCreateSchema.parse({ name: 'A1 Morning', subscriptionType: 'OTHER' }))
  assert.throws(() => groupCreateSchema.parse({ name: 'A1 Morning', subscriptionType: 'GROUP', capacity: 0 }))
})

test('matching excludes level, stage, type, capacity, teacher, and schedule mismatches', () => {
  const request = matchingSchema.parse({
    studentId: 'student-1',
    subscriptionType: 'GROUP',
    levelId: 'a1',
    stageId: 'a1-2',
    preferredDays: [1, 3],
    preferredStartMinute: 600,
  })
  const groups = [
    { id: 'eligible', levelId: 'a1', stageId: 'a1-2', subscriptionType: 'GROUP' as const, teacherProfileId: 'teacher', capacity: 5, activeMemberCount: 2, status: 'ACTIVE', schedules: [{ dayOfWeek: 1, startMinute: 620, status: 'ACTIVE' }] },
    { id: 'full', levelId: 'a1', stageId: 'a1-2', subscriptionType: 'GROUP' as const, teacherProfileId: 'teacher', capacity: 2, activeMemberCount: 2, status: 'ACTIVE', schedules: [{ dayOfWeek: 1, startMinute: 600, status: 'ACTIVE' }] },
    { id: 'wrong-stage', levelId: 'a1', stageId: 'a1-1', subscriptionType: 'GROUP' as const, teacherProfileId: 'teacher', capacity: 5, activeMemberCount: 0, status: 'ACTIVE', schedules: [{ dayOfWeek: 1, startMinute: 600, status: 'ACTIVE' }] },
    { id: 'no-teacher', levelId: 'a1', stageId: 'a1-2', subscriptionType: 'GROUP' as const, teacherProfileId: null, capacity: 5, activeMemberCount: 0, status: 'ACTIVE', schedules: [{ dayOfWeek: 1, startMinute: 600, status: 'ACTIVE' }] },
  ]
  assert.deepEqual(rankMatchingGroups(groups, request).map((item) => item.groupId), ['eligible'])
})

test('matching ranks closer compatible schedules first', () => {
  const request = matchingSchema.parse({ studentId: 'student-1', subscriptionType: 'GROUP', preferredDays: [2], preferredStartMinute: 600 })
  const base = { levelId: null, stageId: null, subscriptionType: 'GROUP' as const, teacherProfileId: 'teacher', capacity: 5, activeMemberCount: 1, status: 'ACTIVE' }
  const groups = [
    { ...base, id: 'later', schedules: [{ dayOfWeek: 2, startMinute: 720, status: 'ACTIVE' }] },
    { ...base, id: 'closer', schedules: [{ dayOfWeek: 2, startMinute: 610, status: 'ACTIVE' }] },
  ]
  assert.deepEqual(rankMatchingGroups(groups, request).map((item) => item.groupId), ['closer', 'later'])
})

test('phase 5 RBAC grants explicit operational capabilities', () => {
  assert.equal(roleHasPermission('ADMIN', 'admin.manageGroups'), true)
  assert.equal(roleHasPermission('MANAGER', 'admin.manageSubscriptions'), true)
  assert.equal(roleHasPermission('STAFF', 'admin.managePackages'), false)
  assert.equal(roleHasPermission('STAFF', 'staff.manageGroups'), false)
  assert.equal(roleHasPermission('TEACHER', 'teacher.viewAssignedGroups'), true)
  assert.equal(roleHasPermission('STUDENT', 'student.viewCommercial'), true)
})

test('database execution is blocked unless explicitly enabled', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  delete process.env.PHASE5_DATABASE_ENABLED
  const response = phase5DatabaseGuard()
  assert.equal(response?.status, 503)
  const body = await response!.json()
  assert.equal(body.error.code, 'DATABASE_UNAVAILABLE')
  if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
  else process.env.PHASE5_DATABASE_ENABLED = original
})