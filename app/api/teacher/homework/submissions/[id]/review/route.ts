import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireTeacher, canSession } from '@/lib/auth-helpers'
import { homeworkReviewSchema, nextAggregateHomeworkReviewStatus, phase7DatabaseGuard } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
import { queuePhase7Notifications } from '@/lib/phase7-notifications'
import { recordAuditEvent } from '@/lib/audit'

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
  const blocked=phase7DatabaseGuard();if(blocked)return blocked
  const access=await requireTeacher();if(isNextResponse(access))return access
  if(!canSession(access,'teacher.manageHomework'))return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403})
  const {id}=await params
  const submission=await prisma.homeworkSubmission.findUnique({where:{id},include:{homework:{include:{items:true}},reviews:true}})
  if(!submission || submission.homework.createdById!==access.userId)return NextResponse.json({ok:false,error:{code:'NOT_FOUND',message:'Submission not found'}},{status:404})
  if(submission.reviews.length)return NextResponse.json({ok:false,error:{code:'ALREADY_REVIEWED',message:'Submission already reviewed'}},{status:409})
  const parsed=homeworkReviewSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return validationError(parsed.error)
  const review=await prisma.$transaction(async (tx) => {
    const created = await tx.homeworkReview.create({data:{submissionId:id,teacherId:access.userId,score:parsed.data.score,feedback:parsed.data.feedback,corrections:parsed.data.corrections,nextSteps:parsed.data.nextSteps,completedAt:parsed.data.complete?new Date():undefined}})
    await tx.homeworkSubmission.update({where:{id},data:{status:'REVIEWED'}})
    if (submission.homework.studentId === submission.studentId) {
      const requiredIds = submission.homework.items.filter((item) => item.isRequired).map((item) => item.id)
      const submitted = await tx.homeworkSubmission.findMany({
        where: { homeworkId: submission.homeworkId, studentId: submission.studentId, itemId: { in: requiredIds } },
        select: { itemId: true, reviews: { select: { id: true } } },
      })
      const reviewedIds = new Set(submitted.filter((item) => item.reviews.length > 0).map((item) => item.itemId).filter(Boolean))
      const allRequiredReviewed = requiredIds.length > 0 && requiredIds.every((requiredId) => reviewedIds.has(requiredId))
      const aggregateStatus = nextAggregateHomeworkReviewStatus(submission.homework.status, allRequiredReviewed, parsed.data.complete)
      if (aggregateStatus !== submission.homework.status) {
        await tx.homework.update({where:{id:submission.homeworkId},data:{status:aggregateStatus}})
      }
    }
    await queuePhase7Notifications({event:'homework.reviewed',entityId:id,recipientUserId:submission.studentId,title:'Homework reviewed',body:submission.homework.title}, tx)
    return created
  })
  await recordAuditEvent({action:'HOMEWORK_CHANGE',userId:access.userId,details:{submissionId:id,homeworkId:submission.homeworkId,action:'REVIEWED'}}).catch(()=>undefined)
  return NextResponse.json(review,{status:201})
}