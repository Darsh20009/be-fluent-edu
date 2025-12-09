import React from 'react';
import { cn } from '@/lib/utils';

export interface FooterProps {
  children?: React.ReactNode;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ children, className }) => {
  return (
    <footer
      className={cn(
        'w-full border-t border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800',
        className
      )}
      role="contentinfo"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children || (
          <div className="py-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4 rtl:text-right">
                  About Youspeak
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 rtl:text-right">
                  Professional online English learning platform with live interactive classes.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4 rtl:text-right">
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/"
                      className="text-sm text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary-400 transition-colors rtl:text-right block"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="/courses"
                      className="text-sm text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary-400 transition-colors rtl:text-right block"
                    >
                      Courses
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about"
                      className="text-sm text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary-400 transition-colors rtl:text-right block"
                    >
                      About
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4 rtl:text-right">
                  Contact
                </h3>
                <ul className="space-y-2">
                  <li className="text-sm text-neutral-600 dark:text-neutral-400 rtl:text-right">
                    Email: info@youspeak.com
                  </li>
                  <li className="text-sm text-neutral-600 dark:text-neutral-400 rtl:text-right">
                    Phone: +123 456 7890
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4 rtl:text-right">
                  Follow Us
                </h3>
                <div className="flex gap-4 rtl:flex-row-reverse rtl:justify-end">
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary-400 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-8 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                © {new Date().getFullYear()} Youspeak. All rights reserved.
              </p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
