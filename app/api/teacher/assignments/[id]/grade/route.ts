import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const { grade, feedback, grammarErrors } = await request.json()

    if (grade === undefined || grade === null) {
      return NextResponse.json({ error: 'Grade is required' }, { status: 400 })
    }

    const { id: submissionId } = await params

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        Assignment: {
          include: {
            Session: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.Assignment && submission.Assignment.Session && submission.Assignment.Session.teacherId !== teacherProfile.id) {
      return NextResponse.json({ error: 'Not authorized to grade this submission' }, { status: 403 })
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: parseFloat(grade.toString()),
        feedback: feedback || null,
        grammarErrors: grammarErrors || null
      }
    })

    // Deduct lesson from subscription when assignment is graded/submitted
    if (submission.studentId) {
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          studentId: submission.studentId,
          status: 'APPROVED',
          paid: true
        }
      })

      if (activeSubscription) {
        console.log(`📝 Found subscription for assignment submission from ${submission.studentId}:`, {
          id: activeSubscription.id,
          lessonsAvailable: activeSubscription.lessonsAvailable,
          lessonsTaken: activeSubscription.lessonsTaken
        })

        // Check if lessons are still available and deduct one
        if (activeSubscription.lessonsAvailable > activeSubscription.lessonsTaken) {
          const updated = await prisma.subscription.update({
            where: { id: activeSubscription.id },
            data: {
              lessonsTaken: { increment: 1 }
            }
          })
          console.log(`✅ Lesson deducted for assignment from ${submission.studentId}. New lessonsTaken: ${updated.lessonsTaken}`)
        } else {
          console.log(`⚠️ No lessons available for ${submission.studentId}. Available: ${activeSubscription.lessonsAvailable}, Taken: ${activeSubscription.lessonsTaken}`)
        }
      } else {
        console.log(`❌ No active subscription found for student ${submission.studentId}`)
      }
    }

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error('Error grading submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
