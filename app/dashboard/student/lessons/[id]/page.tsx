'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Play, FileText, CheckCircle, BookOpen, Trophy, ArrowRight } from 'lucide-react'
import MultipleChoiceExercise from '@/components/exercises/MultipleChoiceExercise'
import FillBlankExercise from '@/components/exercises/FillBlankExercise'
import DragDropExercise from '@/components/exercises/DragDropExercise'
import SentenceReadingExercise from '@/components/exercises/SentenceReadingExercise'

interface Exercise {
  id: string
  type: string
  order: number
  question: string
  questionAr: string | null
  options: string | null
  correctAnswer: string
  explanation: string | null
  explanationAr: string | null
  sentence: string | null
  sentenceAr: string | null
  audioUrl: string | null
  imageUrl: string | null
  dragItems: string | null
  dropZones: string | null
  blanks: string | null
  points: number
  attempted: boolean
  lastAttempt: {
    isCorrect: boolean
    answer: string
  } | null
}

interface Lesson {
  id: string
  title: string
  titleAr: string
  description: string | null
  descriptionAr: string | null
  level: string
  videoUrl: string | null
  videoDuration: number | null
  articleContent: string | null
  articleContentAr: string | null
  exercises: Exercise[]
  progress: {
    completed: boolean
    videoWatched: boolean
    articleRead: boolean
    exercisesScore: number | null
  } | null
}

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'video' | 'article' | 'exercises'>('video')
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exercisesScore, setExercisesScore] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchLesson()
  }, [resolvedParams.id])

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/lessons/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setLesson(data)
        setExercisesScore(data.progress?.exercisesScore || null)
        
        if (!data.videoUrl && data.articleContent) {
          setActiveTab('article')
        } else if (!data.videoUrl && !data.articleContent && data.exercises.length > 0) {
          setActiveTab('exercises')
        }
      } else {
        router.push('/dashboard/student/lessons')
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (data: Partial<{
    videoWatched: boolean
    articleRead: boolean
    exercisesScore: number
    completed: boolean
  }>) => {
    try {
      await fetch(`/api/lessons/${resolvedParams.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleVideoEnded = () => {
    updateProgress({ videoWatched: true })
  }

  const handleArticleRead = () => {
    updateProgress({ articleRead: true })
  }

  const handleExerciseComplete = (score: number) => {
    setExercisesScore(score)
    if (score >= 80) {
      updateProgress({ exercisesScore: score, completed: true })
    }
  }

  const renderExercise = (exercise: Exercise) => {
    const commonProps = {
      exercise,
      onComplete: handleExerciseComplete,
      onNext: () => {
        if (currentExerciseIndex < (lesson?.exercises.length || 0) - 1) {
          setCurrentExerciseIndex(prev => prev + 1)
        }
      }
    }

    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        return <MultipleChoiceExercise {...commonProps} />
      case 'FILL_BLANK':
        return <FillBlankExercise {...commonProps} />
      case 'DRAG_DROP':
        return <DragDropExercise {...commonProps} />
      case 'SENTENCE_READING':
        return <SentenceReadingExercise {...commonProps} />
      default:
        return <MultipleChoiceExercise {...commonProps} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    )
  }

  if (!lesson) {
    return null
  }

  const currentExercise = lesson.exercises[currentExerciseIndex]

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/student/lessons')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#10B981]" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-[#10B981]">{lesson.titleAr}</h1>
              <p className="text-sm text-gray-500">{lesson.title}</p>
            </div>
            {exercisesScore !== null && (
              <div className="flex items-center gap-2 bg-[#10B981]/10 px-3 py-2 rounded-lg">
                <Trophy className="w-5 h-5 text-[#10B981]" />
                <span className="font-bold text-[#10B981]">{Math.round(exercisesScore)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {lesson.videoUrl && (
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'video'
                  ? 'bg-[#10B981] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Play className="w-4 h-4" />
              الفيديو
            </button>
          )}
          {lesson.articleContentAr && (
            <button
              onClick={() => setActiveTab('article')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'article'
                  ? 'bg-[#10B981] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              المقال
            </button>
          )}
          {lesson.exercises.length > 0 && (
            <button
              onClick={() => setActiveTab('exercises')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === 'exercises'
                  ? 'bg-[#10B981] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              التمارين ({lesson.exercises.length})
            </button>
          )}
        </div>

        {activeTab === 'video' && lesson.videoUrl && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-black">
              <video
                src={lesson.videoUrl}
                controls
                className="w-full h-full"
                onEnded={handleVideoEnded}
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
            {lesson.descriptionAr && (
              <div className="p-4 border-t">
                <h3 className="font-bold text-lg mb-2">وصف الدرس</h3>
                <p className="text-gray-600">{lesson.descriptionAr}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'article' && lesson.articleContentAr && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div 
              className="prose prose-lg max-w-none text-right"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: lesson.articleContentAr }}
              onMouseUp={handleArticleRead}
            />
            {lesson.articleContent && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-bold text-lg mb-4 text-gray-400">English Version</h3>
                <div 
                  className="prose prose-lg max-w-none text-gray-500"
                  dangerouslySetInnerHTML={{ __html: lesson.articleContent }}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'exercises' && lesson.exercises.length > 0 && (
          <div>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  التمرين {currentExerciseIndex + 1} من {lesson.exercises.length}
                </span>
                <div className="flex gap-1">
                  {lesson.exercises.map((ex, idx) => (
                    <button
                      key={ex.id}
                      onClick={() => setCurrentExerciseIndex(idx)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        idx === currentExerciseIndex
                          ? 'bg-[#10B981] text-white'
                          : ex.attempted
                          ? ex.lastAttempt?.isCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ex.attempted && ex.lastAttempt?.isCorrect ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] transition-all duration-300"
                  style={{ width: `${((currentExerciseIndex + 1) / lesson.exercises.length) * 100}%` }}
                />
              </div>
            </div>

            {currentExercise && renderExercise(currentExercise)}

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
                disabled={currentExerciseIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
                السابق
              </button>
              <button
                onClick={() => setCurrentExerciseIndex(prev => Math.min(lesson.exercises.length - 1, prev + 1))}
                disabled={currentExerciseIndex === lesson.exercises.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#003A6A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
