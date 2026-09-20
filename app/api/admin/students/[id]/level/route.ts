import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAnyPermission } from '@/lib/auth-helpers'
import { z } from 'zod'
import { recordAuditEvent } from '@/lib/audit'

const levelSchema = z.object({ levelId: z.string().min(1), stageId: z.string().min(1).nullable().optional() })

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAnyPermission(['admin.changeStudentLevel', 'staff.changeStudentLevel'])
  if (isNextResponse(access)) return access
  const { id } = await params
  const body = levelSchema.parse(await request.json())
  const [student, level, stage] = await Promise.all([
    prisma.user.findFirst({ where: { id, role: 'STUDENT' }, include: { StudentProfile: true } }),
    prisma.level.findUnique({ where: { id: body.levelId } }),
    body.stageId ? prisma.levelStage.findUnique({ where: { id: body.stageId } }) : null,
  ])
  if (!student || !student.StudentProfile) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Student profile not found' } }, { status: 404 })
  if (!level || !level.isActive) return NextResponse.json({ ok: false, error: { code: 'INVALID_LEVEL', message: 'Invalid level' } }, { status: 400 })
  if (body.stageId && (!stage || stage.levelId !== level.id || !stage.isActive)) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_STAGE', message: 'Stage does not belong to the selected level' } }, { status: 400 })
  }
  const profile = await prisma.studentProfile.update({
    where: { userId: id },
    data: { officialLevelId: level.id, officialStageId: body.stageId ?? null, levelCurrent: level.code },
    include: { officialLevel: true, officialStage: true },
  })
  await prisma.studentLearningProfile.upsert({
    where: { userId: id },
    create: { userId: id, studentProfileId: profile.id, officialLevelId: level.id, officialStageId: body.stageId ?? null },
    update: { officialLevelId: level.id, officialStageId: body.stageId ?? null },
  })
  await recordAuditEvent({ action: 'LEVEL_CHANGE', userId: access.userId, details: { studentId: id, levelId: level.id, stageId: body.stageId ?? null } }).catch(() => undefined)
  return NextResponse.json(profile)
}