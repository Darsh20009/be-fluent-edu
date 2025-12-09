import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTeacher, isNextResponse } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const { id } = await params

    const test = await prisma.writingTest.findUnique({
      where: { id },
      include: {
        WritingTestSubmission: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Writing test not found' }, { status: 404 })
    }

    if (test.teacherId !== teacher.teacherProfileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error fetching writing test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const { id } = await params
    const body = await request.json()
    const { title, titleAr, instructions, instructionsAr, dueDate } = body

    const test = await prisma.writingTest.findUnique({
      where: { id }
    })

    if (!test) {
      return NextResponse.json({ error: 'Writing test not found' }, { status: 404 })
    }

    if (test.teacherId !== teacher.teacherProfileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedTest = await prisma.writingTest.update({
      where: { id },
      data: {
        title: title || test.title,
        titleAr: titleAr !== undefined ? titleAr : test.titleAr,
        instructions: instructions !== undefined ? instructions : test.instructions,
        instructionsAr: instructionsAr !== undefined ? instructionsAr : test.instructionsAr,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : test.dueDate,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedTest)
  } catch (error) {
    console.error('Error updating writing test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const { id } = await params

    const test = await prisma.writingTest.findUnique({
      where: { id }
    })

    if (!test) {
      return NextResponse.json({ error: 'Writing test not found' }, { status: 404 })
    }

    if (test.teacherId !== teacher.teacherProfileId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.writingTest.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Writing test deleted successfully' })
  } catch (error) {
    console.error('Error deleting writing test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
