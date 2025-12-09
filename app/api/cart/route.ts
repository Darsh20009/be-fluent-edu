import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent, parseJsonBody, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireStudent()
    if (isNextResponse(user)) return user

    let cart = await prisma.cart.findUnique({
      where: { studentId: user.userId },
      include: {
        CartItem: {
          include: {
            Package: true
          }
        }
      }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          studentId: user.userId
        },
        include: {
          CartItem: {
            include: {
              Package: true
            }
          }
        }
      })
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireStudent()
    if (isNextResponse(user)) return user

    const body = await parseJsonBody<{ packageId: string }>(request)
    if (isNextResponse(body)) return body

    const { packageId } = body

    const pkg = await prisma.package.findUnique({
      where: { id: packageId }
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (!pkg.isActive) {
      return NextResponse.json({ error: 'Package is not active' }, { status: 400 })
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
      return NextResponse.json({ error: 'You already have an active subscription for this package' }, { status: 400 })
    }

    let cart = await prisma.cart.findUnique({
      where: { studentId: user.userId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          studentId: user.userId
        }
      })
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_packageId: {
          cartId: cart.id,
          packageId: packageId
        }
      }
    })

    if (existingCartItem) {
      return NextResponse.json({ error: 'Package already in cart' }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        packageId: packageId
      },
      include: {
        Package: true
      }
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireStudent()
    if (isNextResponse(user)) return user

    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 })
    }

    const cart = await prisma.cart.findUnique({
      where: { studentId: user.userId }
    })

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    await prisma.cartItem.delete({
      where: {
        cartId_packageId: {
          cartId: cart.id,
          packageId: packageId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
