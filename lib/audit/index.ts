import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'LOGIN'
  | 'OTP_REQUEST'
  | 'OTP_VERIFICATION'
  | 'AUTH_OTP_REQUESTED'
  | 'AUTH_OTP_SENT'
  | 'AUTH_OTP_VERIFIED'
  | 'AUTH_OTP_FAILED'
  | 'AUTH_OTP_EXPIRED'
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_SESSION_REVOKED'
  | 'AUTH_ROLE_CHANGED'
  | 'AUTH_ACCOUNT_SUSPENDED'
  | 'AUTH_ACCOUNT_REACTIVATED'
  | 'ROLE_CHANGE'
  | 'SUBSCRIPTION_CHANGE'
  | 'LEVEL_CHANGE'
  | 'GROUP_ASSIGNMENT'
  | 'TEACHER_ASSIGNMENT'
  | 'FEEDBACK_CHANGE'
  | 'HOMEWORK_CHANGE'
  | 'QMEET_OPERATION'
  | 'WHATSAPP_OPERATION'
  | 'AI_CONFIGURATION_CHANGE'
  | 'ADMIN_ACTION'

export interface AuditEvent {
  action: AuditAction
  userId?: string
  details?: Record<string, unknown>
}

function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  const blocked = /password|secret|token|code|otp|api.?key|credential/i
  return Object.fromEntries(
    Object.entries(details).filter(([key]) => !blocked.test(key)),
  )
}

export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: event.action,
      userId: event.userId,
      details: event.details ? JSON.stringify(sanitizeDetails(event.details)) : undefined,
    },
  })
}
