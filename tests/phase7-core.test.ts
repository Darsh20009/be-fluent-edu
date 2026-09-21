import assert from 'node:assert/strict'
import test from 'node:test'
import { NextRequest } from 'next/server'
import {
  canPublishFeedback,
  coversAllRequiredItems,
  canTransitionFeedback,
  canTransitionHomework,
  deterministicNotificationKey,
  feedbackPronunciationSchema,
  homeworkCreateSchema,
  homeworkSubmissionSchema,
  nextAggregateHomeworkReviewStatus,
  phase7DatabaseGuard,
  studentCanViewFeedback,
  teacherOwnsSession,
} from '@/lib/phase7'
import { roleHasPermission } from '@/lib/authorization'
import { storageProviderStatus, UnavailableStorageProvider } from '@/lib/storage'
import { GET as getStudentFeedback } from '@/app/api/student/feedback/route'
import { GET as getTeacherHomework } from '@/app/api/teacher/homework/route'

test('feedback lifecycle only allows draft, ready, and published transitions', () => {
  assert.equal(canTransitionFeedback('DRAFT', 'READY_TO_PUBLISH'), true)
  assert.equal(canTransitionFeedback('READY_TO_PUBLISH', 'DRAFT'), true)
  assert.equal(canTransitionFeedback('READY_TO_PUBLISH', 'PUBLISHED'), true)
  assert.equal(canTransitionFeedback('PUBLISHED', 'DRAFT'), false)
  assert.equal(canTransitionFeedback('DRAFT', 'PUBLISHED'), false)
})

test('feedback publication requires ended session state and educational content', () => {
  assert.equal(canPublishFeedback('ENDED', true), true)
  assert.equal(canPublishFeedback('FEEDBACK_PENDING', true), true)
  assert.equal(canPublishFeedback('COMPLETED', true), true)
  assert.equal(canPublishFeedback('LIVE', true), false)
  assert.equal(canPublishFeedback('COMPLETED', false), false)
})

test('teacher ownership and student visibility are identity-bound', () => {
  assert.equal(teacherOwnsSession('teacher-profile-1', 'teacher-profile-1'), true)
  assert.equal(teacherOwnsSession('teacher-profile-1', 'teacher-profile-2'), false)
  assert.equal(studentCanViewFeedback({ actorUserId: 'student-1', feedbackStudentId: 'student-1', feedbackStatus: 'PUBLISHED', sessionStatus: 'COMPLETED', participantStatus: 'JOINED' }), true)
  assert.equal(studentCanViewFeedback({ actorUserId: 'student-2', feedbackStudentId: 'student-1', feedbackStatus: 'PUBLISHED', sessionStatus: 'COMPLETED' }), false)
  assert.equal(studentCanViewFeedback({ actorUserId: 'student-1', feedbackStudentId: 'student-1', feedbackStatus: 'DRAFT', sessionStatus: 'COMPLETED' }), false)
})

test('pronunciation feedback is structured and requires guidance', () => {
  const item = feedbackPronunciationSchema.parse({ target: 'comfortable', actual: 'missing syllable reduction', guidance: 'Use three syllables', phonetic: '/ˈkʌmftəbl/' })
  assert.equal(item.target, 'comfortable')
  assert.throws(() => feedbackPronunciationSchema.parse({ target: 'comfortable' }))
})

test('homework lifecycle allows only adjacent forward transitions', () => {
  assert.equal(canTransitionHomework('DRAFT', 'PUBLISHED'), true)
  assert.equal(canTransitionHomework('PUBLISHED', 'OPEN'), true)
  assert.equal(canTransitionHomework('OPEN', 'SUBMITTED'), true)
  assert.equal(canTransitionHomework('SUBMITTED', 'REVIEWED'), true)
  assert.equal(canTransitionHomework('REVIEWED', 'COMPLETED'), true)
  assert.equal(canTransitionHomework('OPEN', 'COMPLETED'), false)
})

test('required homework items must all be covered before aggregate completion', () => {
  assert.equal(coversAllRequiredItems(['item-1', 'item-2'], ['item-1']), false)
  assert.equal(coversAllRequiredItems(['item-1', 'item-2'], ['item-2', 'item-1']), true)
  assert.equal(coversAllRequiredItems([], []), false)
})

test('completed homework is terminal when later submissions are reviewed', () => {
  assert.equal(nextAggregateHomeworkReviewStatus('COMPLETED', true, false), 'COMPLETED')
  assert.equal(nextAggregateHomeworkReviewStatus('SUBMITTED', false, true), 'SUBMITTED')
  assert.equal(nextAggregateHomeworkReviewStatus('SUBMITTED', true, false), 'REVIEWED')
  assert.equal(nextAggregateHomeworkReviewStatus('REVIEWED', true, true), 'COMPLETED')
})

test('homework contracts require a target, items, and matching content forms', () => {
  assert.throws(() => homeworkCreateSchema.parse({ title: 'Practice', items: [] }))
  const homework = homeworkCreateSchema.parse({ title: 'Practice', studentId: 'student-1', items: [{ itemType: 'TEXT', prompt: 'Write a paragraph', order: 0 }] })
  assert.equal(homework.items[0].itemType, 'TEXT')
  assert.throws(() => homeworkCreateSchema.parse({ title: 'Practice', studentId: 'student-1', groupId: 'group-1', items: [{ itemType: 'TEXT', order: 0 }] }))
  assert.throws(() => homeworkSubmissionSchema.parse({ contentType: 'TEXT', attempt: 1 }))
  assert.throws(() => homeworkSubmissionSchema.parse({ contentType: 'FILE', attempt: 1 }))
  assert.equal(homeworkSubmissionSchema.parse({ itemId: 'item-1', contentType: 'LINK', contentRef: 'https://example.com/work', attempt: 1 }).contentType, 'LINK')
})

test('notification keys are deterministic and channel-specific', () => {
  const first = deterministicNotificationKey('feedback.published', 'feedback-1', 'student-1', 'IN_APP')
  assert.equal(first, deterministicNotificationKey('feedback.published', 'feedback-1', 'student-1', 'IN_APP'))
  assert.notEqual(first, deterministicNotificationKey('feedback.published', 'feedback-1', 'student-1', 'WHATSAPP'))
})

test('Phase 7 RBAC grants explicit capabilities without implicit staff access', () => {
  assert.equal(roleHasPermission('ADMIN', 'admin.manageFeedbackLibraries'), true)
  assert.equal(roleHasPermission('MANAGER', 'manager.manageHomework'), true)
  assert.equal(roleHasPermission('TEACHER', 'teacher.manageHomework'), true)
  assert.equal(roleHasPermission('STUDENT', 'student.viewFeedback'), true)
  assert.equal(roleHasPermission('STAFF', 'admin.manageFeedback'), false)
})

test('storage provider reports unavailable instead of claiming upload success', () => {
  assert.deepEqual(storageProviderStatus(new UnavailableStorageProvider()), { configured: false, status: 'PROVIDER_UNAVAILABLE' })
})

test('database guard blocks Phase 7 before route authentication and Prisma', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  delete process.env.PHASE5_DATABASE_ENABLED
  const guard = phase7DatabaseGuard()
  assert.equal(guard?.status, 503)
  assert.equal((await guard!.json()).error.code, 'DATABASE_UNAVAILABLE')
  const feedbackResponse = await getStudentFeedback(new NextRequest('http://localhost/api/student/feedback'))
  const homeworkResponse = await getTeacherHomework()
  assert.equal(feedbackResponse.status, 503)
  assert.equal(homeworkResponse.status, 503)
  if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
  else process.env.PHASE5_DATABASE_ENABLED = original
})

test.skip('MongoDB integration: feedback, libraries, homework, reviews, and notification outbox persistence', () => {
  // Blocked explicitly: MongoDB infrastructure remains unavailable.
})