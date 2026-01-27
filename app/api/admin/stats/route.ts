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
        where: { status: 'APPROVED' }
      })
    ])

    // Total revenue from approved subscriptions - Robust population
    let totalRevenue = 0
    if (approvedSubscriptions && approvedSubscriptions.length > 0) {
      const packageIds = [...new Set(approvedSubscriptions.map(s => s.packageId).filter(Boolean))]
      const packages = await prisma.package.findMany({
        where: { id: { in: packageIds as string[] } }
      })
      const packageMap = new Map(packages.map(p => [p.id, p]))

      for (const sub of approvedSubscriptions) {
        const pkg = packageMap.get(sub.packageId)
        if (pkg) {
          totalRevenue += pkg.price
        }
      }
    }

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
