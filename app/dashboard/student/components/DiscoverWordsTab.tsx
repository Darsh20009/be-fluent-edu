'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Star, Sparkles, Brain, Trophy } from 'lucide-react'
import Alert from '@/components/ui/Alert'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

interface Word {
  word: string
  arabic: string
  example: string
  imageUrl?: string
}

interface DiscoverWordsTabProps {
  isActive: boolean
}

export default function DiscoverWordsTab({ isActive }: DiscoverWordsTabProps) {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => {
    if (isActive) {
      loadWords()
    }
  }, [level, isActive])

  const loadWords = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/words/discover?level=${level}`)
      const data = await res.json()
      setWords(data.words)
      setCurrentIndex(0)
      setShowExample(false)
    } catch (error) {
      console.error('Error loading words:', error)
    }
    setLoading(false)
  }

  const handleResponse = async (known: boolean) => {
    const currentWord = words[currentIndex]

    await fetch('/api/words/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: currentWord.word,
        arabic: currentWord.arabic,
        example: currentWord.example,
        known: known
      })
    })

    if (known) {
      setScore(score + 10)
      setStreak(streak + 1)
    } else {
      setStreak(0)
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowExample(false)
    } else {
      loadWords()
    }
  }

  if (!isActive) {
    return (
    <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-4">
          {t('اكتشف الكلمات الجديدة', 'Discover new words')}
        </h2>
        <Alert variant="warning">
          <p>{t('قم بتفعيل حسابك للوصول لهذه الميزة', 'Activate your account to access this feature')}</p>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-800 text-2xl flex items-center gap-3">
          <Sparkles className="animate-spin h-8 w-8 text-blue-600" />
          <span>{t('جاري تحميل الكلمات...', 'Loading words...')}</span>
        </div>
      </div>
    )
  }

  const currentWord = words[currentIndex]

  return (
    <div className="space-y-6" dir={localeDirection(language)}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/80 border-2 border-blue-200 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('اكتشف الكلمات الجديدة', 'Discover new words')}</h1>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-blue-50 border-2 border-blue-500 px-6 py-3 rounded-xl text-center">
            <Star className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-2xl font-bold text-gray-900">{score}</div>
            <div className="text-xs text-gray-600">{t('النقاط', 'Points')}</div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-400 px-6 py-3 rounded-xl text-center">
            <Trophy className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-2xl font-bold text-gray-900">{streak}</div>
            <div className="text-xs text-gray-600">{t('التتابع', 'Streak')}</div>
          </div>
        </div>
      </motion.div>

      {/* Level Selector */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 justify-center"
      >
        {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setLevel(lvl)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all border-2 ${
              level === lvl
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110'
                : 'bg-white text-gray-900 border-blue-300 hover:border-blue-600 hover:text-blue-600'
            }`}
          >
            {lvl === 'beginner' && t('مبتدئ', 'Beginner')}
            {lvl === 'intermediate' && t('متوسط', 'Intermediate')}
            {lvl === 'advanced' && t('متقدم', 'Advanced')}
          </button>
        ))}
      </motion.div>

      {/* Word Card */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={currentIndex}
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-white border-2 border-blue-200 rounded-3xl shadow-xl p-12 text-center relative overflow-hidden"
            >
              {/* Background Decoration */}

              {/* Word with Image */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Image */}
                {currentWord.imageUrl && (
                  <div className="mb-6 relative w-64 h-64 mx-auto rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={currentWord.imageUrl} 
                      alt={currentWord.word}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <div className="inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl mb-6">
                  <h2 className="text-6xl font-bold">{currentWord.word}</h2>
                </div>

                {/* Progress */}
                <div className="flex justify-center gap-2 mb-8">
                  {words.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'w-12 bg-blue-600'
                          : idx < currentIndex
                          ? 'w-2 bg-blue-400'
                          : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {language === 'ar' && <div className="mb-8">
                  <p className="text-3xl font-bold text-gray-900 mb-2" dir="rtl">{currentWord.arabic}</p>
                </div>}

                {/* Example Toggle */}
                <button
                  onClick={() => setShowExample(!showExample)}
                  className="mb-6 flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <Sparkles className="h-5 w-5" />
                  {showExample ? t('إخفاء المثال', 'Hide example') : t('عرض المثال', 'Show example')}
                </button>

                {showExample && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200"
                  >
                    <p className="text-lg text-gray-900 italic">"{currentWord.example}"</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleResponse(false)}
                    className="flex-1 max-w-xs bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
                  >
                    <X className="h-8 w-8" />
                    <span>{t('لا أعرفها', "I don't know it")}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleResponse(true)}
                    className="flex-1 max-w-xs bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3 transition-colors"
                  >
                    <Check className="h-8 w-8" />
                    <span>{t('أعرفها!', 'I know it!')}</span>
                  </motion.button>
                </div>

                {/* Tips */}
                <div className="mt-8 text-sm text-gray-900 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p>{language === 'ar' ? <><strong>جميع الكلمات</strong> ستُضاف تلقائياً لقائمة "كلماتي" - الكلمات التي تعرفها ستُعلم كـ "معروفة"</> : <>All words are automatically added to "My Words"—words you know are marked as known.</>}</p>
                  <p className="mt-2">{t('الكلمات التي لا تعرفها ستُحفظ كـ "غير معروفة" لمراجعتها لاحقاً', 'Words you do not know are saved as unknown for later review.')}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
