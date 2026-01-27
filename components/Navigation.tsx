'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import { useTranslation } from '@/lib/hooks/useTranslation'

interface NavigationProps {
  isAuthenticated?: boolean
  userRole?: string
}

export default function Navigation({ isAuthenticated = false, userRole }: NavigationProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-[#10B981] dark:text-blue-400">
                Youspeak
              </h1>
            </Link>
            
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-6">
                <Link 
                  href="/" 
                  className={`text-sm font-medium hover:text-[#10B981] dark:hover:text-blue-400 transition-colors ${pathname === '/' ? 'text-[#10B981] dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {t('home')}
                </Link>
                <Link 
                  href="/packages" 
                  className={`text-sm font-medium hover:text-[#10B981] dark:hover:text-blue-400 transition-colors ${pathname === '/packages' ? 'text-[#10B981] dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {t('packages')}
                </Link>
                <Link 
                  href="/grammar" 
                  className={`text-sm font-medium hover:text-[#10B981] dark:hover:text-blue-400 transition-colors ${pathname === '/grammar' ? 'text-[#10B981] dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  Grammar / القواعد
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
            
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-[#10B981] dark:bg-blue-600 text-white rounded-lg hover:bg-[#003A6A] dark:hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t('dashboard')}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-[#10B981] dark:bg-blue-600 text-white rounded-lg hover:bg-[#003A6A] dark:hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
