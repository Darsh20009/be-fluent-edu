import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { normalizePhone } from '@/lib/validation'
import { hashPlacementTicket } from '@/lib/placement-ticket'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { persistSavedStudentGoals } from '@/lib/phase9/pipeline'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  password: z.string().min(6),
  phone: z.string().min(10).optional(),
  age: z.number().min(5).max(100),
  nationality: z.string().trim().min(2).max(100),
  gender: z.enum(['FEMALE', 'MALE', 'PREFER_NOT_TO_SAY']),
  goal: z.string().min(1),
  preferredTime: z.string().min(1),
  packageId: z.string().min(1),
  receiptUrl: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone number is required',
  path: ['email'],
})

export async function POST(request: Request) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    const normalizedPhone = validatedData.phone
      ? normalizePhone(validatedData.phone)
      : undefined

    if (validatedData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists / هذا البريد الإلكتروني مسجل بالفعل' },
          { status: 400 }
        )
      }
    }

    if (validatedData.phone) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: {
          OR: [
            { normalizedPhone },
            { phone: normalizedPhone },
            { phone: validatedData.phone },
          ],
        },
      })

      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'User with this phone number already exists / رقم الهاتف هذا مسجل بالفعل' },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const uniqueEmail =
      validatedData.email?.trim().toLowerCase() ||
      `${normalizedPhone?.replace(/\D/g, '')}@phone.befluent.com`
    const placementAccessToken = randomBytes(32).toString('base64url')

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: validatedData.name,
          email: uniqueEmail,
          passwordHash: hashedPassword,
          phone: normalizedPhone || null,
          normalizedPhone: normalizedPhone || null,
          role: 'STUDENT',
          isActive: false,
          status: 'PENDING',
          StudentProfile: {
            create: {
              age: validatedData.age,
              nationality: validatedData.nationality,
              gender: validatedData.gender,
              goal: validatedData.goal,
              preferredTime: validatedData.preferredTime,
              packageId: validatedData.packageId,
              receiptUrl: validatedData.receiptUrl || null,
            },
          },
          Subscription: {
            create: {
              packageId: validatedData.packageId,
              status: 'PENDING',
              receiptUrl: validatedData.receiptUrl || null,
              paymentMethod: 'E_WALLET',
              paid: false,
            },
          },
        },
        include: {
          StudentProfile: true,
        },
      })
      await persistSavedStudentGoals(tx, created.id)
      await tx.placementTestTicket.create({
        data: {
          userId: created.id,
          tokenHash: hashPlacementTicket(placementAccessToken),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
      return created
    })

    // Send Welcome Email
    if (validatedData.email) {
      try {
        const { sendEmail, getWelcomeEmailTemplate } = await import('@/lib/email')
        await sendEmail({
          to: validatedData.email,
          subject: 'مرحباً بك في Be Fluent Academy! / Welcome to Be Fluent Academy!',
          html: getWelcomeEmailTemplate(validatedData.name)
        })
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr)
      }
    }

    const response = NextResponse.json({
      message: 'Registration successful. Your account is pending activation.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    })
    response.cookies.set('bf-placement-ticket', placementAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api',
      maxAge: 24 * 60 * 60,
    })
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('❌ Registration error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack:', error.stack)
    }
    return NextResponse.json(
      { 
        error: 'Registration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
