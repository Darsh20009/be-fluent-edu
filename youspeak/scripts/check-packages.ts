
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPackages() {
  try {
    const packages = await prisma.package.findMany()
    
    console.log('Total packages:', packages.length)
    console.log('\n=== Packages Data ===')
    
    packages.forEach((pkg, index) => {
      console.log(`\nPackage ${index + 1}:`)
      console.log('  ID:', pkg.id)
      console.log('  Title:', pkg.title)
      console.log('  TitleAr:', pkg.titleAr)
      console.log('  Price:', pkg.price)
      console.log('  Lessons:', pkg.lessonsCount)
      console.log('  Duration:', pkg.durationDays)
      console.log('  Active:', pkg.isActive)
      console.log('  Has all required fields:', !!(pkg.id && pkg.title && pkg.titleAr && pkg.price !== null))
    })
    
    const invalidPackages = packages.filter(pkg => 
      !pkg.id || !pkg.title || !pkg.titleAr || pkg.price === null
    )
    
    if (invalidPackages.length > 0) {
      console.log('\n⚠️ Invalid packages found:', invalidPackages.length)
      invalidPackages.forEach(pkg => {
        console.log('  Invalid package ID:', pkg.id)
      })
    } else {
      console.log('\n✓ All packages are valid')
    }
    
  } catch (error) {
    console.error('Error checking packages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPackages()
