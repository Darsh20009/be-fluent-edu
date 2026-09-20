import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNextResponse, requireTeacher } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  try {
    const session = await requireTeacher();
    if (isNextResponse(session)) return session;
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const existing = await prisma.liveSession.findFirst({ where: { sessionId } });

    if (!existing) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }

    const liveSession = await prisma.liveSession.update({
      where: { id: existing.id },
      data: { status: 'finished', endedAt: new Date() }
    });

    return NextResponse.json(liveSession);
  } catch (error) {
    console.error('Error ending live session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
