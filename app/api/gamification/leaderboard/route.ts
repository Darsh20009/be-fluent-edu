import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLeaderboard, getUserRank, getOrCreateUserGamification } from '@/lib/gamification'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') as 'xp' | 'streak' | 'level') || 'xp'
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const leaderboard = await getLeaderboard(limit, type)
    
    let userRank = null
    let userStats = null
    
    if (session?.user?.id) {
      userRank = await getUserRank(session.user.id)
      userStats = await getOrCreateUserGamification(session.user.id)
    }
    
    return NextResponse.json({
      success: true,
      leaderboard,
      userRank,
      userStats: userStats ? {
        totalXP: userStats.totalXP,
        currentLevel: userStats.currentLevel,
        currentStreak: userStats.currentStreak,
      } : null,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
