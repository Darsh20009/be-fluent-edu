import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const recordings = await prisma.voiceRecording.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(recordings)
  } catch (error) {
    console.error('Error fetching recordings:', error)
    return NextResponse.json({ error: 'Failed to fetch recordings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, audioData, duration, promptText, promptTextAr, category } = body

    if (!title || !audioData) {
      return NextResponse.json({ error: 'Title and audio data are required' }, { status: 400 })
    }

    const recording = await prisma.voiceRecording.create({
      data: {
        studentId: user.id,
        title,
        audioData,
        duration,
        promptText,
        promptTextAr,
        category
      }
    })

    return NextResponse.json(recording)
  } catch (error) {
    console.error('Error saving recording:', error)
    return NextResponse.json({ error: 'Failed to save recording' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Recording ID required' }, { status: 400 })
    }

    const recording = await prisma.voiceRecording.findUnique({ where: { id } })
    if (!recording || recording.studentId !== user.id) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    await prisma.voiceRecording.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recording:', error)
    return NextResponse.json({ error: 'Failed to delete recording' }, { status: 500 })
  }
}
