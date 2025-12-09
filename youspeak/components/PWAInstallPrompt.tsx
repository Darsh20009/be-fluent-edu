'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Apple } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
        <div className="bg-gradient-to-r from-[#004E89] to-[#0066B3] p-6 text-white text-center relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 left-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl p-2 shadow-lg">
            <Image
              src="/logo.png"
              alt="Youspeak"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Youspeak</h2>
          <p className="text-white/90 text-sm">تعلم الإنجليزية مع مستر يوسف</p>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
            أضف التطبيق للصفحة الرئيسية
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-10 h-10 bg-[#004E89]/10 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-[#004E89]" />
              </div>
              <span className="text-sm">وصول سريع من الشاشة الرئيسية</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-10 h-10 bg-[#004E89]/10 rounded-full flex items-center justify-center">
                <Monitor className="w-5 h-5 text-[#004E89]" />
              </div>
              <span className="text-sm">تجربة تطبيق كاملة بدون متصفح</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-10 h-10 bg-[#004E89]/10 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-[#004E89]" />
              </div>
              <span className="text-sm">لا يحتاج تحميل من متجر التطبيقات</span>
            </div>
          </div>

          {isIOS ? (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <Apple className="w-5 h-5" />
                <span className="font-semibold">لإضافة التطبيق على iPhone/iPad:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 mr-2">
                <li>اضغط على زر المشاركة <span className="inline-block w-5 h-5 align-middle">⬆️</span></li>
                <li>اختر &quot;إضافة إلى الشاشة الرئيسية&quot;</li>
                <li>اضغط &quot;إضافة&quot;</li>
              </ol>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full bg-[#004E89] text-white py-3 px-6 rounded-xl font-bold text-lg hover:bg-[#003d6b] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              تثبيت التطبيق
            </button>
          )}
          
          <button
            onClick={handleDismiss}
            className="w-full mt-3 text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors"
          >
            ليس الآن
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
