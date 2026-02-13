import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { title, titleAr, questions } = await req.json();
    
    const test = await prisma.test.create({
      data: {
        title,
        titleAr,
        questions: {
          create: questions.map((q: any, index: number) => ({
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
    const tests = await prisma.test.findMany({
      include: { questions: true }
    });
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}
