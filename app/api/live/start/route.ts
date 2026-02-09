import { NextResponse } from 'next/server';
import LiveSession from '@/models/LiveSession';
import { dbConnect } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { sessionId, teacherId } = await req.json();

    if (!sessionId || !teacherId) {
      return NextResponse.json({ error: 'Missing sessionId or teacherId' }, { status: 400 });
    }

    const liveSession = await LiveSession.findOneAndUpdate(
      { sessionId },
      { 
        teacherId,
        status: 'live',
        startedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(liveSession);
  } catch (error) {
    console.error('Error starting live session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}