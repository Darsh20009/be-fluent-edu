import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTeacher, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const tests = await prisma.writingTest.findMany({
      where: {
        teacherId: teacher.teacherProfileId
      },
      include: {
        WritingTestSubmission: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching writing tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const body = await request.json()
    const { title, titleAr, instructions, instructionsAr, dueDate } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const test = await prisma.writingTest.create({
      data: {
        teacherId: teacher.teacherProfileId,
        title,
        titleAr: titleAr || null,
        instructions: instructions || null,
        instructionsAr: instructionsAr || null,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Error creating writing test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
