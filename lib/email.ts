export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const apiKey = process.env.SMTP2GO_API_KEY;
  
  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        to: [to],
        sender: process.env.SMTP2GO_FROM_EMAIL || 'noreply@befluent.academy',
        subject: subject,
        html_body: html,
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

export function getAssignmentEmailTemplate(studentName: string, assignmentTitle: string, dueDate: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #10B981;">واجب جديد / New Assignment</h2>
      <p>مرحباً ${studentName}،</p>
      <p>لديك واجب جديد بعنوان: <strong>${assignmentTitle}</strong></p>
      <p>تاريخ التسليم: ${dueDate}</p>
      <div style="margin-top: 20px;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">انتقل إلى لوحة التحكم</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `;
}

export function getSessionEmailTemplate(studentName: string, sessionTitle: string, startTime: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #10B981;">موعد حصة جديدة / New Session Scheduled</h2>
      <p>مرحباً ${studentName}،</p>
      <p>تم تحديد موعد حصة جديدة بعنوان: <strong>${sessionTitle}</strong></p>
      <p>الوقت: ${startTime}</p>
      <div style="margin-top: 20px;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">انتقل إلى حصصي</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `;
}

export function getCertificateEmailTemplate(studentName: string, level: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #10B981;">تهانينا! شهادة جديدة / Congratulations! New Certificate</h2>
      <p>مرحباً ${studentName}،</p>
      <p>مبروك! لقد تم إصدار شهادة إتمام المستوى: <strong>${level}</strong> بنجاح.</p>
      <p>يمكنك الآن تحميل الشهادة من لوحة التحكم الخاصة بك.</p>
      <div style="margin-top: 20px;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">تحميل الشهادة</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `;
}

export function getSubscriptionConfirmationTemplate(studentName: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #10B981;">تأكيد الاشتراك / Subscription Confirmed</h2>
      <p>مرحباً ${studentName}،</p>
      <p>يسعدنا إبلاغك بأنه تم تأكيد اشتراكك بنجاح في Be Fluent Academy.</p>
      <p>يمكنك الآن الوصول إلى جميع ميزات المنصة والبدء في رحلة تعلمك.</p>
      <div style="margin-top: 20px;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">انتقل إلى لوحة التحكم</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `;
}
