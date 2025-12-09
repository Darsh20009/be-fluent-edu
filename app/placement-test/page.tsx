'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Headphones, 
  BookOpen, 
  Type, 
  PenTool, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  XCircle,
  Trophy,
  Star,
  Target,
  Clock,
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  BookMarked,
  MessageCircle,
  Award,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  type: 'LISTENING' | 'READING' | 'VOCABULARY' | 'GRAMMAR'
  level: string
  question: string
  questionAr: string
  options: string[]
  passage?: string
  passageAr?: string
  audioUrl?: string
  points: number
}

interface SectionScore {
  correct: number
  total: number
  pointsEarned: number
  maxPoints: number
  percentage: number
}

interface TestResult {
  score: number
  totalPossible: number
  percentage: number
  correctAnswers: number
  totalQuestions: number
  level: string
  levelDescription: { en: string; ar: string }
  sectionScores: {
    listening: SectionScore
    reading: SectionScore
    vocabulary: SectionScore
    grammar: SectionScore
  }
}

const SECTION_INFO = {
  LISTENING: {
    icon: Headphones,
    title: 'Listening',
    titleAr: 'الاستماع',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    recommendation: {
      en: 'Practice with podcasts, audiobooks, and English media. Start with slower content and gradually increase speed.',
      ar: 'تدرب مع البودكاست والكتب الصوتية والوسائط الإنجليزية. ابدأ بالمحتوى البطيء وزد السرعة تدريجياً.'
    }
  },
  READING: {
    icon: BookOpen,
    title: 'Reading',
    titleAr: 'القراءة',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    recommendation: {
      en: 'Read graded readers at your level. Focus on understanding context before looking up words.',
      ar: 'اقرأ كتب القراءة المتدرجة بمستواك. ركز على فهم السياق قبل البحث عن الكلمات.'
    }
  },
  VOCABULARY: {
    icon: Type,
    title: 'Vocabulary',
    titleAr: 'المفردات',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    recommendation: {
      en: 'Use flashcards and spaced repetition. Learn words in context, not isolation. Practice daily.',
      ar: 'استخدم البطاقات التعليمية والتكرار المتباعد. تعلم الكلمات في سياقها. تدرب يومياً.'
    }
  },
  GRAMMAR: {
    icon: PenTool,
    title: 'Grammar',
    titleAr: 'القواعد',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    recommendation: {
      en: 'Study grammar rules with examples. Practice through writing and speaking. Focus on common patterns.',
      ar: 'ادرس قواعد اللغة مع الأمثلة. تدرب من خلال الكتابة والتحدث. ركز على الأنماط الشائعة.'
    }
  }
}

const LEVEL_INFO: Record<string, {
  color: string
  bgColor: string
  borderColor: string
  emoji: string
  title: string
  titleAr: string
  nextLevel: string | null
  recommendations: { en: string[]; ar: string[] }
}> = {
  A1: {
    color: 'from-emerald-400 to-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    emoji: '🌱',
    title: 'Beginner',
    titleAr: 'مبتدئ',
    nextLevel: 'A2',
    recommendations: {
      en: [
        'Master basic vocabulary (numbers, colors, family, daily items)',
        'Learn simple present tense and basic verb conjugations',
        'Practice introducing yourself and basic conversations',
        'Listen to slow, clear English content for beginners'
      ],
      ar: [
        'أتقن المفردات الأساسية (الأرقام، الألوان، العائلة، الأشياء اليومية)',
        'تعلم زمن المضارع البسيط والتصريفات الأساسية',
        'تدرب على تقديم نفسك والمحادثات الأساسية',
        'استمع لمحتوى إنجليزي بطيء وواضح للمبتدئين'
      ]
    }
  },
  A2: {
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    emoji: '📚',
    title: 'Elementary',
    titleAr: 'أساسي',
    nextLevel: 'B1',
    recommendations: {
      en: [
        'Expand vocabulary to 1000+ words',
        'Master past tense and future expressions',
        'Practice describing experiences and routines',
        'Read simple stories and articles'
      ],
      ar: [
        'وسع مفرداتك إلى أكثر من 1000 كلمة',
        'أتقن الماضي والتعبيرات المستقبلية',
        'تدرب على وصف التجارب والروتين',
        'اقرأ قصص ومقالات بسيطة'
      ]
    }
  },
  B1: {
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    emoji: '⭐',
    title: 'Intermediate',
    titleAr: 'متوسط',
    nextLevel: 'B2',
    recommendations: {
      en: [
        'Learn conditional sentences and passive voice',
        'Practice expressing opinions and giving reasons',
        'Watch movies with English subtitles',
        'Start writing short essays and reports'
      ],
      ar: [
        'تعلم الجمل الشرطية والمبني للمجهول',
        'تدرب على التعبير عن الآراء وإعطاء الأسباب',
        'شاهد الأفلام مع ترجمة إنجليزية',
        'ابدأ بكتابة مقالات وتقارير قصيرة'
      ]
    }
  },
  B2: {
    color: 'from-orange-400 to-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    emoji: '🚀',
    title: 'Upper Intermediate',
    titleAr: 'فوق المتوسط',
    nextLevel: 'C1',
    recommendations: {
      en: [
        'Master complex grammar structures',
        'Build academic and professional vocabulary',
        'Practice debating and presenting',
        'Read newspapers and academic articles'
      ],
      ar: [
        'أتقن التراكيب النحوية المعقدة',
        'ابنِ مفردات أكاديمية ومهنية',
        'تدرب على المناظرة والعرض التقديمي',
        'اقرأ الصحف والمقالات الأكاديمية'
      ]
    }
  },
  C1: {
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    emoji: '👑',
    title: 'Advanced',
    titleAr: 'متقدم',
    nextLevel: null,
    recommendations: {
      en: [
        'Focus on nuanced language and idioms',
        'Practice academic and professional writing',
        'Engage in complex discussions on varied topics',
        'Aim for near-native fluency through immersion'
      ],
      ar: [
        'ركز على اللغة الدقيقة والتعابير الاصطلاحية',
        'تدرب على الكتابة الأكاديمية والمهنية',
        'شارك في مناقشات معقدة حول مواضيع متنوعة',
        'اسعَ للطلاقة شبه الأصلية من خلال الانغماس'
      ]
    }
  }
}

export default function PlacementTestPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [started, setStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSectionNav, setShowSectionNav] = useState(false)
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'details' | 'recommendations'>('overview')

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (started && !result) {
      interval = setInterval(() => {
        if (startTime) {
          setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000))
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [started, result, startTime])

  const fetchQuestions = async () => {
    try {
      setError(null)
      const res = await fetch('/api/placement-test')
      const data = await res.json()
      if (data.success) {
        setQuestions(data.questions)
      } else {
        setError('فشل في تحميل الأسئلة. يرجى المحاولة مرة أخرى.')
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    setStarted(true)
    setStartTime(new Date())
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      const data = await res.json()
      if (data.success) {
        setResult(data)
      } else {
        setSubmitError('فشل في إرسال الإجابات. يرجى المحاولة مرة أخرى.')
      }
    } catch (err) {
      console.error('Error submitting test:', err)
      setSubmitError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentIndex]
  const currentSection = currentQuestion?.type
  const sectionInfo = currentSection ? SECTION_INFO[currentSection] : null

  const getQuestionsBySection = (type: string) => questions.filter(q => q.type === type)
  const getAnsweredCount = (type: string) => 
    getQuestionsBySection(type).filter(q => answers[q.id]).length

  const getSectionQuestionIndices = (type: string) => {
    const indices: number[] = []
    questions.forEach((q, i) => {
      if (q.type === type) indices.push(i)
    })
    return indices
  }

  const getWeakestSection = () => {
    if (!result) return null
    const sections = Object.entries(result.sectionScores) as [string, SectionScore][]
    const weakest = sections.reduce((prev, curr) => 
      curr[1].percentage < prev[1].percentage ? curr : prev
    )
    return weakest[0].toUpperCase() as keyof typeof SECTION_INFO
  }

  const getStrongestSection = () => {
    if (!result) return null
    const sections = Object.entries(result.sectionScores) as [string, SectionScore][]
    const strongest = sections.reduce((prev, curr) => 
      curr[1].percentage > prev[1].percentage ? curr : prev
    )
    return strongest[0].toUpperCase() as keyof typeof SECTION_INFO
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">جاري تحميل الاختبار...</p>
          <p className="text-gray-400 text-sm mt-2">Loading placement test...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">حدث خطأ</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchQuestions}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              إعادة المحاولة
            </button>
            <Link
              href="/dashboard/student"
              className="px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    const levelInfo = LEVEL_INFO[result.level] || LEVEL_INFO.A1
    const weakestSection = getWeakestSection()
    const strongestSection = getStrongestSection()
    const weakSectionInfo = weakestSection ? SECTION_INFO[weakestSection] : null
    const strongSectionInfo = strongestSection ? SECTION_INFO[strongestSection] : null

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">نتائج اختبار تحديد المستوى</h1>
              <p className="text-gray-300">Placement Test Results</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white/10 rounded-xl p-1 flex gap-1">
                <button
                  onClick={() => setActiveResultTab('overview')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeResultTab === 'overview' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  النتيجة العامة
                </button>
                <button
                  onClick={() => setActiveResultTab('details')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeResultTab === 'details' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  التفاصيل
                </button>
                <button
                  onClick={() => setActiveResultTab('recommendations')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeResultTab === 'recommendations' 
                      ? 'bg-purple-500 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  التوصيات
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeResultTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className={`${levelInfo.bgColor} border ${levelInfo.borderColor} rounded-3xl p-8 text-center`}>
                    <div className="text-6xl mb-4">{levelInfo.emoji}</div>
                    <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${levelInfo.color} shadow-lg mb-4`}>
                      <p className="text-sm uppercase tracking-wider mb-1">مستواك / Your Level</p>
                      <p className="text-5xl font-bold">{result.level}</p>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{levelInfo.titleAr} - {levelInfo.title}</h2>
                    <div className="max-w-2xl mx-auto">
                      <p className="text-lg mb-2">{result.levelDescription.ar}</p>
                      <p className="text-gray-400">{result.levelDescription.en}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                      <Star className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                      <p className="text-3xl font-bold">{result.score}</p>
                      <p className="text-sm text-gray-400">من {result.totalPossible}</p>
                      <p className="text-xs text-gray-500 mt-1">النقاط المكتسبة</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                      <Target className="w-10 h-10 text-green-400 mx-auto mb-3" />
                      <p className="text-3xl font-bold">{result.percentage}%</p>
                      <p className="text-sm text-gray-400">النسبة المئوية</p>
                      <p className="text-xs text-gray-500 mt-1">Percentage</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                      <CheckCircle className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                      <p className="text-3xl font-bold">{result.correctAnswers}</p>
                      <p className="text-sm text-gray-400">من {result.totalQuestions}</p>
                      <p className="text-xs text-gray-500 mt-1">إجابات صحيحة</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
                      <Clock className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                      <p className="text-3xl font-bold">{formatTime(elapsedTime)}</p>
                      <p className="text-sm text-gray-400">الوقت المستغرق</p>
                      <p className="text-xs text-gray-500 mt-1">Time Spent</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {strongSectionInfo && (
                      <div className={`${strongSectionInfo.bgColor} border ${strongSectionInfo.borderColor} rounded-2xl p-6`}>
                        <div className="flex items-center gap-3 mb-3">
                          <Award className={`w-8 h-8 ${strongSectionInfo.textColor}`} />
                          <div>
                            <p className="font-bold">نقطة القوة / Strength</p>
                            <p className={`${strongSectionInfo.textColor} text-lg font-semibold`}>
                              {strongSectionInfo.titleAr} - {strongSectionInfo.title}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">
                          أحسنت! أنت متميز في هذا المجال. استمر في الممارسة للحفاظ على مستواك.
                        </p>
                      </div>
                    )}
                    {weakSectionInfo && (
                      <div className={`${weakSectionInfo.bgColor} border ${weakSectionInfo.borderColor} rounded-2xl p-6`}>
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp className={`w-8 h-8 ${weakSectionInfo.textColor}`} />
                          <div>
                            <p className="font-bold">مجال التحسين / Area to Improve</p>
                            <p className={`${weakSectionInfo.textColor} text-lg font-semibold`}>
                              {weakSectionInfo.titleAr} - {weakSectionInfo.title}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">
                          {weakSectionInfo.recommendation.ar}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeResultTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
                >
                  <h2 className="text-2xl font-bold mb-6 text-center">تفاصيل الأداء في كل قسم</h2>
                  
                  <div className="space-y-6">
                    {Object.entries(SECTION_INFO).map(([type, info]) => {
                      const score = result.sectionScores[type.toLowerCase() as keyof typeof result.sectionScores]
                      const Icon = info.icon
                      const performanceLabel = score.percentage >= 80 ? 'ممتاز' : 
                                               score.percentage >= 60 ? 'جيد' :
                                               score.percentage >= 40 ? 'متوسط' : 'يحتاج تحسين'
                      const performanceLabelEn = score.percentage >= 80 ? 'Excellent' : 
                                                 score.percentage >= 60 ? 'Good' :
                                                 score.percentage >= 40 ? 'Average' : 'Needs Improvement'
                      
                      return (
                        <div key={type} className={`${info.bgColor} border ${info.borderColor} rounded-2xl p-6`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${info.color} flex items-center justify-center`}>
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{info.titleAr}</h3>
                                <p className="text-gray-400">{info.title}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-3xl font-bold">{score.percentage}%</p>
                              <p className="text-sm text-gray-400">{score.correct}/{score.total} صحيح</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score.percentage}%` }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className={`h-full bg-gradient-to-r ${info.color} rounded-full`}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`px-4 py-1 rounded-full text-sm font-medium ${info.bgColor} ${info.textColor}`}>
                              {performanceLabel} - {performanceLabelEn}
                            </span>
                            <span className="text-sm text-gray-400">
                              {score.pointsEarned} / {score.maxPoints} نقطة
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {activeResultTab === 'recommendations' && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className={`${levelInfo.bgColor} border ${levelInfo.borderColor} rounded-3xl p-8`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${levelInfo.color} flex items-center justify-center text-3xl`}>
                        {levelInfo.emoji}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">خطة التطوير للمستوى {result.level}</h2>
                        <p className="text-gray-400">Development Plan for Level {result.level}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {levelInfo.recommendations.ar.map((rec, i) => (
                        <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${levelInfo.color} flex items-center justify-center flex-shrink-0`}>
                            <span className="font-bold text-sm">{i + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{rec}</p>
                            <p className="text-sm text-gray-400 mt-1">{levelInfo.recommendations.en[i]}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {levelInfo.nextLevel && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <Zap className="w-6 h-6 text-yellow-400" />
                          <div>
                            <p className="font-bold">الهدف التالي: المستوى {levelInfo.nextLevel}</p>
                            <p className="text-sm text-gray-400">Next Goal: Level {levelInfo.nextLevel}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Lightbulb className="w-6 h-6 text-yellow-400" />
                      توصيات لكل مهارة
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(SECTION_INFO).map(([type, info]) => {
                        const score = result.sectionScores[type.toLowerCase() as keyof typeof result.sectionScores]
                        const Icon = info.icon
                        const needsFocus = score.percentage < 60
                        
                        return (
                          <div 
                            key={type} 
                            className={`${info.bgColor} border ${info.borderColor} rounded-xl p-5 ${needsFocus ? 'ring-2 ring-yellow-500/50' : ''}`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Icon className={`w-6 h-6 ${info.textColor}`} />
                              <div>
                                <span className="font-bold">{info.titleAr}</span>
                                {needsFocus && (
                                  <span className="mr-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                    أولوية
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{info.recommendation.ar}</p>
                            <p className="text-xs text-gray-500">{info.recommendation.en}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <BookMarked className="w-8 h-8 text-purple-400 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-lg mb-2">ابدأ رحلة التعلم الآن!</h3>
                        <p className="text-gray-300 mb-4">
                          بناءً على نتائجك، قمنا بتخصيص مسار تعلم مناسب لمستواك. ابدأ بالدروس والتمارين المصممة خصيصاً لك.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href="/dashboard/student"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                          >
                            <MessageCircle className="w-5 h-5" />
                            ابدأ التعلم
                          </Link>
                          <Link
                            href="/listening"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-all"
                          >
                            <Headphones className="w-5 h-5" />
                            تمارين الاستماع
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 justify-center mt-8">
              <Link
                href="/dashboard/student"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                العودة للوحة التحكم
              </Link>
              <button
                onClick={() => {
                  setResult(null)
                  setAnswers({})
                  setCurrentIndex(0)
                  setStarted(false)
                  setElapsedTime(0)
                  setActiveResultTab('overview')
                }}
                className="px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                إعادة الاختبار
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/dashboard/student" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>العودة للوحة التحكم</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Target className="w-20 h-20 text-purple-400 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">اختبار تحديد المستوى</h1>
              <p className="text-xl text-gray-300">Placement Test</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-purple-400" />
                معلومات الاختبار
              </h2>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 bg-white/5 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="font-bold">40</span>
                  </div>
                  <div>
                    <span className="font-medium">سؤال متنوع</span>
                    <span className="text-gray-400 text-sm mr-2">| 40 Questions</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                  <Headphones className="w-10 h-10 p-2 rounded-lg bg-blue-500/20 text-blue-400" />
                  <div>
                    <span className="font-medium">10 أسئلة استماع</span>
                    <span className="text-gray-400 text-sm mr-2">| Listening</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                  <BookOpen className="w-10 h-10 p-2 rounded-lg bg-green-500/20 text-green-400" />
                  <div>
                    <span className="font-medium">10 أسئلة قراءة</span>
                    <span className="text-gray-400 text-sm mr-2">| Reading</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
                  <Type className="w-10 h-10 p-2 rounded-lg bg-purple-500/20 text-purple-400" />
                  <div>
                    <span className="font-medium">10 أسئلة مفردات</span>
                    <span className="text-gray-400 text-sm mr-2">| Vocabulary</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 bg-orange-500/10 rounded-xl p-3 border border-orange-500/20">
                  <PenTool className="w-10 h-10 p-2 rounded-lg bg-orange-500/20 text-orange-400" />
                  <div>
                    <span className="font-medium">10 أسئلة قواعد</span>
                    <span className="text-gray-400 text-sm mr-2">| Grammar</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-8">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">نصائح مهمة</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• اختر المكان الهادئ للتركيز</li>
                    <li>• لا يوجد حد زمني، خذ وقتك</li>
                    <li>• سيحدد هذا الاختبار مستواك (A1 - C1)</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <Zap className="w-6 h-6" />
              ابدأ الاختبار
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
            </div>
          </div>
          <div className="text-center bg-white/10 rounded-xl px-6 py-2">
            <p className="text-xs text-gray-400">السؤال / Question</p>
            <p className="text-xl font-bold">{currentIndex + 1} / {questions.length}</p>
          </div>
          <button 
            onClick={() => setShowSectionNav(!showSectionNav)}
            className="bg-white/10 rounded-xl px-4 py-2 hover:bg-white/20 transition-all"
          >
            {showSectionNav ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </button>
        </div>

        <div className="w-full bg-white/10 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 relative"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full text-center text-[10px] font-bold">
              {Math.round(((currentIndex + 1) / questions.length) * 100)}%
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSectionNav && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-white">
                {Object.entries(SECTION_INFO).map(([type, info]) => {
                  const sectionQuestions = getQuestionsBySection(type)
                  const answered = getAnsweredCount(type)
                  const indices = getSectionQuestionIndices(type)
                  const Icon = info.icon
                  const isCurrentSection = currentSection === type
                  
                  return (
                    <div 
                      key={type} 
                      className={`${info.bgColor} border ${info.borderColor} rounded-xl p-4 ${isCurrentSection ? 'ring-2 ring-white/50' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className={`w-5 h-5 ${info.textColor}`} />
                        <span className="font-semibold text-sm">{info.titleAr}</span>
                        <span className={`mr-auto text-xs px-2 py-0.5 rounded-full ${info.bgColor} ${info.textColor}`}>
                          {answered}/{sectionQuestions.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {indices.map((idx) => {
                          const q = questions[idx]
                          const isAnswered = !!answers[q.id]
                          const isCurrent = idx === currentIndex
                          return (
                            <button
                              key={q.id}
                              onClick={() => setCurrentIndex(idx)}
                              className={`w-7 h-7 rounded text-xs font-semibold transition-all ${
                                isCurrent
                                  ? `bg-gradient-to-r ${info.color} text-white`
                                  : isAnswered
                                    ? 'bg-green-500/40 text-white'
                                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                            >
                              {idx + 1}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {Object.entries(SECTION_INFO).map(([type, info]) => {
            const answered = getAnsweredCount(type)
            const total = getQuestionsBySection(type).length
            const Icon = info.icon
            const isCurrentSection = currentSection === type
            return (
              <div 
                key={type} 
                className={`${info.bgColor} border ${isCurrentSection ? 'border-white/50' : info.borderColor} rounded-lg px-3 py-2 flex items-center gap-2 transition-all`}
              >
                <Icon className={`w-4 h-4 ${info.textColor}`} />
                <span className="text-sm font-semibold text-white">{answered}/{total}</span>
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white"
          >
            {sectionInfo && (
              <div className="flex items-center justify-between mb-6">
                <div className={`inline-flex items-center gap-2 ${sectionInfo.bgColor} ${sectionInfo.textColor} rounded-full px-4 py-2 border ${sectionInfo.borderColor}`}>
                  {sectionInfo.icon && <sectionInfo.icon className="w-5 h-5" />}
                  <span className="font-semibold">{sectionInfo.titleAr}</span>
                  <span className="text-sm opacity-70">({sectionInfo.title})</span>
                </div>
                <span className="text-sm px-3 py-1 bg-white/10 rounded-full">
                  {currentQuestion.level}
                </span>
              </div>
            )}

            {currentQuestion.passage && (
              <div className="bg-white/5 rounded-xl p-5 mb-6 border border-white/10">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  اقرأ النص التالي:
                </p>
                <p className="text-gray-200 leading-relaxed">{currentQuestion.passage}</p>
              </div>
            )}

            <div className="mb-8">
              <p className="text-xl font-semibold mb-3">{currentQuestion.question}</p>
              <p className="text-gray-400 text-right text-lg">{currentQuestion.questionAr}</p>
            </div>

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 rounded-xl text-right transition-all flex items-center ${
                      isSelected
                        ? `bg-gradient-to-r ${sectionInfo?.color || 'from-purple-500 to-pink-500'} border-2 border-white/30 shadow-lg`
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ml-4 font-bold ${
                      isSelected ? 'bg-white/30' : 'bg-white/10'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isSelected && <CheckCircle className="w-6 h-6 text-white/80" />}
                  </motion.button>
                )
              })}
            </div>

            {submitError && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300">{submitError}</p>
                <button
                  onClick={() => setSubmitError(null)}
                  className="mr-auto text-red-400 hover:text-red-300"
                >
                  &times;
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
                <span>السابق</span>
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {Object.keys(answers).length} من {questions.length} مُجاب
                </p>
              </div>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length < questions.length}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      <span>إنهاء الاختبار</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-gray-400 mb-3">انتقل سريع للسؤال</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {questions.map((q, idx) => {
                  const qSection = SECTION_INFO[q.type]
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                        idx === currentIndex
                          ? `bg-gradient-to-r ${qSection?.color || 'from-purple-500 to-pink-500'}`
                          : answers[q.id]
                            ? 'bg-green-500/50'
                            : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
