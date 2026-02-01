import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { studentId, level, issuerName } = await req.json()

    if (!studentId || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        level,
        issuerName: issuerName || session.user.name,
        isManual: true,
        adminId: session.user.id
      }
    })

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }
}
