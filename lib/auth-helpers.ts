import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { NextResponse } from 'next/server'

export interface AuthSession {
  userId: string
  role: string
  name: string
  email: string
}

export interface TeacherSession extends AuthSession {
  teacherProfileId: string
}

export async function requireSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return null
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email
  }
}

export async function requireRole(allowedRoles: string[]): Promise<AuthSession | NextResponse> {
  const session = await requireSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return session
}

export async function requireTeacher(): Promise<TeacherSession | NextResponse> {
  const sessionResult = await requireRole(['TEACHER', 'ADMIN'])
  
  if (sessionResult instanceof NextResponse) {
    return sessionResult
  }

  let teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: sessionResult.userId }
  })

  // Auto-create teacher profile for ADMIN if it doesn't exist
  if (!teacherProfile && sessionResult.role === 'ADMIN') {
    teacherProfile = await prisma.teacherProfile.create({
      data: {
        userId: sessionResult.userId,
        bio: 'Admin Teacher',
        subjects: 'All Subjects'
      }
    })
  }

  if (!teacherProfile) {
    return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
  }

  return {
    ...sessionResult,
    teacherProfileId: teacherProfile.id
  }
}

export async function requireAdmin(): Promise<AuthSession | NextResponse> {
  return await requireRole(['ADMIN', 'ASSISTANT'])
}

export async function requireStudent(): Promise<AuthSession | NextResponse> {
  return await requireRole(['STUDENT'])
}

export async function parseJsonBody<T>(request: Request): Promise<T | NextResponse> {
  try {
    const body = await request.json()
    return body as T
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
}

export function isAuthSession(value: any): value is AuthSession {
  return value && typeof value === 'object' && 'userId' in value
}

export function isTeacherSession(value: any): value is TeacherSession {
  return isAuthSession(value) && 'teacherProfileId' in value
}

export function isNextResponse(value: any): value is NextResponse {
  return value instanceof NextResponse
}

export async function verifyOwnership(
  resourceId: string,
  resourceType: 'session' | 'assignment',
  teacherId: string
): Promise<boolean> {
  if (resourceType === 'session') {
    const session = await prisma.session.findUnique({
      where: { id: resourceId }
    })
    return session?.teacherId === teacherId
  }

  if (resourceType === 'assignment') {
    const assignment = await prisma.assignment.findUnique({
      where: { id: resourceId },
      include: { Session: true }
    })
    return assignment?.Session?.teacherId === teacherId
  }

  return false
}
