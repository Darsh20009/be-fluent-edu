import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checkedAt = new Date().toISOString()

  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      {
        application: 'healthy',
        database: 'not_configured',
        environment: process.env.NODE_ENV || 'development',
        checkedAt,
      },
      { status: 503 },
    )
  }

  try {
    await prisma.$runCommandRaw({ ping: 1 })
    return NextResponse.json({
      application: 'healthy',
      database: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      checkedAt,
    })
  } catch {
    return NextResponse.json(
      {
        application: 'healthy',
        database: 'unavailable',
        environment: process.env.NODE_ENV || 'development',
        checkedAt,
      },
      { status: 503 },
    )
  }
}