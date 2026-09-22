import { NextResponse } from 'next/server'
import { z } from 'zod'

export const whatsappAccountStatuses = [
  'DISCONNECTED', 'QR_REQUIRED', 'CONNECTING', 'CONNECTED',
  'RECONNECTING', 'LOGGED_OUT', 'ERROR',
] as const
export const whatsappContactStatuses = ['ACTIVE', 'INACTIVE', 'BLOCKED'] as const
export const whatsappConversationStatuses = ['OPEN', 'CLOSED', 'ARCHIVED'] as const
export const whatsappDirections = ['INBOUND', 'OUTBOUND'] as const
export const whatsappDeliveryStatuses = ['PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED'] as const

export const whatsappAccountSchema = z.object({
  provider: z.literal('BAILEYS').default('BAILEYS'),
  phoneNumber: z.string().trim().min(3).max(40),
})
export const whatsappContactSchema = z.object({
  accountId: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(3).max(40),
  displayName: z.string().trim().max(200).nullable().optional(),
  userId: z.string().trim().min(1).nullable().optional(),
})
export const whatsappMessageSchema = z.object({
  body: z.string().trim().min(1).max(10000),
  idempotencyKey: z.string().trim().min(1).max(200).nullable().optional(),
})
export const whatsappConversationUpdateSchema = z.object({
  status: z.enum(whatsappConversationStatuses).optional(),
  assignedStaffId: z.string().trim().min(1).nullable().optional(),
})

export function phase8WhatsAppDatabaseGuard() {
  if (process.env.PHASE5_DATABASE_ENABLED === 'true') return null
  return NextResponse.json(
    { ok: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'WhatsApp CRM data is temporarily unavailable.' } },
    { status: 503 },
  )
}

export function normalizeWhatsAppPhone(phone: string) {
  const normalized = phone.trim().replace(/[^\d+]/g, '').replace(/^\+/, '')
  return normalized.length >= 7 ? normalized : null
}

export function isGroupChatPhone(phone: string) {
  return phone.endsWith('@g.us') || phone.includes('-')
}

export function nextReconnectState(attempts: number, connected: boolean, loggedOut = false) {
  if (loggedOut) return { status: 'LOGGED_OUT' as const, attempts }
  if (connected) return { status: 'CONNECTED' as const, attempts: 0 }
  if (attempts >= 10) return { status: 'ERROR' as const, attempts }
  return { status: 'RECONNECTING' as const, attempts: attempts + 1 }
}

export function prepareReconnectAlert(attempts: number) {
  return attempts >= 10
    ? { prepared: true, event: 'whatsapp.reconnect.threshold', attempts, delivery: 'EMAIL_PENDING_PROVIDER_REQUIRED' as const }
    : { prepared: false, attempts }
}

export function canManageWhatsApp(role: string, permissions: readonly string[]) {
  return role === 'ADMIN'
    || permissions.includes('admin.manageWhatsApp')
    || permissions.includes('manager.manageWhatsAppCRM')
}

export function retentionCutoff<T extends { createdAt: Date }>(messages: T[], limit = 150) {
  return [...messages].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, limit)
}

export const WHATSAPP_RECONNECT_LIMIT = 10
export const WHATSAPP_MESSAGE_RETENTION = 150