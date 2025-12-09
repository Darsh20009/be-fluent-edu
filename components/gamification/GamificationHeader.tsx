'use client'

import { useState, useEffect } from 'react'
import { Flame, Star, Trophy, Medal, Zap } from 'lucide-react'
import Link from 'next/link'

interface GamificationStats {
  totalXP: number
  currentLevel: number
  currentLevelXP: number
  xpToNextLevel: number
  currentStreak: number
  longestStreak: number
  levelTitle: string
  xpProgress: number
  rank: number
  totalPoints: number
  wordsLearned: number
  lessonsCompleted: number
}

interface GamificationHeaderProps {
  compact?: boolean
  showStreak?: boolean
  showLevel?: boolean
  showXP?: boolean
  className?: string
}

export default function GamificationHeader({
  compact = false,
  showStreak = true,
  showLevel = true,
  showXP = true,
  className = '',
}: GamificationHeaderProps) {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [streakBonus, setStreakBonus] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        if (data.streakBonus > 0) {
          setStreakBonus(data.streakBonus)
          setTimeout(() => setStreakBonus(0), 3000)
        }
      }
    } catch (error) {
      console.error('Error fetching gamification stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse flex items-center gap-4 ${className}`}>
        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
      </div>
    )
  }

  if (!stats) return null

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showStreak && (
          <Link 
            href="/dashboard/student/achievements" 
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors"
          >
            <Flame className="w-4 h-4" />
            <span className="font-bold text-sm">{stats.currentStreak}</span>
          </Link>
        )}
        
        {showLevel && (
          <Link 
            href="/dashboard/student/achievements" 
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Star className="w-4 h-4" />
            <span className="font-bold text-sm">{stats.currentLevel}</span>
          </Link>
        )}
        
        {showXP && (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-600 rounded-full">
            <Zap className="w-4 h-4" />
            <span className="font-bold text-sm">{stats.totalXP.toLocaleString()}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-4 text-white ${className}`}>
      {streakBonus > 0 && (
        <div className="absolute top-2 right-2 animate-bounce bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
          +{streakBonus} XP مكافأة السلسلة!
        </div>
      )}
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard/student/achievements"
            className="flex flex-col items-center hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <Flame className="w-6 h-6 text-orange-300" />
              <span className="text-2xl font-bold">{stats.currentStreak}</span>
            </div>
            <span className="text-xs mt-1 opacity-80">يوم متتالي</span>
          </Link>
          
          <Link 
            href="/dashboard/student/achievements"
            className="flex flex-col items-center hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <Star className="w-6 h-6 text-yellow-300" />
              <span className="text-2xl font-bold">{stats.currentLevel}</span>
            </div>
            <span className="text-xs mt-1 opacity-80">{stats.levelTitle}</span>
          </Link>
          
          <Link 
            href="/dashboard/student/leaderboard"
            className="flex flex-col items-center hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <Trophy className="w-6 h-6 text-amber-300" />
              <span className="text-2xl font-bold">#{stats.rank}</span>
            </div>
            <span className="text-xs mt-1 opacity-80">الترتيب</span>
          </Link>
        </div>
        
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm opacity-80">المستوى {stats.currentLevel}</span>
            <span className="text-sm opacity-80">المستوى {stats.currentLevel + 1}</span>
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-500"
              style={{ width: `${stats.xpProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs opacity-80">{stats.currentLevelXP} XP</span>
            <span className="text-sm font-bold flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {stats.totalXP.toLocaleString()} XP
            </span>
            <span className="text-xs opacity-80">{stats.xpToNextLevel} XP</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-sm opacity-80">
        <span>📚 {stats.wordsLearned} كلمة</span>
        <span>📝 {stats.lessonsCompleted} درس</span>
        <span>🏅 {stats.totalPoints.toLocaleString()} نقطة</span>
      </div>
    </div>
  )
}
