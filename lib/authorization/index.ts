import type { Permission, Role } from './permissions'
import { normalizeRole, ROLE_PERMISSIONS } from './permissions'

export * from './permissions'

export interface AuthorizationContext {
  userId: string
  role: string
  resourceOwnerId?: string
}

export function hasPermission(
  context: AuthorizationContext,
  permission: Permission,
): boolean {
  const role = normalizeRole(context.role)
  if (!role) return false

  if (
    context.resourceOwnerId &&
    context.resourceOwnerId !== context.userId &&
    role === 'STUDENT' &&
    permission.startsWith('student.')
  ) {
    return false
  }

  return ROLE_PERMISSIONS[role].includes(permission)
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
  return normalizedRole ? ROLE_PERMISSIONS[normalizedRole].includes(permission) : false
}
