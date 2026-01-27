const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 إنشاء حسابات تجريبية...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. حساب المدير
    const admin = await prisma.user.upsert({
      where: { email: 'admin@befluent.com' },
      update: {
        isActive: true,
        passwordHash: hashedPassword,
      },
      create: {
        id: `user_admin_${Date.now()}`,
        name: 'المدير',
        email: 'admin@befluent.com',
        passwordHash: hashedPassword,
        phone: '0500000001',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('✅ تم إنشاء حساب المدير:', admin.email);

    // 2. حساب معلم
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@befluent.com' },
      update: {
        isActive: true,
        passwordHash: hashedPassword,
      },
      create: {
        id: `user_teacher_${Date.now()}`,
        name: 'المعلم',
        email: 'teacher@befluent.com',
        passwordHash: hashedPassword,
        phone: '0500000002',
        role: 'TEACHER',
        isActive: true,
        TeacherProfile: {
          create: {
            id: `profile_teacher_${Date.now()}`,
            bio: 'معلم لغة إنجليزية محترف',
            subjects: 'English Language',
          },
        },
      },
    });
    console.log('✅ تم إنشاء حساب المعلم:', teacher.email);

    // 3. حساب طالب
    const student = await prisma.user.upsert({
      where: { email: 'student@befluent.com' },
      update: {
        isActive: true,
        passwordHash: hashedPassword,
      },
      create: {
        id: `user_student_${Date.now()}`,
        name: 'الطالب',
        email: 'student@befluent.com',
        passwordHash: hashedPassword,
        phone: '0500000003',
        role: 'STUDENT',
        isActive: true,
        StudentProfile: {
          create: {
            id: `profile_student_${Date.now()}`,
            age: 25,
            levelInitial: 'A1',
            levelCurrent: 'A2',
            goal: 'تحسين مهارات المحادثة',
            preferredTime: 'مساءً',
            isVerified: true,
          },
        },
      },
    });
    console.log('✅ تم إنشاء حساب الطالب:', student.email);

    console.log('\n✅ تم إنشاء جميع الحسابات بنجاح!');
    console.log('\n📋 معلومات تسجيل الدخول:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 كلمة المرور لجميع الحسابات: 123456');
    console.log('\n👨‍💼 المدير:');
    console.log('   البريد: admin@befluent.com');
    console.log('\n👨‍🏫 المعلم:');
    console.log('   البريد: teacher@befluent.com');
    console.log('\n👨‍🎓 الطالب:');
    console.log('   البريد: student@befluent.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ خطأ في إنشاء الحسابات:', error);
    if (error.message.includes('protocol')) {
      console.log('\n⚠️  المشكلة: DATABASE_URL غير صحيح');
      console.log('يجب أن يكون بالشكل:');
      console.log('postgresql://username:password@host:5432/database');
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
