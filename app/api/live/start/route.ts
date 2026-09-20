import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNextResponse, requireTeacher } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  try {
    const session = await requireTeacher();
    if (isNextResponse(session)) return session;
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId or teacherId' }, { status: 400 });
    }

    const existing = await prisma.liveSession.findFirst({ where: { sessionId } });

    let liveSession;
    if (existing) {
      liveSession = await prisma.liveSession.update({
        where: { id: existing.id },
        data: { teacherId: session.teacherProfileId, status: 'live', startedAt: new Date() }
      });
    } else {
      liveSession = await prisma.liveSession.create({
        data: { sessionId, teacherId: session.teacherProfileId, status: 'live', startedAt: new Date() }
      });
    }

    return NextResponse.json(liveSession);
  } catch (error) {
    console.error('Error starting live session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
