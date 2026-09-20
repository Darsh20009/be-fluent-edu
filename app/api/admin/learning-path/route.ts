import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const settings = await prisma.siteSettings.findFirst();
    const learningPath = settings?.learningPath ? JSON.parse(settings.learningPath) : [];
    return NextResponse.json(learningPath);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch learning path' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
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
