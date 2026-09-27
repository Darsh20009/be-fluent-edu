import { NextResponse } from 'next/server'
import { isNextResponse, requireAnyPermission } from '@/lib/auth-helpers'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { adminIntelligenceOverview } from '@/lib/phase9/staff-service'

export async function GET() {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAnyPermission(['admin.viewLearningIntelligence', 'manager.viewLearningIntelligence'])
  if (isNextResponse(access)) return access
  return NextResponse.json(await adminIntelligenceOverview())
}