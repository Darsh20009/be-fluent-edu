'use client'

import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, GripVertical, RotateCcw } from 'lucide-react'

interface Exercise {
  id: string
  type: string
  question: string
  questionAr: string | null
  correctAnswer: string
  explanation: string | null
  explanationAr: string | null
  dragItems: string | null
  dropZones: string | null
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

export default function DragDropExercise({ exercise, onComplete, onNext }: Props) {
  const dragItems: string[] = exercise.dragItems ? JSON.parse(exercise.dragItems) : []
  const correctOrder: string[] = JSON.parse(exercise.correctAnswer)
  
  const getInitialItems = () => {
    if (exercise.lastAttempt?.answer) {
      try {
        return JSON.parse(exercise.lastAttempt.answer)
      } catch {
        return [...dragItems].sort(() => Math.random() - 0.5)
      }
    }
    return [...dragItems].sort(() => Math.random() - 0.5)
  }

  const [items, setItems] = useState<string[]>(getInitialItems)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(exercise.attempted)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    exercise.lastAttempt?.isCorrect ?? null
  )
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDragStart = (index: number) => {
    if (submitted) return
    setDraggedItem(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === index || submitted) return

    const newItems = [...items]
    const draggedItemContent = newItems[draggedItem]
    newItems.splice(draggedItem, 1)
    newItems.splice(index, 0, draggedItemContent)
    setItems(newItems)
    setDraggedItem(index)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleTouchMove = useCallback((index: number, direction: 'up' | 'down') => {
    if (submitted) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[newIndex]
    newItems[newIndex] = temp
    setItems(newItems)
  }, [items, submitted])

  const handleReset = () => {
    setItems([...dragItems].sort(() => Math.random() - 0.5))
  }

  const handleSubmit = async () => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(`/api/exercises/${exercise.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: JSON.stringify(items) })
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
        
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {exercise.questionAr || exercise.question}
            </h3>
            {exercise.questionAr && (
              <p className="text-sm text-gray-500">{exercise.question}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">رتب العناصر بالترتيب الصحيح</p>
          </div>
          {!submitted && (
            <button
              onClick={handleReset}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="إعادة الترتيب"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {items.map((item, index) => {
          const isInCorrectPosition = submitted && item === correctOrder[index]
          const isInWrongPosition = submitted && item !== correctOrder[index]

          return (
            <div
              key={`${item}-${index}`}
              draggable={!submitted}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                draggedItem === index
                  ? 'border-[#004E89] bg-[#004E89]/10 scale-105 shadow-lg'
                  : isInCorrectPosition
                  ? 'border-green-500 bg-green-50'
                  : isInWrongPosition
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${submitted ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                {!submitted && (
                  <GripVertical className="w-5 h-5 text-gray-400" />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isInCorrectPosition
                    ? 'bg-green-500 text-white'
                    : isInWrongPosition
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isInCorrectPosition ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isInWrongPosition ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              
              <span className={`flex-1 ${
                isInCorrectPosition ? 'text-green-700' : isInWrongPosition ? 'text-red-700' : 'text-gray-700'
              }`}>
                {item}
              </span>

              {!submitted && (
                <div className="flex flex-col gap-1 sm:hidden">
                  <button
                    onClick={() => handleTouchMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleTouchMove(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {submitted && !isCorrect && (
        <div className="p-4 rounded-lg mb-4 bg-blue-50 border border-blue-200">
          <h4 className="font-bold mb-2 text-gray-700">الترتيب الصحيح:</h4>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            {correctOrder.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </div>
      )}

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
          disabled={loading}
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
