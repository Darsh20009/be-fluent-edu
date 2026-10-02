import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { recordAuditEvent } from '@/lib/audit'

const knowledgeSchema = z.object({
  content: z.string().max(20000),
})

const GLOBAL_KNOWLEDGE_ID = 'admin-assistant'

export async function GET() {
  const access = await requirePermission('admin.manageSystem')
  if (isNextResponse(access)) return access
  if (access.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  try {
    const entry = await prisma.adminAssistantKnowledgeBase.findUnique({
      where: { id: GLOBAL_KNOWLEDGE_ID },
      select: { content: true, updatedAt: true },
    })
    return NextResponse.json({ content: entry?.content || '', updatedAt: entry?.updatedAt || null })
  } catch (error) {
    console.error('Assistant knowledge could not be loaded:', error)
    return NextResponse.json({ ok: false, error: { code: 'KNOWLEDGE_UNAVAILABLE' } }, { status: 503 })
  }
}

export async function PUT(request: NextRequest) {
  const access = await requirePermission('admin.manageSystem')
  if (isNextResponse(access)) return access
  if (access.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const input = await request.json().catch(() => null)
  const parsed = knowledgeSchema.safeParse(input)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_KNOWLEDGE' } }, { status: 400 })
  }

  try {
    const entry = await prisma.adminAssistantKnowledgeBase.upsert({
      where: { id: GLOBAL_KNOWLEDGE_ID },
      create: {
        id: GLOBAL_KNOWLEDGE_ID,
        content: parsed.data.content,
        updatedById: access.userId,
      },
      update: {
        content: parsed.data.content,
        updatedById: access.userId,
      },
      select: { content: true, updatedAt: true },
    })
    await recordAuditEvent({
      action: 'AI_CONFIGURATION_CHANGE',
      userId: access.userId,
      details: { feature: 'ADMIN_ASSISTANT_KNOWLEDGE', contentLength: entry.content.length },
    }).catch((error) => console.error('Assistant knowledge audit event failed:', error))
    return NextResponse.json({ ok: true, content: entry.content, updatedAt: entry.updatedAt })
  } catch (error) {
    console.error('Assistant knowledge could not be saved:', error)
    return NextResponse.json({ ok: false, error: { code: 'KNOWLEDGE_SAVE_FAILED' } }, { status: 503 })
  }
}