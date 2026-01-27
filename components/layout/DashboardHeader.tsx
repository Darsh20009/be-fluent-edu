'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, LogOut } from 'lucide-react';
import AppHeader from './AppHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export interface DashboardHeaderProps {
  userName: string;
  roleBadge?: React.ReactNode;
  onToggleSidebar?: () => void;
  onLogout: () => void;
  showSettings?: boolean;
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  roleBadge,
  onToggleSidebar,
  onLogout,
  showSettings = true,
  className,
}) => {
  return (
    <AppHeader variant="dashboard" className={className} showLogo={true}>
      {onToggleSidebar && (
        <button
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white mr-2"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      
      {roleBadge && (
        <div className="hidden sm:block">
          {typeof roleBadge === 'string' ? (
            <Badge variant="success">{roleBadge}</Badge>
          ) : (
            roleBadge
          )}
        </div>
      )}
      
      <span className="text-xs sm:text-sm hidden sm:block text-white">{userName}</span>
      
      {showSettings && (
        <Link href="/settings">
          <Button
            variant="outline"
            size="sm"
            className="text-black border-black hover:bg-black hover:text-white text-xs sm:text-sm px-2 sm:px-2"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        className="text-white border-white hover:bg-white hover:text-[#10B981] text-xs sm:text-sm px-2 sm:px-4"
      >
        <LogOut className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Logout / خروج</span>
      </Button>
    </AppHeader>
  );
};

export default DashboardHeader;
