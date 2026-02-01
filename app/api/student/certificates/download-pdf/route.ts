import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jsPDF } from 'jspdf';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('id');

    if (!certificateId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: { User: true }
    });

    if (!certificate) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Generate PDF server-side using jsPDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 600]
    });

    // Simple Professional Layout for PDF
    doc.setFillColor(16, 185, 129); // emerald-600
    doc.rect(0, 0, 800, 20, 'F');
    doc.rect(0, 580, 800, 20, 'F');
    doc.rect(0, 0, 20, 600, 'F');
    doc.rect(780, 0, 20, 600, 'F');

    doc.setTextColor(6, 78, 59); // emerald-900
    doc.setFontSize(40);
    doc.text('Certificate of Completion', 400, 100, { align: 'center' });

    doc.setTextColor(100, 116, 139); // gray-500
    doc.setFontSize(20);
    doc.text('This is to certify that', 400, 180, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(35);
    doc.text(certificate.User.name, 400, 250, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(20);
    doc.text('has successfully completed the level', 400, 310, { align: 'center' });

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(30);
    doc.text(certificate.level, 400, 370, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(15);
    const dateStr = new Date(certificate.createdAt).toLocaleDateString();
    doc.text(`Date: ${dateStr}`, 400, 450, { align: 'center' });
    doc.text(`Certificate ID: ${certificate.id}`, 400, 480, { align: 'center' });

    const pdfBuffer = doc.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificate.id}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF Gen Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
