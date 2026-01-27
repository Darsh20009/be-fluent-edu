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

    const subscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'UNDER_REVIEW' },
          { status: 'APPROVED' },
          { status: 'REJECTED' }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json([])
    }

    // Robust population to handle MongoDB consistency issues
    const studentIds = [...new Set(subscriptions.map(s => s.studentId).filter(Boolean))]
    const packageIds = [...new Set(subscriptions.map(s => s.packageId).filter(Boolean))]
    const teacherIds = [...new Set(subscriptions.map(s => s.assignedTeacherId).filter(Boolean))]

    const [users, packages, teachers] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: studentIds as string[] } },
        select: { id: true, name: true, email: true, phone: true }
      }),
      prisma.package.findMany({
        where: { id: { in: packageIds as string[] } }
      }),
      prisma.teacherProfile.findMany({
        where: { id: { in: teacherIds as string[] } },
        include: { User: { select: { name: true, email: true } } }
      })
    ])

    const userMap = new Map(users.map(u => [u.id, u]))
    const packageMap = new Map(packages.map(p => [p.id, p]))
    const teacherMap = new Map(teachers.map(t => [t.id, t]))

    const detailedSubscriptions = subscriptions.map(sub => {
      const user = userMap.get(sub.studentId)
      const pkg = packageMap.get(sub.packageId)
      const teacher = sub.assignedTeacherId ? teacherMap.get(sub.assignedTeacherId) : null

      if (!user || !pkg) return null

      return {
        ...sub,
        User: user,
        Package: pkg,
        AssignedTeacher: teacher
      }
    }).filter(s => s !== null)

    return NextResponse.json(detailedSubscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
