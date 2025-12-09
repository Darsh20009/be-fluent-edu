import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTeacher, isNextResponse } from '@/lib/auth-helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const { id: submissionId } = await params
    const body = await request.json()
    const { grade, feedback, grammarErrors } = body

    if (grade === undefined || grade === null) {
      return NextResponse.json({ error: 'Grade is required' }, { status: 400 })
    }

    const submission = await prisma.writingTestSubmission.findUnique({
      where: { id: submissionId },
      include: {
        WritingTest: true
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.WritingTest.teacherId !== teacher.teacherProfileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedSubmission = await prisma.writingTestSubmission.update({
      where: { id: submissionId },
      data: {
        grade: parseFloat(grade.toString()),
        feedback: feedback || null,
        grammarErrors: grammarErrors ? JSON.stringify(grammarErrors) : null,
        gradedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        WritingTest: true
      }
    })

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error('Error grading submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
