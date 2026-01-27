import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ASSISTANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const [
      totalUsers,
      totalStudents,
      activeStudents,
      totalTeachers,
      totalSessions,
      sessionsThisWeek,
      pendingSubscriptions,
      approvedSubscriptions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.session.count(),
      prisma.session.count({
        where: {
          startTime: { gte: oneWeekAgo }
        }
      }),
      prisma.subscription.count({ where: { status: 'PENDING' } }),
      prisma.subscription.findMany({
        where: { status: 'APPROVED' },
        include: { Package: true }
      })
    ])

    // Filter out invalid subscriptions where relations might be missing (MongoDB safety)
    const validApprovedSubscriptions = approvedSubscriptions.filter(sub => sub.Package)
    const totalRevenue = validApprovedSubscriptions.reduce((sum, sub) => sum + (sub.Package?.price || 0), 0)

    return NextResponse.json({
      totalUsers,
      totalStudents,
      activeStudents,
      totalTeachers,
      totalSessions,
      sessionsThisWeek,
      pendingSubscriptions,
      totalRevenue
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
