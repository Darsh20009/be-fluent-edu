'use client'

import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Volume2, VolumeX, Loader2 } from 'lucide-react'

interface Exercise {
  id: string
  type: string
  question: string
  questionAr: string | null
  options: string | null
  correctAnswer: string
  explanation: string | null
  explanationAr: string | null
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

export default function MultipleChoiceExercise({ exercise, onComplete, onNext }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    exercise.lastAttempt?.answer || null
  )
  const [submitted, setSubmitted] = useState(exercise.attempted)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    exercise.lastAttempt?.isCorrect ?? null
  )
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const options: string[] = exercise.options ? JSON.parse(exercise.options) : []

  const playAudio = () => {
    if (exercise.audioUrl) {
      const audio = new Audio(exercise.audioUrl)
      audio.play()
    }
  }

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
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

  const handleSpeakQuestion = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speakText(exercise.question)
    }
  }

  const handleSpeakOption = (option: string) => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speakText(option)
    }
  }

  const handleSubmit = async () => {
    if (!selectedOption || loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/exercises/${exercise.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: selectedOption })
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
        
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-2 flex-shrink-0">
            {exercise.audioUrl && (
              <button
                onClick={playAudio}
                className="p-2 bg-[#004E89] text-white rounded-full hover:bg-[#003A6A] transition-colors"
                title="تشغيل الصوت المسجل"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSpeakQuestion}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              title={isSpeaking ? "إيقاف القراءة" : "استمع للسؤال"}
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              {exercise.questionAr || exercise.question}
            </h3>
            {exercise.questionAr && (
              <p className="text-sm text-gray-500">{exercise.question}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {options.map((option, index) => {
          const isSelected = selectedOption === option
          const isCorrectOption = option === exercise.correctAnswer
          
          let optionClass = 'border-gray-200 hover:border-[#004E89] hover:bg-[#004E89]/5'
          
          if (submitted) {
            if (isCorrectOption) {
              optionClass = 'border-green-500 bg-green-50'
            } else if (isSelected && !isCorrect) {
              optionClass = 'border-red-500 bg-red-50'
            }
          } else if (isSelected) {
            optionClass = 'border-[#004E89] bg-[#004E89]/10'
          }

          return (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSpeakOption(option)
                }}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors flex-shrink-0"
                title="استمع للخيار"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => !submitted && setSelectedOption(option)}
                disabled={submitted}
                className={`flex-1 p-4 rounded-xl border-2 text-right transition-all duration-200 ${optionClass} ${
                  submitted ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    submitted && isCorrectOption
                      ? 'bg-green-500 text-white'
                      : submitted && isSelected && !isCorrect
                      ? 'bg-red-500 text-white'
                      : isSelected
                      ? 'bg-[#004E89] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {submitted && isCorrectOption ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : submitted && isSelected && !isCorrect ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>
                  <span className={`flex-1 ${
                    submitted && isCorrectOption ? 'text-green-700 font-medium' : 'text-gray-700'
                  }`}>
                    {option}
                  </span>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {showExplanation && (exercise.explanationAr || exercise.explanation) && (
        <div className={`p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <h4 className="font-bold mb-2 text-gray-700">
            {isCorrect ? '✅ أحسنت!' : '💡 التوضيح:'}
          </h4>
          <p className="text-gray-600">{exercise.explanationAr || exercise.explanation}</p>
        </div>
      )}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption || loading}
          className="w-full py-3 bg-[#004E89] text-white rounded-lg font-medium hover:bg-[#003A6A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري التحقق...' : 'تحقق من الإجابة'}
        </button>
      ) : (
        <button
          onClick={onNext}
          className="w-full py-3 bg-[#004E89] text-white rounded-lg font-medium hover:bg-[#003A6A] transition-colors"
        >
          التمرين التالي
        </button>
      )}
    </div>
  )
}
