import { prisma } from './prisma'

export const ENGLISH_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
export type EnglishLevel = typeof ENGLISH_LEVELS[number]

export const LEVEL_DESCRIPTIONS = {
  ar: {
    A1: 'مبتدئ',
    A2: 'أساسي',
    B1: 'متوسط',
    B2: 'فوق المتوسط',
    C1: 'متقدم'
  },
  en: {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced'
  }
}

export const LEVEL_COLORS = {
  A1: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  A2: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  B1: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  B2: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  C1: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' }
}

export const LEVEL_THRESHOLDS = {
  A1: { min: 0, max: 20 },
  A2: { min: 21, max: 40 },
  B1: { min: 41, max: 60 },
  B2: { min: 61, max: 80 },
  C1: { min: 81, max: 100 }
}

export interface PerformanceMetrics {
  wordsKnownPercentage: number
  wordsCorrectRate: number
  exercisesCorrectRate: number
  lessonsCompletionRate: number
  writingAverageScore: number
  overallScore: number
  dataPoints: number
}

export interface LevelProgress {
  currentLevel: EnglishLevel
  initialLevel: EnglishLevel | null
  performanceScore: number
  suggestedLevel: EnglishLevel
  levelDifference: number
  shouldAdjust: boolean
  progressPercentage: number
  metrics: PerformanceMetrics
}

function getLevelIndex(level: EnglishLevel): number {
  return ENGLISH_LEVELS.indexOf(level)
}

function getLevelFromIndex(index: number): EnglishLevel {
  if (index < 0) return ENGLISH_LEVELS[0]
  if (index >= ENGLISH_LEVELS.length) return ENGLISH_LEVELS[ENGLISH_LEVELS.length - 1]
  return ENGLISH_LEVELS[index]
}

function getLevelFromScore(score: number): EnglishLevel {
  for (const [level, thresholds] of Object.entries(LEVEL_THRESHOLDS)) {
    if (score >= thresholds.min && score <= thresholds.max) {
      return level as EnglishLevel
    }
  }
  return 'A1'
}

function getProgressInLevel(score: number, level: EnglishLevel): number {
  const thresholds = LEVEL_THRESHOLDS[level]
  const range = thresholds.max - thresholds.min
  const progress = ((score - thresholds.min) / range) * 100
  return Math.max(0, Math.min(100, progress))
}

export async function calculateStudentPerformanceMetrics(studentId: string): Promise<PerformanceMetrics> {
  const [words, exerciseAttempts, lessonProgress, writings] = await Promise.all([
    prisma.word.findMany({
      where: { studentId },
      select: { known: true, correctCount: true, incorrectCount: true }
    }),
    prisma.exerciseAttempt.findMany({
      where: { studentId },
      select: { isCorrect: true }
    }),
    prisma.lessonProgress.findMany({
      where: { studentId },
      select: { completed: true, exercisesScore: true }
    }),
    prisma.freeWriting.findMany({
      where: { studentId, grade: { not: null } },
      select: { grade: true }
    })
  ])

  let wordsKnownPercentage = 0
  let wordsCorrectRate = 0
  if (words.length > 0) {
    wordsKnownPercentage = (words.filter(w => w.known).length / words.length) * 100
    const totalAttempts = words.reduce((sum, w) => sum + w.correctCount + w.incorrectCount, 0)
    const totalCorrect = words.reduce((sum, w) => sum + w.correctCount, 0)
    wordsCorrectRate = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0
  }

  let exercisesCorrectRate = 0
  if (exerciseAttempts.length > 0) {
    exercisesCorrectRate = (exerciseAttempts.filter(e => e.isCorrect).length / exerciseAttempts.length) * 100
  }

  let lessonsCompletionRate = 0
  if (lessonProgress.length > 0) {
    lessonsCompletionRate = (lessonProgress.filter(l => l.completed).length / lessonProgress.length) * 100
  }

  let writingAverageScore = 0
  if (writings.length > 0) {
    writingAverageScore = writings.reduce((sum, w) => sum + (w.grade || 0), 0) / writings.length
  }

  const dataPoints = words.length + exerciseAttempts.length + lessonProgress.length + writings.length
  
  const categoriesWithData = [
    words.length > 0 ? 1 : 0,
    exerciseAttempts.length > 0 ? 1 : 0,
    lessonProgress.length > 0 ? 1 : 0,
    writings.length > 0 ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  const weights = {
    wordsKnown: 0.15,
    wordsCorrect: 0.20,
    exercises: 0.30,
    lessons: 0.15,
    writing: 0.20
  }

  let overallScore = 0
  let totalWeight = 0

  if (words.length > 0) {
    overallScore += wordsKnownPercentage * weights.wordsKnown
    overallScore += wordsCorrectRate * weights.wordsCorrect
    totalWeight += weights.wordsKnown + weights.wordsCorrect
  }

  if (exerciseAttempts.length > 0) {
    overallScore += exercisesCorrectRate * weights.exercises
    totalWeight += weights.exercises
  }

  if (lessonProgress.length > 0) {
    overallScore += lessonsCompletionRate * weights.lessons
    totalWeight += weights.lessons
  }

  if (writings.length > 0) {
    overallScore += writingAverageScore * weights.writing
    totalWeight += weights.writing
  }

  if (totalWeight > 0) {
    overallScore = overallScore / totalWeight
  } else {
    overallScore = 0
  }

  return {
    wordsKnownPercentage: Math.round(wordsKnownPercentage * 10) / 10,
    wordsCorrectRate: Math.round(wordsCorrectRate * 10) / 10,
    exercisesCorrectRate: Math.round(exercisesCorrectRate * 10) / 10,
    lessonsCompletionRate: Math.round(lessonsCompletionRate * 10) / 10,
    writingAverageScore: Math.round(writingAverageScore * 10) / 10,
    overallScore: Math.round(overallScore * 10) / 10,
    dataPoints
  }
}

export async function getStudentLevelProgress(studentId: string): Promise<LevelProgress | null> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    select: {
      levelInitial: true,
      levelCurrent: true,
      updatedAt: true
    }
  })

  if (!student) {
    return null
  }

  const metrics = await calculateStudentPerformanceMetrics(studentId)

  const currentLevel = (student.levelCurrent || student.levelInitial || 'A1') as EnglishLevel
  const initialLevel = (student.levelInitial || 'A1') as EnglishLevel
  const suggestedLevel = getLevelFromScore(metrics.overallScore)
  
  const currentLevelIndex = getLevelIndex(currentLevel)
  const suggestedLevelIndex = getLevelIndex(suggestedLevel)
  const levelDifference = suggestedLevelIndex - currentLevelIndex

  const shouldAdjust = Math.abs(levelDifference) >= 1 && metrics.dataPoints >= 20

  const progressPercentage = getProgressInLevel(metrics.overallScore, currentLevel)

  return {
    currentLevel,
    initialLevel,
    performanceScore: metrics.overallScore,
    suggestedLevel,
    levelDifference,
    shouldAdjust,
    progressPercentage,
    metrics
  }
}

export async function adjustStudentLevel(
  studentId: string, 
  newLevel: EnglishLevel
): Promise<{ success: boolean; previousLevel: string; newLevel: string }> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentId }
  })

  if (!student) {
    await prisma.studentProfile.create({
      data: {
        userId: studentId,
        levelInitial: newLevel,
        levelCurrent: newLevel
      }
    })
    return {
      success: true,
      previousLevel: 'NEW',
      newLevel
    }
  }

  const previousLevel = student.levelCurrent || student.levelInitial || 'A1'

  await prisma.studentProfile.update({
    where: { userId: studentId },
    data: {
      levelCurrent: newLevel,
      updatedAt: new Date()
    }
  })

  return {
    success: true,
    previousLevel,
    newLevel
  }
}

export async function autoAdjustLevelIfNeeded(studentId: string): Promise<{
  adjusted: boolean
  previousLevel?: string
  newLevel?: string
  reason?: string
}> {
  const progress = await getStudentLevelProgress(studentId)

  if (!progress) {
    return { adjusted: false, reason: 'Student profile not found' }
  }

  if (progress.metrics.dataPoints < 20) {
    return { 
      adjusted: false, 
      reason: `Not enough data (${progress.metrics.dataPoints}/20 activities required)` 
    }
  }

  if (!progress.shouldAdjust) {
    return { 
      adjusted: false, 
      reason: 'Performance matches current level' 
    }
  }

  const result = await adjustStudentLevel(studentId, progress.suggestedLevel)

  return {
    adjusted: true,
    previousLevel: result.previousLevel,
    newLevel: result.newLevel,
    reason: progress.levelDifference > 0 
      ? 'Performance exceeds current level'
      : 'Performance below current level'
  }
}

export function getRecommendationsForLevel(
  currentLevel: EnglishLevel,
  metrics: PerformanceMetrics,
  lang: 'ar' | 'en' = 'ar'
): string[] {
  const recommendations: string[] = []

  if (lang === 'ar') {
    if (metrics.wordsCorrectRate < 70) {
      recommendations.push('راجع الكلمات التي تعلمتها بانتظام لتحسين التذكر')
    }
    if (metrics.exercisesCorrectRate < 60) {
      recommendations.push('أعد محاولة التمارين الصعبة وركز على القواعد')
    }
    if (metrics.lessonsCompletionRate < 50) {
      recommendations.push('أكمل المزيد من الدروس لتطوير مهاراتك')
    }
    if (metrics.writingAverageScore < 70 && metrics.dataPoints > 0) {
      recommendations.push('تدرب على الكتابة أكثر وتعلم من تعليقات المعلم')
    }
    if (metrics.overallScore > 80) {
      recommendations.push('أنت جاهز للانتقال للمستوى التالي!')
    }
  } else {
    if (metrics.wordsCorrectRate < 70) {
      recommendations.push('Review learned words regularly to improve retention')
    }
    if (metrics.exercisesCorrectRate < 60) {
      recommendations.push('Retry difficult exercises and focus on grammar rules')
    }
    if (metrics.lessonsCompletionRate < 50) {
      recommendations.push('Complete more lessons to develop your skills')
    }
    if (metrics.writingAverageScore < 70 && metrics.dataPoints > 0) {
      recommendations.push('Practice writing more and learn from teacher feedback')
    }
    if (metrics.overallScore > 80) {
      recommendations.push('You are ready to move to the next level!')
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      lang === 'ar' 
        ? 'استمر في التقدم! أنت تتحسن بشكل ممتاز' 
        : 'Keep going! You are improving excellently'
    )
  }

  return recommendations
}

export function getLevelSkillRequirements(level: EnglishLevel, lang: 'ar' | 'en' = 'ar'): {
  vocabulary: string
  grammar: string
  speaking: string
  listening: string
  writing: string
} {
  const requirements = {
    ar: {
      A1: {
        vocabulary: '500 كلمة أساسية',
        grammar: 'أساسيات الجمل البسيطة',
        speaking: 'تقديم النفس وتحيات بسيطة',
        listening: 'فهم كلمات وجمل قصيرة',
        writing: 'كتابة جمل بسيطة جداً'
      },
      A2: {
        vocabulary: '1000 كلمة',
        grammar: 'الأزمنة الأساسية والضمائر',
        speaking: 'محادثات يومية بسيطة',
        listening: 'فهم نصوص قصيرة واضحة',
        writing: 'فقرات قصيرة عن مواضيع مألوفة'
      },
      B1: {
        vocabulary: '2000 كلمة',
        grammar: 'الأزمنة المركبة والشرطية',
        speaking: 'مناقشة مواضيع متنوعة',
        listening: 'فهم البرامج والأفلام',
        writing: 'نصوص منظمة ومتماسكة'
      },
      B2: {
        vocabulary: '4000 كلمة',
        grammar: 'تراكيب معقدة ودقيقة',
        speaking: 'طلاقة في معظم المواقف',
        listening: 'فهم اللهجات المختلفة',
        writing: 'مقالات وتقارير مفصلة'
      },
      C1: {
        vocabulary: '8000+ كلمة',
        grammar: 'إتقان شامل للقواعد',
        speaking: 'طلاقة تامة وتعبير دقيق',
        listening: 'فهم كامل للمحتوى الأصلي',
        writing: 'كتابة أكاديمية ومهنية متقدمة'
      }
    },
    en: {
      A1: {
        vocabulary: '500 basic words',
        grammar: 'Basic simple sentences',
        speaking: 'Self-introduction and simple greetings',
        listening: 'Understand words and short sentences',
        writing: 'Write very simple sentences'
      },
      A2: {
        vocabulary: '1000 words',
        grammar: 'Basic tenses and pronouns',
        speaking: 'Simple daily conversations',
        listening: 'Understand short clear texts',
        writing: 'Short paragraphs on familiar topics'
      },
      B1: {
        vocabulary: '2000 words',
        grammar: 'Compound and conditional tenses',
        speaking: 'Discuss various topics',
        listening: 'Understand programs and movies',
        writing: 'Organized and coherent texts'
      },
      B2: {
        vocabulary: '4000 words',
        grammar: 'Complex and precise structures',
        speaking: 'Fluency in most situations',
        listening: 'Understand different accents',
        writing: 'Detailed essays and reports'
      },
      C1: {
        vocabulary: '8000+ words',
        grammar: 'Complete grammar mastery',
        speaking: 'Complete fluency and precise expression',
        listening: 'Full understanding of native content',
        writing: 'Advanced academic and professional writing'
      }
    }
  }

  return requirements[lang][level]
}
