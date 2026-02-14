import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tests = await prisma.test.findMany({
      include: { questions: true },
      orderBy: { level: 'asc' }
    });
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const test = await prisma.test.create({
      data: {
        title: body.title,
        titleAr: body.titleAr,
        level: body.level,
        passingScore: body.passingScore || 50,
      }
    });
    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 });
  }
}
