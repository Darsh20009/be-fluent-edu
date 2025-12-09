import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const [wordsCount, sessionsCount, activeSubscription] = await Promise.all([
      prisma.word.count({
        where: { studentId: userId }
      }),
      prisma.sessionStudent.count({
        where: { studentId: userId, attended: true }
      }),
      prisma.subscription.findFirst({
        where: {
          studentId: userId,
          paid: true,
          endDate: { gte: new Date() }
        },
        include: { Package: true }
      })
    ])

    // Count pending assignments: assignments for sessions the student is enrolled in that have no submission
    const studentAssignments = await prisma.assignment.findMany({
      where: {
        Session: {
          SessionStudent: {
            some: { studentId: userId }
          }
        }
      },
      include: {
        Submission: {
          where: { studentId: userId }
        }
      }
    })
    
    const pendingAssignments = studentAssignments.filter(a => a.Submission.length === 0).length

    const nextSession = await prisma.sessionStudent.findFirst({
      where: {
        studentId: userId,
        Session: {
          startTime: { gte: new Date() },
          status: 'SCHEDULED'
        }
      },
      include: {
        Session: {
          include: {
            TeacherProfile: {
              include: { User: true }
            }
          }
        }
      },
      orderBy: {
        Session: { startTime: 'asc' }
      }
    })

    let activeSubDetails = null
    if (activeSubscription) {
      const attendedSessions = await prisma.sessionStudent.count({
        where: {
          studentId: userId,
          attended: true,
          Session: {
            createdAt: {
              gte: activeSubscription.startDate || new Date()
            }
          }
        }
      })
      
      const daysRemaining = activeSubscription.endDate 
        ? Math.ceil((new Date(activeSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0
      
      activeSubDetails = {
        packageTitle: activeSubscription.Package.title,
        packageTitleAr: activeSubscription.Package.titleAr,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        lessonsTotal: activeSubscription.Package.lessonsCount,
        lessonsRemaining: Math.max(0, activeSubscription.Package.lessonsCount - attendedSessions),
        daysRemaining: Math.max(0, daysRemaining)
      }
    }

    return NextResponse.json({
      wordsLearned: wordsCount,
      sessionsAttended: sessionsCount,
      pendingAssignments,
      activeSubscription: activeSubDetails,
      nextSession: nextSession ? {
        id: nextSession.Session.id,
        title: nextSession.Session.title,
        startTime: nextSession.Session.startTime,
        endTime: nextSession.Session.endTime,
        teacherName: nextSession.Session.TeacherProfile.User.name
      } : null
    })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
