'use client'

import { useState, useEffect } from 'react'
import { Flame, Calendar, CheckCircle } from 'lucide-react'

interface StreakDisplayProps {
  streak: number
  longestStreak: number
  className?: string
}

export default function StreakDisplay({ streak, longestStreak, className = '' }: StreakDisplayProps) {
  const [days, setDays] = useState<{ day: string; active: boolean }[]>([])
  
  useEffect(() => {
    const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    const today = new Date().getDay()
    
    const weekDays = []
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7
      weekDays.push({
        day: dayNames[dayIndex],
        active: i < streak && i <= 6
      })
    }
    setDays(weekDays)
  }, [streak])
  
  return (
    <div className={`bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{streak} يوم</h3>
            <p className="text-sm opacity-80">سلسلة الحضور</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm opacity-80">أفضل سلسلة</p>
          <p className="text-xl font-bold">{longestStreak} يوم</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              day.active 
                ? 'bg-white text-orange-500' 
                : 'bg-white/20'
            }`}>
              {day.active ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <span className="text-xs mt-1 opacity-80">{day.day}</span>
          </div>
        ))}
      </div>
      
      {streak >= 7 && (
        <div className="mt-4 p-3 bg-white/20 rounded-xl text-center">
          <p className="font-bold">🎉 ممتاز! أسبوع كامل!</p>
          <p className="text-sm opacity-80">استمر هكذا للحصول على المزيد من المكافآت</p>
        </div>
      )}
    </div>
  )
}
