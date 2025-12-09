import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, parseJsonBody, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const packages = await prisma.package.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const body = await parseJsonBody<{
      title: string
      titleAr: string
      description?: string
      descriptionAr?: string
      price: number
      lessonsCount: number
      durationDays: number
      isActive?: boolean
    }>(request)
    if (isNextResponse(body)) return body

    const { title, titleAr, description, descriptionAr, price, lessonsCount, durationDays, isActive } = body

    if (!title || !titleAr || price === undefined || !lessonsCount || !durationDays) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (price < 0 || lessonsCount < 1 || durationDays < 1) {
      return NextResponse.json({ error: 'Invalid values' }, { status: 400 })
    }

    const newPackage = await prisma.package.create({
      data: {
        id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        titleAr,
        description: description || null,
        descriptionAr: descriptionAr || null,
        price,
        lessonsCount,
        durationDays,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
