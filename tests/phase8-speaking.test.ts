import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canJoinSpeakingRoom,
  membershipTransitionDelta,
  phase8SpeakingDatabaseGuard,
  speakingMessageSchema,
  speakingModerationSchema,
  speakingRoomCreateSchema,
  speakingRoomStudentDto,
} from '@/lib/phase8-speaking'

test('speaking room access requires official level and applicable stage', () => {
  const base = {
    roomStatus: 'OPEN',
    roomLevelId: 'level-b1',
    roomStageId: 'stage-2',
    officialLevelId: 'level-b1',
    officialStageId: 'stage-2',
    activeAccount: true,
    currentMember: false,
    maxMembers: 10,
    activeMemberCount: 2,
  }
  assert.equal(canJoinSpeakingRoom(base), true)
  assert.equal(canJoinSpeakingRoom({ ...base, officialLevelId: 'level-a2' }), false)
  assert.equal(canJoinSpeakingRoom({ ...base, officialStageId: 'stage-1' }), false)
  assert.equal(canJoinSpeakingRoom({ ...base, activeMemberCount: 10 }), false)
})

test('membership counter delta changes only on ACTIVE boundary transitions', () => {
  assert.equal(membershipTransitionDelta('LEFT', 'ACTIVE'), 1)
  assert.equal(membershipTransitionDelta('BLOCKED', 'ACTIVE'), 1)
  assert.equal(membershipTransitionDelta('ACTIVE', 'REMOVED'), -1)
  assert.equal(membershipTransitionDelta('ACTIVE', 'BLOCKED'), -1)
  assert.equal(membershipTransitionDelta('LEFT', 'BLOCKED'), 0)
  assert.equal(membershipTransitionDelta('ACTIVE', 'ACTIVE'), 0)
})

test('room contracts keep server-owned moderation and message forms bounded', () => {
  const room = speakingRoomCreateSchema.parse({ name: 'B1 Conversation', topic: 'Travel', levelId: 'level-b1' })
  assert.equal(room.topic, 'Travel')
  assert.equal(speakingMessageSchema.parse({ messageType: 'TEXT', text: 'Hello' }).messageType, 'TEXT')
  assert.throws(() => speakingMessageSchema.parse({ messageType: 'TEXT' }))
  assert.equal(speakingModerationSchema.parse({ action: 'MUTE', memberUserId: 'user-1' }).action, 'MUTE')
})

test('student room DTO exposes only caller membership and parsed learning content', () => {
  const result = speakingRoomStudentDto({
    id: 'room-1', name: 'Practice', description: null, levelId: 'level-1', stageId: null,
    topic: 'Travel', prompt: 'Ask a question', vocabularyJson: '["route","ticket"]',
    status: 'OPEN', maxMembers: 10, activeMemberCount: 1,
    createdAt: new Date(0), updatedAt: new Date(0),
  }, { id: 'member-1', role: 'MEMBER', status: 'ACTIVE', muted: false, joinedAt: new Date(0), leftAt: null }, [])
  assert.deepEqual(result.vocabulary, ['route', 'ticket'])
  assert.deepEqual(result.member, { id: 'member-1', role: 'MEMBER', status: 'ACTIVE', muted: false, joinedAt: new Date(0), leftAt: null })
  assert.equal('members' in result, false)
  assert.equal('createdById' in result, false)
})

test('speaking room database guard blocks before auth while MongoDB is disabled', async () => {
  const original = process.env.PHASE5_DATABASE_ENABLED
  delete process.env.PHASE5_DATABASE_ENABLED
  const response = phase8SpeakingDatabaseGuard()
  assert.equal(response?.status, 503)
  assert.equal((await response!.json()).error.code, 'DATABASE_UNAVAILABLE')
  if (original === undefined) delete process.env.PHASE5_DATABASE_ENABLED
  else process.env.PHASE5_DATABASE_ENABLED = original
})

test.skip('MongoDB and Socket.IO integration: room membership, messages, and moderation', () => {
  // Blocked explicitly: MongoDB infrastructure and authenticated realtime integration are unavailable.
})