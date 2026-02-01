import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const certificates = await prisma.certificate.findMany({
      where: { studentId: session.user.id },
      orderBy: { issueDate: 'desc' }
    })

    return NextResponse.json({ 
      certificates,
      studentName: session.user.name 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}
