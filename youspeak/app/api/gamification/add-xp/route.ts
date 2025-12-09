import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addXP, XP_REWARDS } from '@/lib/gamification'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { activity, customXP } = body
    
    let xpAmount = customXP || 0
    let activityType: 'word' | 'lesson' | 'exercise' | 'writing' | 'session' | 'other' = 'other'
    let reason = activity || 'Activity completed'
    
    switch (activity) {
      case 'WORD_LEARNED':
        xpAmount = XP_REWARDS.WORD_LEARNED
        activityType = 'word'
        reason = 'تعلم كلمة جديدة'
        break
      case 'WORD_REVIEWED':
        xpAmount = XP_REWARDS.WORD_REVIEWED
        activityType = 'word'
        reason = 'مراجعة كلمة'
        break
      case 'WORD_MASTERED':
        xpAmount = XP_REWARDS.WORD_MASTERED
        activityType = 'word'
        reason = 'إتقان كلمة'
        break
      case 'LESSON_COMPLETED':
        xpAmount = XP_REWARDS.LESSON_COMPLETED
        activityType = 'lesson'
        reason = 'إكمال درس'
        break
      case 'EXERCISE_CORRECT':
        xpAmount = XP_REWARDS.EXERCISE_CORRECT
        activityType = 'exercise'
        reason = 'إجابة صحيحة'
        break
      case 'EXERCISE_PERFECT':
        xpAmount = XP_REWARDS.EXERCISE_PERFECT
        activityType = 'exercise'
        reason = 'تمرين بدرجة كاملة'
        break
      case 'WRITING_SUBMITTED':
        xpAmount = XP_REWARDS.WRITING_SUBMITTED
        activityType = 'writing'
        reason = 'تقديم كتابة'
        break
      case 'WRITING_EXCELLENT':
        xpAmount = XP_REWARDS.WRITING_EXCELLENT
        activityType = 'writing'
        reason = 'كتابة ممتازة'
        break
      case 'SESSION_ATTENDED':
        xpAmount = XP_REWARDS.SESSION_ATTENDED
        activityType = 'session'
        reason = 'حضور جلسة'
        break
      case 'HOMEWORK_SUBMITTED':
        xpAmount = XP_REWARDS.HOMEWORK_SUBMITTED
        activityType = 'other'
        reason = 'تقديم واجب'
        break
      case 'CONVERSATION_COMPLETED':
        xpAmount = XP_REWARDS.CONVERSATION_COMPLETED
        activityType = 'other'
        reason = 'إكمال محادثة تدريبية'
        break
      case 'LISTENING_COMPLETED':
        xpAmount = XP_REWARDS.LISTENING_COMPLETED
        activityType = 'other'
        reason = 'إكمال تمرين استماع'
        break
    }
    
    if (xpAmount <= 0) {
      return NextResponse.json({ error: 'Invalid activity' }, { status: 400 })
    }
    
    const result = await addXP(session.user.id, xpAmount, reason, activityType)
    
    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Error adding XP:', error)
    return NextResponse.json(
      { error: 'Failed to add XP' },
      { status: 500 }
    )
  }
}
