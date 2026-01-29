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
        'w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 transition-all duration-300',
        sticky && 'sticky top-0',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center gap-8">
            {logo && <div className="flex-shrink-0 transform hover:scale-105 transition-transform duration-300">{logo}</div>}
            <div className="hidden md:flex md:items-center md:bg-gray-50/50 md:p-1 md:rounded-xl md:border md:border-gray-100">
              {children}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-gray-50 text-neutral-700 hover:text-[#10B981] transition-all duration-300"
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
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top duration-300"
          role="menu"
        >
          <div className="container mx-auto px-4 py-6 space-y-3">{children}</div>
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
        'block px-5 py-2 text-sm font-bold transition-all duration-300 rounded-xl rtl:text-right',
        active
          ? 'text-[#10B981] bg-[#10B981]/5'
          : 'text-gray-600 hover:text-[#10B981] hover:bg-gray-50',
        className
      )}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </a>
  );
};

export default Navbar;
