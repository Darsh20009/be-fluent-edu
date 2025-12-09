
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('test123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      id: `user_test_${Date.now()}`,
      email: 'test@test.com',
      name: 'Test User',
      phone: '1234567890',
      passwordHash: hashedPassword,
      role: 'STUDENT',
      isActive: true,
    },
  })

  console.log('✅ Test user created successfully!')
  console.log('Email: test@test.com')
  console.log('Password: test123')
  console.log('User ID:', user.id)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
