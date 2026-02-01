import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ASSISTANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: subscriptionId } = await params

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        Package: true,
        User: true
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.paid) {
      return NextResponse.json({ error: 'Subscription already approved' }, { status: 400 })
    }

    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + subscription.Package.durationDays)

    const defaultTeacher = await prisma.teacherProfile.findFirst({
      where: { User: { isActive: true } },
      orderBy: { createdAt: 'asc' }
    })

    if (!defaultTeacher) {
      return NextResponse.json({ 
        error: 'No active teacher available for assignment. Please activate a teacher first.' 
      }, { status: 400 })
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        paid: true,
        startDate: now,
        endDate: endDate,
        approvedAt: now,
        status: 'APPROVED',
        assignedTeacherId: defaultTeacher.id,
        lessonsAvailable: subscription.Package.lessonsCount,
        lessonsTaken: 0
      }
    })

    await prisma.user.update({
      where: { id: subscription.studentId },
      data: { isActive: true }
    })

    await prisma.auditLog.create({
      data: {
        action: 'Subscription approved',
        userId: session.user.id,
        details: `Approved subscription for ${subscription.User.name} - ${subscription.Package.title} (${subscription.Package.price} SAR) - ${subscription.Package.lessonsCount} lessons`
      }
    })

    // Send Approval Email
    if (subscription.User.email && !subscription.User.email.endsWith('@phone.befluent.com')) {
      try {
        const { sendEmail, getSubscriptionConfirmationTemplate } = await import('@/lib/email')
        await sendEmail({
          to: subscription.User.email,
          subject: 'تأكيد تفعيل الاشتراك / Subscription Activation Confirmed',
          html: getSubscriptionConfirmationTemplate(subscription.User.name)
        })
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr)
      }
    }

    const approvalMessage = `🎉 *مبروك! تم تفعيل اشتراكك!*\n\nعزيزي ${subscription.User.name},\n\nتم تفعيل اشتراكك بنجاح في:\n📦 ${subscription.Package.titleAr}\n💰 ${subscription.Package.price} SAR\n📚 ${subscription.Package.lessonsCount} حصة\n📅 صالح حتى: ${endDate.toLocaleDateString('ar-EG')}\n\nيمكنك الآن:\n✅ الدخول إلى لوحة التحكم\n✅ حجز الحصص\n✅ التواصل مع المعلمين\n\nنتمنى لك تجربة تعليمية ممتعة! 🎓\n\nفريق Be Fluent 🌟`
    
    const phoneNumber = '201091515594'
    const studentPhone = subscription.User.phone
    
    if (studentPhone) {
      console.log('Send WhatsApp message to:', studentPhone)
      console.log('Message:', approvalMessage)
    }

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error('Error approving subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
