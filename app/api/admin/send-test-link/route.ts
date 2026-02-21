import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, link } = await req.json();
    
    if (!email || !link) {
      return NextResponse.json({ error: 'Missing email or link' }, { status: 400 });
    }

    // Simulate email sending with better logging for development
    console.log(`[EMAIL SIMULATION] Sending placement test link to ${email}`);
    console.log(`[EMAIL SIMULATION] Link: ${link}`);
    console.log(`[EMAIL SIMULATION] Subject: Your Placement Test Link - Be Fluent`);
    
    // In production, use search_integrations to find an email provider (Resend, SendGrid, etc.)
    // For now, we return success to allow the UI to proceed
    return NextResponse.json({ 
      success: true, 
      message: 'تم إرسال الرابط بنجاح (محاكاة)',
      debug: { email, link }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send link' }, { status: 500 });
  }
}
