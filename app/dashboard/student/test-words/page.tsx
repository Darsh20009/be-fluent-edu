'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Trophy, Brain, BookOpen, Keyboard, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Word {
  id: string
  englishWord: string
  arabicMeaning: string
  exampleSentence: string
  known: boolean
}

type TestMode = 'select' | 'multiple-choice' | 'writing'
type QuestionType = 'en-to-ar' | 'ar-to-en'

interface Question {
  word: Word
  type: QuestionType
  options?: string[]
  correctAnswer: string
}

export default function TestWordsPage() {
  const [mode, setMode] = useState<TestMode | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testComplete, setTestComplete] = useState(false)

  const loadWords = async (testMode: TestMode) => {
    setLoading(true)
    try {
      const res = await fetch('/api/words')
      const data = await res.json()
      const knownWords = data.words.filter((w: Word) => w.known)

      if (knownWords.length < 5) {
        alert('تحتاج على الأقل 5 كلمات معروفة لبدء الاختبار')
        setMode(null)
        setLoading(false)
        return
      }

      const shuffled = knownWords.sort(() => Math.random() - 0.5).slice(0, 10)
      const generatedQuestions = shuffled.map((word: Word) => {
        const questionType: QuestionType = Math.random() > 0.5 ? 'en-to-ar' : 'ar-to-en'

        if (testMode === 'multiple-choice') {
          const correctAnswer = questionType === 'en-to-ar' ? word.arabicMeaning : word.englishWord
          const wrongOptions = knownWords
            .filter((w: Word) => w.id !== word.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((w: Word) => questionType === 'en-to-ar' ? w.arabicMeaning : w.englishWord)

          const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5)

          return {
            word,
            type: questionType,
            options,
            correctAnswer
          }
        }

        return {
          word,
          type: questionType,
          correctAnswer: questionType === 'en-to-ar' ? word.arabicMeaning : word.englishWord
        }
      })

      setQuestions(generatedQuestions)
      setCurrentIndex(0)
      setScore(0)
      setAnswers([])
      setTestComplete(false)
    } catch (error) {
      console.error('Error loading words:', error)
      alert('حدث خطأ في تحميل الكلمات')
      setMode(null)
    }
    setLoading(false)
  }

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex]
    const correct = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
      setAnswers([...answers, true])
    } else {
      setAnswers([...answers, false])
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setUserAnswer('')
        setShowResult(false)
      } else {
        setTestComplete(true)
      }
    }, 2000)
  }

  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    checkSubscription()
  }, [])

  async function checkSubscription() {
    try {
      const response = await fetch('/api/student/subscription-status')
      if (response.ok) {
        const data = await response.json()
        setHasSubscription(data.hasApprovedSubscription)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg border-2 border-[#d4c9b8]">
          <div className="mb-4 flex justify-center">
            <div className="bg-orange-500 p-4 rounded-full">
              <Trophy className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#10B981] mb-3">Premium Feature</h2>
          <p className="text-gray-700 mb-6">
            هذه الميزة متاحة فقط للمشتركين / This feature is only available for subscribers
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/student?tab=packages'}
            className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            ✨ اشترك الآن / Subscribe Now ✨
          </button>
        </div>
      </div>
    )
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-black">اختبر نفسك</h1>
            </div>
            <p className="text-black text-lg">Test Your Vocabulary Knowledge</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMode('multiple-choice')
                loadWords('multiple-choice')
              }}
              className="bg-white border-2 border-blue-600 rounded-2xl p-8 text-left shadow-lg hover:shadow-xl transition-all"
            >
              <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">اختيار من متعدد</h3>
              <p className="text-black opacity-70">Multiple Choice Test</p>
              <p className="text-black text-sm mt-3">اختر الإجابة الصحيحة من 4 خيارات</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMode('writing')
                loadWords('writing')
              }}
              className="bg-white border-2 border-blue-600 rounded-2xl p-8 text-left shadow-lg hover:shadow-xl transition-all"
            >
              <Keyboard className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-black mb-2">اختبار الكتابة</h3>
              <p className="text-black opacity-70">Writing Test</p>
              <p className="text-black text-sm mt-3">اكتب الإجابة الصحيحة بنفسك</p>
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-black text-2xl">جاري تحميل الأسئلة...</div>
      </div>
    )
  }

  if (testComplete) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white border-2 border-blue-600 rounded-3xl p-12 text-center shadow-xl"
          >
            <Trophy className="h-24 w-24 text-blue-600 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-black mb-4">انتهى الاختبار!</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">{percentage}%</div>
            <p className="text-2xl text-black mb-8">
              {score} من {questions.length} إجابة صحيحة
            </p>

            <div className="space-y-3 mb-8">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${
                    answers[idx] 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-black font-semibold">
                      {q.type === 'en-to-ar' ? q.word.englishWord : q.word.arabicMeaning}
                    </span>
                    {answers[idx] ? (
                      <Check className="h-6 w-6 text-green-600" />
                    ) : (
                      <X className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="text-sm text-black opacity-70 mt-1">
                    الإجابة: {q.correctAnswer}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setMode(null)
                  setTestComplete(false)
                }}
              >
                اختبار جديد
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = '/dashboard/student'}
              >
                العودة للوحة التحكم
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-black font-semibold">
              السؤال {currentIndex + 1} من {questions.length}
            </span>
            <span className="text-black font-semibold">النقاط: {score}</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 border-2 border-blue-600">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="bg-white border-2 border-blue-600 rounded-3xl p-12 shadow-xl"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-black mb-4">
                {currentQuestion.type === 'en-to-ar' 
                  ? currentQuestion.word.englishWord
                  : currentQuestion.word.arabicMeaning}
              </h3>
              <p className="text-black opacity-70">
                {currentQuestion.type === 'en-to-ar' 
                  ? 'ما معنى هذه الكلمة بالعربي؟'
                  : 'What is the English word for this?'}
              </p>
            </div>

            {mode === 'multiple-choice' && currentQuestion.options ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !showResult && handleAnswer(option)}
                    disabled={showResult}
                    className={`w-full p-6 rounded-xl border-2 text-left font-semibold text-lg transition-all ${
                      showResult
                        ? option === currentQuestion.correctAnswer
                          ? 'bg-green-500 border-green-600 text-white'
                          : 'bg-gray-200 border-gray-300 text-black opacity-50'
                        : 'bg-white border-blue-600 text-black hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && option === currentQuestion.correctAnswer && (
                        <Check className="h-6 w-6" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="اكتب الإجابة هنا..."
                  disabled={showResult}
                  inputSize="lg"
                  className="mb-4 text-black"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && userAnswer.trim() && !showResult) {
                      handleAnswer(userAnswer)
                    }
                  }}
                />
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => handleAnswer(userAnswer)}
                  disabled={!userAnswer.trim() || showResult}
                >
                  تأكيد <ArrowRight className="h-5 w-5 mr-2" />
                </Button>
              </div>
            )}

            {showResult && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`mt-6 p-6 rounded-xl border-2 ${
                  isCorrect 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {isCorrect ? (
                    <Check className="h-8 w-8 text-green-600" />
                  ) : (
                    <X className="h-8 w-8 text-red-600" />
                  )}
                  <span className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'صحيح!' : 'خطأ!'}
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-black">
                    الإجابة الصحيحة: <strong>{currentQuestion.correctAnswer}</strong>
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}