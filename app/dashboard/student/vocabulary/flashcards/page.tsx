'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layers, 
  Volume2, 
  RotateCcw,
  ChevronRight,
  Check,
  X,
  Brain,
  Star,
  Clock,
  Plus,
  Image as ImageIcon,
  Upload
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

interface FlashCard {
  id: string
  word: string
  arabic: string
  example: string
  imageUrl?: string
  audioUrl?: string
  known: boolean
  reviewCount: number
  correctCount: number
  incorrectCount: number
}

interface Stats {
  totalWords: number
  dueForReview: number
  mastered: number
  totalCorrect: number
  totalIncorrect: number
}

export default function FlashcardsPage() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [cards, setCards] = useState<FlashCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'review' | 'new' | 'all'>('review')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWord, setNewWord] = useState({ word: '', arabic: '', example: '' })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchCards()
  }, [mode])

  const fetchCards = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/vocabulary/flashcards?mode=${mode}&limit=20`)
      const data = await res.json()
      setCards(data.cards || [])
      setStats(data.stats)
      setCurrentIndex(0)
      setIsFlipped(false)
    } catch (error) {
      console.error('Error fetching cards:', error)
    }
    setLoading(false)
  }

  const handleResponse = async (quality: number) => {
    const currentCard = cards[currentIndex]
    try {
      await fetch('/api/vocabulary/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentCard.id,
          quality,
          action: 'review'
        })
      })

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setIsFlipped(false)
      } else {
        fetchCards()
      }
    } catch (error) {
      console.error('Error submitting response:', error)
    }
  }

  const handleAddWord = async () => {
    if (!newWord.word || !newWord.arabic) return

    try {
      await fetch('/api/vocabulary/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWord,
          action: 'add'
        })
      })
      setNewWord({ word: '', arabic: '', example: '' })
      setShowAddForm(false)
      fetchCards()
    } catch (error) {
      console.error('Error adding word:', error)
    }
  }

  const playAudio = () => {
    const currentCard = cards[currentIndex]
    if (currentCard?.audioUrl && audioRef.current) {
      audioRef.current.src = currentCard.audioUrl
      audioRef.current.play()
    } else {
      const utterance = new SpeechSynthesisUtterance(currentCard.word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <Layers className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{t('جاري تحميل البطاقات...', 'Loading flashcards...')}</p>
        </div>
      </div>
    )
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8">
      <audio ref={audioRef} className="hidden" />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/dashboard/student/vocabulary"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ChevronRight className="h-5 w-5" />
            <span>{t('العودة', 'Back')}</span>
          </Link>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-5 w-5" />
            <span>{t('إضافة كلمة', 'Add a word')}</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('بطاقات التكرار', 'Flashcards')}
          </h1>
          <p className="text-gray-600">
            {t('راجع كلماتك باستخدام نظام التكرار المتباعد', 'Review your words with spaced repetition')}
          </p>
        </motion.div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.dueForReview}</p>
              <p className="text-sm text-gray-500">{t('للمراجعة', 'Due')}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.mastered}</p>
              <p className="text-sm text-gray-500">{t('تم إتقانها', 'Mastered')}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.totalWords}</p>
              <p className="text-sm text-gray-500">{t('إجمالي', 'Total')}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'review', label: t('للمراجعة', 'Due') },
            { id: 'new', label: t('جديدة', 'New') },
            { id: 'all', label: t('الكل', 'All') }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as typeof mode)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === m.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-sm"
          >
            <Layers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('لا توجد بطاقات', 'No flashcards')}</h3>
            <p className="text-gray-500 mb-6">
              {mode === 'review' 
                ? t('لا توجد كلمات تحتاج مراجعة حالياً', 'No words are due for review right now')
                : t('أضف كلمات جديدة لبدء التعلم', 'Add new words to start learning')}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
            >
              {t('إضافة كلمة جديدة', 'Add a new word')}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="perspective-1000 mb-8">
              <motion.div
                className="relative w-full h-80 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <div 
                  className="absolute inset-0 bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {currentCard?.imageUrl && (
                    <img 
                      src={currentCard.imageUrl}
                      alt={currentCard.word}
                      className="h-24 w-24 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h2 className="text-5xl font-bold text-gray-800 mb-4">
                    {currentCard?.word}
                  </h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playAudio()
                    }}
                    className="p-3 rounded-full bg-purple-100 hover:bg-purple-200"
                  >
                    <Volume2 className="h-6 w-6 text-purple-600" />
                  </button>
                  <p className="text-gray-400 mt-4">{t('اضغط للقلب', 'Tap to flip')}</p>
                </div>

                <div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-white"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <p className="text-4xl font-bold mb-4">{currentCard?.arabic}</p>
                  {currentCard?.example && (
                    <p className="text-white/80 text-lg italic text-center">
                      "{currentCard.example}"
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center gap-4"
              >
                <button
                  onClick={() => handleResponse(1)}
                  className="flex flex-col items-center gap-2 px-6 py-4 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                >
                  <X className="h-8 w-8" />
                  <span className="font-medium">{t('لم أعرفها', 'Forgot')}</span>
                </button>
                <button
                  onClick={() => handleResponse(3)}
                  className="flex flex-col items-center gap-2 px-6 py-4 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors"
                >
                  <RotateCcw className="h-8 w-8" />
                  <span className="font-medium">{t('صعبة', 'Hard')}</span>
                </button>
                <button
                  onClick={() => handleResponse(4)}
                  className="flex flex-col items-center gap-2 px-6 py-4 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                >
                  <Check className="h-8 w-8" />
                  <span className="font-medium">{t('جيدة', 'Good')}</span>
                </button>
                <button
                  onClick={() => handleResponse(5)}
                  className="flex flex-col items-center gap-2 px-6 py-4 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                >
                  <Star className="h-8 w-8" />
                  <span className="font-medium">{t('سهلة', 'Easy')}</span>
                </button>
              </motion.div>
            )}

            <div className="flex justify-center mt-6">
              <span className="text-gray-500">
                {currentIndex + 1} / {cards.length}
              </span>
            </div>
          </>
        )}

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">{t('إضافة كلمة جديدة', 'Add a new word')}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('الكلمة بالإنجليزي', 'Word in English')}
                    </label>
                    <input
                      type="text"
                      value={newWord.word}
                      onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('مثال: beautiful', 'Example: beautiful')}
                      dir="ltr"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('المعنى بالعربي', 'Meaning in Arabic')}
                    </label>
                    <input
                      type="text"
                      value={newWord.arabic}
                      onChange={(e) => setNewWord({ ...newWord, arabic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('مثال: جميل', 'Example: beautiful')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('مثال (اختياري)', 'Example (optional)')}
                    </label>
                    <input
                      type="text"
                      value={newWord.example}
                      onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t('مثال: The sunset is beautiful', 'Example: The sunset is beautiful')}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    onClick={handleAddWord}
                    disabled={!newWord.word || !newWord.arabic}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('إضافة', 'Add')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}
