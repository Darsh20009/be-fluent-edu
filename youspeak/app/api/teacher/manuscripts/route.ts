import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTeacher, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    // Fetch all submissions with manuscriptUrl from this teacher's tests
    // Then filter in app layer to avoid TypeScript issues
    const allSubmissions = await prisma.writingTestSubmission.findMany({
      where: {
        WritingTest: {
          teacherId: teacher.teacherProfileId
        },
        grade: null
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        WritingTest: {
          select: {
            id: true,
            title: true,
            titleAr: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // Filter those with manuscript URLs
    const pendingManuscripts = allSubmissions.filter((s: any) => s.manuscriptUrl)

    return NextResponse.json(pendingManuscripts)
  } catch (error) {
    console.error('Error fetching manuscripts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
