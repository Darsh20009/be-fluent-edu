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
        sender: 'noreply@befluent-edu.online',
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

const LOGO_URL = 'https://befluent-edu.online/logo.png';

export function getAssignmentEmailTemplate(studentName: string, assignmentTitle: string, dueDate: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${LOGO_URL}" alt="Be Fluent Academy Logo" style="max-width: 150px; height: auto;" />
      </div>
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
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${LOGO_URL}" alt="Be Fluent Academy Logo" style="max-width: 150px; height: auto;" />
      </div>
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
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${LOGO_URL}" alt="Be Fluent Academy Logo" style="max-width: 150px; height: auto;" />
      </div>
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

export function getSubscriptionConfirmationTemplate(studentName: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${LOGO_URL}" alt="Be Fluent Academy Logo" style="max-width: 150px; height: auto;" />
      </div>
      <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px;">تأكيد الاشتراك / Subscription Confirmed</h2>
      <p>مرحباً ${studentName}،</p>
      <p>يسعدنا إبلاغك بأنه تم تأكيد اشتراكك بنجاح في Be Fluent Academy.</p>
      <p>يمكنك الآن الوصول إلى جميع ميزات المنصة والبدء في رحلة تعلمك.</p>
      <div style="margin-top: 20px; text-align: center;">
        <a href="https://befluent.academy/dashboard/student" style="background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">انتقل إلى لوحة التحكم</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; pt: 10px;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `;
}
