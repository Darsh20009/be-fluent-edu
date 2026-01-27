import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Create test accounts
    const hashedAdminPassword = await bcrypt.hash('admin123456', 10)
    const hashedTeacherPassword = await bcrypt.hash('teacher123456', 10)
    const hashedStudentPassword = await bcrypt.hash('student123456', 10)

    // Admin
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@befluent.com' }
    })
    if (!adminExists) {
      await prisma.user.create({
        data: {
          email: 'admin@befluent.com',
          passwordHash: hashedAdminPassword,
          name: 'Admin',
          role: 'ADMIN',
          isActive: true
        }
      })
    }

    // Teacher
    const teacherExists = await prisma.user.findUnique({
      where: { email: 'teacher@befluent.com' }
    })
    if (!teacherExists) {
      const teacher = await prisma.user.create({
        data: {
          email: 'teacher@befluent.com',
          passwordHash: hashedTeacherPassword,
          name: 'Teacher',
          role: 'TEACHER',
          isActive: true
        }
      })
      
      // Create teacher profile
      await prisma.teacherProfile.create({
        data: {
          userId: teacher.id,
          bio: 'Test teacher',
          subjects: 'English'
        }
      })
    }

    // Student
    const studentExists = await prisma.user.findUnique({
      where: { email: 'student@befluent.com' }
    })
    if (!studentExists) {
      const student = await prisma.user.create({
        data: {
          email: 'student@befluent.com',
          passwordHash: hashedStudentPassword,
          name: 'Student',
          role: 'STUDENT',
          isActive: true
        }
      })
      
      // Create student profile
      await prisma.studentProfile.create({
        data: {
          userId: student.id,
          levelInitial: 'A1',
          levelCurrent: 'A1',
          targetLevel: 'B2'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test accounts created successfully',
      accounts: [
        { email: 'admin@befluent.com', password: 'admin123456', role: 'ADMIN' },
        { email: 'teacher@befluent.com', password: 'teacher123456', role: 'TEACHER' },
        { email: 'student@befluent.com', password: 'student123456', role: 'STUDENT' }
      ]
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
