import type { Permission, Role } from './permissions'
import { normalizeRole, ROLE_PERMISSIONS } from './permissions'

export * from './permissions'

export interface AuthorizationContext {
  userId: string
  role: string
  resourceOwnerId?: string
  permissions?: readonly string[]
}

const MANAGER_PERMISSION_ALIASES: Partial<Record<Permission, Permission>> = {
  'admin.manageUsers': 'manager.manageUsers',
  'admin.manageSessions': 'manager.manageSessions',
  'admin.manageFeedback': 'manager.manageFeedback',
  'admin.manageHomework': 'manager.manageHomework',
  'admin.manageSpeakingRooms': 'manager.manageSpeakingRooms',
  'admin.viewLearningIntelligence': 'manager.viewLearningIntelligence',
  'admin.manageLearningIntelligence': 'manager.manageLearningIntelligence',
}

export function hasPermission(
  context: AuthorizationContext,
  permission: Permission,
): boolean {
  const role = normalizeRole(context.role)
  if (!role) return false

  if (role === 'STAFF') {
    return context.permissions?.includes(permission) ?? false
  }

  if (
    context.resourceOwnerId &&
    context.resourceOwnerId !== context.userId &&
    role === 'STUDENT' &&
    permission.startsWith('student.')
  ) {
    return false
  }

  const rolePermissions = ROLE_PERMISSIONS[role]
  if (rolePermissions.includes(permission)) return true

  const managerAlias = role === 'MANAGER' ? MANAGER_PERMISSION_ALIASES[permission] : undefined
  return managerAlias ? rolePermissions.includes(managerAlias) : false
}

export function can(
  context: AuthorizationContext,
  permission: Permission,
): boolean {
  return hasPermission(context, permission)
}

export function canAny(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(context, permission))
}

export function canAll(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(context, permission))
}

export function assertPermission(
  context: AuthorizationContext,
  permission: Permission,
): void {
  if (!hasPermission(context, permission)) {
    throw new Error(`Permission denied: ${permission}`)
  }
}

export function roleHasPermission(
  role: Role | string,
  permission: Permission,
): boolean {
  const normalizedRole = normalizeRole(role)
  if (normalizedRole === 'STAFF') return false
  return normalizedRole ? hasPermission({ userId: '', role: normalizedRole }, permission) : false
}
