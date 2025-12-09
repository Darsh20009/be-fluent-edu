import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function seedData() {
  console.log('Starting data seeding...')
  
  const password = await bcrypt.hash('admin123', 10)
  
  // Create sample words for existing students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' }
  })
  
  const sampleWords = [
    { english: 'hello', arabic: 'مرحبا', example: 'Hello, how are you?' },
    { english: 'book', arabic: 'كتاب', example: 'I am reading a book.' },
    { english: 'school', arabic: 'مدرسة', example: 'I go to school every day.' },
    { english: 'teacher', arabic: 'معلم', example: 'The teacher is very kind.' },
    { english: 'student', arabic: 'طالب', example: 'She is a good student.' },
    { english: 'water', arabic: 'ماء', example: 'I drink water.' },
    { english: 'food', arabic: 'طعام', example: 'The food is delicious.' },
    { english: 'house', arabic: 'بيت', example: 'This is my house.' },
    { english: 'car', arabic: 'سيارة', example: 'He drives a car.' },
    { english: 'friend', arabic: 'صديق', example: 'She is my best friend.' },
    { english: 'family', arabic: 'عائلة', example: 'I love my family.' },
    { english: 'time', arabic: 'وقت', example: 'What time is it?' },
    { english: 'day', arabic: 'يوم', example: 'Have a nice day!' },
    { english: 'night', arabic: 'ليل', example: 'Good night, sleep well.' },
    { english: 'morning', arabic: 'صباح', example: 'Good morning everyone!' },
  ]
  
  for (const student of students) {
    console.log(`Adding words for student: ${student.name}`)
    
    for (let i = 0; i < sampleWords.length; i++) {
      const word = sampleWords[i]
      const known = i < 5 // First 5 words are marked as known
      
      await prisma.word.create({
        data: {
          id: `word_${student.id}_${i}_${Date.now()}`,
          studentId: student.id,
          englishWord: word.english,
          arabicMeaning: word.arabic,
          exampleSentence: word.example,
          known,
          reviewCount: known ? Math.floor(Math.random() * 5) + 1 : 0
        }
      })
    }
  }
  
  // Create sample packages
  const packages = [
    {
      id: `pkg_${Date.now()}_1`,
      title: 'Basic English',
      titleAr: 'الإنجليزية الأساسية',
      description: 'Learn the basics of English language',
      descriptionAr: 'تعلم أساسيات اللغة الإنجليزية',
      price: 500,
      lessonsCount: 12,
      durationDays: 30
    },
    {
      id: `pkg_${Date.now()}_2`,
      title: 'Intermediate English',
      titleAr: 'الإنجليزية المتوسطة',
      description: 'Improve your English skills',
      descriptionAr: 'حسن مهاراتك في اللغة الإنجليزية',
      price: 800,
      lessonsCount: 20,
      durationDays: 60
    },
    {
      id: `pkg_${Date.now()}_3`,
      title: 'Advanced English',
      titleAr: 'الإنجليزية المتقدمة',
      description: 'Master advanced English',
      descriptionAr: 'أتقن اللغة الإنجليزية المتقدمة',
      price: 1200,
      lessonsCount: 30,
      durationDays: 90
    }
  ]
  
  for (const pkg of packages) {
    await prisma.package.create({ data: pkg })
  }
  
  console.log('✅ Data seeding completed!')
  console.log(`- Added ${sampleWords.length} words per student`)
  console.log(`- Created ${packages.length} packages`)
}

seedData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
