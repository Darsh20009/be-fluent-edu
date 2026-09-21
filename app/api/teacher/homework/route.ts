import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireTeacher, canSession } from '@/lib/auth-helpers'
import { homeworkCreateSchema } from '@/lib/phase7'
import { phase7DatabaseGuard } from '@/lib/phase7'
import { recordAuditEvent } from '@/lib/audit'
import { validationError } from '@/lib/phase5'

export async function GET() {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requireTeacher(); if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageHomework')) return NextResponse.json({ ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403})
  const rows = await prisma.homework.findMany({ where: { createdById: access.userId }, include: { items:true, submissions:{include:{reviews:true}} }, orderBy:{createdAt:'desc'} })
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requireTeacher(); if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageHomework')) return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403})
  const parsed = homeworkCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const data = parsed.data
  if (data.dueAt && data.dueAt <= new Date()) return NextResponse.json({ok:false,error:{code:'INVALID_DUE_DATE',message:'Due date must be in the future'}},{status:400})
  if (data.groupId) {
    const group = await prisma.learningGroup.findUnique({where:{id:data.groupId},include:{members:{where:{status:'ACTIVE'}}}})
    if (!group || group.teacherProfileId !== access.teacherProfileId) return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Group is not assigned to this teacher'}},{status:403})
  }
  if (data.sessionId) {
    const session = await prisma.session.findUnique({where:{id:data.sessionId},include:{participants:true}})
    if (!session || session.teacherId !== access.teacherProfileId) return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Session is not assigned to this teacher'}},{status:403})
  }
  if (data.studentId) {
    const eligible = await prisma.groupMember.findFirst({where:{userId:data.studentId,status:'ACTIVE',group:{teacherProfileId:access.teacherProfileId}}})
    if (!eligible) return NextResponse.json({ok:false,error:{code:'STUDENT_NOT_ELIGIBLE',message:'Student is not assigned to this teacher'}},{status:409})
  }
  const studentId = data.studentId
  const homework = await prisma.homework.create({data:{createdById:access.userId,studentId,groupId:data.groupId,sessionId:data.sessionId,title:data.title,description:data.description,dueAt:data.dueAt,items:{create:data.items}}})
  await recordAuditEvent({action:'HOMEWORK_CHANGE',userId:access.userId,details:{homeworkId:homework.id,action:'CREATED'}}).catch(()=>undefined)
  return NextResponse.json(homework,{status:201})
}
