import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserStats, updateStreak, initializeDefaultBadges } from '@/lib/gamification'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await initializeDefaultBadges()
    
    const streakResult = await updateStreak(session.user.id)
    
    const stats = await getUserStats(session.user.id)
    
    return NextResponse.json({
      success: true,
      stats,
      streakUpdated: streakResult.xpBonus > 0,
      streakBonus: streakResult.xpBonus,
    })
  } catch (error) {
    console.error('Error fetching gamification stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
