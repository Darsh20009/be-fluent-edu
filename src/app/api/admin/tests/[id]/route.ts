import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { order: 'asc' } } }
    });
    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const test = await prisma.test.update({
      where: { id: params.id },
      data: {
        title: body.title,
        titleAr: body.titleAr,
        level: body.level,
        passingScore: body.passingScore,
        isPublished: body.isPublished
      }
    });
    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.test.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 });
  }
}
