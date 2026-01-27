'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowUp, 
  ArrowRight, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  RefreshCcw,
  Target,
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface LevelProgress {
  success: boolean
  currentLevel: string
  currentLevelName: string
  initialLevel: string | null
  initialLevelName: string | null
  performanceScore: number
  suggestedLevel: string
  suggestedLevelName: string
  levelDifference: number
  shouldAdjust: boolean
  progressPercentage: number
  metrics: {
    wordsKnownPercentage: number
    wordsCorrectRate: number
    exercisesCorrectRate: number
    lessonsCompletionRate: number
    writingAverageScore: number
    overallScore: number
    dataPoints: number
  }
  recommendations: string[]
  skillRequirements: {
    vocabulary: string
    grammar: string
    speaking: string
    writing: string
  }
  colors: { bg: string; text: string; border: string }
  needsPlacementTest?: boolean
}

export default function LevelProgressPage() {
  const [progress, setProgress] = useState<LevelProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjusting, setAdjusting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchProgress = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/student/level-progress?lang=ar')
      const data = await res.json()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [])

  const handleAutoAdjust = async () => {
    setAdjusting(true)
    setMessage(null)
    try {
      const res = await fetch('/api/student/level-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto' })
      })
      const data = await res.json()
      
      if (data.adjusted) {
        setMessage({ type: 'success', text: data.message })
        await fetchProgress()
      } else {
        setMessage({ type: 'error', text: data.reason || 'لا يمكن تعديل المستوى حالياً' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تعديل المستوى' })
    } finally {
      setAdjusting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل بيانات المستوى...</p>
        </div>
      </div>
    )
  }

  if (progress?.needsPlacementTest) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-800 mb-4">اختبار تحديد المستوى مطلوب</h2>
          <p className="text-amber-700 mb-6">
            لم يتم العثور على ملف الطالب. يرجى إكمال اختبار تحديد المستوى أولاً لتحديد مستواك في اللغة الإنجليزية.
          </p>
          <a 
            href="/placement-test" 
            className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition"
          >
            ابدأ اختبار تحديد المستوى
            <ChevronRight className="w-5 h-5 rotate-180" />
          </a>
        </div>
      </div>
    )
  }

  if (!progress?.success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-4">حدث خطأ</h2>
          <p className="text-red-700 mb-6">تعذر تحميل بيانات المستوى. يرجى المحاولة مرة أخرى.</p>
          <button 
            onClick={fetchProgress}
            className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition"
          >
            <RefreshCcw className="w-5 h-5" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  const levelColors: Record<string, { gradient: string; ring: string }> = {
    A1: { gradient: 'from-red-400 to-red-600', ring: 'ring-red-300' },
    A2: { gradient: 'from-orange-400 to-orange-600', ring: 'ring-orange-300' },
    B1: { gradient: 'from-yellow-400 to-yellow-600', ring: 'ring-yellow-300' },
    B2: { gradient: 'from-blue-400 to-blue-600', ring: 'ring-blue-300' },
    C1: { gradient: 'from-purple-400 to-purple-600', ring: 'ring-purple-300' }
  }

  const currentColors = levelColors[progress.currentLevel] || levelColors.A1
  const suggestedColors = levelColors[progress.suggestedLevel] || levelColors.A1

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" dir="rtl">
      <Link
        href="/dashboard/student"
        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors mb-4"
      >
        <ChevronRight className="w-5 h-5" />
        <span>العودة للوحة التحكم</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">تقدم مستوى اللغة الإنجليزية</h1>
            <p className="text-gray-500">تتبع مستواك وتقدمك في تعلم اللغة</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">المستوى الحالي</p>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${currentColors.gradient} flex items-center justify-center ring-4 ${currentColors.ring} shadow-lg`}
            >
              <span className="text-4xl font-bold text-white">{progress.currentLevel}</span>
            </motion.div>
            <p className="mt-3 text-lg font-semibold text-gray-700">{progress.currentLevelName}</p>
            {progress.initialLevel && progress.initialLevel !== progress.currentLevel && (
              <p className="text-sm text-gray-400 mt-1">
                المستوى الأولي: {progress.initialLevel} ({progress.initialLevelName})
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">التقدم في المستوى الحالي</span>
                <span className="text-sm font-semibold text-gray-700">{Math.round(progress.progressPercentage)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progressPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-l ${currentColors.gradient}`}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-gray-700">درجة الأداء</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-800">{progress.performanceScore}</span>
                <span className="text-gray-500">/ 100</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                بناءً على {progress.metrics.dataPoints} نشاط
              </p>
            </div>

            {progress.shouldAdjust && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  {progress.levelDifference > 0 ? (
                    <ArrowUp className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <ArrowRight className="w-6 h-6 text-amber-500" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-700">
                      {progress.levelDifference > 0 ? 'يمكنك الترقية!' : 'تعديل مستوى متاح'}
                    </p>
                    <p className="text-sm text-gray-500">
                      المستوى المقترح: {progress.suggestedLevel} ({progress.suggestedLevelName})
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAutoAdjust}
                  disabled={adjusting}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {adjusting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري التعديل...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-5 h-5" />
                      تحديث المستوى تلقائياً
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-4 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">مقاييس الأداء</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            label="الكلمات المعروفة"
            value={progress.metrics.wordsKnownPercentage}
            icon={<BookOpen className="w-5 h-5" />}
            color="text-emerald-500"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            label="دقة الكلمات"
            value={progress.metrics.wordsCorrectRate}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="text-blue-500"
            bgColor="bg-blue-50"
          />
          <MetricCard
            label="دقة التمارين"
            value={progress.metrics.exercisesCorrectRate}
            icon={<Target className="w-5 h-5" />}
            color="text-purple-500"
            bgColor="bg-purple-50"
          />
          <MetricCard
            label="إتمام الدروس"
            value={progress.metrics.lessonsCompletionRate}
            icon={<Star className="w-5 h-5" />}
            color="text-amber-500"
            bgColor="bg-amber-50"
          />
          <MetricCard
            label="متوسط الكتابة"
            value={progress.metrics.writingAverageScore}
            icon={<Award className="w-5 h-5" />}
            color="text-rose-500"
            bgColor="bg-rose-50"
          />
          <MetricCard
            label="الدرجة الإجمالية"
            value={progress.metrics.overallScore}
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-teal-500"
            bgColor="bg-teal-50"
            highlighted
          />
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Lightbulb className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">توصيات لتحسين مستواك</h2>
          </div>

          <div className="space-y-3">
            {progress.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl"
              >
                <div className="p-1 bg-amber-200 rounded-full mt-0.5">
                  <ChevronRight className="w-4 h-4 text-amber-700 rotate-180" />
                </div>
                <p className="text-gray-700">{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${currentColors.gradient}`}>
              <Award className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">متطلبات المستوى {progress.currentLevel}</h2>
          </div>

          <div className="space-y-3">
            <SkillRequirement label="المفردات" value={progress.skillRequirements.vocabulary} />
            <SkillRequirement label="القواعد" value={progress.skillRequirements.grammar} />
            <SkillRequirement label="التحدث" value={progress.skillRequirements.speaking} />
            <SkillRequirement label="الكتابة" value={progress.skillRequirements.writing} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  icon, 
  color, 
  bgColor,
  highlighted = false 
}: { 
  label: string
  value: number
  icon: React.ReactNode
  color: string
  bgColor: string
  highlighted?: boolean
}) {
  return (
    <div className={`p-4 rounded-xl ${highlighted ? 'bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200' : bgColor}`}>
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}%</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function SkillRequirement({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <span className="w-20 text-sm font-medium text-gray-500">{label}:</span>
      <span className="text-gray-700 flex-1">{value}</span>
    </div>
  )
}
