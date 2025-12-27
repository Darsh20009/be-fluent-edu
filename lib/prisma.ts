import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set!')
} else {
  const dbType = databaseUrl.includes('mongodb') ? 'MongoDB' : 'PostgreSQL'
  console.log(`✅ ${dbType} database configured from DATABASE_URL`)
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
