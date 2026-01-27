const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkLogin() {
  try {
    const testEmail = 'admin@befluent.com';
    const testPassword = '123456';
    
    console.log('Testing login for:', testEmail);
    console.log('Password being tested:', testPassword);
    console.log('');
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    console.log('   Password hash:', user.password);
    console.log('');
    
    // Test password
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password verification result:', isValid);
    
    if (isValid) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match!');
      
      // Let's try to create a new hash and compare
      console.log('\nTesting hash generation:');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash generated:', newHash);
      const newCheck = await bcrypt.compare(testPassword, newHash);
      console.log('New hash verification:', newCheck);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogin();
