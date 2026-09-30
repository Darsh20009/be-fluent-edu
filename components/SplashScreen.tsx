'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLockup from '@/components/brand/BrandLockup';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    if (hasShownSplash) {
      setIsVisible(false);
      return;
    }

    setMounted(true);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('hasShownSplash', 'true');
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!mounted && typeof window !== 'undefined' && sessionStorage.getItem('hasShownSplash')) return null;
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        >
          {/* Background with blur effect */}
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md"></div>
          
          {/* Animated Background Circles - Responsive sizes */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 90, 180],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[20%] -right-[20%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] bg-gradient-to-br from-[#10B981]/15 to-emerald-300/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                scale: [1.1, 1, 1.1],
                rotate: [180, 90, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-[20%] -left-[20%] w-[45vw] h-[45vw] max-w-[350px] max-h-[350px] bg-gradient-to-tr from-teal-300/20 to-[#10B981]/15 rounded-full blur-3xl"
            />
          </div>

          {/* Floating Particles - Fewer on mobile */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: `${10 + (i * 10)}%`,
                  y: `${20 + (i * 8)}%`,
                  opacity: 0
                }}
                animate={{ 
                  y: [`${20 + (i * 8)}%`, `${-10}%`],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: 3 + (i * 0.3),
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
                className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981]/30"
              />
            ))}
          </div>

          {/* Main Content - Responsive */}
          <div className="relative z-10 text-center px-6 sm:px-8 w-full max-w-sm sm:max-w-md">
            <div className="mb-6 flex justify-center sm:mb-8">
              <BrandLockup size="xl" tagline="FLUENCY COMES FIRST" priority />
            </div>

            {/* Tagline - Responsive */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-base sm:text-lg md:text-xl font-bold text-gray-600 mb-6 sm:mb-8"
            >
              تعلم الإنجليزية بطلاقة
            </motion.p>

            {/* Progress Bar - Responsive */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.4 }}
              className="max-w-[200px] sm:max-w-[240px] mx-auto"
            >
              <div className="relative h-1.5 sm:h-2 bg-gray-200/60 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#10B981] via-emerald-400 to-teal-400 rounded-full"
                />
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                />
              </div>
              
              {/* Loading Text - Responsive */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-3 sm:mt-4 flex items-center justify-center gap-2"
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-gray-500 font-medium text-xs sm:text-sm"
                >
                  جاري التحميل
                </motion.span>
                <div className="flex gap-0.5 sm:gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#10B981] rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Domain - Responsive */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 sm:mt-8"
            >
              <span className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-wide">
                befluent-edu.online
              </span>
            </motion.div>
          </div>

          {/* Bottom Decoration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-t from-[#10B981]/5 to-transparent pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
