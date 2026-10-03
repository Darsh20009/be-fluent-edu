import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers';
import { PLACEMENT_BANDS } from '@/lib/placement-bands';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const { id } = await params;
    const data = await req.json();
    const band = data.band || (data.level ? `${data.level}.1` : null);
    const testType = data.testType || 'PLACEMENT';
    if (testType === 'PLACEMENT' && (!band || !PLACEMENT_BANDS.includes(band))) {
      return NextResponse.json({ error: 'Choose a valid CEFR placement band.' }, { status: 400 });
    }
    const question = await prisma.placementQuestion.update({
      where: { id },
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
        band,
        testType,
        category: data.category || null
      }
    });
    return NextResponse.json(question);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const { id } = await params;
    await prisma.placementQuestion.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
