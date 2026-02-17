import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const question = await prisma.placementQuestion.update({
      where: { id: params.id },
      data: {
        question: data.question,
        questionAr: data.questionAr,
        options: JSON.stringify(data.options),
        correctAnswer: data.correctAnswer,
        level: data.level,
        testType: data.testType,
        category: data.category
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
