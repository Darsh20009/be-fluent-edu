import { NextRequest, NextResponse } from 'next/server'
import { isNextResponse, requireAnyPermission } from '@/lib/auth-helpers'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { adminRecommendationQuerySchema, adminRecommendations } from '@/lib/phase9/staff-service'
import { validationError } from '@/lib/phase5'

export async function GET(request: NextRequest) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAnyPermission(['admin.viewLearningIntelligence', 'manager.viewLearningIntelligence'])
  if (isNextResponse(access)) return access
  const parsed = adminRecommendationQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()))
  if (!parsed.success) return validationError(parsed.error)
  return NextResponse.json({ items: await adminRecommendations(parsed.data) })
}