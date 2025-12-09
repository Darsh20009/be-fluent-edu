import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent, parseJsonBody, isNextResponse } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const user = await requireStudent()
    if (isNextResponse(user)) return user

    const body = await parseJsonBody<{
      packageId: string
      paymentMethod: 'BANK_TRANSFER' | 'E_WALLET'
      eWalletProvider?: 'INSTAPAY' | 'ETISALAT_CASH'
    }>(request)
    if (isNextResponse(body)) return body

    const { packageId, paymentMethod, eWalletProvider } = body

    if (paymentMethod === 'E_WALLET' && !eWalletProvider) {
      return NextResponse.json({ error: 'E-wallet provider required' }, { status: 400 })
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId }
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        studentId: user.userId,
        packageId: packageId,
        status: {
          in: ['PENDING', 'UNDER_REVIEW', 'APPROVED']
        }
      }
    })

    if (existingSubscription) {
      return NextResponse.json({ error: 'You already have a pending or active subscription for this package' }, { status: 400 })
    }

    const subscription = await prisma.subscription.create({
      data: {
        studentId: user.userId,
        packageId: packageId,
        status: 'PENDING',
        paymentMethod: paymentMethod,
        eWalletProvider: eWalletProvider
      },
      include: {
        Package: true
      }
    })

    const cart = await prisma.cart.findUnique({
      where: { studentId: user.userId }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          packageId: packageId
        }
      })
    }

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
