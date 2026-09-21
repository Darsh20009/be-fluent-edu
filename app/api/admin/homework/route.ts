import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin, canSession } from '@/lib/auth-helpers'
import { phase7DatabaseGuard } from '@/lib/phase7'
export async function GET(){const blocked=phase7DatabaseGuard();if(blocked)return blocked;const access=await requireAdmin();if(isNextResponse(access))return access;if(!canSession(access,'admin.manageHomework'))return NextResponse.json({ok:false,error:{code:'FORBIDDEN',message:'Forbidden'}},{status:403});return NextResponse.json(await prisma.homework.findMany({include:{items:true,submissions:{include:{reviews:true}}},orderBy:{createdAt:'desc'}}))}