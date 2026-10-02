'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Trophy, Brain, BookOpen, Keyboard, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

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

interface TestWordsTabProps {
  isActive: boolean
  hasSubscription?: boolean
}

export default function TestWordsTab({ isActive, hasSubscription = false }: TestWordsTabProps) {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
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
      const words = Array.isArray(data) ? data : (data.words || [])
      const knownWords = words.filter((w: Word) => w.known)

      if (knownWords.length < 5) {
        toast.error(t('تحتاج إلى 5 كلمات معروفة على الأقل لبدء الاختبار', 'You need at least 5 known words to start the test'))
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
      toast.error(t('حدث خطأ في تحميل الكلمات', 'An error occurred while loading words'))
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

  if (!isActive) {
    return (
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-4">
          {t('اختبر نفسك', 'Test yourself')}
        </h2>
        <Alert variant="warning">
          <p>{t('قم بتفعيل حسابك للوصول لهذه الميزة', 'Activate your account to access this feature')}</p>
        </Alert>
      </div>
    )
  }

  if (!mode) {
    return (
      <div className="space-y-6" dir={localeDirection(language)}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black">{t('اختبر نفسك', 'Test yourself')}</h1>
          </div>
          <p className="text-black text-lg">{t('اختبر حصيلتك من المفردات', 'Test your vocabulary knowledge')}</p>
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
            <h3 className="text-2xl font-bold text-black mb-2">{t('اختيار من متعدد', 'Multiple choice')}</h3>
            <p className="text-black text-sm mt-3">{t('اختر الإجابة الصحيحة من 4 خيارات', 'Choose the correct answer from 4 options')}</p>
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
            <h3 className="text-2xl font-bold text-black mb-2">{t('اختبار الكتابة', 'Writing test')}</h3>
            <p className="text-black text-sm mt-3">{t('اكتب الإجابة الصحيحة بنفسك', 'Type the correct answer yourself')}</p>
          </motion.button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-black text-2xl">{t('جاري تحميل الأسئلة...', 'Loading questions...')}</div>
      </div>
    )
  }

  if (testComplete) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white border-2 border-blue-600 rounded-3xl p-12 text-center shadow-xl max-w-2xl mx-auto"
        >
          <Trophy className="h-24 w-24 text-blue-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-black mb-4">{t('انتهى الاختبار!', 'Test complete!')}</h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">{percentage}%</div>
          <p className="text-2xl text-black mb-8">
            {t(`${score} من ${questions.length} إجابة صحيحة`, `${score} of ${questions.length} correct answers`)}
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
                  {t('الإجابة: ', 'Answer: ')}{q.correctAnswer}
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
              {t('اختبار جديد', 'New test')}
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
      <div className="space-y-6" dir={localeDirection(language)}>
      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-black font-semibold">
            {t(`السؤال ${currentIndex + 1} من ${questions.length}`, `Question ${currentIndex + 1} of ${questions.length}`)}
          </span>
          <span className="text-black font-semibold">{t('النقاط: ', 'Points: ')}{score}</span>
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
          className="bg-white border-2 border-blue-600 rounded-3xl p-12 shadow-xl max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-black mb-4">
              {currentQuestion.type === 'en-to-ar' 
                ? currentQuestion.word.englishWord
                : currentQuestion.word.arabicMeaning}
            </h3>
            <p className="text-black opacity-70">
              {currentQuestion.type === 'en-to-ar' 
                ? t('ما معنى هذه الكلمة بالعربية؟', 'What does this word mean in Arabic?')
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
                placeholder={t('اكتب الإجابة هنا...', 'Type your answer...')}
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
                {t('تأكيد', 'Submit')} <ArrowRight className="h-5 w-5 mr-2" />
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
                  {isCorrect ? t('صحيح!', 'Correct!') : t('خطأ!', 'Incorrect!')}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-black">
                  {t('الإجابة الصحيحة: ', 'Correct answer: ')}<strong>{currentQuestion.correctAnswer}</strong>
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
