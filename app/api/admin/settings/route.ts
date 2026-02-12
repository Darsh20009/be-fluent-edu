import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          whatsappNumber: '201091515594',
          supportNumber: '201091515594',
          supportEmail: 'support@befluent-edu.online',
          facebookUrl: 'https://facebook.com/befluent',
          instagramUrl: 'https://instagram.com/befluent',
          heroTitle: 'تعلم الإنجليزية بطلاقة مع Be Fluent',
          heroSubtitle: 'منصة تعليم اللغة الإنجليزية الأكثر تطوراً - طلاقتك تبدأ من هنا'
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    let settings = await prisma.siteSettings.findFirst();

    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data
      });
    } else {
      settings = await prisma.siteSettings.create({
        data
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
