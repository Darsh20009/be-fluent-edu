import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { studentId, level, issuerName } = await req.json()

    if (!studentId || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        level,
        issuerName: issuerName || session.user.name,
        isManual: true,
        adminId: session.user.id
      },
      include: {
        User: true
      }
    })

    // Generate PDF for attachment
    let pdfBase64 = '';
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 800, 20, 'F'); doc.rect(0, 580, 800, 20, 'F');
      doc.rect(0, 0, 20, 600, 'F'); doc.rect(780, 0, 20, 600, 'F');
      doc.setTextColor(6, 78, 59); doc.setFontSize(40);
      doc.text('Certificate of Completion', 400, 100, { align: 'center' });
      doc.setTextColor(0, 0, 0); doc.setFontSize(35);
      doc.text(certificate.User.name, 400, 250, { align: 'center' });
      doc.setTextColor(16, 185, 129); doc.setFontSize(30);
      doc.text(level, 400, 370, { align: 'center' });
      pdfBase64 = doc.output('datauristring').split(',')[1];
    } catch (pdfErr) {
      console.error('Failed to generate PDF for email:', pdfErr);
    }

    // Send notification email
    try {
      const { sendEmail, getCertificateEmailTemplate } = await import('@/lib/email')
      await sendEmail({
        to: certificate.User.email,
        subject: `شهادة جديدة من Be Fluent - ${level}`,
        html: getCertificateEmailTemplate(certificate.User.name, level),
        attachments: pdfBase64 ? [{
          filename: `certificate-${level}.pdf`,
          fileblob: pdfBase64,
          content_type: 'application/pdf'
        }] : undefined
      })
    } catch (emailError) {
      console.error('Failed to send certificate email:', emailError)
    }

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
  }
}
