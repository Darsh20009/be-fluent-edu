'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, ChevronLeft, ArrowUp, Loader2 } from 'lucide-react'

interface LevelProgress {
  currentLevel: string
  currentLevelName: string
  performanceScore: number
  progressPercentage: number
  suggestedLevel: string
  shouldAdjust: boolean
  levelDifference: number
  metrics: {
    dataPoints: number
  }
}

const levelColors: Record<string, { gradient: string; text: string }> = {
  A1: { gradient: 'from-red-400 to-red-600', text: 'text-red-600' },
  A2: { gradient: 'from-orange-400 to-orange-600', text: 'text-orange-600' },
  B1: { gradient: 'from-yellow-400 to-yellow-600', text: 'text-yellow-600' },
  B2: { gradient: 'from-blue-400 to-blue-600', text: 'text-blue-600' },
  C1: { gradient: 'from-purple-400 to-purple-600', text: 'text-purple-600' }
}

export default function LevelProgressWidget({ className = '' }: { className?: string }) {
  const [progress, setProgress] = useState<LevelProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/student/level-progress?lang=ar')
        const data = await res.json()
        if (data.success) {
          setProgress(data)
        }
      } catch (error) {
        console.error('Error fetching level progress:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [])

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-100 p-4 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <Link href="/placement-test" className={`block ${className}`}>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md border border-amber-200 p-4 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-800">اختبار تحديد المستوى</h3>
              <p className="text-sm text-amber-600">اكتشف مستواك في الإنجليزية</p>
            </div>
            <ChevronLeft className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </Link>
    )
  }

  const colors = levelColors[progress.currentLevel] || levelColors.A1

  return (
    <Link href="/dashboard/student/level-progress" className={`block ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition"
      >
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
            <span className="text-xl font-bold text-white">{progress.currentLevel}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">مستوى اللغة</span>
            </div>
            <h3 className="font-bold text-gray-800">{progress.currentLevelName}</h3>
            
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">التقدم</span>
                <span className="text-xs font-medium text-gray-600">{Math.round(progress.progressPercentage)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${colors.gradient}`}
                />
              </div>
            </div>

            {progress.shouldAdjust && progress.levelDifference > 0 && (
              <div className="flex items-center gap-1 mt-2 text-emerald-600">
                <ArrowUp className="w-4 h-4" />
                <span className="text-xs font-medium">جاهز للترقية إلى {progress.suggestedLevel}</span>
              </div>
            )}
          </div>

          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </div>
      </motion.div>
    </Link>
  )
}
