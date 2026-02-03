import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await request.json() as { type: string }

    if (type === 'all') {
      // DANGEROUS: Clear everything except admin user
      await prisma.auditLog.deleteMany({})
      await prisma.certificate.deleteMany({})
      await prisma.attendance.deleteMany({})
      await prisma.assignmentSubmission.deleteMany({})
      await prisma.assignment.deleteMany({})
      await prisma.session.deleteMany({})
      await prisma.subscription.deleteMany({})
      await prisma.studentProfile.deleteMany({})
      await prisma.teacherProfile.deleteMany({})
      // Delete users who are not admins
      await prisma.user.deleteMany({
        where: { role: { not: 'ADMIN' } }
      })
      return NextResponse.json({ success: true, message: 'Database cleared successfully (except admins)' })
    }

    if (type === 'logs') {
      await prisma.auditLog.deleteMany({})
      return NextResponse.json({ success: true, message: 'Logs cleared successfully' })
    }

    if (type === 'sessions') {
      await prisma.session.deleteMany({})
      return NextResponse.json({ success: true, message: 'Sessions cleared successfully' })
    }

    return NextResponse.json({ error: 'Invalid cleanup type' }, { status: 400 })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
