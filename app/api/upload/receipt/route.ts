import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const user = await requireStudent()
    if (isNextResponse(user)) return user

    const formData = await request.formData()
    const subscriptionId = formData.get('subscriptionId') as string
    const file = formData.get('receipt') as File

    if (!subscriptionId || !file) {
      return NextResponse.json({ error: 'Subscription ID and receipt file required' }, { status: 400 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.studentId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (subscription.status !== 'PENDING') {
      return NextResponse.json({ error: 'Subscription is not in pending state' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts')
    await mkdir(uploadsDir, { recursive: true })

    const fileName = `receipt_${subscriptionId}_${Date.now()}.${file.name.split('.').pop()}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    const receiptUrl = `/uploads/receipts/${fileName}`

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        receiptUrl: receiptUrl,
        status: 'UNDER_REVIEW',
        updatedAt: new Date()
      },
      include: {
        Package: true
      }
    })

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error('Error uploading receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
