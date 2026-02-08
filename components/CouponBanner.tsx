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
        className="fixed top-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:w-96"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-[#10B981] to-teal-500 text-white p-6 rounded-2xl shadow-2xl border-4 border-white/20">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
          
          <div className="relative flex flex-col items-center text-center">
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="bg-white/20 p-3 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-black mb-1 tracking-tight">
              {coupon.message.split('!')[0]}!
            </h3>
            
            <div className="my-4 w-full py-3 px-4 bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/40 rounded-xl">
              <p className="text-sm text-white/80 font-medium mb-1 uppercase tracking-widest">Use Code / استخدم الكود</p>
              <p className="text-3xl font-black text-white tracking-widest font-mono">
                {coupon.code}
              </p>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-amber-300 drop-shadow-sm">
                {coupon.discount}
              </span>
              <span className="text-xl font-bold uppercase tracking-wider">OFF</span>
            </div>
            
            <p className="mt-4 text-xs font-medium text-white/70 italic">
              Limited time offer. Apply at checkout.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}