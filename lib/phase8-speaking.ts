import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
// Shared CommonJS boundary is also consumed by canonical start-server.js.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const { membershipTransitionDelta, transitionSpeakingRoomMember, SpeakingMembershipError } = require('./phase8-speaking-membership.js') as {
  membershipTransitionDelta: (fromStatus: string, toStatus: string) => -1 | 0 | 1
  transitionSpeakingRoomMember: (client: unknown, input: { roomId: string; userId: string; transition: 'ACTIVATE' | 'DEACTIVATE'; status?: string; allowBlockedReactivation?: boolean }) => Promise<unknown>
  SpeakingMembershipError: new (code: string) => Error & { code: string }
}

export const speakingRoomStatuses = ['OPEN', 'ACTIVE', 'INACTIVE', 'CLOSED'] as const
export const speakingMessageTypes = ['TEXT', 'VOICE'] as const
export const speakingMessageStatuses = ['VISIBLE', 'REPORTED', 'MODERATED', 'DELETED'] as const
export const speakingReportStatuses = ['OPEN', 'RESOLVED', 'DISMISSED'] as const
export const speakingContentTypes = ['TOPIC', 'PROMPT', 'VOCABULARY'] as const
export const speakingLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export const speakingRoomCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).nullable().optional(),
  levelId: z.string().trim().min(1).nullable().optional(),
  stageId: z.string().trim().min(1).nullable().optional(),
  teacherProfileId: z.string().trim().min(1).nullable().optional(),
  topic: z.string().trim().min(1).max(300),
  prompt: z.string().trim().max(2000).nullable().optional(),
  vocabulary: z.array(z.string().trim().min(1).max(120)).max(100).default([]),
  maxMembers: z.number().int().min(2).max(100).nullable().optional(),
  status: z.enum(speakingRoomStatuses).default('OPEN'),
})

export const speakingRoomUpdateSchema = speakingRoomCreateSchema.partial()
export const speakingRoomStatusSchema = z.object({ status: z.enum(speakingRoomStatuses) })
export const speakingMessageSchema = z.object({
  messageType: z.enum(speakingMessageTypes),
  text: z.string().trim().max(4000).nullable().optional(),
  voiceRef: z.string().trim().max(2000).nullable().optional(),
}).superRefine((value, context) => {
  if (value.messageType === 'TEXT' && !value.text) context.addIssue({ code: 'custom', path: ['text'], message: 'Text is required' })
  if (value.messageType === 'VOICE' && !value.voiceRef) context.addIssue({ code: 'custom', path: ['voiceRef'], message: 'Voice storage reference is required' })
})

export const speakingReportSchema = z.object({
  targetUserId: z.string().trim().min(1).nullable().optional(),
  messageId: z.string().trim().min(1).nullable().optional(),
  reason: z.string().trim().min(1).max(1000),
})
export const speakingModerationSchema = z.object({
  action: z.enum(['MUTE', 'UNMUTE', 'REMOVE', 'BLOCK', 'UNBLOCK', 'DELETE_MESSAGE', 'RESOLVE_REPORT', 'DISMISS_REPORT']),
  memberUserId: z.string().trim().min(1).nullable().optional(),
  messageId: z.string().trim().min(1).nullable().optional(),
  reportId: z.string().trim().min(1).nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
})
export const speakingContentSchema = z.object({
  roomId: z.string().trim().min(1).nullable().optional(),
  contentType: z.enum(speakingContentTypes),
  text: z.string().trim().min(1).max(2000),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

export function phase8SpeakingDatabaseGuard() {
  if (process.env.PHASE5_DATABASE_ENABLED === 'true') return null
  return NextResponse.json(
    { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Speaking rooms are temporarily unavailable.' } },
    { status: 503 },
  )
}

export function levelCodeAllowed(code: string | null | undefined) {
  return Boolean(code && speakingLevels.includes(code as (typeof speakingLevels)[number]))
}

export function canJoinSpeakingRoom(input: {
  roomStatus: string
  roomLevelId: string | null
  roomStageId: string | null
  officialLevelId: string | null
  officialStageId: string | null
  activeAccount: boolean
  currentMember: boolean
  maxMembers: number | null
  activeMemberCount: number
}) {
  if (!input.activeAccount || !['OPEN', 'ACTIVE'].includes(input.roomStatus)) return false
  if (input.currentMember) return true
  if (!input.officialLevelId || input.roomLevelId !== input.officialLevelId) return false
  if (input.roomStageId && input.roomStageId !== input.officialStageId) return false
  if (input.maxMembers !== null && input.activeMemberCount >= input.maxMembers) return false
  return true
}

export async function officialStudentLevel(userId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { officialLevelId: true, officialStageId: true },
  })
  return profile
}

export async function speakingRoomAccess(roomId: string, userId: string) {
  const room = await prisma.speakingRoom.findUnique({
    where: { id: roomId },
    include: { members: true },
  })
  if (!room) return { room: null, member: null, allowed: false }
  const existingMember = room.members.find((item) => item.userId === userId) || null
  if (existingMember?.status === 'BLOCKED') return { room, member: null, allowed: false }
  const member = existingMember?.status === 'ACTIVE' ? existingMember : null
  if (member) return { room, member, allowed: true }
  const profile = await officialStudentLevel(userId)
  const allowed = canJoinSpeakingRoom({
    roomStatus: room.status,
    roomLevelId: room.levelId,
    roomStageId: room.stageId,
    officialLevelId: profile?.officialLevelId || null,
    officialStageId: profile?.officialStageId || null,
    activeAccount: true,
    currentMember: false,
    maxMembers: room.maxMembers,
    activeMemberCount: room.members.filter((item) => item.status === 'ACTIVE').length,
  })
  return { room, member: null, allowed }
}

export function speakingRoomStudentDto(room: {
  id: string
  name: string | null
  description: string | null
  levelId: string | null
  stageId: string | null
  topic: string
  prompt: string | null
  vocabularyJson: string | null
  status: string
  maxMembers: number | null
  activeMemberCount: number
  createdAt: Date
  updatedAt: Date
}, member: { id: string; role: string; status: string; muted: boolean; joinedAt: Date; leftAt: Date | null } | null, content: unknown[]) {
  let vocabulary: string[] = []
  try {
    const parsed = room.vocabularyJson ? JSON.parse(room.vocabularyJson) : []
    if (Array.isArray(parsed)) vocabulary = parsed.filter((item): item is string => typeof item === 'string')
  } catch { vocabulary = [] }
  return {
    id: room.id, name: room.name, description: room.description, levelId: room.levelId, stageId: room.stageId,
    topic: room.topic, prompt: room.prompt, vocabulary, status: room.status, maxMembers: room.maxMembers,
    activeMemberCount: room.activeMemberCount, createdAt: room.createdAt, updatedAt: room.updatedAt,
    content, member: member ? { id: member.id, role: member.role, status: member.status, muted: member.muted, joinedAt: member.joinedAt, leftAt: member.leftAt } : null,
  }
}

export async function teacherCanModerateSpeakingRoom(roomId: string, userId: string) {
  const room = await prisma.speakingRoom.findUnique({
    where: { id: roomId },
    select: { moderatorTeacherProfile: { select: { userId: true } } },
  })
  return room?.moderatorTeacherProfile?.userId === userId
}

export async function speakingRoomAudit(userId: string, action: string, roomId: string, details?: Record<string, unknown>) {
  const { recordAuditEvent } = await import('@/lib/audit')
  await recordAuditEvent({ action: 'ADMIN_ACTION', userId, details: { domain: 'SPEAKING_ROOM', action, roomId, ...details } }).catch(() => undefined)
}