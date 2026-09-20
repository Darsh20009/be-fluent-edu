import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { NextResponse } from 'next/server'
import {
  can,
  canAll,
  canAny,
  hasPermission,
  normalizeRole,
  type Permission,
} from './authorization'
import { isAccountUsable, resolveAccountStatus } from './auth/status'

export interface AuthSession {
  userId: string
  role: string
  name: string
  email: string
  status: string
  isActive: boolean
  permissions: string[]
}

export interface TeacherSession extends AuthSession {
  teacherProfileId: string
}

async function resolveCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      staffPermissions: { where: { granted: true } },
    },
  })
}

export async function requireSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions)
  const sessionUserId = session?.user?.id
  if (!sessionUserId) return null

  let user
  try {
    user = await resolveCurrentUser(sessionUserId)
  } catch {
    return null
  }

  if (!user || !isAccountUsable(user)) {
    return null
  }

  const role = normalizeRole(user.role)
  if (!role) return null

  return {
    userId: user.id,
    role,
    name: user.name,
    email: user.email,
    status: resolveAccountStatus(user),
    isActive: user.isActive,
    permissions: user.staffPermissions.map((permission) => permission.permission),
  }
}

export async function requireRole(
  allowedRoles: string[],
): Promise<AuthSession | NextResponse> {
  const session = await requireSession()

  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 },
    )
  }

  const normalizedAllowedRoles = allowedRoles
    .map((role) => normalizeRole(role))
    .filter(Boolean)

  if (!normalizedAllowedRoles.includes(normalizeRole(session.role))) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
      { status: 403 },
    )
  }

  return session
}

export async function requirePermission(
  permission: Permission,
  resourceOwnerId?: string,
): Promise<AuthSession | NextResponse> {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 },
    )
  }

  const allowed = hasPermission(
    {
      userId: session.userId,
      role: session.role,
      permissions: session.permissions,
      resourceOwnerId,
    },
    permission,
  )
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
      { status: 403 },
    )
  }
  return session
}

export async function requireAnyPermission(
  permissions: readonly Permission[],
): Promise<AuthSession | NextResponse> {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 },
    )
  }

  if (
    !canAny(
      {
        userId: session.userId,
        role: session.role,
        permissions: session.permissions,
      },
      permissions,
    )
  ) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
      { status: 403 },
    )
  }
  return session
}

export async function requireAllPermissions(
  permissions: readonly Permission[],
): Promise<AuthSession | NextResponse> {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 },
    )
  }

  if (
    !canAll(
      {
        userId: session.userId,
        role: session.role,
        permissions: session.permissions,
      },
      permissions,
    )
  ) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
      { status: 403 },
    )
  }
  return session
}

export async function requireTeacher(): Promise<TeacherSession | NextResponse> {
  const sessionResult = await requireRole(['TEACHER', 'ADMIN'])

  if (sessionResult instanceof NextResponse) {
    return sessionResult
  }

  let teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: sessionResult.userId },
  })

  // Keep the existing admin compatibility behavior without granting staff
  // implicit teacher access.
  if (!teacherProfile && sessionResult.role === 'ADMIN') {
    teacherProfile = await prisma.teacherProfile.create({
      data: {
        userId: sessionResult.userId,
        bio: 'Admin Teacher',
        subjects: 'All Subjects',
      },
    })
  }

  if (!teacherProfile) {
    return NextResponse.json(
      { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Teacher profile not found' } },
      { status: 404 },
    )
  }

  return {
    ...sessionResult,
    teacherProfileId: teacherProfile.id,
  }
}

export async function requireAdmin(): Promise<AuthSession | NextResponse> {
  return await requireRole(['ADMIN'])
}

export async function requireStudent(): Promise<AuthSession | NextResponse> {
  return await requireRole(['STUDENT'])
}

export async function parseJsonBody<T>(request: Request): Promise<T | NextResponse> {
  try {
    const body = await request.json()
    return body as T
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }
}

export function isAuthSession(value: unknown): value is AuthSession {
  return Boolean(value && typeof value === 'object' && 'userId' in value)
}

export function isTeacherSession(value: unknown): value is TeacherSession {
  return isAuthSession(value) && 'teacherProfileId' in value
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}

export function canSession(
  session: AuthSession,
  permission: Permission,
  resourceOwnerId?: string,
) {
  return can(
    {
      userId: session.userId,
      role: session.role,
      permissions: session.permissions,
      resourceOwnerId,
    },
    permission,
  )
}

export async function verifyOwnership(
  resourceId: string,
  resourceType: 'session' | 'assignment',
  teacherId: string,
): Promise<boolean> {
  if (resourceType === 'session') {
    const session = await prisma.session.findUnique({
      where: { id: resourceId },
    })
    return session?.teacherId === teacherId
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: resourceId },
    include: { Session: true },
  })
  return assignment?.Session?.teacherId === teacherId
}