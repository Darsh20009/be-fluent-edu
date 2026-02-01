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

    // Generate PDF for attachment with improved design
    let pdfBase64 = '';
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
      
      // 1. Background & Gold-ish Border
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 800, 600, 'F');
      
      // Main Frame
      doc.setDrawColor(16, 185, 129); // Be Fluent Green
      doc.setLineWidth(2);
      doc.rect(20, 20, 760, 560, 'D');
      
      // Decorative Corner Accents
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(4);
      // Top Left
      doc.line(20, 20, 60, 20); doc.line(20, 20, 20, 60);
      // Top Right
      doc.line(740, 20, 780, 20); doc.line(780, 20, 780, 60);
      // Bottom Left
      doc.line(20, 540, 20, 580); doc.line(20, 580, 60, 580);
      // Bottom Right
      doc.line(780, 540, 780, 580); doc.line(740, 580, 780, 580);

      // 2. Central Watermark Seal
      doc.setGState(new (doc as any).GState({opacity: 0.03}));
      doc.setFillColor(16, 185, 129);
      doc.circle(400, 300, 150, 'F');
      doc.setGState(new (doc as any).GState({opacity: 1}));

      // 3. Header
      doc.setTextColor(31, 41, 55);
      doc.setFont('times', 'bold');
      doc.setFontSize(50);
      doc.text('BE FLUENT ACADEMY', 400, 90, { align: 'center' });
      
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('PREMIUM ENGLISH LEARNING PLATFORM', 400, 120, { align: 'center' });

      // 4. Main Title
      doc.setTextColor(17, 24, 39);
      doc.setFont('times', 'italic');
      doc.setFontSize(38);
      doc.text('Certificate of Achievement', 400, 190, { align: 'center' });

      // 5. Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(18);
      doc.setTextColor(75, 85, 99);
      doc.text('This distinguished award is presented to', 400, 240, { align: 'center' });

      doc.setFont('times', 'bold');
      doc.setFontSize(48);
      doc.setTextColor(16, 185, 129);
      doc.text(certificate.User.name.toUpperCase(), 400, 310, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(18);
      doc.setTextColor(75, 85, 99);
      doc.text('for demonstrating excellence and mastering the requirements of', 400, 360, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(31, 41, 55);
      doc.text(`ENGLISH PROFICIENCY LEVEL: ${level}`, 400, 410, { align: 'center' });

      // 6. Footer
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(1);
      doc.line(100, 510, 300, 510);
      doc.line(500, 510, 700, 510);

      doc.setFontSize(14);
      doc.setTextColor(107, 114, 128);
      doc.text('Date of Excellence', 200, 530, { align: 'center' });
      doc.text('Academic Director', 600, 530, { align: 'center' });

      const dateStr = new Date(certificate.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
      doc.setTextColor(16, 185, 129);
      doc.text(dateStr, 200, 550, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text(`Official Verification ID: ${certificate.id}`, 400, 570, { align: 'center' });

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
