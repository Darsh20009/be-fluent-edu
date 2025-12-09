import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserGamification, initializeDefaultBadges } from '@/lib/gamification'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await initializeDefaultBadges()
    
    const gamification = await getOrCreateUserGamification(session.user.id)
    
    const allBadges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
    
    const earnedBadgeIds = gamification.userBadges.map((ub: { badgeId: string }) => ub.badgeId)
    
    const badgesWithStatus = allBadges.map(badge => {
      const earned = earnedBadgeIds.includes(badge.id)
      const userBadge = gamification.userBadges.find((ub: { badgeId: string }) => ub.badgeId === badge.id)
      
      return {
        ...badge,
        earned,
        earnedAt: userBadge?.earnedAt || null,
      }
    })
    
    const earnedCount = badgesWithStatus.filter(b => b.earned).length
    const totalCount = badgesWithStatus.length
    
    return NextResponse.json({
      success: true,
      badges: badgesWithStatus,
      earnedCount,
      totalCount,
      progress: Math.round((earnedCount / totalCount) * 100),
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}
