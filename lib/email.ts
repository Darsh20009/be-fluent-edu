export async function sendEmail({ to, subject, html, attachments }: { to: string, subject: string, html: string, attachments?: Array<{ filename: string, fileblob: string, content_type: string }> }) {
  const apiKey = process.env.SMTP2GO_API_KEY;
  const fromEmail = process.env.SMTP2GO_FROM_EMAIL || 'befluent@qirox.online';
  const fromName = process.env.SMTP2GO_FROM_NAME || 'Be Fluent Academy';
  
  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        to: [to],
        sender: `${fromName} <${fromEmail}>`,
        subject: subject,
        html_body: html,
        attachments: attachments || []
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('SMTP2GO Error:', data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email Sending Error:', error);
    return { success: false, error };
  }
}

const LOGO_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')}/brand/be-fluent-mark-2026.png`
  : 'https://befluent-edu.online/brand/be-fluent-mark-2026.png';

const EMAIL_BRAND_HEADER = `
  <table role="presentation" align="center" style="border-collapse: collapse; margin: 0 auto 20px;">
    <tr>
      <td style="padding-right: 10px; vertical-align: middle;">
        <img src="${LOGO_URL}" alt="" width="44" height="47" style="display: block; width: 44px; height: 47px; object-fit: contain;" />
      </td>
      <td style="vertical-align: middle; color: #24342b; font-family: Arial, sans-serif; font-size: 24px; font-weight: 700; white-space: nowrap;">Be Fluent</td>
    </tr>
  </table>
`;

export function getAssignmentEmailTemplate(studentName: string, assignmentTitle: string, dueDate: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
      ${EMAIL_BRAND_HEADER}
      <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px;">واجب جديد / New Assignment</h2>
      <p>مرحباً ${studentName}،</p>
      <p>لديك واجب جديد بعنوان: <strong>${assignmentTitle}</strong></p>
      <p>تاريخ التسليم: ${dueDate}</p>
      <div style="margin-top: 20px; text-align: center;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">انتقل إلى لوحة التحكم</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; pt: 10px;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `;
}

export function getSessionEmailTemplate(studentName: string, sessionTitle: string, startTime: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
      ${EMAIL_BRAND_HEADER}
      <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px;">موعد حصة جديدة / New Session Scheduled</h2>
      <p>مرحباً ${studentName}،</p>
      <p>تم تحديد موعد حصة جديدة بعنوان: <strong>${sessionTitle}</strong></p>
      <p>الوقت: ${startTime}</p>
      <div style="margin-top: 20px; text-align: center;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">انتقل إلى حصصي</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; pt: 10px;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `;
}

export function getCertificateEmailTemplate(studentName: string, level: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
      ${EMAIL_BRAND_HEADER}
      <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px;">تهانينا! شهادة جديدة / Congratulations! New Certificate</h2>
      <p>مرحباً ${studentName}،</p>
      <p>مبروك! لقد تم إصدار شهادة إتمام المستوى: <strong>${level}</strong> بنجاح.</p>
      <p>يمكنك الآن تحميل الشهادة من لوحة التحكم الخاصة بك.</p>
      <div style="margin-top: 20px; text-align: center;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">تحميل الشهادة</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; pt: 10px;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `;
}

export function getWelcomeEmailTemplate(studentName: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
      ${EMAIL_BRAND_HEADER}
      <h2 style="color: #10B981; font-size: 22px; font-weight: 900; margin: 0 0 8px;">أهلاً بك يا ${studentName}! 🎉</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">يسعدنا انضمامك لعائلة <strong>Be Fluent Academy</strong>. رحلتك نحو الطلاقة بدأت الآن!</p>

      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="font-weight: 700; color: #111827; margin: 0 0 12px;">ما الذي يحدث الآن؟</p>
        <p style="margin: 0 0 8px; color: #374151; font-size: 14px;">✅ <strong>الخطوة ١:</strong> فريقنا يراجع بيانات اشتراكك حالياً</p>
        <p style="margin: 0 0 8px; color: #374151; font-size: 14px;">⏳ <strong>الخطوة ٢:</strong> تفعيل الحساب خلال 24 ساعة</p>
        <p style="margin: 0; color: #374151; font-size: 14px;">🚀 <strong>الخطوة ٣:</strong> تبدأ حصصك الخاصة مع معلمك!</p>
      </div>

      <div style="margin: 24px 0; text-align: center;">
        <a href="https://befluent-edu.online/auth/login" style="background-color: #111827; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 900; font-size: 15px; display: inline-block;">دخول لوحة التحكم</a>
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; text-align: center; margin-top: 20px;">
        <p style="color: #166534; font-weight: 700; margin: 0 0 8px; font-size: 14px;">💬 هل لديك أي سؤال؟ تواصل معنا على واتساب</p>
        <a href="https://api.whatsapp.com/send/?phone=201091515594" style="background-color: #25D366; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">واتساب مباشر</a>
      </div>

      <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 16px; text-align: center;">فريق Be Fluent Academy — befluent-edu.online</p>
    </div>
  `;
}

export function getSubscriptionConfirmationTemplate(studentName: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
      ${EMAIL_BRAND_HEADER}
      <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px;">تأكيد تفعيل الاشتراك / Subscription Confirmed</h2>
      <p>مرحباً ${studentName}،</p>
      <p>يسعدنا إبلاغك بأنه تم تأكيد وتفعيل اشتراكك بنجاح في Be Fluent Academy.</p>
      <p>يمكنك الآن الوصول إلى جميع ميزات المنصة والبدء في رحلة تعلمك.</p>
      <div style="margin-top: 20px; text-align: center;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">انتقل إلى لوحة التحكم</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; pt: 10px;">فريق Be Fluent Academy - تعلم الإنجليزية بطلاقة</p>
    </div>
  `;
}
