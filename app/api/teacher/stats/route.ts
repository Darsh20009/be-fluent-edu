import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const isSystemAdmin = session.user.role === 'ADMIN' && session.user.name === 'Be Fluent'

    const [totalSessions, upcomingSessions, activeStudents, pendingSubmissions] = await Promise.all([
      prisma.session.count({
        where: isSystemAdmin ? {} : { teacherId: teacherProfile.id }
      }),
      prisma.session.count({
        where: isSystemAdmin ? {
          startTime: { gte: new Date() },
          status: 'SCHEDULED'
        } : {
          teacherId: teacherProfile.id,
          startTime: { gte: new Date() },
          status: 'SCHEDULED'
        }
      }),
      isSystemAdmin ? prisma.user.count({ where: { role: 'STUDENT' } }) : prisma.sessionStudent.groupBy({
        by: ['studentId'],
        where: {
          Session: {
            teacherId: teacherProfile.id
          }
        }
      }).then(res => res.length),
      prisma.submission.count({
        where: isSystemAdmin ? { grade: null } : {
          Assignment: {
            Session: {
              teacherId: teacherProfile.id
            }
          },
          grade: null
        }
      })
    ])

    const nextSession = await prisma.session.findFirst({
      where: isSystemAdmin ? {
        startTime: { gte: new Date() },
        status: 'SCHEDULED'
      } : {
        teacherId: teacherProfile.id,
        startTime: { gte: new Date() },
        status: 'SCHEDULED'
      },
      include: {
        SessionStudent: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json({
      totalStudents: typeof activeStudents === 'number' ? activeStudents : (activeStudents as any).length,
      totalSessions,
      upcomingSessions,
      pendingGrading: pendingSubmissions,
      nextSession: nextSession ? {
        id: nextSession.id,
        title: nextSession.title,
        startTime: nextSession.startTime,
        endTime: nextSession.endTime,
        studentsCount: nextSession.SessionStudent.length
      } : null
    })
  } catch (error) {
    console.error('Error fetching teacher stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
