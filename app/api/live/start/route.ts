import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { sessionId, teacherId } = await req.json();

    if (!sessionId || !teacherId) {
      return NextResponse.json({ error: 'Missing sessionId or teacherId' }, { status: 400 });
    }

    const existing = await prisma.liveSession.findFirst({ where: { sessionId } });

    let liveSession;
    if (existing) {
      liveSession = await prisma.liveSession.update({
        where: { id: existing.id },
        data: { teacherId, status: 'live', startedAt: new Date() }
      });
    } else {
      liveSession = await prisma.liveSession.create({
        data: { sessionId, teacherId, status: 'live', startedAt: new Date() }
      });
    }

    return NextResponse.json(liveSession);
  } catch (error) {
    console.error('Error starting live session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
