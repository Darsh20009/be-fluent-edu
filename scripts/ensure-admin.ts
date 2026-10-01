import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const adminEmail = 'admin@befluent-edu.online'

async function main() {
  if (process.env.NODE_ENV === 'production' || process.env.PHASE5_DATABASE_ENABLED !== 'true') {
    throw new Error('Admin bootstrap is restricted to the enabled Development database.')
  }

  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD
  delete process.env.ADMIN_BOOTSTRAP_PASSWORD
  if (!password || password.length < 16) {
    throw new Error('Set a strong ADMIN_BOOTSTRAP_PASSWORD through Replit Secrets (at least 16 characters).')
  }

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  })
  if (existing) {
    throw new Error('The bootstrap email already exists. No account or password was changed.')
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin Be Fluent',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      status: 'ACTIVE',
      passwordSetupRequired: false,
    },
  })

  console.log(`Development admin account created: ${adminEmail}`)
}

main()
  .catch(() => {
    console.error('Admin bootstrap failed. No password or database credentials were logged.')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })