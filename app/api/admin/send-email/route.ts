import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

const LOGO_URL = 'https://befluent-edu.online/logo.png'

function getDirectEmailTemplate(message: string) {
  return `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${LOGO_URL}" alt="Be Fluent Academy Logo" style="max-width: 150px; height: auto;" />
      </div>
      <div style="padding: 20px 0; line-height: 1.8; white-space: pre-wrap;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <div style="margin-top: 20px; text-align: center;">
        <a href="https://befluent-edu.online" style="background-color: #10B981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">زيارة الموقع</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">Be Fluent Academy - تعليم الإنجليزية بطلاقة</p>
    </div>
  `
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to, subject, message } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const html = getDirectEmailTemplate(message)
    const result = await sendEmail({ to, subject, html })

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to send email', details: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
