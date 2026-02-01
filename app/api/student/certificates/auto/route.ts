import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { level } = await req.json()

    // Find the lesson for this level
    const lesson = await prisma.lesson.findFirst({
      where: { level }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 })
    }

    // Check progress
    const progress = await prisma.lessonProgress.findFirst({
      where: {
        studentId: session.user.id,
        lessonId: lesson.id,
        completed: true
      }
    })

    if (!progress) {
      return NextResponse.json({ error: 'Level not completed' }, { status: 400 })
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: {
        studentId: session.user.id,
        level: level
      }
    })

    if (existingCert) {
      return NextResponse.json({ certificate: existingCert })
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        studentId: session.user.id,
        level,
        isManual: false,
        issuerName: 'Be Fluent System'
      }
    })

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error('Error in automatic certification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
