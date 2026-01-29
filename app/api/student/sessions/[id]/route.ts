import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getServerSession(authOptions)

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const sessionData = await prisma.session.findUnique({
      where: { id },
      include: {
        SessionStudent: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
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
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Allow Admin and Teacher to join
    if (sessionUser.user.role === 'ADMIN' || sessionUser.user.role === 'TEACHER') {
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
    }

    // Check if student is assigned to this session
    const isAssigned = sessionData.SessionStudent.some(
      (ss) => ss.studentId === sessionUser.user.id
    )

    if (!isAssigned) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

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
