import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json()

    if (type === 'logs') {
      await prisma.auditLog.deleteMany({})
      return NextResponse.json({ message: 'Logs cleared' })
    }

    if (type === 'all') {
      // 1. Delete transactional data
      await prisma.submission.deleteMany({})
      await prisma.assignment.deleteMany({})
      await prisma.sessionStudent.deleteMany({})
      await prisma.session.deleteMany({})
      await prisma.chat.deleteMany({})
      await prisma.cartItem.deleteMany({})
      await prisma.cart.deleteMany({})
      await prisma.subscription.deleteMany({})
      await prisma.certificate.deleteMany({})
      
      // 2. Delete profiles and users that are NOT admins
      const nonAdminUsers = await prisma.user.findMany({
        where: { role: { not: 'ADMIN' } },
        select: { id: true }
      })
      const nonAdminIds = nonAdminUsers.map(u => u.id)

      await prisma.studentProfile.deleteMany({
        where: { userId: { in: nonAdminIds } }
      })
      
      await prisma.teacherProfile.deleteMany({
        where: { userId: { in: nonAdminIds } }
      })

      await prisma.user.deleteMany({
        where: { id: { in: nonAdminIds } }
      })

      await prisma.auditLog.deleteMany({})
      
      return NextResponse.json({ message: 'System reset completed' })
    }

    return NextResponse.json({ error: 'Invalid cleanup type' }, { status: 400 })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
