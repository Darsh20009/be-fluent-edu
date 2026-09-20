import { normalizeRole, type Role } from '@/lib/authorization'

export const ACCOUNT_STATUSES = ['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING'] as const
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export function resolveAccountStatus(user: {
  status?: string | null
  isActive?: boolean | null
}): AccountStatus {
  if (user.status === 'SUSPENDED') return 'SUSPENDED'
  if (user.status === 'DISABLED') return 'DISABLED'
  if (user.status === 'PENDING' && !user.isActive) return 'PENDING'

  // Existing Phase 1 users may not have a persisted status yet. Their
  // isActive flag remains the compatibility source until they are migrated.
  return user.isActive === false ? 'PENDING' : 'ACTIVE'
}

export function isAccountUsable(user: {
  status?: string | null
  isActive?: boolean | null
}): boolean {
  return resolveAccountStatus(user) === 'ACTIVE'
}

export function resolveUserRole(role: string | null | undefined): Role | null {
  return normalizeRole(role)
}