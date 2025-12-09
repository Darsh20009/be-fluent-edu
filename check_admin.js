const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    console.log('بيانات المدير:');
    console.log(JSON.stringify(admins, null, 2));
    
    if (admins.length === 0) {
      console.log('\nلا يوجد مدير في قاعدة البيانات. جارٍ البحث عن جميع الأدوار...');
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          role: true
        },
        take: 10
      });
      console.log('المستخدمون الموجودون:');
      console.log(JSON.stringify(allUsers, null, 2));
    }
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
