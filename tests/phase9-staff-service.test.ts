import assert from 'node:assert/strict'
import test from 'node:test'
import {
  currentTeacherAssignmentWhere,
  isTeacherAssignedToStudent,
} from '@/lib/phase9/staff-service'

const now = new Date('2025-06-15T12:00:00.000Z')

function record(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>
}

test('teacher access predicate only admits current active assignment records', () => {
  const where = currentTeacherAssignmentWhere('teacher-profile-1', now)
  const branches = where.OR as unknown as Record<string, unknown>[]
  assert.equal(branches.length, 4)
  assert.equal('studentFeedback' in where, false)

  const groupMember = record(record(branches[0].groupMemberships).some)
  assert.deepEqual(
    { role: groupMember.role, status: groupMember.status, leftAt: groupMember.leftAt },
    { role: 'STUDENT', status: 'ACTIVE', leftAt: null },
  )
  assert.deepEqual(groupMember.group, { status: 'ACTIVE', teacherProfileId: 'teacher-profile-1' })

  const participant = record(record(branches[1].sessionParticipants).some)
  assert.deepEqual(participant.status, { in: ['SCHEDULED', 'JOINED'] })
  const session = record(participant.session)
  assert.deepEqual(session.status, { in: ['SCHEDULED', 'READY', 'LIVE'] })
  assert.deepEqual(session.endTime, { gt: now })

  const subscription = record(record(branches[2].Subscription).some)
  assert.equal(subscription.status, 'APPROVED')
  assert.equal(subscription.paid, true)
  assert.deepEqual(subscription.approvedAt, { not: null })
  assert.equal(subscription.rejectedAt, null)
  assert.deepEqual(subscription.OR, [{ startDate: null }, { startDate: { lte: now } }])
  assert.deepEqual(record((subscription.AND as unknown[])[0]).OR, [{ endDate: null }, { endDate: { gt: now } }])

  const enrollment = record(record(branches[3].enrollments).some)
  assert.equal(enrollment.status, 'ACTIVE')
  assert.deepEqual(enrollment.OR, [{ startsAt: null }, { startsAt: { lte: now } }])
  const enrollmentAnd = enrollment.AND as unknown[]
  assert.deepEqual(record(enrollmentAnd[0]).OR, [{ endsAt: null }, { endsAt: { gt: now } }])
  const currentSubscription = record(record(record((record(enrollmentAnd[1]).OR as unknown[])[1]).subscription).is)
  assert.equal(currentSubscription.status, 'APPROVED')
  assert.equal(currentSubscription.assignedTeacherId, 'teacher-profile-1')
})

test('student authorization query uses the same current assignment predicate', async () => {
  let captured: { where: Record<string, unknown> } | undefined
  const fakeClient = {
    user: {
      findFirst: async (args: { where: Record<string, unknown> }) => {
        captured = args
        return { id: 'student-1' }
      },
    },
  } as unknown as NonNullable<Parameters<typeof isTeacherAssignedToStudent>[2]>

  assert.equal(await isTeacherAssignedToStudent(
    { userId: 'teacher-user-1', teacherProfileId: 'teacher-profile-1' },
    'student-1',
    fakeClient,
    now,
  ), true)
  assert.equal(captured?.where.id, 'student-1')
  assert.equal(captured?.where.role, 'STUDENT')
  assert.equal((captured?.where.OR as unknown[]).length, 4)
})