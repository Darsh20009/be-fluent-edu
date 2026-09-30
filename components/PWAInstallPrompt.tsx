'use client';

import { useState, useEffect } from 'react';
import { X, Download, Apple, Chrome } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const { language } = useTheme();
  const isArabic = language === 'ar';
  const tr = (ar: string, en: string) => isArabic ? ar : en;
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const isIOS = typeof window !== 'undefined'
    && typeof navigator !== 'undefined'
    && /iPad|iPhone|iPod/.test(navigator.userAgent)
    && !('MSStream' in window);
  const isInstalled = typeof window !== 'undefined'
    && window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    let promptTimer: number | undefined;
    const schedulePrompt = () => {
      if (promptTimer) window.clearTimeout(promptTimer);
      promptTimer = window.setTimeout(() => setShowPrompt(true), 12000);
    };

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      schedulePrompt();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (isIOS) {
      schedulePrompt();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      if (promptTimer) window.clearTimeout(promptTimer);
    };
  }, [isIOS]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <aside
      aria-label={tr('تثبيت تطبيق Be Fluent', 'Install the Be Fluent app')}
      className="fixed inset-x-0 bottom-0 z-[80] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:inset-x-auto sm:end-5 sm:bottom-5 sm:w-[380px] sm:p-0"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="max-h-[80dvh] overflow-y-auto rounded-lg border border-[#dce4dc] bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-[#202a25]">{tr('أضف Be Fluent إلى شاشتك الرئيسية', 'Add Be Fluent to your home screen')}</h2>
            <p className="mt-1 text-xs leading-5 text-[#65716a]">{tr('افتح الموقع بسهولة كتطبيق عند الحاجة.', 'Open the site like an app whenever you need it.')}</p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={tr('إغلاق', 'Dismiss')}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-[#65716a] hover:bg-[#f2f5f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#24714f]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {isIOS ? (
          <div className="mt-3 border-t border-[#e7ece7] pt-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-[#34443a]">
              <Apple size={15} aria-hidden="true" />
              {tr('على iPhone أو iPad', 'On iPhone or iPad')}
            </p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-xs leading-5 text-[#65716a]">
              <li>{tr('اضغط «مشاركة» في متصفح Safari.', 'Tap Share in Safari.')}</li>
              <li>{tr('اختر «إضافة إلى الشاشة الرئيسية».', 'Choose Add to Home Screen.')}</li>
              <li>{tr('اضغط «إضافة» للتأكيد.', 'Tap Add to confirm.')}</li>
            </ol>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24714f]"
          >
            <Chrome size={17} aria-hidden="true" />
            <Download size={16} aria-hidden="true" />
            {tr('تثبيت التطبيق', 'Install app')}
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-1 min-h-10 w-full text-xs font-medium text-[#65716a] underline underline-offset-4 hover:text-[#34443a]"
        >
          {tr('ليس الآن', 'Not now')}
        </button>
      </div>
    </aside>
  );
}
