import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const exercises = await prisma.exercise.findMany({
      where: { lessonId: id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const lesson = await prisma.lesson.findUnique({
      where: { id }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const lastExercise = await prisma.exercise.findFirst({
      where: { lessonId: id },
      orderBy: { order: 'desc' }
    })

    const {
      type,
      question,
      questionAr,
      options,
      correctAnswer,
      explanation,
      explanationAr,
      sentence,
      sentenceAr,
      audioUrl,
      imageUrl,
      dragItems,
      dropZones,
      blanks,
      points,
      order
    } = body

    if (!type || !question || !correctAnswer) {
      return NextResponse.json({ error: 'Type, question, and correctAnswer are required' }, { status: 400 })
    }

    const exercise = await prisma.exercise.create({
      data: {
        lessonId: id,
        type,
        question,
        questionAr,
        options: options ? JSON.stringify(options) : null,
        correctAnswer,
        explanation,
        explanationAr,
        sentence,
        sentenceAr,
        audioUrl,
        imageUrl,
        dragItems: dragItems ? JSON.stringify(dragItems) : null,
        dropZones: dropZones ? JSON.stringify(dropZones) : null,
        blanks: blanks ? JSON.stringify(blanks) : null,
        points: points || 10,
        order: order ?? (lastExercise ? lastExercise.order + 1 : 1)
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    console.error('Error creating exercise:', error)
    return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exerciseId, ...data } = body

    if (!exerciseId) {
      return NextResponse.json({ error: 'Exercise ID is required' }, { status: 400 })
    }

    const exercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.question && { question: data.question }),
        ...(data.questionAr !== undefined && { questionAr: data.questionAr }),
        ...(data.options !== undefined && { options: data.options ? JSON.stringify(data.options) : null }),
        ...(data.correctAnswer && { correctAnswer: data.correctAnswer }),
        ...(data.explanation !== undefined && { explanation: data.explanation }),
        ...(data.explanationAr !== undefined && { explanationAr: data.explanationAr }),
        ...(data.sentence !== undefined && { sentence: data.sentence }),
        ...(data.sentenceAr !== undefined && { sentenceAr: data.sentenceAr }),
        ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.dragItems !== undefined && { dragItems: data.dragItems ? JSON.stringify(data.dragItems) : null }),
        ...(data.dropZones !== undefined && { dropZones: data.dropZones ? JSON.stringify(data.dropZones) : null }),
        ...(data.blanks !== undefined && { blanks: data.blanks ? JSON.stringify(data.blanks) : null }),
        ...(data.points !== undefined && { points: data.points }),
        ...(data.order !== undefined && { order: data.order })
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    console.error('Error updating exercise:', error)
    return NextResponse.json({ error: 'Failed to update exercise' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const exerciseId = searchParams.get('exerciseId')

    if (!exerciseId) {
      return NextResponse.json({ error: 'Exercise ID is required' }, { status: 400 })
    }

    await prisma.exercise.delete({
      where: { id: exerciseId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting exercise:', error)
    return NextResponse.json({ error: 'Failed to delete exercise' }, { status: 500 })
  }
}
