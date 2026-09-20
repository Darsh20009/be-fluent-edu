import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const { title, titleAr, questions } = await req.json() as {
      title: string
      titleAr?: string
      questions: Array<{
        type?: string
        question: string
        questionAr?: string
        options?: unknown
        correctAnswer: string
        points?: number
      }>
    };
    
    const test = await prisma.test.create({
      data: {
        title,
        titleAr,
        questions: {
          create: questions.map((q, index: number) => ({
            type: q.type || 'MULTIPLE_CHOICE',
            question: q.question,
            questionAr: q.questionAr,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            order: index
          }))
        }
      }
    });

    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const tests = await prisma.test.findMany({
      include: { questions: true }
    });
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}
