import { NextRequest, NextResponse } from 'next/server'
import { requireTeacher, isNextResponse } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const { id } = await params
    const { studentId, status } = await request.json()

    if (!studentId || !status) {
      return NextResponse.json({ error: 'Missing studentId or status' }, { status: 400 })
    }

    const session = await prisma.session.findUnique({
      where: { id }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.teacherId !== teacher.teacherProfileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sessionStudent = await prisma.sessionStudent.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: id,
          studentId
        }
      }
    })

    if (!sessionStudent) {
      return NextResponse.json({ error: 'Student not found in session' }, { status: 404 })
    }

    const updateData: any = {}
    let deductLesson = false

    if (status === 'PRESENT') {
      updateData.attended = true
      deductLesson = true
    } else if (status === 'ABSENT') {
      updateData.attended = false
      deductLesson = true
    } else if (status === 'POSTPONED') {
      updateData.attended = null
      deductLesson = false
    }

    // Update attendance
    const updated = await prisma.sessionStudent.update({
      where: {
        sessionId_studentId: {
          sessionId: id,
          studentId
        }
      },
      data: updateData
    })

    // Deduct lesson from subscription if PRESENT or ABSENT
    if (deductLesson) {
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          studentId,
          status: 'APPROVED',
          paid: true,
          lessonsAvailable: { gt: prisma.subscription.fields.lessonsTaken }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      if (activeSubscription) {
        console.log(`📚 Found subscription for ${studentId}:`, {
          id: activeSubscription.id,
          lessonsAvailable: activeSubscription.lessonsAvailable,
          lessonsTaken: activeSubscription.lessonsTaken
        })

        const updatedSubscription = await prisma.subscription.update({
          where: { id: activeSubscription.id },
          data: {
            lessonsTaken: { increment: 1 }
          }
        })
        console.log(`✅ Lesson deducted for ${studentId}. New lessonsTaken: ${updatedSubscription.lessonsTaken}`)
      } else {
        // If no subscription with available lessons found, check if there's ANY approved/paid subscription
        const anySubscription = await prisma.subscription.findFirst({
          where: {
            studentId,
            status: 'APPROVED',
            paid: true
          }
        })
        
        if (!anySubscription) {
          console.log(`❌ No active subscription found for student ${studentId}`)
        } else {
          console.log(`⚠️ No lessons available in the active subscription for ${studentId}.`)
        }
      }
    }

    return NextResponse.json({ success: true, ...updated })
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
