import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const settings = await prisma.siteSettings.findFirst();
    return NextResponse.json(settings || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (isNextResponse(session)) return session;
    const data = await req.json();
    const settings = await prisma.siteSettings.findFirst();

    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      await prisma.siteSettings.create({ data });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
