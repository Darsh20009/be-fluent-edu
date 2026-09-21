import { NextResponse } from 'next/server'
import { qmeetProviderStatus } from '@/lib/phase6'
import { phase6DatabaseGuard } from '@/lib/phase6'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'

export async function GET() {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  return NextResponse.json(qmeetProviderStatus())
}