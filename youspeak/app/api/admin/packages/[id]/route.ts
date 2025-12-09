import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, parseJsonBody, isNextResponse } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const { id } = await params

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        Subscription: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(pkg)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const { id } = await params

    const body = await parseJsonBody<{
      title?: string
      titleAr?: string
      description?: string
      descriptionAr?: string
      price?: number
      lessonsCount?: number
      durationDays?: number
      isActive?: boolean
    }>(request)
    if (isNextResponse(body)) return body

    const { title, titleAr, description, descriptionAr, price, lessonsCount, durationDays, isActive } = body

    const existingPackage = await prisma.package.findUnique({
      where: { id }
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (price !== undefined && price < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    if (lessonsCount !== undefined && lessonsCount < 1) {
      return NextResponse.json({ error: 'Invalid lessons count' }, { status: 400 })
    }

    if (durationDays !== undefined && durationDays < 1) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (titleAr !== undefined) updateData.titleAr = titleAr
    if (description !== undefined) updateData.description = description
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr
    if (price !== undefined) updateData.price = price
    if (lessonsCount !== undefined) updateData.lessonsCount = lessonsCount
    if (durationDays !== undefined) updateData.durationDays = durationDays
    if (isActive !== undefined) updateData.isActive = isActive
    updateData.updatedAt = new Date()

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedPackage)
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const { id } = await params

    const existingPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        Subscription: true
      }
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    if (existingPackage.Subscription.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete package with active subscriptions' },
        { status: 400 }
      )
    }

    await prisma.package.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
