import { prisma } from '../lib/prisma'

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    })
    
    console.log('Users in database:')
    console.log(JSON.stringify(users, null, 2))
    console.log(`\nTotal users found: ${users.length}`)
  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
