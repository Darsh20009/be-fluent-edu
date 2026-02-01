import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'
import { addXP, updateStreak, XP_REWARDS } from '@/lib/gamification'

export async function POST(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const formData = await request.formData()
    const testId = formData.get('testId') as string
    const content = formData.get('content') as string
    const manuscript = formData.get('manuscript') as File | null

    if (!testId || !content) {
      return NextResponse.json({ error: 'Test ID and content are required' }, { status: 400 })
    }

    let manuscriptUrl = null

    if (manuscript) {
      // For now, create a simple data URL or reference
      try {
        const bytes = await manuscript.arrayBuffer()
        // Store as base64 for now - can be improved with actual file storage
        manuscriptUrl = `data:${manuscript.type};base64,${Buffer.from(bytes).toString('base64')}`
      } catch (error) {
        console.error('Error processing manuscript:', error)
      }
    }

    const test = await prisma.writingTest.findUnique({
      where: { id: testId },
      include: {
        TeacherProfile: {
          include: {
            AssignedSubscriptions: {
              where: {
                studentId: student.userId,
                status: 'APPROVED',
                paid: true
              }
            }
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Writing test not found' }, { status: 404 })
    }

    // Allow submission if it's an admin test OR if student is enrolled with the teacher
    if (test.teacherId !== 'admin' && (!test.TeacherProfile || !test.TeacherProfile.AssignedSubscriptions.length)) {
      return NextResponse.json({ error: 'You are not enrolled with this teacher' }, { status: 403 })
    }

    const existingSubmission = await prisma.writingTestSubmission.findFirst({
      where: {
        testId,
        studentId: student.userId
      }
    })

    if (existingSubmission) {
      const updated = await prisma.writingTestSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          manuscriptUrl: manuscriptUrl || existingSubmission.manuscriptUrl,
          submittedAt: new Date(),
          updatedAt: new Date()
        }
      })
      return NextResponse.json(updated, { status: 200 })
    }

    const submission = await prisma.writingTestSubmission.create({
      data: {
        id: `wsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testId,
        studentId: student.userId,
        content,
        manuscriptUrl
      }
    })

    await addXP(student.userId, XP_REWARDS.WRITING_SUBMITTED, 'تقديم كتابة', 'writing')
    await updateStreak(student.userId)

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error submitting writing test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
