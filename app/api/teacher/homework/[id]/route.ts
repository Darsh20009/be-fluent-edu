import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireTeacher, canSession } from '@/lib/auth-helpers'
import { canTransitionHomework, homeworkTransitionSchema, phase7DatabaseGuard } from '@/lib/phase7'
import { recordAuditEvent } from '@/lib/audit'
import { validationError } from '@/lib/phase5'
import { queuePhase7Notifications } from '@/lib/phase7-notifications'

export async function PATCH(request: NextRequest,{params}:{params:Promise<{id:string}>}) {
  const blocked=phase7DatabaseGuard(); if(blocked)return blocked
  const access=await requireTeacher(); if(isNextResponse(access))return access
  if(!canSession(access,'teacher.manageHomework'))return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403})
  const {id}=await params; const homework=await prisma.homework.findUnique({where:{id},include:{items:true}})
  if(!homework || homework.createdById!==access.userId)return NextResponse.json({ok:false,error:{code:'NOT_FOUND',message:'Homework not found'}},{status:404})
  const parsed=homeworkTransitionSchema.safeParse(await request.json().catch(()=>null)); if(!parsed.success)return validationError(parsed.error)
  if(!canTransitionHomework(homework.status,parsed.data.status))return NextResponse.json({ok:false,error:{code:'INVALID_TRANSITION',message:'Invalid homework lifecycle transition'}},{status:409})
  const recipientIds = parsed.data.status === 'PUBLISHED'
    ? homework.studentId
      ? [homework.studentId]
      : homework.groupId
        ? (await prisma.groupMember.findMany({where:{groupId:homework.groupId,status:'ACTIVE'}})).map((item) => item.userId)
        : homework.sessionId
          ? (await prisma.sessionParticipant.findMany({where:{sessionId:homework.sessionId,status:{not:'CANCELLED'}}})).map((item) => item.userId)
          : []
    : []
  const updated=await prisma.$transaction(async (tx) => {
    const item = await tx.homework.update({where:{id},data:{status:parsed.data.status}})
    for(const recipientUserId of recipientIds) await queuePhase7Notifications({event:'homework.assigned',entityId:id,recipientUserId,title:'Homework assigned',body:homework.title}, tx)
    return item
  })
  await recordAuditEvent({action:'HOMEWORK_CHANGE',userId:access.userId,details:{homeworkId:id,from:homework.status,to:updated.status}}).catch(()=>undefined)
  return NextResponse.json(updated)
}