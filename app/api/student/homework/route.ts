import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireStudent, canSession } from '@/lib/auth-helpers'
import { phase7DatabaseGuard } from '@/lib/phase7'

export async function GET() {
  const blocked=phase7DatabaseGuard(); if(blocked)return blocked
  const access=await requireStudent(); if(isNextResponse(access))return access
  if(!canSession(access,'student.viewHomework'))return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403})
  const rows=await prisma.homework.findMany({where:{OR:[{studentId:access.userId},{group:{members:{some:{userId:access.userId,status:'ACTIVE'}}}},{session:{participants:{some:{userId:access.userId,status:{not:'CANCELLED'}}}}}],status:{in:['OPEN','SUBMITTED','REVIEWED','COMPLETED']}},include:{items:true,submissions:{where:{studentId:access.userId},include:{reviews:true}}},orderBy:{dueAt:'asc'}})
  return NextResponse.json(rows)
}