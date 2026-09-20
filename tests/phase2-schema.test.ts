import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const schema = readFileSync(join(process.cwd(), 'prisma/schema.prisma'), 'utf8')

function modelBlock(name: string) {
  const match = schema.match(new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`, 'm'))
  assert.ok(match, `Expected model ${name} to exist`)
  return match[1]
}

test('keeps MongoDB as the only Prisma datasource and preserves legacy models', () => {
  assert.match(schema, /provider = "mongodb"/)
  assert.match(schema, /url\s+= env\("MONGODB_URI"\)/)
  for (const model of ['User', 'StudentProfile', 'TeacherProfile', 'Subscription', 'Session', 'PlacementTestAttempt', 'UserGamification']) {
    assert.match(schema, new RegExp(`model ${model} \\{`))
  }
})

test('models one identity with centralized staff permissions', () => {
  const user = modelBlock('User')
  const permissions = modelBlock('StaffPermission')
  assert.match(user, /role\s+String/)
  assert.match(user, /normalizedPhone\s+String\?/)
  assert.match(user, /status\s+String/)
  assert.match(permissions, /userId\s+String/)
  assert.match(permissions, /permission\s+String/)
  assert.match(permissions, /user\s+User/)
})

test('keeps official level, stage, and recommendation relationships separate', () => {
  const profile = modelBlock('StudentProfile')
  const learningProfile = modelBlock('StudentLearningProfile')
  const stage = modelBlock('LevelStage')
  assert.match(profile, /officialLevelId\s+String\?/)
  assert.match(profile, /officialStageId\s+String\?/)
  assert.match(profile, /recommendedLevelId\s+String\?/)
  assert.match(profile, /recommendedStageId\s+String\?/)
  assert.match(learningProfile, /officialLevelId\s+String\?/)
  assert.match(learningProfile, /recommendedLevelId\s+String\?/)
  assert.match(stage, /levelId\s+String/)
  assert.match(stage, /@@unique\(\[levelId, code\]\)/)
})

test('separates commercial subscriptions from group enrollments', () => {
  const subscription = modelBlock('Subscription')
  const enrollment = modelBlock('Enrollment')
  const group = modelBlock('LearningGroup')
  assert.match(subscription, /packageId\s+String/)
  assert.match(subscription, /Enrollment\s+Enrollment\[\]/)
  assert.match(enrollment, /subscriptionId\s+String\?/)
  assert.match(enrollment, /groupId\s+String\?/)
  assert.match(enrollment, /subscriptionType\s+SubscriptionType/)
  assert.match(group, /capacity\s+Int\?/)
  assert.match(group, /schedules\s+GroupSchedule\[\]/)
  assert.match(schema, /enum SubscriptionType \{[\s\S]*GROUP[\s\S]*DUO[\s\S]*PRIVATE[\s\S]*SMALL_GROUP/)
})

test('separates session participants, attendance, QMeet, and feedback', () => {
  const session = modelBlock('Session')
  const participant = modelBlock('SessionParticipant')
  const attendance = modelBlock('Attendance')
  const qmeet = modelBlock('QMeetMeeting')
  const feedback = modelBlock('SessionFeedback')
  assert.match(session, /participants\s+SessionParticipant\[\]/)
  assert.match(session, /attendances\s+Attendance\[\]/)
  assert.match(session, /qmeetMeeting\s+QMeetMeeting\?/)
  assert.match(participant, /@@unique\(\[sessionId, userId\]\)/)
  assert.match(attendance, /@@unique\(\[sessionId, userId\]\)/)
  assert.match(qmeet, /sessionId\s+String\s+@unique/)
  assert.match(feedback, /expressions\s+FeedbackExpression\[\]/)
  assert.match(feedback, /ebi\s+FeedbackEBI\[\]/)
})

test('models homework submissions and reviews as separate records', () => {
  const homework = modelBlock('Homework')
  const item = modelBlock('HomeworkItem')
  const submission = modelBlock('HomeworkSubmission')
  const review = modelBlock('HomeworkReview')
  assert.match(homework, /items\s+HomeworkItem\[\]/)
  assert.match(homework, /submissions\s+HomeworkSubmission\[\]/)
  assert.match(item, /homeworkId\s+String/)
  assert.match(submission, /studentId\s+String/)
  assert.match(submission, /reviews\s+HomeworkReview\[\]/)
  assert.match(review, /submissionId\s+String/)
  assert.match(review, /teacherId\s+String/)
})