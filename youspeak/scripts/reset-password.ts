import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function resetPasswords() {
  try {
    const password = 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await prisma.user.update({
      where: { email: 'admin@youspeak.com' },
      data: { passwordHash: hashedPassword },
    })
    console.log('✅ Admin password updated: admin123')
    
    await prisma.user.update({
      where: { email: 'teacher@youspeak.com' },
      data: { passwordHash: hashedPassword },
    })
    console.log('✅ Teacher password updated: admin123')
    
    await prisma.user.update({
      where: { email: 'student2@test.com' },
      data: { passwordHash: hashedPassword },
    })
    console.log('✅ Student password updated: admin123')
    
    console.log('\n=== Login Credentials ===')
    console.log('Admin: admin@youspeak.com / admin123')
    console.log('Teacher: teacher@youspeak.com / admin123')
    console.log('Student: student2@test.com / admin123')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPasswords()
