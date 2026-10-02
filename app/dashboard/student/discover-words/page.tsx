'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Star, Sparkles, Brain, Trophy, ArrowRight, Volume2, Filter, ChevronDown, Image as ImageIcon, BookOpen, Layers } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

interface Word {
  word: string
  arabic: string
  example: string
  imageUrl?: string
  category?: string
}

interface Category {
  id: string
  name: string
  nameEn: string
  icon: string
  count: number
}

export default function DiscoverWordsPage() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [category, setCategory] = useState<string>('all')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showExample, setShowExample] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [totalWords, setTotalWords] = useState(0)
  const [knownWords, setKnownWords] = useState(0)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadWords()
  }, [level, category])

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/words/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadWords = async () => {
    setLoading(true)
    setImageLoaded(false)
    try {
      const url = category === 'all' 
        ? `/api/words/discover?level=${level}`
        : `/api/words/discover?level=${level}&category=${category}`
      const res = await fetch(url)
      const data = await res.json()
      setWords(data.words || [])
      setTotalWords(data.totalAvailable || 0)
      setKnownWords(data.knownCount || 0)
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
        imageUrl: currentWord.imageUrl,
        known: known
      })
    })

    if (known) {
      setScore(score + 10)
      setStreak(streak + 1)
      setKnownWords(knownWords + 1)
    } else {
      setStreak(0)
    }

    setImageLoaded(false)
    
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowExample(false)
    } else {
      loadWords()
    }
  }

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId)
    return cat ? (language === 'ar' ? cat.name : cat.nameEn) : catId
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <BookOpen className="absolute inset-0 m-auto h-10 w-10 text-blue-600" />
          </div>
          <p className="text-xl text-gray-700 font-medium">{t('جاري تحميل الكلمات...', 'Loading words...')}</p>
        </div>
      </div>
    )
  }

  const currentWord = words[currentIndex]

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('أحسنت', 'Well done')}</h2>
          <p className="text-gray-600 mb-6">
            {t('لقد راجعت جميع الكلمات المتاحة في هذا المستوى', 'You reviewed all available words at this level')}
            {category !== 'all' && ` ${t('وهذه الفئة', 'and in this category')} (${getCategoryName(category)})`}!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setCategory('all')
                loadWords()
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('جميع الفئات', 'All categories')}
            </button>
            <button
              onClick={() => loadWords()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              {t('إعادة المحاولة', 'Try again')}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('اكتشف الكلمات', 'Discover words')}</h1>
                <p className="text-gray-500 text-sm">Discover New Words</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 px-5 py-3 rounded-xl text-center">
                <Star className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                <div className="text-xl font-bold text-gray-900">{score}</div>
                <div className="text-xs text-gray-500">{t('النقاط', 'Points')}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 px-5 py-3 rounded-xl text-center">
                <Sparkles className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <div className="text-xl font-bold text-gray-900">{streak}</div>
                <div className="text-xs text-gray-500">{t('التتابع', 'Streak')}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level & Category Filters */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Level Selector */}
          <div className="flex gap-2 justify-center flex-wrap">
            {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                  level === lvl
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {lvl === 'beginner' && t('مبتدئ', 'Beginner')}
                {lvl === 'intermediate' && t('متوسط', 'Intermediate')}
                {lvl === 'advanced' && t('متقدم', 'Advanced')}
              </button>
            ))}
          </div>

          {/* Category Filter Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>{t('تصفية حسب الفئة', 'Filter by category')}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Category Grid */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        category === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('جميع الفئات', 'All categories')}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          category === cat.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Bar */}
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              {t(`${totalWords} كلمة متاحة`, `${totalWords} words available`)}
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              {t(`${knownWords} كلمة تعرفها`, `${knownWords} words known`)}
            </span>
          </div>
        </motion.div>

        {/* Word Card */}
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${currentWord.word}`}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
              {/* Image Section */}
              {currentWord.imageUrl && (
                <div className="relative h-48 md:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-12 w-12 text-gray-300 animate-pulse" />
                        <span className="text-gray-400 text-sm">{t('جاري تحميل الصورة...', 'Loading image...')}</span>
                      </div>
                    </div>
                  )}
                  <img 
                    src={currentWord.imageUrl} 
                    alt={currentWord.word}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(currentWord.word)}`
                      setImageLoaded(true)
                    }}
                  />
                  
                  {/* Category Badge */}
                  {currentWord.category && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                      {getCategoryName(currentWord.category)}
                    </div>
                  )}

                  {/* Progress Indicator */}
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                    {currentIndex + 1} / {words.length}
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div className="p-6 md:p-8">
                {/* Progress Dots */}
                <div className="flex justify-center gap-1.5 mb-6">
                  {words.slice(0, 10).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'w-8 bg-blue-600'
                          : idx < currentIndex
                          ? 'w-1.5 bg-blue-400'
                          : 'w-1.5 bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* English Word */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3">
                    <motion.h2 
                      className="text-4xl md:text-5xl font-bold text-gray-900"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      {currentWord.word}
                    </motion.h2>
                    <button
                      onClick={() => speakWord(currentWord.word)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                      title={t('نطق الكلمة', 'Pronounce word')}
                    >
                      <Volume2 className="h-5 w-5 text-blue-600" />
                    </button>
                  </div>
                </div>

                {/* Arabic Meaning */}
                <div className="text-center mb-6">
                  <p className="text-2xl font-bold text-indigo-700" dir="rtl">
                    {currentWord.arabic}
                  </p>
                </div>

                {/* Example Toggle */}
                <div className="text-center mb-6">
                  <button
                    onClick={() => setShowExample(!showExample)}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    {showExample ? t('إخفاء المثال', 'Hide example') : t('عرض مثال', 'Show example')}
                  </button>
                </div>

                {/* Example Sentence */}
                <AnimatePresence>
                  {showExample && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-6"
                    >
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => speakWord(currentWord.example)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                          >
                            <Volume2 className="h-4 w-4 text-blue-600" />
                          </button>
                          <span className="text-xs text-blue-600 font-medium">{t('مثال', 'Example')}</span>
                        </div>
                        <p className="text-gray-700 italic text-lg">"{currentWord.example}"</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleResponse(false)}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <X className="h-6 w-6" />
                    <span>{t('لا أعرفها', 'I don’t know it')}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleResponse(true)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Check className="h-6 w-6" />
                    <span>{t('أعرفها!', 'I know it!')}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Tips */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-gray-500 bg-white/50 rounded-xl p-4"
          >
            <p>{t('جميع الكلمات تُضاف تلقائياً لقائمة "كلماتي" للمراجعة لاحقاً', 'All words are automatically added to “My Words” for later review')}</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
