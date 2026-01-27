import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        emailOrPhone: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt:', credentials?.emailOrPhone)
        
        if (!credentials?.emailOrPhone || !credentials?.password) {
          console.log('❌ Missing credentials')
          throw new Error('الرجاء إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور')
        }

        const isEmail = credentials.emailOrPhone.includes('@')
        console.log('📧 Is email:', isEmail)
        
        let user;
        try {
          user = await prisma.user.findFirst({
            where: isEmail
              ? { email: credentials.emailOrPhone }
              : { phone: credentials.emailOrPhone },
            include: {
              StudentProfile: true,
              TeacherProfile: true,
            },
          })
          console.log('🔍 User query completed, found:', !!user)
        } catch (dbError) {
          console.error('❌ Database error:', dbError)
          throw new Error('حدث خطأ في الاتصال بقاعدة البيانات')
        }

        if (!user) {
          console.log('❌ User not found:', credentials.emailOrPhone)
          throw new Error('البيانات المدخلة غير صحيحة')
        }

        /* 
        if (!user.isActive) {
          console.log('❌ User account is inactive:', user.email)
          throw new Error('هذا الحساب غير مفعل حالياً. يرجى التواصل مع الإدارة.')
        }
        */

        if (!user.passwordHash) {
          console.log('❌ No password hash for user:', credentials.emailOrPhone)
          throw new Error('البيانات المدخلة غير صحيحة')
        }

        console.log('✅ User found:', user.email, 'Role:', user.role, 'Active:', user.isActive)

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          console.log('❌ Invalid password for:', credentials.emailOrPhone)
          throw new Error('البيانات المدخلة غير صحيحة')
        }

        console.log('✅ Password valid')
        console.log('✅ Login successful for:', user.email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 90 * 24 * 60 * 60, // 90 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
