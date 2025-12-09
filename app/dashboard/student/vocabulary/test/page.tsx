'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  ChevronRight,
  Check,
  X,
  Trophy,
  RotateCcw,
  BookOpen,
  Pencil
} from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  type: 'multiple_choice' | 'writing'
  word: string
  question: string
  questionEn: string
  options?: string[]
  correctAnswer: string
  example: string
}

interface TestResult {
  word: string
  correct: boolean
  userAnswer: string
  correctAnswer: string
}

export default function VocabularyTestPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [results, setResults] = useState<{
    score: number
    correctCount: number
    totalQuestions: number
    results: TestResult[]
  } | null>(null)
  const [settings, setSettings] = useState({
    mode: 'mixed',
    count: 10,
    source: 'database',
    level: 'beginner'
  })
  const [writingAnswer, setWritingAnswer] = useState('')

  const startTest = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        mode: settings.mode,
        count: settings.count.toString(),
        source: settings.source,
        level: settings.level
      })
      
      const res = await fetch(`/api/vocabulary/test?${params}`)
      const data = await res.json()
      
      if (data.error) {
        alert(data.error)
        setLoading(false)
        return
      }

      setQuestions(data.questions)
      setCurrentIndex(0)
      setAnswers({})
      setTestStarted(true)
      setTestCompleted(false)
      setResults(null)
    } catch (error) {
      console.error('Error starting test:', error)
    }
    setLoading(false)
  }

  const submitAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex]
    setAnswers({ ...answers, [currentQuestion.id]: answer })
    
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
        setWritingAnswer('')
      }, 300)
    }
  }

  const finishTest = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/vocabulary/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, questions })
      })
      const data = await res.json()
      setResults(data)
      setTestCompleted(true)
    } catch (error) {
      console.error('Error submitting test:', error)
    }
    setLoading(false)
  }

  const restartTest = () => {
    setTestStarted(false)
    setTestCompleted(false)
    setQuestions([])
    setAnswers({})
    setResults(null)
    setCurrentIndex(0)
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/dashboard/student/vocabulary"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronRight className="h-5 w-5" />
              <span>العودة</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">اختبار المفردات</h1>
              <p className="text-gray-600">اختبر معرفتك بالكلمات الإنجليزية</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الأسئلة
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'multiple_choice', label: 'اختيار متعدد', icon: BookOpen },
                    { id: 'writing', label: 'كتابة', icon: Pencil },
                    { id: 'mixed', label: 'مختلط', icon: GraduationCap }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSettings({ ...settings, mode: m.id })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        settings.mode === m.id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <m.icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مصدر الكلمات
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSettings({ ...settings, source: 'my_words' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      settings.source === 'my_words'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    كلماتي المحفوظة
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, source: 'database' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      settings.source === 'database'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    قاعدة الكلمات
                  </button>
                </div>
              </div>

              {settings.source === 'database' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المستوى
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['beginner', 'intermediate', 'advanced'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setSettings({ ...settings, level: l })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          settings.level === l
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {l === 'beginner' ? 'مبتدئ' : l === 'intermediate' ? 'متوسط' : 'متقدم'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الأسئلة: {settings.count}
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={settings.count}
                  onChange={(e) => setSettings({ ...settings, count: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>

              <button
                onClick={startTest}
                disabled={loading}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'جاري التحميل...' : 'ابدأ الاختبار'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (testCompleted && results) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-sm text-center"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              results.score >= 70 ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              <Trophy className={`h-12 w-12 ${
                results.score >= 70 ? 'text-green-600' : 'text-orange-600'
              }`} />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {results.score >= 90 ? 'ممتاز!' : results.score >= 70 ? 'جيد جداً!' : 'حاول مرة أخرى'}
            </h2>
            
            <p className="text-6xl font-bold text-green-600 mb-4">
              {results.score}%
            </p>
            
            <p className="text-gray-600 mb-8">
              أجبت على {results.correctCount} من {results.totalQuestions} سؤال بشكل صحيح
            </p>

            <div className="space-y-3 mb-8 max-h-64 overflow-y-auto">
              {results.results.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${
                    r.correct ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.word}</span>
                    {r.correct ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  {!r.correct && (
                    <div className="mt-2 text-sm">
                      <p className="text-red-600">إجابتك: {r.userAnswer || 'لم تجب'}</p>
                      <p className="text-green-600">الإجابة الصحيحة: {r.correctAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={restartTest}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span>اختبار جديد</span>
              </button>
              <Link
                href="/dashboard/student/vocabulary"
                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center"
              >
                العودة للقائمة
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              السؤال {currentIndex + 1} من {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl p-8 shadow-sm"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                {currentQuestion.word}
              </h2>
              <p className="text-gray-600">{currentQuestion.question}</p>
            </div>

            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => submitAnswer(option)}
                    className={`w-full p-4 rounded-xl border-2 text-right transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'writing' && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={writingAnswer}
                  onChange={(e) => setWritingAnswer(e.target.value)}
                  placeholder="اكتب الإجابة هنا..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-xl focus:border-green-500 focus:ring-0"
                  autoFocus
                />
                <button
                  onClick={() => {
                    submitAnswer(writingAnswer)
                    setWritingAnswer('')
                  }}
                  disabled={!writingAnswer.trim()}
                  className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  تأكيد
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentIndex === questions.length - 1 && Object.keys(answers).length === questions.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <button
              onClick={finishTest}
              disabled={loading}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري التصحيح...' : 'إنهاء الاختبار'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
