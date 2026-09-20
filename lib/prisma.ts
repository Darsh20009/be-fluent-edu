import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const mongoUrl = process.env.MONGODB_URI

if (!mongoUrl) {
  console.error('❌ MONGODB_URI is not set!')
} else {
  console.log('✅ MongoDB configured from MONGODB_URI')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
