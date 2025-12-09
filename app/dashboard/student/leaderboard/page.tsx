'use client'

import { useState, useEffect } from 'react'
import { Trophy, Flame, Star, Medal, Crown, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import GamificationHeader from '@/components/gamification/GamificationHeader'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  profilePhoto: string | null
  totalXP: number
  currentLevel: number
  currentStreak: number
  levelTitle: string
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'xp' | 'streak' | 'level'>('xp')
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userStats, setUserStats] = useState<any>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [type])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gamification/leaderboard?type=${type}&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        setLeaderboard(data.leaderboard)
        setUserRank(data.userRank)
        setUserStats(data.userStats)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-gray-500 font-bold">#{rank}</span>
    }
  }

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300'
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300'
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </button>
          <div className="p-2 bg-yellow-100 rounded-xl">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">لوحة المتصدرين</h1>
            <p className="text-sm text-gray-500">Leaderboard</p>
          </div>
        </div>

        <GamificationHeader className="mb-6" />

        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm">
          <button
            onClick={() => setType('xp')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
              type === 'xp' 
                ? 'bg-purple-600 text-white' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>نقاط الخبرة</span>
          </button>
          <button
            onClick={() => setType('streak')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
              type === 'streak' 
                ? 'bg-orange-600 text-white' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span>السلسلة</span>
          </button>
          <button
            onClick={() => setType('level')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
              type === 'level' 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>المستوى</span>
          </button>
        </div>

        {userRank && userStats && (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-600">#{userRank}</span>
                <div>
                  <p className="font-medium text-gray-800">ترتيبك الحالي</p>
                  <p className="text-sm text-gray-500">
                    {type === 'xp' && `${userStats.totalXP.toLocaleString()} XP`}
                    {type === 'streak' && `${userStats.currentStreak} يوم`}
                    {type === 'level' && `المستوى ${userStats.currentLevel}`}
                  </p>
                </div>
              </div>
              {userRank > 1 && (
                <p className="text-sm text-gray-500">
                  استمر للوصول إلى المركز الأول! 💪
                </p>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md ${getRankBgColor(entry.rank)}`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {entry.profilePhoto ? (
                    <img src={entry.profilePhoto} alt={entry.name} className="w-full h-full object-cover" />
                  ) : (
                    entry.name.charAt(0)
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{entry.name}</h3>
                  <p className="text-sm text-gray-500">{entry.levelTitle} • المستوى {entry.currentLevel}</p>
                </div>

                <div className="text-right">
                  {type === 'xp' && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <Star className="w-5 h-5" />
                      <span className="font-bold">{entry.totalXP.toLocaleString()}</span>
                    </div>
                  )}
                  {type === 'streak' && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Flame className="w-5 h-5" />
                      <span className="font-bold">{entry.currentStreak} يوم</span>
                    </div>
                  )}
                  {type === 'level' && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Trophy className="w-5 h-5" />
                      <span className="font-bold">المستوى {entry.currentLevel}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600">لا يوجد متصدرين بعد</h3>
            <p className="text-gray-500">كن أول من يتصدر القائمة!</p>
          </div>
        )}
      </div>
    </div>
  )
}
