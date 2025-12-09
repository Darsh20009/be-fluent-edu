'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  titleEn?: string
  icon?: LucideIcon
  showBack?: boolean
  backUrl?: string
  action?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  titleEn,
  icon: Icon,
  showBack = true,
  backUrl,
  action,
  className = '',
}: PageHeaderProps) {
  const router = useRouter()
  
  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }
  
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="رجوع"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </button>
        )}
        
        {Icon && (
          <div className="p-2 bg-blue-100 rounded-xl">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
        
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
          {titleEn && (
            <p className="text-sm text-gray-500">{titleEn}</p>
          )}
        </div>
      </div>
      
      {action && <div>{action}</div>}
    </div>
  )
}
