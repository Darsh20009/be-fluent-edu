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
        'border-b border-[#dfe5dd]',
        isMarketing ? 'bg-[#fdfcf8]' : 'bg-[#10B981] text-white',
        className
      )}
    >
      <div className="mx-auto max-w-[1130px] px-4 py-3">
        <div
          className={cn(
            'flex items-center justify-between px-1 py-1',
            isMarketing
              ? ''
              : 'bg-transparent'
          )}
        >
          <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1 mr-2">
            {showLogo && (
              <>
                <div className="relative flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Be Fluent Logo"
                    width={50}
                    height={50}
                    priority
                    className={cn(
                      'relative',
              isMarketing ? 'w-9 h-9 sm:w-11 sm:h-11' : 'w-8 h-8 sm:w-10 sm:h-10 rounded-lg'
                    )}
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
                <div className="min-w-0">
                  <Link href="/">
                    <span
                      className={cn(
                        'text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold block truncate',
                         isMarketing ? 'text-[#1e2b29]' : 'text-white'
                      )}
                    >
                      Be Fluent
                    </span>
                  </Link>
                  {isMarketing && (
                     <p className="text-[9px] text-[#68756f] truncate">FLUENCY COMES FIRST</p>
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
