import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getMongoDBUri(): string {
  const uri = process.env.MONGODB_URI || ''
  
  if (uri.includes('mongodb.net/') || uri.includes('mongodb://')) {
    const parts = uri.split('mongodb.net/')
    if (parts.length === 2) {
      const afterHost = parts[1]
      const dbName = afterHost.split('?')[0]
      
      if (!dbName || dbName.length === 0) {
        const queryParams = afterHost.includes('?') ? afterHost.substring(afterHost.indexOf('?')) : ''
        return parts[0] + 'mongodb.net/youspeak' + queryParams
      }
    }
  }
  
  return uri
}

const databaseUrl = getMongoDBUri()
if (databaseUrl !== process.env.MONGODB_URI) {
  console.log('✅ MongoDB database name added: youspeak')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
