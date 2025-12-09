'use client'

import { useState, useEffect } from 'react'
import { Award, Star, Flame, Trophy, Medal, ArrowRight, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import GamificationHeader from '@/components/gamification/GamificationHeader'
import StreakDisplay from '@/components/gamification/StreakDisplay'
import LevelProgress from '@/components/gamification/LevelProgress'
import BadgeCard from '@/components/gamification/BadgeCard'

interface Badge {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  category: string
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  xpReward: number
  earned: boolean
  earnedAt: string | null
}

interface Stats {
  totalXP: number
  currentLevel: number
  currentLevelXP: number
  xpToNextLevel: number
  currentStreak: number
  longestStreak: number
  levelTitle: string
  xpProgress: number
}

export default function AchievementsPage() {
  const router = useRouter()
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [earnedCount, setEarnedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [badgesRes, statsRes] = await Promise.all([
        fetch('/api/gamification/badges'),
        fetch('/api/gamification/stats')
      ])
      
      const badgesData = await badgesRes.json()
      const statsData = await statsRes.json()
      
      if (badgesData.success) {
        setBadges(badgesData.badges)
        setEarnedCount(badgesData.earnedCount)
        setTotalCount(badgesData.totalCount)
      }
      
      if (statsData.success) {
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'STREAK', label: 'السلسلة' },
    { id: 'LEARNING', label: 'التعلم' },
    { id: 'ACHIEVEMENT', label: 'الإنجازات' },
  ]

  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned' && !badge.earned) return false
    if (filter === 'locked' && badge.earned) return false
    if (categoryFilter !== 'all' && badge.category !== categoryFilter) return false
    return true
  })

  const earnedPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </button>
          <div className="p-2 bg-purple-100 rounded-xl">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">الإنجازات والشارات</h1>
            <p className="text-sm text-gray-500">Achievements & Badges</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="animate-pulse h-48 bg-gray-200 rounded-2xl" />
            <div className="animate-pulse h-32 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <StreakDisplay 
                  streak={stats.currentStreak} 
                  longestStreak={stats.longestStreak} 
                />
                <LevelProgress
                  level={stats.currentLevel}
                  currentXP={stats.currentLevelXP}
                  xpToNext={stats.xpToNextLevel}
                  levelTitle={stats.levelTitle}
                />
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">تقدم الشارات</h2>
                <span className="text-lg font-bold text-purple-600">
                  {earnedCount}/{totalCount}
                </span>
              </div>
              
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${earnedPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                حصلت على {earnedPercentage}% من الشارات
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === 'all' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilter('earned')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === 'earned' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    المكتسبة
                  </button>
                  <button
                    onClick={() => setFilter('locked')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === 'locked' 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    المقفلة
                  </button>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        categoryFilter === cat.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  name={badge.name}
                  nameAr={badge.nameAr}
                  description={badge.description}
                  descriptionAr={badge.descriptionAr}
                  icon={badge.icon}
                  rarity={badge.rarity}
                  earned={badge.earned}
                  earnedAt={badge.earnedAt}
                  xpReward={badge.xpReward}
                />
              ))}
            </div>

            {filteredBadges.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600">لا توجد شارات</h3>
                <p className="text-gray-500">جرب تغيير الفلتر لرؤية شارات أخرى</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
