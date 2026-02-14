import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const question = await prisma.testQuestion.create({
      data: {
        testId: params.id,
        question: body.question,
        questionAr: body.questionAr,
        type: body.type || 'MULTIPLE_CHOICE',
        options: JSON.stringify(body.options),
        correctAnswer: body.correctAnswer,
        points: body.points || 1,
        order: body.order || 0
      }
    });
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
