import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers';
import { PLACEMENT_BANDS } from '@/lib/placement-bands';

export async function GET(request: Request) {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('testType') || 'PLACEMENT';

    const questions = await prisma.placementQuestion.findMany({
      where: { testType },
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const body = await request.json();
    const {
      question, questionAr, questionType = 'MCQ',
      options, correctAnswer, mediaUrl, explanation,
      points = 1, level, band, testType = 'PLACEMENT', category, order = 0
    } = body;

    if (testType === 'PLACEMENT' && !PLACEMENT_BANDS.includes(band)) {
      return NextResponse.json({ error: 'Choose a valid CEFR placement band.' }, { status: 400 });
    }
    const count = await prisma.placementQuestion.count({ where: { testType } });

    const q = await prisma.placementQuestion.create({
      data: {
        question,
        questionAr: questionAr || null,
        questionType,
        options: options ? JSON.stringify(options) : null,
        correctAnswer: correctAnswer || null,
        mediaUrl: mediaUrl || null,
        explanation: explanation || null,
        points,
        order: order || count,
        level: level || (typeof band === 'string' ? band.split('.')[0] : 'A1'),
        band: band || null,
        testType,
        category: category || null
      }
    });
    return NextResponse.json(q);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
