'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Apple, Sparkles, Zap, Chrome } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/Button';

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
    if (typeof window === 'undefined') return;
    
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] p-8 text-white text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse"></div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90"
          >
            <X size={20} />
          </button>
          
          <div className="relative w-24 h-24 mx-auto mb-4 bg-white rounded-2xl p-3 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Be Fluent"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          
          <h2 className="text-2xl font-black mb-1 relative">Be Fluent</h2>
          <p className="text-white/80 text-sm font-medium relative">Fluency Comes First</p>
          
          <div className="flex justify-center gap-2 mt-3 relative">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> تعلم تفاعلي
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> وصول سريع
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-black text-gray-800 mb-4 text-center">
            أضف التطبيق للشاشة الرئيسية
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-[#10B981]/10 to-transparent rounded-xl hover:from-[#10B981]/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-right w-full">وصول سريع من الشاشة الرئيسية</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-[#10B981]/10 to-transparent rounded-xl hover:from-[#10B981]/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-right w-full">تجربة تطبيق كاملة بدون متصفح</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-[#10B981]/10 to-transparent rounded-xl hover:from-[#10B981]/20 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-right w-full">لا يحتاج تحميل من المتجر</span>
            </div>
          </div>

          {isIOS ? (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 text-sm text-gray-700 border border-gray-200 text-right" dir="rtl">
              <div className="flex items-center gap-2 mb-3 flex-row-reverse">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">لإضافة التطبيق على iPhone/iPad:</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 mr-2 text-gray-600">
                <li>
                  اضغط على زر المشاركة <span className="text-lg">⬆️</span> في متصفح Safari
                </li>
                <li>اختر &quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)</li>
                <li>اضغط &quot;إضافة&quot; (Add) في الزاوية العلوية</li>
              </ol>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-4 px-6 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-emerald-200"
            >
              <Chrome className="w-6 h-6" />
              تثبيت التطبيق عبر Chrome
            </button>
          )}
          
          <button
            onClick={handleDismiss}
            className="w-full mt-3 text-gray-400 py-2 text-sm hover:text-gray-600 transition-colors font-medium"
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
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
