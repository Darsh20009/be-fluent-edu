import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@befluent.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@befluent.com',
      name: 'Mister Youssef',
      phone: '+201234567890',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Created admin:', admin.email)

  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@befluent.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'teacher@befluent.com',
      name: 'Sarah Ahmed',
      phone: '+201234567891',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      isActive: true,
    },
  })
  
  await prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
      id: uuidv4(),
      userId: teacher.id,
      bio: 'Experienced English teacher with 5+ years of teaching',
      subjects: 'English Grammar, Conversation, IELTS Preparation',
    },
  })
  console.log('✅ Created teacher:', teacher.email)

  const studentPassword = await bcrypt.hash('student123', 10)
  
  const students = [
    { name: 'Ahmed Ali', email: 'ahmed@student.com', age: 25, level: 'Beginner', isActive: true },
    { name: 'Fatima Hassan', email: 'fatima@student.com', age: 22, level: 'Intermediate', isActive: true },
    { name: 'Omar Mahmoud', email: 'omar@student.com', age: 28, level: 'Advanced', isActive: false },
  ]

  const createdStudents = []
  
  for (const studentData of students) {
    const student = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        id: uuidv4(),
        email: studentData.email,
        name: studentData.name,
        phone: `+20123456${Math.floor(Math.random() * 10000)}`,
        passwordHash: studentPassword,
        role: 'STUDENT',
        isActive: studentData.isActive,
      },
    })
    
    await prisma.studentProfile.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        id: uuidv4(),
        userId: student.id,
        age: studentData.age,
        levelInitial: studentData.level,
        levelCurrent: studentData.level,
        targetLevel: 'Advanced',
        goal: 'Improve English for career advancement',
        preferredTime: 'Evening',
        isVerified: studentData.isActive,
      },
    })
    
    createdStudents.push(student)
    console.log(`✅ Created student: ${student.email}`)
  }

  await prisma.package.deleteMany({})
  
  const packages = [
    {
      id: uuidv4(),
      title: 'Trial',
      titleAr: 'جلسة تجريبية',
      description: '20-minute introductory session',
      descriptionAr: 'جلسة تعريفية 20 دقيقة',
      price: 0,
      lessonsCount: 1,
      durationDays: 7,
    },
    {
      id: uuidv4(),
      title: 'Starter',
      titleAr: 'باقة البداية',
      description: 'Single level - 8 lessons valid for 2 months',
      descriptionAr: 'مستوى واحد - 8 حصص صالحة لمدة شهرين',
      price: 200,
      lessonsCount: 8,
      durationDays: 60,
    },
    {
      id: uuidv4(),
      title: 'Monthly',
      titleAr: 'الباقة الشهرية',
      description: '12 lessons - Great value',
      descriptionAr: '12 حصة - قيمة رائعة',
      price: 360,
      lessonsCount: 12,
      durationDays: 30,
    },
    {
      id: uuidv4(),
      title: 'Quarterly',
      titleAr: 'الباقة الفصلية',
      description: '36 lessons (3 months) - Best value',
      descriptionAr: '36 حصة (3 أشهر) - أفضل قيمة',
      price: 1000,
      lessonsCount: 36,
      durationDays: 90,
    },
  ]

  await prisma.package.createMany({ data: packages })
  console.log('✅ Created 4 packages')

  const sampleWords = [
    { english: 'hello', arabic: 'مرحبا', example: 'Hello, how are you?' },
    { english: 'goodbye', arabic: 'وداعا', example: 'Goodbye, see you later!' },
    { english: 'thank you', arabic: 'شكرا لك', example: 'Thank you for your help.' },
    { english: 'please', arabic: 'من فضلك', example: 'Please come in.' },
    { english: 'sorry', arabic: 'آسف', example: 'I am sorry for being late.' },
    { english: 'yes', arabic: 'نعم', example: 'Yes, I agree with you.' },
    { english: 'no', arabic: 'لا', example: 'No, I do not think so.' },
    { english: 'good morning', arabic: 'صباح الخير', example: 'Good morning everyone!' },
    { english: 'good night', arabic: 'تصبح على خير', example: 'Good night, sleep well.' },
    { english: 'welcome', arabic: 'أهلا وسهلا', example: 'Welcome to our class!' },
    { english: 'understand', arabic: 'أفهم', example: 'I understand the lesson.' },
    { english: 'help', arabic: 'مساعدة', example: 'Can you help me, please?' },
    { english: 'learn', arabic: 'تعلم', example: 'I want to learn English.' },
    { english: 'study', arabic: 'دراسة', example: 'I study every day.' },
    { english: 'practice', arabic: 'تمرين', example: 'Practice makes perfect.' },
    { english: 'improve', arabic: 'تحسين', example: 'I want to improve my skills.' },
    { english: 'speak', arabic: 'تحدث', example: 'I can speak English well.' },
    { english: 'listen', arabic: 'استمع', example: 'Please listen carefully.' },
    { english: 'read', arabic: 'قراءة', example: 'I read books every day.' },
    { english: 'write', arabic: 'كتابة', example: 'I write in my journal.' },
  ]

  for (const student of createdStudents) {
    if (student.isActive) {
      const wordsToAdd = sampleWords.slice(0, Math.floor(Math.random() * 10) + 8)
      
      for (const wordData of wordsToAdd) {
        await prisma.word.create({
          data: {
            id: uuidv4(),
            studentId: student.id,
            englishWord: wordData.english,
            arabicMeaning: wordData.arabic,
            exampleSentence: wordData.example,
            known: Math.random() > 0.6,
          },
        })
      }
      
      console.log(`✅ Added ${wordsToAdd.length} words for ${student.email}`)
    }
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Test Accounts:')
  console.log('Admin: admin@befluent.com / admin123')
  console.log('Teacher: teacher@befluent.com / teacher123')
  console.log('Student 1: ahmed@student.com / student123 (Active)')
  console.log('Student 2: fatima@student.com / student123 (Active)')
  console.log('Student 3: omar@student.com / student123 (Inactive)')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
