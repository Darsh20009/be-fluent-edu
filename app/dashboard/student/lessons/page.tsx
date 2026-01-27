'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BookOpen, Play, FileText, CheckCircle, Clock, Filter, ChevronLeft } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  titleAr: string
  description: string | null
  descriptionAr: string | null
  level: string
  category: string | null
  categoryAr: string | null
  videoUrl: string | null
  thumbnailUrl: string | null
  exerciseCount: number
  progress: {
    completed: boolean
    videoWatched: boolean
    articleRead: boolean
    exercisesScore: number | null
  } | null
}

export default function LessonsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchLessons()
  }, [selectedLevel, selectedCategory])

  const fetchLessons = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedLevel) params.append('level', selectedLevel)
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await fetch(`/api/lessons?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelLabel = (level: string) => {
    const labels: Record<string, { en: string; ar: string; color: string }> = {
      BEGINNER: { en: 'Beginner', ar: 'مبتدئ', color: 'bg-green-100 text-green-700' },
      INTERMEDIATE: { en: 'Intermediate', ar: 'متوسط', color: 'bg-yellow-100 text-yellow-700' },
      ADVANCED: { en: 'Advanced', ar: 'متقدم', color: 'bg-red-100 text-red-700' }
    }
    return labels[level] || { en: level, ar: level, color: 'bg-gray-100 text-gray-700' }
  }

  const categories = [...new Set(lessons.map(l => l.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/dashboard/student')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#10B981]" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#10B981]">الدروس التعليمية</h1>
            <p className="text-gray-600">Lessons</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            >
              <option value="">جميع المستويات</option>
              <option value="BEGINNER">مبتدئ</option>
              <option value="INTERMEDIATE">متوسط</option>
              <option value="ADVANCED">متقدم</option>
            </select>
            
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              >
                <option value="">جميع الفئات</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat || ''}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد دروس متاحة</h3>
            <p className="text-gray-500">سيتم إضافة دروس جديدة قريباً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {lessons.map((lesson) => {
              const levelInfo = getLevelLabel(lesson.level)
              const isCompleted = lesson.progress?.completed
              
              return (
                <div
                  key={lesson.id}
                  onClick={() => router.push(`/dashboard/student/lessons/${lesson.id}`)}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    isCompleted ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="relative h-40 bg-gradient-to-br from-[#10B981] to-[#059669]">
                    {lesson.thumbnailUrl ? (
                      <img
                        src={lesson.thumbnailUrl}
                        alt={lesson.titleAr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    
                    {lesson.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-[#10B981] ml-1" />
                        </div>
                      </div>
                    )}
                    
                    {isCompleted && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>مكتمل</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelInfo.color}`}>
                        {levelInfo.ar}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{lesson.titleAr}</h3>
                    <p className="text-sm text-gray-500 mb-3">{lesson.title}</p>
                    
                    {lesson.descriptionAr && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.descriptionAr}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        {lesson.videoUrl && (
                          <span className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            فيديو
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {lesson.exerciseCount} تمرين
                        </span>
                      </div>
                      
                      {lesson.progress?.exercisesScore !== null && lesson.progress?.exercisesScore !== undefined && (
                        <span className="text-[#10B981] font-medium">
                          {Math.round(lesson.progress.exercisesScore)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
