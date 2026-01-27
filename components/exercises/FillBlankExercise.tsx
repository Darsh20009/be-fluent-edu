'use client'

import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Volume2, VolumeX } from 'lucide-react'

interface Exercise {
  id: string
  type: string
  question: string
  questionAr: string | null
  correctAnswer: string
  explanation: string | null
  explanationAr: string | null
  sentence: string | null
  blanks: string | null
  imageUrl: string | null
  audioUrl: string | null
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

export default function FillBlankExercise({ exercise, onComplete, onNext }: Props) {
  const blanks: string[] = exercise.blanks ? JSON.parse(exercise.blanks) : [exercise.correctAnswer]
  const [answers, setAnswers] = useState<string[]>(
    exercise.lastAttempt?.answer 
      ? exercise.lastAttempt.answer.split('|||') 
      : new Array(blanks.length).fill('')
  )
  const [submitted, setSubmitted] = useState(exercise.attempted)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    exercise.lastAttempt?.isCorrect ?? null
  )
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const playAudio = () => {
    if (exercise.audioUrl) {
      const audio = new Audio(exercise.audioUrl)
      audio.play()
    }
  }

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const cleanText = text.replace(/___/g, 'blank')
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const handleSpeakSentence = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      const sentence = exercise.sentence || exercise.question
      speakText(sentence)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (answers.some(a => !a.trim()) || loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/exercises/${exercise.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answers.join('|||') })
      })

      if (response.ok) {
        const result = await response.json()
        setIsCorrect(result.isCorrect)
        setSubmitted(true)
        setShowExplanation(true)
        onComplete(result.exercisesScore)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderSentenceWithBlanks = () => {
    const sentence = exercise.sentence || exercise.question
    const parts = sentence.split('___')
    
    return (
      <div className="text-lg leading-relaxed flex flex-wrap items-center gap-2">
        {parts.map((part, index) => (
          <span key={index} className="flex items-center gap-2">
            <span>{part}</span>
            {index < parts.length - 1 && (
              <div className="relative inline-block">
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  disabled={submitted}
                  className={`w-32 sm:w-40 px-3 py-2 border-b-2 bg-transparent text-center font-medium focus:outline-none transition-colors ${
                    submitted
                      ? answers[index]?.toLowerCase().trim() === blanks[index]?.toLowerCase().trim()
                        ? 'border-green-500 text-green-700'
                        : 'border-red-500 text-red-700'
                      : 'border-[#10B981] focus:border-[#003A6A]'
                  }`}
                  placeholder="..."
                />
                {submitted && answers[index]?.toLowerCase().trim() !== blanks[index]?.toLowerCase().trim() && (
                  <div className="absolute top-full left-0 right-0 text-center text-xs text-green-600 mt-1">
                    {blanks[index]}
                  </div>
                )}
              </div>
            )}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="mb-6">
        {exercise.imageUrl && (
          <img
            src={exercise.imageUrl}
            alt="Exercise"
            className="w-full max-w-md mx-auto rounded-lg mb-4"
          />
        )}
        
        <div className="flex items-start gap-3 mb-4">
          <div className="flex flex-col gap-2 flex-shrink-0">
            {exercise.audioUrl && (
              <button
                onClick={playAudio}
                className="p-2 bg-[#10B981] text-white rounded-full hover:bg-[#003A6A] transition-colors"
                title="تشغيل الصوت المسجل"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSpeakSentence}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              title={isSpeaking ? "إيقاف القراءة" : "استمع للجملة"}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1">أكمل الفراغات</h3>
            <p className="text-sm text-gray-500">Fill in the blanks</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          {renderSentenceWithBlanks()}
        </div>
      </div>

      {submitted && (
        <div className={`flex items-center gap-3 p-4 rounded-lg mb-4 ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {isCorrect ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <span className="text-green-700 font-medium">إجابة صحيحة! أحسنت!</span>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <span className="text-red-700 font-medium block">إجابة خاطئة</span>
                <span className="text-sm text-gray-600">
                  الإجابة الصحيحة: {blanks.join(' / ')}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {showExplanation && (exercise.explanationAr || exercise.explanation) && (
        <div className="p-4 rounded-lg mb-4 bg-blue-50 border border-blue-200">
          <h4 className="font-bold mb-2 text-gray-700">💡 التوضيح:</h4>
          <p className="text-gray-600">{exercise.explanationAr || exercise.explanation}</p>
        </div>
      )}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={answers.some(a => !a.trim()) || loading}
          className="w-full py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#003A6A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري التحقق...' : 'تحقق من الإجابة'}
        </button>
      ) : (
        <button
          onClick={onNext}
          className="w-full py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#003A6A] transition-colors"
        >
          التمرين التالي
        </button>
      )}
    </div>
  )
}
