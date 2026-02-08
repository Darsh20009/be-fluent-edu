"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CouponBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [coupon, setCoupon] = useState<{ code: string; discount: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchActiveCoupon() {
      try {
        const res = await fetch('/api/coupons/active');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const latest = data[0];
            setCoupon({
              code: latest.code,
              discount: latest.discount + '%',
              message: 'خصم خاص متاح الآن! استخدم الكود عند الاشتراك'
            });
            setIsVisible(true);
          }
        }
      } catch (err) {
        console.error('Error fetching coupon:', err);
      }
    }
    
    const timer = setTimeout(() => {
      fetchActiveCoupon();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success('تم نسخ الكود!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible || !coupon) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.9 }}
        className="fixed top-6 left-4 right-4 z-[100] md:left-auto md:right-6 md:w-[400px]"
      >
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-emerald-100 p-1">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-[22px] p-6 text-white relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full -ml-16 -mb-16 blur-3xl" />
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center relative z-0">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl mb-4 shadow-inner border border-white/20">
                <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black mb-1 leading-tight">
                {coupon.message}
              </h3>
              
              <div className="my-5 w-full relative group">
                <div 
                  onClick={copyToClipboard}
                  className="flex items-center justify-between py-4 px-6 bg-white/10 backdrop-blur-md border-2 border-dashed border-white/40 rounded-2xl cursor-pointer hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  <div className="text-left">
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-0.5">Copy Code / نسخ الكود</p>
                    <p className="text-2xl font-black tracking-[0.2em] font-mono leading-none">
                      {coupon.code}
                    </p>
                  </div>
                  <div className="bg-white text-emerald-600 p-2 rounded-xl shadow-md">
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-amber-400 text-emerald-900 px-6 py-2 rounded-full font-black shadow-lg transform -rotate-2">
                <Tag className="w-5 h-5" />
                <span className="text-2xl">{coupon.discount} OFF</span>
              </div>
              
              <p className="mt-5 text-[10px] font-bold text-white/60 uppercase tracking-tighter">
                * عرض لفترة محدودة | Limited Time Offer
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}