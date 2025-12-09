import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const submissions = await prisma.writingTestSubmission.findMany({
      where: {
        studentId: student.userId
      },
      include: {
        WritingTest: {
          select: {
            title: true,
            titleAr: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
