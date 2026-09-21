import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireStudent, canSession } from '@/lib/auth-helpers'
import { homeworkSubmissionSchema, phase7DatabaseGuard } from '@/lib/phase7'
import { storageProviderStatus } from '@/lib/storage'
import { recordAuditEvent } from '@/lib/audit'
import { Prisma } from '@prisma/client'

export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  const blocked=phase7DatabaseGuard();if(blocked)return blocked
  const access=await requireStudent();if(isNextResponse(access))return access
  if(!canSession(access,'student.viewHomework'))return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403})
  const {id}=await params
  const homework=await prisma.homework.findFirst({where:{id,status:{in:['OPEN','SUBMITTED','REVIEWED','COMPLETED']},OR:[{studentId:access.userId},{group:{members:{some:{userId:access.userId,status:'ACTIVE'}}}},{session:{participants:{some:{userId:access.userId,status:{not:'CANCELLED'}}}}}]},include:{items:true,submissions:{where:{studentId:access.userId},include:{reviews:true}}}})
  if(!homework)return NextResponse.json({ok:false,error:{code:'NOT_FOUND',message:'Homework not found'}},{status:404})
  const showReview=request.nextUrl.searchParams.get('includeReview')==='true'
  if(!showReview) homework.submissions.forEach(s=>s.reviews=[])
  return NextResponse.json(homework)
}

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  const blocked=phase7DatabaseGuard();if(blocked)return blocked
  const access=await requireStudent();if(isNextResponse(access))return access
  if(!canSession(access,'student.submitHomework'))return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403})
  const {id}=await params
  const homework=await prisma.homework.findFirst({where:{id,status:{in:['OPEN','SUBMITTED']},OR:[{studentId:access.userId},{group:{members:{some:{userId:access.userId,status:'ACTIVE'}}}},{session:{participants:{some:{userId:access.userId,status:{not:'CANCELLED'}}}}}]},include:{items:true}})
  if(!homework)return NextResponse.json({ok:false,error:{code:'NOT_FOUND',message:'Open homework not found'}},{status:404})
  const parsed=homeworkSubmissionSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({ok:false,error:{code:'VALIDATION_ERROR',message:'Invalid submission',details:parsed.error.flatten()}},{status:400})
  const data=parsed.data
  const item=homework.items.find(x=>x.id===data.itemId)
  if(!item)return NextResponse.json({ok:false,error:{code:'ITEM_NOT_FOUND',message:'Homework item not found'}},{status:404})
  if(item.itemType!==data.contentType)return NextResponse.json({ok:false,error:{code:'TYPE_MISMATCH',message:'Submission type does not match item'}},{status:409})
  if(['VOICE','VIDEO','FILE'].includes(data.contentType) && !storageProviderStatus().configured)return NextResponse.json({ok:false,error:{code:'PROVIDER_UNAVAILABLE',message:'Storage provider is not configured'}},{status:503})
  if(data.contentType==='LINK' && !/^https:\/\//i.test(data.contentRef??''))return NextResponse.json({ok:false,error:{code:'INVALID_LINK',message:'Links must use HTTPS'}},{status:400})
  try {
    const submission=await prisma.$transaction(async (tx) => {
      const created = await tx.homeworkSubmission.create({data:{homeworkId:id,itemId:data.itemId,studentId:access.userId,attempt:data.attempt,contentType:data.contentType,contentText:data.contentText,contentRef:data.contentRef}})
      if(homework.studentId === access.userId && homework.status==='OPEN') {
        const requiredIds = homework.items.filter((homeworkItem) => homeworkItem.isRequired).map((homeworkItem) => homeworkItem.id)
        const submitted = await tx.homeworkSubmission.findMany({ where: { homeworkId: id, studentId: access.userId, itemId: { in: requiredIds } }, select: { itemId: true } })
        const completedIds = new Set(submitted.map((submittedItem) => submittedItem.itemId).filter(Boolean))
        if (requiredIds.length > 0 && requiredIds.every((requiredId) => completedIds.has(requiredId))) {
          await tx.homework.update({where:{id},data:{status:'SUBMITTED'}})
        }
      }
      return created
    })
    await recordAuditEvent({action:'HOMEWORK_CHANGE',userId:access.userId,details:{homeworkId:id,submissionId:submission.id,action:'SUBMITTED'}}).catch(()=>undefined)
    return NextResponse.json(submission,{status:201})
  } catch (error) {
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')return NextResponse.json({ok:false,error:{code:'DUPLICATE_SUBMISSION',message:'A submission for this attempt already exists'}},{status:409})
    throw error
  }
}