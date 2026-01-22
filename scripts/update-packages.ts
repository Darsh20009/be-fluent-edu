import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clear existing packages
  await prisma.package.deleteMany({})

  const packages = [
    // Basic (Group) - اشتراك Basic
    {
      title: 'Basic - 1 Month',
      titleAr: 'اشتراك Basic - شهر',
      price: 1500,
      lessonsCount: 8,
      durationDays: 30,
      description: 'Group Sessions',
      descriptionAr: 'حصص جروب',
    },
    {
      title: 'Basic - 3 Months',
      titleAr: 'اشتراك Basic - 3 شهور',
      price: 3500,
      lessonsCount: 24,
      durationDays: 90,
      description: 'Group Sessions',
      descriptionAr: 'حصص جروب',
    },
    {
      title: 'Basic - 6 Months',
      titleAr: 'اشتراك Basic - 6 شهور',
      price: 6000,
      lessonsCount: 48,
      durationDays: 180,
      description: 'Group Sessions',
      descriptionAr: 'حصص جروب',
    },
    // Gold (Private) - اشتراك Gold
    {
      title: 'Gold - 1 Month',
      titleAr: 'اشتراك Gold - شهر',
      price: 3000,
      lessonsCount: 8,
      durationDays: 30,
      description: 'Private Sessions',
      descriptionAr: 'حصص برايفت',
    },
    {
      title: 'Gold - 3 Months',
      titleAr: 'اشتراك Gold - 3 شهور',
      price: 7500,
      lessonsCount: 24,
      durationDays: 90,
      description: 'Private Sessions',
      descriptionAr: 'حصص برايفت',
    },
    {
      title: 'Gold - 6 Months',
      titleAr: 'اشتراك Gold - 6 شهور',
      price: 12000,
      lessonsCount: 48,
      durationDays: 180,
      description: 'Private Sessions',
      descriptionAr: 'حصص برايفت',
    },
  ]

  for (const pkg of packages) {
    await prisma.package.create({ data: pkg })
  }

  console.log('Packages updated successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
