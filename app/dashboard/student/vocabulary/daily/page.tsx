'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Volume2, 
  Check, 
  X, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface DailyWord {
  id: string
  word: string
  arabic: string
  example: string
  imageUrl?: string
  audioUrl?: string
  level: string
  isLearned: boolean
}

export default function DailyWordsPage() {
  const [words, setWords] = useState<DailyWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [loading, setLoading] = useState(true)
  const [showMeaning, setShowMeaning] = useState(false)
  const [learnedToday, setLearnedToday] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchDailyWords()
  }, [level])

  const fetchDailyWords = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/vocabulary/daily?level=${level}&count=5`)
      const data = await res.json()
      setWords(data.words || [])
      setCurrentIndex(0)
      setShowMeaning(false)
      setLearnedToday(data.words?.filter((w: DailyWord) => w.isLearned).length || 0)
    } catch (error) {
      console.error('Error fetching daily words:', error)
    }
    setLoading(false)
  }

  const handleLearn = async () => {
    const currentWord = words[currentIndex]
    try {
      await fetch('/api/vocabulary/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: currentWord.word,
          arabic: currentWord.arabic,
          example: currentWord.example,
          action: 'learn'
        })
      })
      
      setLearnedToday(prev => prev + 1)
      const updatedWords = [...words]
      updatedWords[currentIndex] = { ...currentWord, isLearned: true }
      setWords(updatedWords)
      
      if (currentIndex < words.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1)
          setShowMeaning(false)
        }, 500)
      }
    } catch (error) {
      console.error('Error marking word as learned:', error)
    }
  }

  const playAudio = () => {
    const currentWord = words[currentIndex]
    if (currentWord?.audioUrl && audioRef.current) {
      audioRef.current.src = currentWord.audioUrl
      audioRef.current.play()
    } else {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowMeaning(false)
    }
  }

  const prevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setShowMeaning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل كلمات اليوم...</p>
        </div>
      </div>
    )
  }

  const currentWord = words[currentIndex]

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-4 md:p-8" dir="rtl">
      <audio ref={audioRef} className="hidden" />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/dashboard/student/vocabulary"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ChevronRight className="h-5 w-5" />
            <span>العودة</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-700">
              {new Date().toLocaleDateString('ar-EG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            كلمات اليوم
          </h1>
          <p className="text-gray-600">
            تعلم {words.length} كلمات جديدة كل يوم
          </p>
        </motion.div>

        <div className="flex justify-center gap-2 mb-6">
          {['beginner', 'intermediate', 'advanced'].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l as typeof level)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                level === l
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {l === 'beginner' ? 'مبتدئ' : l === 'intermediate' ? 'متوسط' : 'متقدم'}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {words.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx)
                setShowMeaning(false)
              }}
              className={`w-10 h-10 rounded-full font-bold transition-all ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white scale-110'
                  : words[idx]?.isLearned
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentWord && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {currentWord.imageUrl && (
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <img 
                  src={currentWord.imageUrl} 
                  alt={currentWord.word}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <motion.h2 
                    className="text-5xl font-bold text-gray-800"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    {currentWord.word}
                  </motion.h2>
                  <button
                    onClick={playAudio}
                    className="p-3 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                  >
                    <Volume2 className="h-6 w-6 text-blue-600" />
                  </button>
                </div>

                <AnimatePresence>
                  {showMeaning ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-3xl text-blue-600 font-bold mb-4">
                        {currentWord.arabic}
                      </p>
                      {currentWord.example && (
                        <div className="bg-gray-50 rounded-xl p-4 mt-4">
                          <p className="text-gray-600 text-lg italic">
                            "{currentWord.example}"
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setShowMeaning(true)}
                      className="px-6 py-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      اضغط لإظهار المعنى
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {showMeaning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center gap-4 mt-8"
                >
                  {!currentWord.isLearned && (
                    <button
                      onClick={handleLearn}
                      className="flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-bold text-lg"
                    >
                      <Check className="h-6 w-6" />
                      <span>تعلمتها!</span>
                    </button>
                  )}
                  
                  {currentWord.isLearned && (
                    <div className="flex items-center gap-2 px-8 py-4 bg-green-100 text-green-700 rounded-xl font-bold text-lg">
                      <Check className="h-6 w-6" />
                      <span>تم تعلمها</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
              <button
                onClick={prevWord}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
                <span>السابق</span>
              </button>
              
              <span className="text-gray-500">
                {currentIndex + 1} / {words.length}
              </span>
              
              <button
                onClick={nextWord}
                disabled={currentIndex === words.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>التالي</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">تقدمك اليوم</h3>
              <p className="text-white/90">
                تعلمت {learnedToday} من {words.length} كلمات
              </p>
            </div>
            <div className="text-4xl font-bold">
              {Math.round((learnedToday / words.length) * 100)}%
            </div>
          </div>
          <div className="mt-4 h-3 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(learnedToday / words.length) * 100}%` }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
