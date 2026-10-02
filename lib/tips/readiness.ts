import { qiroxEmailProviderStatus } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export interface TipsReadiness {
  databaseGateEnabled: boolean
  databaseConfigured: boolean
  databasePingHealthy: boolean | null
  qmeetBasePresent: boolean
  qmeetKeyPresent: boolean
  thanarahKeyPresent: boolean
  emailConfigured: boolean
}

/**
 * Return presence/readiness only. Never serialize environment values or provider
 * errors to the browser. QMeet/Thanarah/email status means configuration only,
 * not a live provider connection check.
 */
export async function getTipsReadiness(): Promise<TipsReadiness> {
  const databaseConfigured = Boolean(process.env.MONGODB_URI)
  let databasePingHealthy: boolean | null = null
  if (databaseConfigured) {
    try {
      await prisma.$runCommandRaw({ ping: 1 })
      databasePingHealthy = true
    } catch {
      databasePingHealthy = false
    }
  }
  const emailStatus = qiroxEmailProviderStatus()
  return {
    databaseGateEnabled: process.env.PHASE5_DATABASE_ENABLED === 'true',
    databaseConfigured,
    databasePingHealthy,
    qmeetBasePresent: Boolean(process.env.QMEET_API_BASE_URL),
    qmeetKeyPresent: Boolean(process.env.QMEET_API_KEY),
    thanarahKeyPresent: Boolean(process.env.THANARAH_API_KEY),
    emailConfigured: emailStatus.configured,
  }
}