import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  password: z.string().min(6),
  phone: z.string().min(10).optional(),
  age: z.number().min(5).max(100),
  goal: z.string().min(1),
  preferredTime: z.string().min(1),
  packageId: z.string().min(1),
  receiptUrl: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone number is required',
  path: ['email'],
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

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
        where: { phone: validatedData.phone },
      })

      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'User with this phone number already exists / رقم الهاتف هذا مسجل بالفعل' },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const uniqueEmail = validatedData.email || `${validatedData.phone}@phone.befluent.com`

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: uniqueEmail,
        passwordHash: hashedPassword,
        phone: validatedData.phone || null,
        role: 'STUDENT',
        isActive: false,
        StudentProfile: {
          create: {
            age: validatedData.age,
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
          }
        }
      },
      include: {
        StudentProfile: true,
      },
    }) as any

    return NextResponse.json({
      message: 'Registration successful. Your account is pending activation.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    })
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
