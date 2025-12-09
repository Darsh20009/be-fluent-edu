import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateStudentPerformanceMetrics } from '@/lib/student-level-system'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studentId = session.user.id
    const metrics = await calculateStudentPerformanceMetrics(studentId)

    const [
      totalWords,
      knownWords,
      totalExercises,
      correctExercises,
      completedLessons,
      totalLessons,
      writingsCount,
      recentActivity
    ] = await Promise.all([
      prisma.word.count({ where: { studentId } }),
      prisma.word.count({ where: { studentId, known: true } }),
      prisma.exerciseAttempt.count({ where: { studentId } }),
      prisma.exerciseAttempt.count({ where: { studentId, isCorrect: true } }),
      prisma.lessonProgress.count({ where: { studentId, completed: true } }),
      prisma.lessonProgress.count({ where: { studentId } }),
      prisma.freeWriting.count({ where: { studentId, grade: { not: null } } }),
      prisma.exerciseAttempt.findMany({
        where: { studentId },
        orderBy: { attemptedAt: 'desc' },
        take: 10,
        select: {
          isCorrect: true,
          attemptedAt: true,
          Exercise: {
            select: {
              type: true,
              Lesson: {
                select: { title: true }
              }
            }
          }
        }
      })
    ])

    const recentCorrectRate = recentActivity.length > 0 
      ? (recentActivity.filter(a => a.isCorrect).length / recentActivity.length) * 100
      : 0

    return NextResponse.json({
      success: true,
      metrics,
      details: {
        words: {
          total: totalWords,
          known: knownWords,
          percentage: totalWords > 0 ? Math.round((knownWords / totalWords) * 100) : 0
        },
        exercises: {
          total: totalExercises,
          correct: correctExercises,
          percentage: totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0
        },
        lessons: {
          total: totalLessons,
          completed: completedLessons,
          percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
        },
        writings: {
          gradedCount: writingsCount,
          averageScore: metrics.writingAverageScore
        }
      },
      recentActivity: {
        count: recentActivity.length,
        correctRate: Math.round(recentCorrectRate),
        items: recentActivity.map(a => ({
          correct: a.isCorrect,
          date: a.attemptedAt,
          exerciseType: a.Exercise.type,
          lessonTitle: a.Exercise.Lesson.title
        }))
      },
      summary: {
        overallScore: metrics.overallScore,
        dataPoints: metrics.dataPoints,
        readyForLevelCheck: metrics.dataPoints >= 20
      }
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch performance metrics' 
    }, { status: 500 })
  }
}
