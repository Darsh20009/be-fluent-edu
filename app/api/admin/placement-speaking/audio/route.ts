import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const access = await requireAdmin()
  if (isNextResponse(access)) return access

  const reviewId = request.nextUrl.searchParams.get('reviewId')
  if (!reviewId) return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 })
  const review = await prisma.placementSpeakingReview.findUnique({
    where: { id: reviewId },
    select: { recordingId: true },
  })
  if (!review?.recordingId) return NextResponse.json({ error: 'This request has no recording.' }, { status: 404 })

  const recording = await prisma.voiceRecording.findUnique({
    where: { id: review.recordingId },
    select: { audioData: true, mimeType: true },
  })
  if (!recording) return NextResponse.json({ error: 'Recording not found.' }, { status: 404 })

  const audio = Uint8Array.from(Buffer.from(recording.audioData, 'base64'))
  return new NextResponse(audio, {
    headers: {
      'Content-Type': recording.mimeType || 'audio/webm',
      'Content-Disposition': 'inline; filename="placement-speaking-response"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}