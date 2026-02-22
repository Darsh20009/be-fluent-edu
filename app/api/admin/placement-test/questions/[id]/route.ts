import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const question = await prisma.placementQuestion.update({
      where: { id: params.id },
      data: {
        question: data.question,
        questionAr: data.questionAr || null,
        questionType: data.questionType || 'MCQ',
        options: data.options ? JSON.stringify(data.options) : null,
        correctAnswer: data.correctAnswer || null,
        mediaUrl: data.mediaUrl || null,
        explanation: data.explanation || null,
        points: data.points || 1,
        order: data.order ?? 0,
        level: data.level,
        testType: data.testType,
        category: data.category || null
      }
    });
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.placementQuestion.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
