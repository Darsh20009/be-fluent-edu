import { NextRequest, NextResponse } from 'next/server'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const { id } = await params
    const url = new URL(request.url)
    const password = url.searchParams.get('password')

    const sessionData = await prisma.session.findFirst({
      where: {
        id,
        SessionStudent: {
          some: {
            studentId: student.userId
          }
        }
      },
      include: {
        TeacherProfile: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found or not enrolled' }, { status: 404 })
    }

    // Allow joining if session is in progress or upcoming (start time has passed)
    const now = new Date()
    // Don't block - let Zego handle timing
    // if (!hasStarted) return 403...

    return NextResponse.json({
      id: sessionData.id,
      title: sessionData.title,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      status: sessionData.status,
      roomId: sessionData.roomId,
      recordingUrl: sessionData.recordingUrl,
      sessionPassword: sessionData.sessionPassword,
      teacher: {
        name: sessionData.TeacherProfile.User.name,
        email: sessionData.TeacherProfile.User.email
      }
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
