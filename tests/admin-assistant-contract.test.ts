import test from 'node:test'
import assert from 'node:assert/strict'
import {
  adminAssistantActionSchema,
  adminAssistantRequestSchema,
} from '../lib/admin-assistant-contract'

test('admin assistant request requires a recent user message and bounded history', () => {
  assert.equal(adminAssistantRequestSchema.safeParse({
    language: 'ar',
    messages: [{ role: 'user', content: 'ابحث عن طالب' }],
  }).success, true)

  assert.equal(adminAssistantRequestSchema.safeParse({
    language: 'ar',
    messages: [{ role: 'assistant', content: 'تم' }],
  }).success, false)

  assert.equal(adminAssistantRequestSchema.safeParse({
    language: 'ar',
    messages: Array.from({ length: 17 }, () => ({ role: 'user', content: 'سؤال' })),
  }).success, false)
})

test('student profile action rejects no-op and unsupported identity changes', () => {
  assert.equal(adminAssistantActionSchema.safeParse({
    type: 'student_profile_update',
    studentId: 'student-1',
    name: null,
    status: null,
    age: null,
    goal: null,
  }).success, false)

  assert.equal(adminAssistantActionSchema.safeParse({
    type: 'student_profile_update',
    studentId: 'student-1',
    email: 'change@example.test',
    name: null,
    status: null,
    age: null,
    goal: null,
  }).success, false)
})

test('subscription creation cannot be represented as an approved or paid action', () => {
  const action = adminAssistantActionSchema.safeParse({
    type: 'subscription_create',
    studentId: 'student-1',
    packageId: 'package-1',
    subscriptionType: 'GROUP',
    assignedTeacherId: null,
    groupId: null,
    capacity: null,
    startDate: null,
    endDate: null,
    adminNotes: null,
    status: 'APPROVED',
    paid: true,
  })
  assert.equal(action.success, false)
})

test('class session action requires a valid time range', () => {
  const action = adminAssistantActionSchema.safeParse({
    type: 'session_create',
    title: 'Practice',
    teacherProfileId: 'teacher-1',
    groupId: null,
    groupScheduleId: null,
    levelId: null,
    stageId: null,
    startTime: '2026-10-02T12:00:00.000Z',
    endTime: '2026-10-02T11:00:00.000Z',
    status: 'SCHEDULED',
    participantIds: [],
  })
  assert.equal(action.success, false)
})

test('messaging proposals require an exact non-empty destination and body', () => {
  assert.equal(adminAssistantActionSchema.safeParse({
    type: 'email_send',
    to: 'not-an-email',
    subject: 'Hello',
    message: 'Body',
  }).success, false)

  assert.equal(adminAssistantActionSchema.safeParse({
    type: 'whatsapp_send',
    conversationId: 'conversation-1',
    body: '   ',
  }).success, false)
})