const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing Admin account...');
  
  const adminEmail = 'admin@befluent-edu.online';
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Upsert the user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      isActive: true,
      passwordHash: adminPassword,
      name: 'Admin Be Fluent'
    },
    create: {
      id: uuidv4(),
      email: adminEmail,
      name: 'Admin Be Fluent',
      phone: '+201091515594',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user ready:', admin.email);

  // Ensure Admin has a TeacherProfile
  await prisma.teacherProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      id: uuidv4(),
      userId: admin.id,
      bio: 'Admin & Head Teacher of Be Fluent Academy',
      subjects: 'General English, Business English, Conversation',
    },
  });

  console.log('✅ Admin TeacherProfile ready');
}

main()
  .catch((e) => {
    console.error('❌ Error fixing admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
