'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Headphones, Play, Clock, ChevronRight, Filter, Search, Video, Music } from 'lucide-react'

interface ListeningContent {
  id: string
  title: string
  titleAr: string
  description: string | null
  descriptionAr: string | null
  mediaType: 'AUDIO' | 'VIDEO'
  thumbnailUrl: string | null
  duration: number | null
  level: string
  category: string | null
  categoryAr: string | null
  exercisesCount: number
}

export default function ListeningPage() {
  const [contents, setContents] = useState<ListeningContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedMediaType, setSelectedMediaType] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    fetchContents()
  }, [selectedLevel, selectedCategory, selectedMediaType])

  const fetchContents = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedLevel) params.append('level', selectedLevel)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedMediaType) params.append('mediaType', selectedMediaType)
      
      const res = await fetch(`/api/listening?${params.toString()}`)
      const data = await res.json()
      setContents(data)
    } catch (error) {
      console.error('Error fetching contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-700'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700'
      case 'ADVANCED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'مبتدئ'
      case 'INTERMEDIATE': return 'متوسط'
      case 'ADVANCED': return 'متقدم'
      default: return level
    }
  }

  const filteredContents = contents.filter(content => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      content.title.toLowerCase().includes(query) ||
      content.titleAr.includes(searchQuery) ||
      content.category?.toLowerCase().includes(query) ||
      content.categoryAr?.includes(searchQuery)
    )
  })

  const categories = [...new Set(contents.map(c => c.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Headphones className="w-8 h-8 text-[#10B981]" />
            <span className="text-xl font-bold text-[#10B981]">Youspeak</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-[#10B981]">الرئيسية</Link>
            <Link href="/grammar" className="text-gray-600 hover:text-[#10B981]">القواعد</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#10B981] mb-2">
            نظام الاستماع
          </h1>
          <p className="text-gray-600">
            استمع وتعلم مع مقاطع صوتية ومقاطع فيديو تعليمية
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن محتوى..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] text-right"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
              >
                <option value="">كل الأنواع</option>
                <option value="AUDIO">صوت فقط</option>
                <option value="VIDEO">فيديو</option>
              </select>
              
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
              >
                <option value="">كل المستويات</option>
                <option value="BEGINNER">مبتدئ</option>
                <option value="INTERMEDIATE">متوسط</option>
                <option value="ADVANCED">متقدم</option>
              </select>
              
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white"
                >
                  <option value="">كل التصنيفات</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat!}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#10B981] border-t-transparent"></div>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-20">
            <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-500 mb-2">لا يوجد محتوى حالياً</h3>
            <p className="text-gray-400">سيتم إضافة محتوى جديد قريباً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <Link
                key={content.id}
                href={`/listening/${content.id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video bg-gradient-to-br from-[#10B981] to-[#0066B8] relative flex items-center justify-center">
                  {content.thumbnailUrl ? (
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    content.mediaType === 'VIDEO' ? (
                      <Video className="w-16 h-16 text-white/50" />
                    ) : (
                      <Music className="w-16 h-16 text-white/50" />
                    )
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-[#10B981] ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                    {formatDuration(content.duration)}
                  </div>
                  <div className="absolute top-2 left-2">
                    {content.mediaType === 'VIDEO' ? (
                      <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Video className="w-3 h-3" /> فيديو
                      </span>
                    ) : (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Music className="w-3 h-3" /> صوت
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-right flex-1">
                      {content.titleAr}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(content.level)}`}>
                      {getLevelText(content.level)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 text-right mb-3 line-clamp-2">
                    {content.descriptionAr || content.description || 'استمع وتعلم'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    {content.categoryAr && (
                      <span className="text-gray-400">{content.categoryAr}</span>
                    )}
                    <div className="flex items-center gap-1 text-[#10B981]">
                      <span>{content.exercisesCount} تمرين</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-[#10B981] text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Youspeak. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
