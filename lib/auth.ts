import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { normalizePhone } from './validation'
import { normalizeRole } from './authorization'
import { isAccountUsable, resolveAccountStatus } from './auth/status'
import { verifyOtp, OtpServiceError } from './auth/otp-service'
import { recordAuditEvent } from './audit'

function publicUser(user: {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  status: string
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: normalizeRole(user.role) || 'STUDENT',
    isActive: user.isActive,
    status: resolveAccountStatus(user),
  }
}

function isEmail(value: string) {
  return value.includes('@')
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        emailOrPhone: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const identity = String(credentials?.emailOrPhone || '').trim()
        const password = String(credentials?.password || '')
        if (!identity || !password) {
          throw new Error('Invalid authentication credentials')
        }

        const user = await prisma.user.findFirst({
          where: isEmail(identity)
            ? { email: identity.toLowerCase() }
            : {
                OR: [
                  { normalizedPhone: normalizePhone(identity) },
                  { phone: normalizePhone(identity) },
                ],
              },
        })

        if (!user || !user.passwordHash || !isAccountUsable(user)) {
          void recordAuditEvent({ action: 'AUTH_LOGIN_FAILED' }).catch(() => undefined)
          throw new Error('Invalid authentication credentials')
        }

        const passwordIsValid = await bcrypt.compare(password, user.passwordHash)
        if (!passwordIsValid) {
          void recordAuditEvent({ action: 'AUTH_LOGIN_FAILED', userId: user.id }).catch(
            () => undefined,
          )
          throw new Error('Invalid authentication credentials')
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastSeenAt: new Date() },
        })
        void recordAuditEvent({ action: 'AUTH_LOGIN_SUCCESS', userId: user.id }).catch(
          () => undefined,
        )
        return publicUser(user)
      },
    }),
    CredentialsProvider({
      id: 'otp',
      name: 'otp',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        email: { label: 'Email', type: 'email' },
        code: { label: 'Verification code', type: 'text' },
        intent: { label: 'Intent', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        const intent = credentials?.intent === 'REGISTER' ? 'REGISTER' : 'LOGIN'
        try {
          const user = await verifyOtp({
            phone: credentials?.phone || undefined,
            email: credentials?.email || undefined,
            code: String(credentials?.code || ''),
            intent,
          })
          return publicUser(user)
        } catch (error) {
          if (error instanceof OtpServiceError) {
            throw new Error('Invalid verification code')
          }
          throw error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 15 * 60,
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
        token.status = user.status
      }

      if (token.id) {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        })
        if (!currentUser || !isAccountUsable(currentUser)) {
          token.revoked = true
          token.isActive = false
          token.status = currentUser ? resolveAccountStatus(currentUser) : 'DISABLED'
        } else {
          token.revoked = false
          token.role = normalizeRole(currentUser.role) || 'STUDENT'
          token.isActive = currentUser.isActive
          token.status = resolveAccountStatus(currentUser)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || 'STUDENT'
        session.user.isActive = token.isActive !== false
        session.user.status = (token.status as string) || 'ACTIVE'
        session.user.revoked = token.revoked === true
      }
      return session
    },
  },
  events: {
    async signOut(message) {
      const userId =
        'token' in message && message.token?.id ? String(message.token.id) : undefined
      void recordAuditEvent({ action: 'AUTH_LOGOUT', userId }).catch(() => undefined)
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
}