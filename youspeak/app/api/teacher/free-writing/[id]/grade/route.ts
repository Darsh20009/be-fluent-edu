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

    const { id: writingId } = await params
    const body = await request.json()
    const { grade, feedback, grammarErrors } = body

    if (grade === undefined || grade === null) {
      return NextResponse.json({ error: 'Grade is required' }, { status: 400 })
    }

    const writing = await prisma.freeWriting.findUnique({
      where: { id: writingId },
      include: {
        User: {
          include: {
            Subscription: {
              where: {
                assignedTeacherId: teacher.teacherProfileId
              }
            }
          }
        }
      }
    })

    if (!writing) {
      return NextResponse.json({ error: 'Writing not found' }, { status: 404 })
    }

    const isAssignedTeacher = writing.teacherId === teacher.teacherProfileId || 
      writing.User.Subscription.length > 0

    if (!isAssignedTeacher) {
      return NextResponse.json({ 
        error: 'Not authorized to grade this writing. You must be the assigned teacher for this student.' 
      }, { status: 403 })
    }

    const updatedWriting = await prisma.freeWriting.update({
      where: { id: writingId },
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
        }
      }
    })

    return NextResponse.json({ writing: updatedWriting }, { status: 200 })
  } catch (error) {
    console.error('Error grading free writing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
