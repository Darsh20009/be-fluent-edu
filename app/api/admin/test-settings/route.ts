import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('testType') || 'PLACEMENT';

    let settings = await (prisma as any).testSettings.findUnique({ where: { testType } });
    if (!settings) {
      settings = await (prisma as any).testSettings.create({
        data: { testType, questionsCount: 10, timeLimitMins: 30, passScore: 60, shuffleQuestions: true }
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'ASSISTANT'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { testType, questionsCount, timeLimitMins, passScore, shuffleQuestions } = body;

    const settings = await (prisma as any).testSettings.upsert({
      where: { testType },
      update: { questionsCount, timeLimitMins, passScore, shuffleQuestions },
      create: { testType, questionsCount, timeLimitMins, passScore, shuffleQuestions }
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
