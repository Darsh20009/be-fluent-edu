'use client'

import { useState } from 'react'
import { Volume2, Eye, EyeOff, CheckCircle, BookOpen } from 'lucide-react'

interface Exercise {
  id: string
  type: string
  question: string
  questionAr: string | null
  sentence: string | null
  sentenceAr: string | null
  correctAnswer: string
  explanation: string | null
  explanationAr: string | null
  audioUrl: string | null
  imageUrl: string | null
  points: number
  attempted: boolean
  lastAttempt: {
    isCorrect: boolean
    answer: string
  } | null
}

interface Props {
  exercise: Exercise
  onComplete: (score: number) => void
  onNext: () => void
}

export default function SentenceReadingExercise({ exercise, onComplete, onNext }: Props) {
  const [showTranslation, setShowTranslation] = useState(false)
  const [completed, setCompleted] = useState(exercise.attempted)
  const [loading, setLoading] = useState(false)

  const sentence = exercise.sentence || exercise.question
  const translation = exercise.sentenceAr || exercise.questionAr || ''

  const playAudio = () => {
    if (exercise.audioUrl) {
      const audio = new Audio(exercise.audioUrl)
      audio.play()
    } else {
      const utterance = new SpeechSynthesisUtterance(sentence)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const handleComplete = async () => {
    if (loading || completed) return

    setLoading(true)
    try {
      const response = await fetch(`/api/exercises/${exercise.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'completed' })
      })

      if (response.ok) {
        const result = await response.json()
        setCompleted(true)
        onComplete(result.exercisesScore)
      }
    } catch (error) {
      console.error('Error marking as complete:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-[#004E89]" />
        <div>
          <h3 className="text-lg font-bold text-gray-800">اقرأ الجملة</h3>
          <p className="text-sm text-gray-500">Read the sentence aloud</p>
        </div>
      </div>

      {exercise.imageUrl && (
        <img
          src={exercise.imageUrl}
          alt="Illustration"
          className="w-full max-w-md mx-auto rounded-lg mb-6"
        />
      )}

      <div className="bg-gradient-to-br from-[#004E89]/5 to-[#004E89]/10 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={playAudio}
            className="p-3 bg-[#004E89] text-white rounded-full hover:bg-[#003A6A] transition-colors flex-shrink-0 shadow-lg"
            title="استمع للنطق"
          >
            <Volume2 className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <p className="text-xl sm:text-2xl font-medium text-gray-800 leading-relaxed mb-4">
              {sentence}
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center gap-2 text-sm text-[#004E89] hover:underline"
              >
                {showTranslation ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    إخفاء الترجمة
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    عرض الترجمة
                  </>
                )}
              </button>
            </div>

            {showTranslation && translation && (
              <div className="mt-4 pt-4 border-t border-[#004E89]/20">
                <p className="text-lg text-gray-600" dir="rtl">
                  {translation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {exercise.explanationAr && (
        <div className="p-4 rounded-lg mb-4 bg-amber-50 border border-amber-200">
          <h4 className="font-bold mb-2 text-gray-700">💡 ملاحظة:</h4>
          <p className="text-gray-600">{exercise.explanationAr}</p>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">نصائح للقراءة:</p>
          <ul className="list-disc list-inside text-gray-500 space-y-1">
            <li>اضغط على زر الصوت للاستماع أولاً</li>
            <li>حاول تقليد النطق الصحيح</li>
            <li>اقرأ بصوت عالٍ عدة مرات</li>
          </ul>
        </div>
      </div>

      {!completed ? (
        <button
          onClick={handleComplete}
          disabled={loading}
          className="w-full py-3 bg-[#004E89] text-white rounded-lg font-medium hover:bg-[#003A6A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            'جاري الحفظ...'
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              قرأت الجملة
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center text-green-600 bg-green-50 py-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">تم إكمال القراءة</span>
          </div>
          <button
            onClick={onNext}
            className="w-full py-3 bg-[#004E89] text-white rounded-lg font-medium hover:bg-[#003A6A] transition-colors"
          >
            التمرين التالي
          </button>
        </div>
      )}
    </div>
  )
}
