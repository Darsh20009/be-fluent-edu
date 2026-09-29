const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function checkLogin() {
  if (process.env.NODE_ENV !== 'development' || process.env.ALLOW_DEV_LOGIN_CHECK !== 'true') {
    console.error('Login check is disabled unless explicitly enabled in Development.');
    process.exitCode = 1;
    return;
  }

  const email = process.env.LOGIN_CHECK_EMAIL;
  const password = process.env.LOGIN_CHECK_PASSWORD;
  if (!email || !password) {
    console.error('Set LOGIN_CHECK_EMAIL and LOGIN_CHECK_PASSWORD in Development to run the login check.');
    process.exitCode = 1;
    return;
  }

  let prisma;
  try {
    prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true, isActive: true },
    });
    const isValid = Boolean(user?.isActive && await bcrypt.compare(password, user.password));
    console.log(isValid ? 'Login check passed.' : 'Login check failed.');
    if (!isValid) process.exitCode = 1;
  } catch {
    console.error('Login check could not be completed; error details were suppressed.');
    process.exitCode = 1;
  } finally {
    if (prisma) {
      await prisma.$disconnect().catch(() => {
        console.error('Login check cleanup failed; error details were suppressed.');
        process.exitCode = 1;
      });
    }
  }
}

checkLogin().catch(() => {
  console.error('Login check could not be completed; error details were suppressed.');
  process.exitCode = 1;
});
