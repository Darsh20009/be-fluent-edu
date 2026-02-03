import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@befluent-edu.online'
  const password = 'admin_password_2025' // You should change this after first login
  const hashedPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true
    },
    create: {
      email,
      name: 'Admin Be Fluent',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log(`✅ Admin user ensured: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
