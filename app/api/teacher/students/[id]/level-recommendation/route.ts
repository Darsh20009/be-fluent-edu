import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { z } from 'zod'
import { recordAuditEvent } from '@/lib/audit'

const recommendationSchema = z.object({
  levelId: z.string().min(1),
  stageId: z.string().min(1).nullable().optional(),
  reason: z.string().trim().max(2000).nullable().optional(),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission('teacher.recommendLevel')
  if (isNextResponse(access)) return access
  const { id: studentId } = await params
  const body = recommendationSchema.parse(await request.json())
  const [student, level, stage] = await Promise.all([
    prisma.user.findFirst({ where: { id: studentId, role: 'STUDENT' }, include: { StudentProfile: true } }),
    prisma.level.findUnique({ where: { id: body.levelId } }),
    body.stageId ? prisma.levelStage.findUnique({ where: { id: body.stageId } }) : null,
  ])
  if (!student || !student.StudentProfile) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Student not found' } }, { status: 404 })
  if (!level?.isActive) return NextResponse.json({ ok: false, error: { code: 'INVALID_LEVEL', message: 'Invalid level' } }, { status: 400 })
  if (body.stageId && (!stage || stage.levelId !== level.id || !stage.isActive)) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_STAGE', message: 'Invalid stage' } }, { status: 400 })
  }
  const recommendation = await prisma.studentLevelRecommendation.create({
    data: {
      teacherId: access.userId,
      studentId,
      studentProfileId: student.StudentProfile.id,
      recommendedLevelId: level.id,
      recommendedStageId: body.stageId ?? null,
      reason: body.reason ?? null,
    },
    include: { recommendedLevel: true, recommendedStage: true },
  })
  await prisma.studentProfile.update({
    where: { userId: studentId },
    data: { recommendedLevelId: level.id, recommendedStageId: body.stageId ?? null },
  })
  await recordAuditEvent({ action: 'LEVEL_RECOMMENDATION', userId: access.userId, details: { studentId, levelId: level.id, stageId: body.stageId ?? null } }).catch(() => undefined)
  return NextResponse.json(recommendation, { status: 201 })
}