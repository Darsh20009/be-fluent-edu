'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import BrandLockup from '@/components/brand/BrandLockup';

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
              <Link href="/" className="min-w-0 shrink-0" aria-label="Be Fluent home">
                <BrandLockup
                  size={isMarketing ? 'md' : 'sm'}
                  tone={isMarketing ? 'dark' : 'light'}
                  tagline={isMarketing ? 'FLUENCY COMES FIRST' : undefined}
                  markClassName={isMarketing ? '' : 'rounded-md bg-white p-1'}
                  priority
                />
              </Link>
            )}
          </div>
          <div className="flex gap-2 xs:gap-3 items-center flex-shrink-0">{children}</div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
