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
      approvedSubscriptions,
      recentSubscriptions,
      recentUsers,
      placementTestCountsRaw
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
      }),
      prisma.subscription.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          User: { select: { name: true, email: true } },
          Package: { select: { title: true, price: true } }
        }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      }),
      prisma.testQuestion.groupBy({
        by: ['testType'],
        _count: true
      })
    ])

    const placementTestCounts = placementTestCountsRaw.reduce((acc: any, curr: any) => {
      acc[curr.testType] = curr._count;
      return acc;
    }, {});

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

    // Monthly revenue visualization (last 6 months)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleString('default', { month: 'short' })
      const year = date.getFullYear()
      
      const startOfMonth = new Date(year, date.getMonth(), 1)
      const endOfMonth = new Date(year, date.getMonth() + 1, 0)

      const monthSubs = await prisma.subscription.findMany({
        where: {
          status: 'APPROVED',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        include: { Package: true }
      })

      const revenue = monthSubs.reduce((acc, sub) => acc + ((sub as any).Package?.price || 0), 0)
      monthlyRevenue.push({ month, revenue })
    }

    return NextResponse.json({
      totalUsers,
      totalStudents,
      activeStudents,
      totalTeachers,
      totalSessions,
      sessionsThisWeek,
      pendingSubscriptions,
      totalRevenue,
      recentSubscriptions,
      recentUsers,
      monthlyRevenue,
      placementTestCounts,
      health: {
        database: 'connected',
        email: 'active'
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
