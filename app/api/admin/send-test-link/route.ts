import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email, link, studentName } = await req.json();

    if (!email || !link) {
      return NextResponse.json({ error: 'Missing email or link' }, { status: 400 });
    }

    const name = studentName || 'الطالب الكريم';

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; text-align: right; background: #f9fafb; padding: 40px 20px;">
        <div style="max-width: 580px; margin: auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 32px; text-align: center;">
            <img src="https://befluent-edu.online/logo.png" alt="Be Fluent" style="max-width: 100px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">اختبار تحديد المستوى</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Placement Test - Be Fluent Academy</p>
          </div>

          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #1f2937; line-height: 1.7; margin: 0 0 16px;">مرحباً <strong style="color: #10B981;">${name}</strong>،</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.8; margin: 0 0 24px;">
              تم تحديد موعد اختبار تحديد المستوى الخاص بك في أكاديمية <strong>Be Fluent</strong>.
              هذا الاختبار يساعدنا على معرفة مستواك الحالي ووضعك في المسار التعليمي المناسب.
            </p>

            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
              <p style="margin: 0 0 8px; font-weight: 700; color: #166534; font-size: 14px;">تفاصيل الاختبار:</p>
              <p style="margin: 4px 0; color: #15803d; font-size: 14px;">⏱️ المدة: 15-20 دقيقة تقريباً</p>
              <p style="margin: 4px 0; color: #15803d; font-size: 14px;">📝 النوع: أسئلة اختيارية متعددة</p>
              <p style="margin: 4px 0; color: #15803d; font-size: 14px;">🎯 الهدف: تحديد مستواك الأنسب</p>
            </div>

            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(16,185,129,0.4);">
                ابدأ الاختبار الآن ←
              </a>
            </div>

            <p style="font-size: 13px; color: #9ca3af; margin: 0; text-align: center;">
              إذا لم تتمكن من فتح الرابط، انسخه وضعه في متصفحك:<br/>
              <span style="color: #10B981; word-break: break-all;">${link}</span>
            </p>
          </div>

          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">Be Fluent Academy — Fluency Comes First</p>
          </div>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: `اختبار تحديد المستوى - Be Fluent Academy | ${name}`,
      html
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'تم إرسال الرابط بنجاح' });
    } else {
      console.error('Email send failed:', result.error);
      return NextResponse.json({ error: 'فشل إرسال البريد الإلكتروني. تحقق من إعدادات البريد.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Send test link error:', error);
    return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
