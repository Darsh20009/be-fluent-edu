import assert from 'node:assert/strict'
import test from 'node:test'
import {
  attendanceMutationSchema,
  calculateAttendanceDuration,
  canStudentJoinSession,
  canTransitionSession,
  phase6DatabaseGuard,
  sessionCreateSchema,
} from '@/lib/phase6'
import { qmeetMeetingResponseSchema } from '@/lib/qmeet/provider'
import { QMeetClient } from '@/lib/qmeet'
import { roleHasPermission } from '@/lib/authorization'

test('session lifecycle allows only the documented forward transitions', () => {
  assert.equal(canTransitionSession('DRAFT', 'SCHEDULED'), true)
  assert.equal(canTransitionSession('SCHEDULED', 'READY'), true)
  assert.equal(canTransitionSession('READY', 'LIVE'), true)
  assert.equal(canTransitionSession('LIVE', 'ENDED'), true)
  assert.equal(canTransitionSession('ENDED', 'FEEDBACK_PENDING'), true)
  assert.equal(canTransitionSession('FEEDBACK_PENDING', 'COMPLETED'), true)
  assert.equal(canTransitionSession('SCHEDULED', 'LIVE'), false)
  assert.equal(canTransitionSession('COMPLETED', 'LIVE'), false)
})

test('session input validates schedule boundaries and participant de-duplication remains a service rule', () => {
  const session = sessionCreateSchema.parse({
    title: 'A1 conversation',
    teacherProfileId: 'teacher-1',
    startTime: '2026-10-01T10:00:00.000Z',
    endTime: '2026-10-01T11:00:00.000Z',
    participantIds: ['student-1', 'student-1'],
  })
  assert.equal(session.status, 'DRAFT')
  assert.throws(() => sessionCreateSchema.parse({ ...session, endTime: session.startTime }))
})

test('student join authorization enforces identity, account, enrollment, state, and timing', () => {
  const base = {
    authenticated: true,
    active: true,
    accountStatus: 'ACTIVE',
    enrolled: true,
    participantStatus: 'SCHEDULED',
    sessionStatus: 'READY',
    startTime: new Date('2026-10-01T10:00:00.000Z'),
    endTime: new Date('2026-10-01T11:00:00.000Z'),
    now: new Date('2026-10-01T09:50:00.000Z'),
  }
  assert.deepEqual(canStudentJoinSession(base), { allowed: true, code: 'ALLOWED' })
  assert.equal(canStudentJoinSession({ ...base, enrolled: false }).code, 'NOT_ENROLLED')
  assert.equal(canStudentJoinSession({ ...base, active: false }).code, 'ACCOUNT_BLOCKED')
  assert.equal(canStudentJoinSession({ ...base, sessionStatus: 'SCHEDULED' }).code, 'SESSION_NOT_JOINABLE')
  assert.equal(canStudentJoinSession({ ...base, now: new Date('2026-10-01T09:00:00.000Z') }).code, 'TOO_EARLY')
})

test('attendance accepts controlled states and computes duration', () => {
  const value = attendanceMutationSchema.parse({ userId: 'student-1', status: 'LATE', joinedAt: '2026-10-01T10:05:00.000Z', leftAt: '2026-10-01T10:35:00.000Z' })
  assert.equal(calculateAttendanceDuration(value.joinedAt, value.leftAt), 1800)
  assert.throws(() => attendanceMutationSchema.parse({ userId: 'student-1', status: 'PENDING' }))
  assert.throws(() => attendanceMutationSchema.parse({ userId: 'student-1', status: 'PRESENT', joinedAt: '2026-10-01T11:00:00.000Z', leftAt: '2026-10-01T10:00:00.000Z' }))
})

test('QMeet success responses require a real room reference and valid URLs', () => {
  const meeting = qmeetMeetingResponseSchema.parse({ roomName: 'room-1', meetingId: 'provider-1', joinUrl: 'https://meet.example/join' })
  assert.equal(meeting.roomName, 'room-1')
  assert.throws(() => qmeetMeetingResponseSchema.parse({ joinUrl: 'not-a-url' }))
  assert.throws(() => qmeetMeetingResponseSchema.parse({ status: 'CREATED' }))
  assert.throws(() => qmeetMeetingResponseSchema.parse({ roomName: 'room-1', joinUrl: 'javascript:alert(1)' }))
  assert.throws(() => qmeetMeetingResponseSchema.parse({ roomName: 'room-1', joinUrl: 'http://meet.example/join' }))
})

test('QMeet client surfaces provider failures instead of returning fake meetings', async () => {
  const client = new QMeetClient({
    apiKey: 'test-key',
    baseUrl: 'https://qmeet.example',
    fetcher: async () => new Response(JSON.stringify({ error: 'failed' }), { status: 502 }),
  })
  await assert.rejects(() => client.createMeeting({ title: 'Class' }))
})

test('QMeet client accepts an empty 204 deletion response', async () => {
  const client = new QMeetClient({
    apiKey: 'test-key',
    baseUrl: 'https://qmeet.example',
    fetcher: async () => new Response(null, { status: 204 }),
  })
  await assert.doesNotReject(() => client.deleteMeeting('room-1'))
})

test('Phase 6 RBAC separates admin, teacher, and student capabilities', () => {
  assert.equal(roleHasPermission('ADMIN', 'admin.manageSessions'), true)
  assert.equal(roleHasPermission('MANAGER', 'manager.manageSessions'), true)
  assert.equal(roleHasPermission('TEACHER', 'teacher.manageAttendance'), true)
  assert.equal(roleHasPermission('STUDENT', 'student.viewSessions'), true)
  assert.equal(roleHasPermission('STUDENT', 'teacher.manageAttendance'), false)
})

test('Phase 6 database execution remains blocked by the existing gate', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  delete process.env.PHASE5_DATABASE_ENABLED
  const response = phase6DatabaseGuard()
  assert.equal(response?.status, 503)
  assert.equal((await response!.json()).error.code, 'DATABASE_UNAVAILABLE')
  if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
  else process.env.PHASE5_DATABASE_ENABLED = original
})

test.skip('MongoDB integration: session, participant, attendance, and QMeet persistence', () => {
  // Blocked explicitly: MongoDB command execution is unavailable.
})