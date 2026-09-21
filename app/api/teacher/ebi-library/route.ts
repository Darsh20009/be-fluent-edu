import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireTeacher } from '@/lib/auth-helpers'
import { phase7DatabaseGuard } from '@/lib/phase7'
export async function GET(request: NextRequest) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requireTeacher(); if (isNextResponse(access)) return access
  const q = request.nextUrl.searchParams.get('q') || undefined
  const items = await prisma.eBILibraryItem.findMany({ where: { status: 'ACTIVE', ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}) }, orderBy: { title: 'asc' } })
  return NextResponse.json({ items })
}