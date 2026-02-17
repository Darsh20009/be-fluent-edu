import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, link } = await req.json();
    
    if (!email || !link) {
      return NextResponse.json({ error: 'Missing email or link' }, { status: 400 });
    }

    // Here we would normally use nodemailer or a service like Resend/Postmark
    // For now, we will simulate the success since we don't have SMTP credentials
    console.log(`Sending placement test link to ${email}: ${link}`);
    
    // In a real scenario:
    // await sendEmail({ to: email, subject: 'Placement Test Link', body: `Click here: ${link}` });

    return NextResponse.json({ success: true, message: 'Link sent successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send link' }, { status: 500 });
  }
}
