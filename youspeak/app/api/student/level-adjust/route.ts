import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  autoAdjustLevelIfNeeded,
  adjustStudentLevel,
  ENGLISH_LEVELS,
  LEVEL_DESCRIPTIONS,
  EnglishLevel
} from '@/lib/student-level-system'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = session.user.id
    const body = await request.json()
    const { action, newLevel } = body

    if (action === 'auto') {
      const result = await autoAdjustLevelIfNeeded(studentId)
      
      return NextResponse.json({
        success: true,
        adjusted: result.adjusted,
        previousLevel: result.previousLevel,
        newLevel: result.newLevel,
        reason: result.reason,
        message: result.adjusted 
          ? `تم تعديل مستواك من ${result.previousLevel} إلى ${result.newLevel}`
          : result.reason
      })
    }

    if (action === 'manual' && newLevel) {
      if (!ENGLISH_LEVELS.includes(newLevel as EnglishLevel)) {
        return NextResponse.json({ 
          success: false,
          error: 'Invalid level. Must be one of: A1, A2, B1, B2, C1' 
        }, { status: 400 })
      }

      const result = await adjustStudentLevel(studentId, newLevel as EnglishLevel)
      
      return NextResponse.json({
        success: true,
        adjusted: true,
        previousLevel: result.previousLevel,
        newLevel: result.newLevel,
        message: `تم تغيير مستواك إلى ${newLevel} (${LEVEL_DESCRIPTIONS.ar[newLevel as EnglishLevel]})`
      })
    }

    return NextResponse.json({ 
      success: false,
      error: 'Invalid action. Use "auto" or "manual" with newLevel' 
    }, { status: 400 })

  } catch (error) {
    console.error('Error adjusting level:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to adjust level' 
    }, { status: 500 })
  }
}
