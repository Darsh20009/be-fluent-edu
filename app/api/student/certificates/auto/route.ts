import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { level } = await req.json()

    // Find the lesson for this level
    const lesson = await prisma.lesson.findFirst({
      where: { level }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 })
    }

    // Check progress
    const progress = await prisma.lessonProgress.findFirst({
      where: {
        studentId: session.user.id,
        lessonId: lesson.id,
        completed: true
      }
    })

    if (!progress) {
      return NextResponse.json({ error: 'Level not completed' }, { status: 400 })
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: {
        studentId: session.user.id,
        level: level
      }
    })

    if (existingCert) {
      return NextResponse.json({ certificate: existingCert })
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        studentId: session.user.id,
        level,
        isManual: false,
        issuerName: 'Be Fluent System'
      }
    })

    // Generate PDF for attachment with improved design
    let pdfBase64 = '';
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
      
      // 1. Background & Border
      doc.setFillColor(249, 250, 251); // Soft white background
      doc.rect(0, 0, 800, 600, 'F');
      
      // Double Border
      doc.setDrawColor(16, 185, 129); // Primary Green
      doc.setLineWidth(15);
      doc.rect(10, 10, 780, 580, 'D');
      doc.setLineWidth(2);
      doc.rect(30, 30, 740, 540, 'D');

      // 2. Watermark Background Text
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(60);
      doc.setGState(new (doc as any).GState({opacity: 0.05}));
      for(let i=0; i<5; i++) {
        doc.text('BE FLUENT ACADEMY', 400, 100 + (i*100), { align: 'center', angle: -20 });
      }
      doc.setGState(new (doc as any).GState({opacity: 1}));

      // 3. Header
      doc.setTextColor(6, 78, 59);
      doc.setFont('times', 'bold');
      doc.setFontSize(45);
      doc.text('CERTIFICATE OF COMPLETION', 400, 100, { align: 'center' });
      
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(3);
      doc.line(300, 115, 500, 115);

      // 4. Content
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(22);
      doc.setTextColor(107, 114, 128);
      doc.text('This is to certify that', 400, 180, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(42);
      doc.setTextColor(31, 41, 55);
      doc.text((session.user.name as string).toUpperCase(), 400, 250, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(20);
      doc.setTextColor(107, 114, 128);
      doc.text('has successfully completed the requirements for', 400, 310, { align: 'center' });

      // Level Badge Box
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.roundedRect(250, 340, 300, 50, 25, 25, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.setTextColor(5, 150, 105);
      doc.text(`Level: ${level}`, 400, 375, { align: 'center' });

      // 5. Footer Details
      doc.setFontSize(14);
      doc.setTextColor(156, 163, 175);
      const dateStr = new Date(certificate.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });
      doc.text(`Date of Issue: ${dateStr}`, 100, 500);
      doc.text(`Certificate ID: ${certificate.id}`, 100, 520);
      doc.text('ISO 9001:2015 CERTIFIED', 700, 520, { align: 'right' });

      // 6. Signatures
      doc.setDrawColor(156, 163, 175);
      doc.setLineWidth(1);
      doc.line(550, 480, 700, 480);
      doc.setTextColor(31, 41, 55);
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      doc.text('Academic Director', 625, 500, { align: 'center' });

      pdfBase64 = doc.output('datauristring').split(',')[1];
    } catch (pdfErr) {
      console.error('Failed to generate PDF for email:', pdfErr);
    }

    // Send notification email
    try {
      const { sendEmail, getCertificateEmailTemplate } = await import('@/lib/email')
      await sendEmail({
        to: session.user.email as string,
        subject: `تهانينا! شهادة إتمام المستوى ${level}`,
        html: getCertificateEmailTemplate(session.user.name as string, level),
        attachments: pdfBase64 ? [{
          filename: `certificate-${level}.pdf`,
          fileblob: pdfBase64,
          content_type: 'application/pdf'
        }] : undefined
      })
    } catch (emailError) {
      console.error('Failed to send auto certificate email:', emailError)
    }

    return NextResponse.json({ certificate })
  } catch (error) {
    console.error('Error in automatic certification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
