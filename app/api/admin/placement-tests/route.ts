import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const attempts = await prisma.placementTestAttempt.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    })

    const formatted = attempts.map((a: {
      id: string;
      studentId: string;
      score: number;
      percentage: number;
      levelResult: string | null;
      startedAt: Date;
      completedAt: Date | null;
      details: string | null;
      User: { id: string; name: string; email: string }
    }) => ({
      id: a.id,
      userId: a.studentId,
      userName: a.User?.name || 'Unknown',
      userEmail: a.User?.email || '',
      score: Math.round(a.percentage),
      level: a.levelResult || 'A1',
      completedAt: (a.completedAt || a.startedAt).toISOString(),
      answers: a.details ? JSON.parse(a.details) : []
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching placement test results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
