"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Sparkles } from 'lucide-react';

export default function CouponBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [coupon, setCoupon] = useState<{ code: string; discount: string; message: string } | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use a mock seasonal coupon
    const mockCoupon = {
      code: 'WELCOME2026',
      discount: '25%',
      message: 'خصم خاص بمناسبة العام الجديد! استخدم الكود عند الاشتراك'
    };
    
    const timer = setTimeout(() => {
      setCoupon(mockCoupon);
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || !coupon) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-emerald-600 via-[#10B981] to-teal-500 text-white py-3 px-4 shadow-lg"
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-white/20 p-2 rounded-lg hidden sm:block">
              <Tag className="w-4 h-4" />
            </div>
            <p className="text-sm md:text-base font-bold truncate">
              <span className="hidden sm:inline">{coupon.message}: </span>
              <span className="bg-white text-emerald-600 px-3 py-1 rounded-full text-xs md:text-sm mx-2">
                {coupon.code}
              </span>
              <span className="font-black text-amber-300">خصم {coupon.discount}</span>
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}