import { NextResponse } from 'next/server';
import LiveSession from '@/models/LiveSession';
import { dbConnect } from '@/lib/db';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const liveSession = await LiveSession.findOneAndUpdate(
      { sessionId },
      { 
        status: 'finished',
        endedAt: new Date()
      },
      { new: true }
    );

    if (!liveSession) {
      return NextResponse.json({ error: 'Live session not found' }, { status: 404 });
    }

    return NextResponse.json(liveSession);
  } catch (error) {
    console.error('Error ending live session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}