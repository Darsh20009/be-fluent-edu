'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface AppHeaderProps {
  variant?: 'marketing' | 'dashboard';
  children?: React.ReactNode;
  className?: string;
  showLogo?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  variant = 'marketing',
  children,
  className,
  showLogo = true,
}) => {
  const isMarketing = variant === 'marketing';
  
  return (
    <header
      className={cn(
        'shadow-lg',
        isMarketing ? 'bg-[#F5F1E8]' : 'bg-[#004E89] text-white',
        className
      )}
    >
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <div
          className={cn(
            'flex items-center justify-between rounded-xl sm:rounded-2xl px-3 xs:px-4 sm:px-6 py-3 sm:py-4 shadow-lg',
            isMarketing
              ? 'backdrop-blur-sm bg-white/30 border-2 border-[#d4c9b8]'
              : 'bg-transparent'
          )}
        >
          <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1 mr-2">
            {showLogo && (
              <>
                <div className="relative flex-shrink-0">
                  {isMarketing && (
                    <div className="absolute inset-0 bg-[#004E89] blur-xl opacity-20 rounded-full"></div>
                  )}
                  <Image
                    src="/logo.png"
                    alt="Youspeak Logo"
                    width={50}
                    height={50}
                    priority
                    className={cn(
                      'relative',
                      isMarketing ? 'w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14' : 'w-8 h-8 sm:w-10 sm:h-10 rounded-lg'
                    )}
                    style={{ width: 'auto', height: 'auto', mixBlendMode: isMarketing ? 'multiply' : 'normal' }}
                  />
                </div>
                <div className="min-w-0">
                  <Link href="/">
                    <span
                      className={cn(
                        'text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold block truncate',
                        isMarketing ? 'text-black' : 'text-white'
                      )}
                    >
                      Youspeak
                    </span>
                  </Link>
                  {isMarketing && (
                    <p className="text-[10px] xs:text-xs text-gray-700 truncate">Master English Today</p>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2 xs:gap-3 items-center flex-shrink-0">{children}</div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
