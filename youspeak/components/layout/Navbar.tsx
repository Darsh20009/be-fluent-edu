'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface NavbarProps {
  logo?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ logo, children, className, sticky = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav
      className={cn(
        'w-full border-b-2 border-[#d4c9b8] bg-[#F5F1E8] z-40',
        sticky && 'sticky top-0',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {logo && <div className="flex-shrink-0">{logo}</div>}
            <div className="hidden md:flex md:items-center md:gap-6">{children}</div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-[#d4c9b8] bg-[#F5F1E8]"
          role="menu"
        >
          <div className="container mx-auto px-4 py-4 space-y-2">{children}</div>
        </div>
      )}
    </nav>
  );
};

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  active = false,
  className,
  onClick,
}) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        'block px-3 py-2 text-sm font-medium transition-colors rounded-md rtl:text-right',
        active
          ? 'text-primary bg-primary-50 dark:bg-primary-900/20'
          : 'text-neutral-700 hover:text-primary hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800',
        className
      )}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </a>
  );
};

export default Navbar;
