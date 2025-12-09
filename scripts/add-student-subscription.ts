import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Checking students without subscriptions...')

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      include: {
        Subscription: true
      }
    })

    console.log(`📊 Found ${students.length} students`)

    const packages = await prisma.package.findMany({
      orderBy: { price: 'asc' },
      take: 1
    })

    if (packages.length === 0) {
      console.log('⚠️ No packages found. Creating a default package...')
      
      const newPackage = await prisma.package.create({
        data: {
          id: uuidv4(),
          title: 'Basic Package',
          titleAr: 'الباقة الأساسية',
          description: 'Basic English learning package',
          descriptionAr: 'باقة تعليم اللغة الإنجليزية الأساسية',
          price: 500,
          lessonsCount: 8,
          durationDays: 30,
          isActive: true
        }
      })
      
      packages.push(newPackage)
      console.log('✅ Created default package')
    }

    const defaultPackage = packages[0]

    for (const student of students) {
      if (student.Subscription.length === 0) {
        console.log(`📝 Creating subscription for ${student.name}...`)
        
        await prisma.subscription.create({
          data: {
            id: uuidv4(),
            studentId: student.id,
            packageId: defaultPackage.id,
            status: 'APPROVED',
            paid: true,
            paymentMethod: 'BANK_TRANSFER',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            approvedAt: new Date()
          }
        })
        
        console.log(`✅ Subscription created for ${student.name}`)
      } else {
        console.log(`ℹ️  ${student.name} already has ${student.Subscription.length} subscription(s)`)
      }
    }

    console.log('✅ Done!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
