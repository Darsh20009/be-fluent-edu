'use client'

import { Lock, CheckCircle } from 'lucide-react'

interface BadgeCardProps {
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  earned: boolean
  earnedAt?: string | null
  xpReward: number
  className?: string
}

export default function BadgeCard({
  name,
  nameAr,
  description,
  descriptionAr,
  icon,
  rarity,
  earned,
  earnedAt,
  xpReward,
  className = '',
}: BadgeCardProps) {
  const getRarityStyles = () => {
    switch (rarity) {
      case 'LEGENDARY':
        return {
          bg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
          border: 'border-yellow-400',
          text: 'text-yellow-400',
          label: 'أسطورية',
          glow: 'shadow-lg shadow-yellow-500/30'
        }
      case 'EPIC':
        return {
          bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500',
          border: 'border-purple-400',
          text: 'text-purple-400',
          label: 'ملحمية',
          glow: 'shadow-lg shadow-purple-500/30'
        }
      case 'RARE':
        return {
          bg: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500',
          border: 'border-blue-400',
          text: 'text-blue-400',
          label: 'نادرة',
          glow: 'shadow-lg shadow-blue-500/20'
        }
      case 'UNCOMMON':
        return {
          bg: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500',
          border: 'border-green-400',
          text: 'text-green-400',
          label: 'غير شائعة',
          glow: 'shadow-md shadow-green-500/20'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600',
          border: 'border-gray-400',
          text: 'text-gray-400',
          label: 'شائعة',
          glow: ''
        }
    }
  }
  
  const styles = getRarityStyles()
  
  return (
    <div className={`relative rounded-2xl p-4 transition-all duration-300 ${
      earned 
        ? `bg-white border-2 ${styles.border} ${styles.glow} hover:scale-105` 
        : 'bg-gray-100 border-2 border-gray-200 opacity-60'
    } ${className}`}>
      {!earned && (
        <div className="absolute inset-0 bg-gray-900/10 rounded-2xl flex items-center justify-center">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`w-14 h-14 rounded-xl ${earned ? styles.bg : 'bg-gray-300'} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={`font-bold ${earned ? 'text-gray-800' : 'text-gray-500'}`}>
              {nameAr}
            </h4>
            {earned && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          
          <p className={`text-sm ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
            {descriptionAr}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${earned ? styles.bg : 'bg-gray-300'} text-white`}>
              {styles.label}
            </span>
            
            <span className={`text-xs ${earned ? 'text-yellow-600' : 'text-gray-400'}`}>
              +{xpReward} XP
            </span>
          </div>
          
          {earned && earnedAt && (
            <p className="text-xs text-gray-400 mt-1">
              حصلت عليها: {new Date(earnedAt).toLocaleDateString('ar-EG')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
