import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'

const reviewSchema = z.object({
  reviewId: z.string().min(1).max(100),
  status: z.enum(['IN_REVIEW', 'REVIEWED', 'MEETING_SCHEDULED', 'CLOSED']),
  reviewNotes: z.string().trim().max(3000).optional(),
  meetingAt: z.string().datetime().nullable().optional(),
})

export async function GET(request: NextRequest) {
  const access = await requireAdmin()
  if (isNextResponse(access)) return access

  const status = request.nextUrl.searchParams.get('status')
  const validStatuses = ['PENDING', 'MEETING_REQUESTED', 'IN_REVIEW', 'REVIEWED', 'MEETING_SCHEDULED', 'CLOSED']
  const items = await prisma.placementSpeakingReview.findMany({
    where: status && validStatuses.includes(status) ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      student: { select: { id: true, name: true, email: true, phone: true } },
    },
  })
  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      attemptId: item.attemptId,
      mode: item.mode,
      status: item.status,
      reviewNotes: item.reviewNotes,
      meetingAt: item.meetingAt,
      recordingUrl: item.recordingId
        ? `/api/admin/placement-speaking/audio?reviewId=${encodeURIComponent(item.id)}`
        : null,
      createdAt: item.createdAt,
      student: item.student,
    })),
  })
}

export async function PATCH(request: Request) {
  const access = await requireAdmin()
  if (isNextResponse(access)) return access

  let body: z.infer<typeof reviewSchema>
  try {
    body = reviewSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid review update.' }, { status: 400 })
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  if (body.status === 'MEETING_SCHEDULED' && !body.meetingAt) {
    return NextResponse.json({ error: 'Choose a meeting time before scheduling.' }, { status: 400 })
  }

  const review = await prisma.placementSpeakingReview.findUnique({ where: { id: body.reviewId } })
  if (!review) return NextResponse.json({ error: 'Review request not found.' }, { status: 404 })

  const updated = await prisma.placementSpeakingReview.update({
    where: { id: review.id },
    data: {
      status: body.status,
      reviewNotes: body.reviewNotes ?? review.reviewNotes,
      meetingAt: body.meetingAt ? new Date(body.meetingAt) : review.meetingAt,
      reviewerId: access.userId,
      reviewedAt: new Date(),
    },
    select: { id: true, mode: true, status: true, reviewNotes: true, meetingAt: true, reviewedAt: true },
  })
  return NextResponse.json(updated)
}