'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    const timer1 = setTimeout(() => setCurrentStep(1), 300);
    const timer2 = setTimeout(() => setCurrentStep(2), 600);
    const timer3 = setTimeout(() => setCurrentStep(3), 900);
    const timer4 = setTimeout(() => setIsVisible(false), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  if (!mounted || !isVisible) return null;

  const steps = [
    { text: 'Be', color: '#1F2937' },
    { text: 'Fluent', color: '#10B981' },
    { text: 'Now', color: '#1F2937' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
      
      <div className="text-center relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12 flex justify-center"
        >
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
            <Image
              src="/logo.png"
              alt="Be Fluent Logo"
              fill
              sizes="128px"
              className="relative z-10 object-contain p-2"
              priority
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-7xl font-extrabold mb-12 bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent"
        >
          Be Fluent
        </motion.h1>

        <div className="flex flex-col items-center justify-center gap-2 mb-12 min-h-[200px]">
          {steps.map((step, index) => (
            currentStep >= index && (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeOut"
                }}
                className="text-5xl font-extrabold tracking-wide"
                style={{ color: step.color }}
              >
                {step.text.split('').map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: charIndex * 0.05,
                      duration: 0.1
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            )
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ width: 12, height: 12, backgroundColor: '#d1c4b0' }}
              animate={{
                width: currentStep >= i ? 60 : 12,
                height: currentStep >= i ? 12 : 12,
                backgroundColor: currentStep >= i ? '#10B981' : '#e5e7eb'
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="rounded-full shadow-lg"
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="text-gray-700 text-lg font-semibold tracking-wide"
        >
          جاري التحميل • Loading...
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-16 left-16 text-6xl opacity-10"
        animate={{ 
          rotate: [0, 15, -15, 0],
          y: [0, -10, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        📚
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-20 text-5xl opacity-10"
        animate={{ 
          rotate: [0, -20, 20, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/4 text-4xl opacity-10"
        animate={{ 
          y: [-15, 15, -15],
          x: [-10, 10, -10]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        🎓
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 left-1/4 text-5xl opacity-10"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        🌟
      </motion.div>
      
      {/* Geometric Decorations */}
      <div className="absolute top-32 right-32 w-20 h-20 border-4 border-[#10B981]/10 rounded-lg rotate-12"></div>
      <div className="absolute bottom-40 left-20 w-16 h-16 border-4 border-[#10B981]/10 rounded-full"></div>
    </div>
  );
}
