'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Trophy, Star, Flame, Target, Award, Crown, Zap, 
  TrendingUp, Users, ArrowRight, Sparkles, Medal,
  BookOpen, Headphones, PenTool, MessageSquare, Clock
} from 'lucide-react'

interface Badge {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  category: string
  xpReward: number
  pointsReward: number
  earned: boolean
  earnedAt: string | null
}

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  totalXP: number
  currentLevel: number
  currentStreak: number
}

interface UserStats {
  totalXP: number
  currentLevel: number
  currentLevelXP: number
  xpToNextLevel: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  wordsLearned: number
  lessonsCompleted: number
  exercisesCompleted: number
  writingsSubmitted: number
  perfectScores: number
  levelTitle: string
}

export default function AchievementsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard'>('overview')
  const [leaderboardType, setLeaderboardType] = useState<'xp' | 'streak' | 'level'>('xp')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [leaderboardType])

  const fetchData = async () => {
    try {
      const [statsRes, badgesRes, leaderboardRes] = await Promise.all([
        fetch('/api/gamification/stats'),
        fetch('/api/gamification/badges'),
        fetch('/api/gamification/leaderboard')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      }

      if (badgesRes.ok) {
        const badgesData = await badgesRes.json()
        setBadges(badgesData.badges || [])
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json()
        setLeaderboard(leaderboardData.leaderboard || [])
        setUserRank(leaderboardData.userRank)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/gamification/leaderboard?type=${leaderboardType}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
        setUserRank(data.userRank)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const getBadgeIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      star: <Star className="w-8 h-8" />,
      flame: <Flame className="w-8 h-8" />,
      trophy: <Trophy className="w-8 h-8" />,
      crown: <Crown className="w-8 h-8" />,
      medal: <Medal className="w-8 h-8" />,
      award: <Award className="w-8 h-8" />,
      zap: <Zap className="w-8 h-8" />,
      book: <BookOpen className="w-8 h-8" />,
      headphones: <Headphones className="w-8 h-8" />,
      pen: <PenTool className="w-8 h-8" />,
      message: <MessageSquare className="w-8 h-8" />,
      target: <Target className="w-8 h-8" />,
    }
    return icons[iconName] || <Award className="w-8 h-8" />
  }

  const progressPercentage = stats 
    ? Math.round((stats.currentLevelXP / stats.xpToNextLevel) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#10B981] border-t-transparent"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl text-gray-600 mb-4">يرجى تسجيل الدخول لعرض إنجازاتك</h2>
          <Link href="/auth/login" className="text-[#10B981] hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  const earnedBadges = badges.filter(b => b.earned)
  const unearnedBadges = badges.filter(b => !b.earned)

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-[#10B981]" />
            <span className="text-xl font-bold text-[#10B981]">Be Fluent</span>
          </Link>
          <Link 
            href="/dashboard/student" 
            className="flex items-center gap-2 text-gray-600 hover:text-[#10B981]"
          >
            <span>لوحة التحكم</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-[#10B981] to-[#0066B8] rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold">{stats.currentLevel}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                {stats.levelTitle}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">إنجازاتك</h1>
              <p className="text-white/80 mb-4">استمر في التعلم لتحقيق المزيد من الإنجازات</p>
              
              <div className="bg-white/20 rounded-full h-4 mb-2">
                <div 
                  className="bg-yellow-400 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-white/80">
                {stats.currentLevelXP.toLocaleString()} / {stats.xpToNextLevel.toLocaleString()} XP للمستوى التالي
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <div className="bg-white/20 rounded-xl p-4 text-center min-w-[100px]">
                <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
                <p className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</p>
                <p className="text-xs text-white/70">XP الإجمالي</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center min-w-[100px]">
                <Flame className="w-6 h-6 mx-auto mb-1 text-orange-400" />
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-white/70">يوم متتالي</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center min-w-[100px]">
                <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-300" />
                <p className="text-2xl font-bold">{earnedBadges.length}</p>
                <p className="text-xs text-white/70">شارة</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
            { id: 'badges', label: 'الشارات', icon: Award },
            { id: 'leaderboard', label: 'المتصدرين', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#10B981] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الكلمات المحفوظة</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.wordsLearned}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الدروس المكتملة</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.lessonsCompleted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الكتابات المقدمة</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.writingsSubmitted}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الدرجات الكاملة</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.perfectScores}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                سلسلة التعلم
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-[#10B981]">{stats.currentStreak}</p>
                  <p className="text-gray-500">يوم متتالي</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-400">{stats.longestStreak}</p>
                  <p className="text-gray-400 text-sm">أطول سلسلة</p>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded ${
                      i < stats.currentStreak % 7
                        ? 'bg-orange-400'
                        : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2 text-center">أيام هذا الأسبوع</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                أحدث الشارات
              </h3>
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {earnedBadges.slice(0, 4).map(badge => (
                    <div 
                      key={badge.id}
                      className="text-center"
                      title={badge.nameAr}
                    >
                      <div className="w-14 h-14 mx-auto rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-1">
                        {getBadgeIcon(badge.icon)}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{badge.nameAr}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">لم تحصل على شارات بعد</p>
                  <p className="text-sm text-gray-400">استمر في التعلم لتحصل على شارتك الأولى!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-8">
            {earnedBadges.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  الشارات المكتسبة ({earnedBadges.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {earnedBadges.map(badge => (
                    <div 
                      key={badge.id}
                      className="bg-white rounded-xl p-4 shadow-sm text-center border-2 border-yellow-200"
                    >
                      <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-3">
                        {getBadgeIcon(badge.icon)}
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1">{badge.nameAr}</h4>
                      <p className="text-sm text-gray-500 mb-2">{badge.descriptionAr}</p>
                      {badge.earnedAt && (
                        <p className="text-xs text-green-600">
                          حصلت عليها في {new Date(badge.earnedAt).toLocaleDateString('ar-EG')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unearnedBadges.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-gray-400" />
                  شارات متاحة للحصول عليها ({unearnedBadges.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {unearnedBadges.map(badge => (
                    <div 
                      key={badge.id}
                      className="bg-white rounded-xl p-4 shadow-sm text-center opacity-60"
                    >
                      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                        {getBadgeIcon(badge.icon)}
                      </div>
                      <h4 className="font-bold text-gray-600 mb-1">{badge.nameAr}</h4>
                      <p className="text-sm text-gray-400 mb-2">{badge.descriptionAr}</p>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Zap className="w-3 h-3" />
                        +{badge.xpReward} XP
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {badges.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد شارات متاحة حالياً</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex flex-wrap gap-2">
              {[
                { id: 'xp', label: 'XP' },
                { id: 'streak', label: 'السلسلة' },
                { id: 'level', label: 'المستوى' },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setLeaderboardType(type.id as any)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    leaderboardType === type.id
                      ? 'bg-[#10B981] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {userRank && (
              <div className="p-4 bg-[#10B981]/5 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold">
                    {userRank}
                  </div>
                  <div>
                    <p className="font-bold text-[#10B981]">ترتيبك الحالي</p>
                    <p className="text-sm text-gray-500">من بين جميع المتعلمين</p>
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.userId}
                  className={`p-4 flex items-center gap-4 ${
                    index < 3 ? 'bg-gradient-to-l from-yellow-50' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-300 text-orange-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index === 0 ? <Crown className="w-5 h-5" /> :
                     index === 1 ? <Medal className="w-5 h-5" /> :
                     index === 2 ? <Award className="w-5 h-5" /> :
                     entry.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{entry.userName}</p>
                    <p className="text-sm text-gray-500">المستوى {entry.currentLevel}</p>
                  </div>
                  <div className="text-left">
                    {leaderboardType === 'xp' && (
                      <p className="font-bold text-[#10B981]">{entry.totalXP.toLocaleString()} XP</p>
                    )}
                    {leaderboardType === 'streak' && (
                      <p className="font-bold text-orange-500 flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {entry.currentStreak} يوم
                      </p>
                    )}
                    {leaderboardType === 'level' && (
                      <p className="font-bold text-[#10B981]">المستوى {entry.currentLevel}</p>
                    )}
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">لا يوجد متعلمين في لوحة المتصدرين حالياً</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#10B981] text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 Be Fluent. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
