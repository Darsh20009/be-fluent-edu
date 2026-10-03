import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolvePlacementAccess } from '@/lib/placement-access'

const requestSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('RECORDING'),
    attemptId: z.string().min(1).max(100),
    audioBase64: z.string().min(1).max(1_000_000),
    mimeType: z.string().min(1).max(100),
    duration: z.number().int().min(1).max(60),
    promptText: z.string().trim().min(5).max(500),
  }),
  z.object({
    mode: z.literal('MEETING'),
    attemptId: z.string().min(1).max(100),
  }),
])

const allowedAudioType = (mimeType: string) =>
  ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
    .some((type) => mimeType.toLowerCase().startsWith(type))

export async function GET(request: NextRequest) {
  const access = await resolvePlacementAccess(request)
  if (access.response) return access.response
  if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })

  const attemptId = request.nextUrl.searchParams.get('attemptId')
  if (!attemptId) return NextResponse.json({ error: 'An attempt ID is required.' }, { status: 400 })
  const attempt = await prisma.placementTestAttempt.findFirst({
    where: { id: attemptId, studentId: access.userId, testType: 'PLACEMENT', completedAt: { not: null } },
    select: { id: true },
  })
  if (!attempt) return NextResponse.json({ error: 'Placement attempt not found.' }, { status: 404 })

  const review = await prisma.placementSpeakingReview.findUnique({
    where: { attemptId },
    select: { id: true, mode: true, status: true, meetingAt: true, createdAt: true },
  })
  return NextResponse.json({ review })
}

export async function POST(request: NextRequest) {
  const access = await resolvePlacementAccess(request)
  if (access.response) return access.response
  if (!access.userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 1_500_000) {
    return NextResponse.json({ error: 'The recording is too large. Keep it under 45 seconds and try again.' }, { status: 413 })
  }

  let body: z.infer<typeof requestSchema>
  try {
    body = requestSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Choose a completed test and provide a valid recording or meeting request.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (body.mode === 'RECORDING') {
    if (!allowedAudioType(body.mimeType) || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.audioBase64)) {
      return NextResponse.json({ error: 'This audio format is not supported.' }, { status: 415 })
    }
    const audioBytes = Buffer.from(body.audioBase64, 'base64')
    if (!audioBytes.byteLength || audioBytes.byteLength > 700 * 1024) {
      return NextResponse.json({ error: 'The recording must be 700 KB or smaller.' }, { status: 413 })
    }
  }

  const attempt = await prisma.placementTestAttempt.findFirst({
    where: {
      id: body.attemptId,
      studentId: access.userId,
      testType: 'PLACEMENT',
      completedAt: { not: null },
    },
    select: { id: true },
  })
  if (!attempt) return NextResponse.json({ error: 'Complete the placement test before sending your response.' }, { status: 409 })

  const existing = await prisma.placementSpeakingReview.findUnique({
    where: { attemptId: body.attemptId },
    select: { id: true, status: true, mode: true },
  })
  if (existing) {
    return NextResponse.json({ success: true, review: existing, alreadySubmitted: true })
  }

  try {
    const review = await prisma.$transaction(async (tx) => {
      let recordingId: string | undefined
      if (body.mode === 'RECORDING') {
        const recording = await tx.voiceRecording.create({
          data: {
            studentId: access.userId!,
            title: 'Placement speaking response',
            audioData: body.audioBase64,
            mimeType: body.mimeType,
            duration: body.duration,
            promptText: body.promptText,
            category: 'PLACEMENT_SPEAKING',
          },
          select: { id: true },
        })
        recordingId = recording.id
      }

      const created = await tx.placementSpeakingReview.create({
        data: {
          studentId: access.userId!,
          attemptId: body.attemptId,
          recordingId,
          mode: body.mode,
          status: body.mode === 'MEETING' ? 'MEETING_REQUESTED' : 'PENDING',
        },
        select: { id: true, mode: true, status: true, createdAt: true },
      })
      return created
    })
    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (error) {
    console.error('Placement speaking submission failed', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'Your response could not be saved. Please retry.' }, { status: 500 })
  }
}