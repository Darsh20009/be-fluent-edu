import { requireAnyPermission, isNextResponse } from '@/lib/auth-helpers'

export async function requireWhatsAppAccess() {
  const access = await requireAnyPermission(['admin.manageWhatsApp', 'manager.manageWhatsAppCRM'])
  if (isNextResponse(access)) return access
  return access
}