'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  className,
  defaultCollapsed = false,
  collapsible = true,
  header,
  footer,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-neutral-200 bg-[#F5F1E8] dark:bg-neutral-900 dark:border-neutral-800 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
      aria-label="Sidebar"
    >
      {header && (
        <div className={cn('border-b border-neutral-200 dark:border-neutral-800 p-4', isCollapsed && 'px-2')}>
          {header}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">{children}</nav>
      </div>

      {footer && (
        <div className={cn('border-t border-neutral-200 dark:border-neutral-800 p-4', isCollapsed && 'px-2')}>
          {footer}
        </div>
      )}

      {collapsible && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          )}
        </button>
      )}
    </aside>
  );
};

export interface SidebarItemProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  children,
  active = false,
  href,
  onClick,
  className,
}) => {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors rtl:flex-row-reverse',
        active
          ? 'bg-primary-50 text-primary dark:bg-primary-900/20'
          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
        className
      )}
      aria-current={active ? 'page' : undefined}
    >
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      <span className="truncate">{children}</span>
    </Component>
  );
};

export default Sidebar;
