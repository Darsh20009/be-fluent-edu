import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    const learningPath = settings?.learningPath ? JSON.parse(settings.learningPath) : [];
    return NextResponse.json(learningPath);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch learning path' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const pathData = await req.json();
    const settings = await prisma.siteSettings.findFirst();

    const updateData = {
      learningPath: JSON.stringify(pathData)
    };

    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      await prisma.siteSettings.create({ data: updateData });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update learning path' }, { status: 500 });
  }
}
