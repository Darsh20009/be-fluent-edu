import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTeacher, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const writings = await prisma.freeWriting.findMany({
      where: { teacherId: teacher.teacherProfileId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    return NextResponse.json({ writings }, { status: 200 })
  } catch (error) {
    console.error('Error fetching free writings for teacher:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
