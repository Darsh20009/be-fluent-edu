import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, parseJsonBody, isNextResponse } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const body = await parseJsonBody<{
      studentId: string
      teacherId: string
    }>(request)
    if (isNextResponse(body)) return body

    const { studentId, teacherId } = body

    if (!studentId || !teacherId) {
      return NextResponse.json({ error: 'Student ID and Teacher ID are required' }, { status: 400 })
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId }
    })

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        studentId: studentId,
        status: 'APPROVED',
        paid: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!subscription) {
      return NextResponse.json({ 
        error: 'Student does not have an active paid subscription' 
      }, { status: 409 })
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        assignedTeacherId: teacherId,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Teacher assigned successfully',
      studentId,
      teacherId,
      subscriptionId: subscription.id
    })
  } catch (error) {
    console.error('Error assigning teacher:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
