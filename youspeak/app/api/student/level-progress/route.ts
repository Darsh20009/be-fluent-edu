import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getStudentLevelProgress, 
  getRecommendationsForLevel,
  getLevelSkillRequirements,
  LEVEL_DESCRIPTIONS,
  LEVEL_COLORS
} from '@/lib/student-level-system'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = session.user.id
    const progress = await getStudentLevelProgress(studentId)

    if (!progress) {
      return NextResponse.json({
        success: false,
        error: 'Student profile not found. Please complete the placement test first.',
        needsPlacementTest: true
      })
    }

    const lang = request.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'ar'
    const recommendations = getRecommendationsForLevel(
      progress.currentLevel, 
      progress.metrics,
      lang
    )
    const skillRequirements = getLevelSkillRequirements(progress.currentLevel, lang)

    return NextResponse.json({
      success: true,
      currentLevel: progress.currentLevel,
      currentLevelName: LEVEL_DESCRIPTIONS[lang][progress.currentLevel],
      initialLevel: progress.initialLevel,
      initialLevelName: progress.initialLevel ? LEVEL_DESCRIPTIONS[lang][progress.initialLevel] : null,
      performanceScore: progress.performanceScore,
      suggestedLevel: progress.suggestedLevel,
      suggestedLevelName: LEVEL_DESCRIPTIONS[lang][progress.suggestedLevel],
      levelDifference: progress.levelDifference,
      shouldAdjust: progress.shouldAdjust,
      progressPercentage: progress.progressPercentage,
      metrics: progress.metrics,
      recommendations,
      skillRequirements,
      colors: LEVEL_COLORS[progress.currentLevel],
      nextLevelColors: progress.levelDifference > 0 ? LEVEL_COLORS[progress.suggestedLevel] : null
    })
  } catch (error) {
    console.error('Error fetching level progress:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch level progress' 
    }, { status: 500 })
  }
}
