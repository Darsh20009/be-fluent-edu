import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صحيح' }, { status: 400 })
    }

    const adminEmail = process.env.SMTP2GO_FROM_EMAIL || 'noreply@befluent-edu.online'
    const supportEmail = 'support@befluent-edu.online'

    const html = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://befluent-edu.online/logo.png" alt="Be Fluent" style="max-width: 120px; height: auto;" />
        </div>
        <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px;">رسالة جديدة من نموذج التواصل</h2>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px; font-weight: bold; color: #374151; width: 30%;">الاسم:</td><td style="padding: 8px; color: #6b7280;">${name}</td></tr>
          <tr style="background:#f9fafb;"><td style="padding: 8px; font-weight: bold; color: #374151;">البريد الإلكتروني:</td><td style="padding: 8px; color: #6b7280;">${email}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; color: #374151;">الموضوع:</td><td style="padding: 8px; color: #6b7280;">${subject}</td></tr>
        </table>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-right: 4px solid #10B981;">
          <p style="font-weight: bold; color: #374151; margin: 0 0 8px 0;">الرسالة:</p>
          <p style="color: #6b7280; margin: 0; white-space: pre-wrap; line-height: 1.8;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        <div style="margin-top: 20px; padding: 12px; background: #ecfdf5; border-radius: 8px;">
          <p style="color: #065f46; font-size: 13px; margin: 0;">
            <strong>للرد:</strong> أرسل بريداً إلكترونياً إلى <a href="mailto:${email}" style="color: #10B981;">${email}</a>
          </p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #eee; padding-top: 12px;">Be Fluent Academy - نموذج التواصل</p>
      </div>
    `

    const result = await sendEmail({
      to: supportEmail,
      subject: `[تواصل] ${subject} - من ${name}`,
      html
    })

    if (result.success) {
      const confirmHtml = `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://befluent-edu.online/logo.png" alt="Be Fluent" style="max-width: 120px; height: auto;" />
          </div>
          <h2 style="color: #10B981;">شكراً لتواصلك معنا، ${name}!</h2>
          <p style="color: #6b7280; line-height: 1.8;">لقد استلمنا رسالتك بخصوص "<strong>${subject}</strong>" وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن خلال 24-48 ساعة.</p>
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://befluent-edu.online" style="background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">زيارة الموقع</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #eee; padding-top: 12px;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
        </div>
      `

      await sendEmail({
        to: email,
        subject: 'شكراً لتواصلك مع Be Fluent Academy',
        html: confirmHtml
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'فشل إرسال الرسالة، يرجى المحاولة مرة أخرى' }, { status: 500 })
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
  }
}
