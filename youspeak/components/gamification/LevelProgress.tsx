'use client'

import { Star, ChevronUp } from 'lucide-react'

interface LevelProgressProps {
  level: number
  currentXP: number
  xpToNext: number
  levelTitle: string
  className?: string
}

export default function LevelProgress({ 
  level, 
  currentXP, 
  xpToNext, 
  levelTitle,
  className = '' 
}: LevelProgressProps) {
  const progress = Math.round((currentXP / xpToNext) * 100)
  
  const getLevelColor = (lvl: number) => {
    if (lvl >= 50) return 'from-yellow-500 to-amber-400'
    if (lvl >= 30) return 'from-purple-500 to-pink-500'
    if (lvl >= 20) return 'from-blue-500 to-cyan-400'
    if (lvl >= 10) return 'from-green-500 to-emerald-400'
    return 'from-gray-500 to-slate-400'
  }
  
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center`}>
          <span className="text-2xl font-bold text-white">{level}</span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-xl font-bold text-gray-800">{levelTitle}</span>
          </div>
          <p className="text-sm text-gray-500">المستوى {level}</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">المستوى التالي</p>
          <div className="flex items-center gap-1 text-green-600">
            <ChevronUp className="w-4 h-4" />
            <span className="font-bold">{xpToNext - currentXP} XP</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${getLevelColor(level)} rounded-full transition-all duration-700`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <span>{currentXP.toLocaleString()} XP</span>
          <span className="font-bold text-gray-700">{progress}%</span>
          <span>{xpToNext.toLocaleString()} XP</span>
        </div>
      </div>
      
      {progress >= 90 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
          <p className="text-yellow-700 font-medium">🌟 أنت قريب جداً من المستوى التالي!</p>
        </div>
      )}
    </div>
  )
}
