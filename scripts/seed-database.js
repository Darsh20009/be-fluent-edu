const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات الوهمية...\n');

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'admin@befluent.com' },
    data: { passwordHash: adminPassword }
  });
  console.log('✅ تم تحديث كلمة مرور المدير إلى: admin123\n');

  const teacherPassword = await bcrypt.hash('teacher123', 10);
  
  let teacher = await prisma.user.findUnique({
    where: { email: 'teacher@befluent.com' }
  });
  
  if (teacher) {
    teacher = await prisma.user.update({
      where: { email: 'teacher@befluent.com' },
      data: { passwordHash: teacherPassword, isActive: true }
    });
  } else {
    teacher = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'teacher@befluent.com',
        name: 'Mr. Ahmed',
        passwordHash: teacherPassword,
        role: 'TEACHER',
        isActive: true,
        phone: '+966501234567'
      }
    });
  }

  const existingTeacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: teacher.id }
  });

  if (existingTeacherProfile) {
    await prisma.teacherProfile.update({
      where: { userId: teacher.id },
      data: { bio: 'خبرة 10 سنوات في تدريس اللغة الإنجليزية' }
    });
  } else {
    await prisma.teacherProfile.create({
      data: {
        id: uuidv4(),
        userId: teacher.id,
        bio: 'خبرة 10 سنوات في تدريس اللغة الإنجليزية',
        subjects: 'English Grammar, Speaking, Writing'
      }
    });
  }
  console.log('✅ تم إنشاء حساب معلم: teacher@befluent.com (كلمة المرور: teacher123)\n');

  const studentPassword = await bcrypt.hash('student123', 10);
  const students = [];
  
  const studentNames = [
    { name: 'محمد أحمد', email: 'student1@test.com', age: 18, level: 'A1' },
    { name: 'فاطمة علي', email: 'student2@test.com', age: 22, level: 'A2' },
    { name: 'عبدالله خالد', email: 'student3@test.com', age: 20, level: 'B1' }
  ];

  for (const studentData of studentNames) {
    let student = await prisma.user.findUnique({
      where: { email: studentData.email }
    });
    
    if (student) {
      student = await prisma.user.update({
        where: { email: studentData.email },
        data: { passwordHash: studentPassword, isActive: true }
      });
    } else {
      student = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: studentData.email,
          name: studentData.name,
          passwordHash: studentPassword,
          role: 'STUDENT',
          isActive: true,
          phone: `+96650${Math.floor(Math.random() * 9000000) + 1000000}`
        }
      });
    }
    
    const existingStudentProfile = await prisma.studentProfile.findUnique({
      where: { userId: student.id }
    });

    if (existingStudentProfile) {
      await prisma.studentProfile.update({
        where: { userId: student.id },
        data: { age: studentData.age, levelCurrent: studentData.level }
      });
    } else {
      await prisma.studentProfile.create({
        data: {
          id: uuidv4(),
          userId: student.id,
          age: studentData.age,
          levelInitial: studentData.level,
          levelCurrent: studentData.level,
          targetLevel: 'C1',
          goal: 'تحسين مهارات المحادثة والكتابة',
          preferredTime: 'مساءً',
          isVerified: true
        }
      });
    }
    
    students.push(student);
  }
  console.log('✅ تم إنشاء 3 حسابات طلاب (كلمة المرور للجميع: student123)\n');

  const words = [
    { en: 'book', ar: 'كتاب', example: 'I read a book every day.' },
    { en: 'teacher', ar: 'معلم', example: 'My teacher is very kind.' },
    { en: 'student', ar: 'طالب', example: 'She is a good student.' },
    { en: 'learn', ar: 'يتعلم', example: 'I want to learn English.' },
    { en: 'speak', ar: 'يتحدث', example: 'Can you speak Arabic?' },
    { en: 'beautiful', ar: 'جميل', example: 'What a beautiful day!' },
    { en: 'important', ar: 'مهم', example: 'This is very important.' },
    { en: 'difficult', ar: 'صعب', example: 'English is not difficult.' }
  ];

  await prisma.word.deleteMany({
    where: {
      studentId: { in: students.map(s => s.id) }
    }
  });

  for (const student of students) {
    for (const word of words) {
      await prisma.word.create({
        data: {
          id: uuidv4(),
          studentId: student.id,
          englishWord: word.en,
          arabicMeaning: word.ar,
          exampleSentence: word.example,
          known: Math.random() > 0.5
        }
      });
    }
  }
  console.log('✅ تم إضافة كلمات تجريبية للطلاب\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 ملخص الحسابات:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💼 المدير: admin@befluent.com / admin123');
  console.log('👨‍🏫 المعلم: teacher@befluent.com / teacher123');
  console.log('👨‍🎓 الطلاب:');
  console.log('  - student1@test.com / student123');
  console.log('  - student2@test.com / student123');
  console.log('  - student3@test.com / student123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
