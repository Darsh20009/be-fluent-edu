import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin, canSession } from '@/lib/auth-helpers'
import { canTransitionHomework, homeworkTransitionSchema, phase7DatabaseGuard } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
import { queuePhase7Notifications } from '@/lib/phase7-notifications'
import { recordAuditEvent } from '@/lib/audit'
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const blocked=phase7DatabaseGuard();if(blocked)return blocked
  const access=await requireAdmin();if(isNextResponse(access))return access
  if(!canSession(access,'admin.manageHomework'))return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403})
  const {id}=await params
  const item=await prisma.homework.findUnique({where:{id}})
  if(!item)return NextResponse.json({ok:false,error:{code:'NOT_FOUND',message:'Homework not found'}},{status:404})
  const parsed=homeworkTransitionSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return validationError(parsed.error)
  if(!canTransitionHomework(item.status,parsed.data.status))return NextResponse.json({ok:false,error:{code:'INVALID_TRANSITION',message:'Invalid homework lifecycle transition'}},{status:409})
  const recipientIds = parsed.data.status === 'PUBLISHED'
    ? item.studentId
      ? [item.studentId]
      : item.groupId
        ? (await prisma.groupMember.findMany({where:{groupId:item.groupId,status:'ACTIVE'}})).map((member) => member.userId)
        : item.sessionId
          ? (await prisma.sessionParticipant.findMany({where:{sessionId:item.sessionId,status:{not:'CANCELLED'}}})).map((participant) => participant.userId)
          : []
    : []
  const updated=await prisma.$transaction(async (tx) => {
    const homework = await tx.homework.update({where:{id},data:{status:parsed.data.status}})
    for(const recipientUserId of recipientIds)await queuePhase7Notifications({event:'homework.assigned',entityId:id,recipientUserId,title:'Homework assigned',body:item.title}, tx)
    return homework
  })
  await recordAuditEvent({action:'HOMEWORK_CHANGE',userId:access.userId,details:{homeworkId:id,from:item.status,to:updated.status}}).catch(()=>undefined)
  return NextResponse.json(updated)
}