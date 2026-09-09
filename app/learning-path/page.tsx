"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Coffee, ClipboardList, Users, ShieldCheck, Zap, Clock, UserPlus } from 'lucide-react';
import { MarketingFrame } from '@/components/marketing/MarketingFrame';

const pathSteps = [
  { 
    id: 1, 
    title: 'تحديد الهدف', 
    description: 'نبدأ بجلسة استشارية لتحديد أهدافك من تعلم الإنجليزية، سواء للعمل، الدراسة أو السفر.', 
    icon: <Target className="w-6 h-6" />,
    x: 10, y: 80, 
    color: '#3B82F6' 
  },
  { 
    id: 2, 
    title: 'الحصة التجريبية', 
    description: 'تجربة واقعية لنظامنا التعليمي مع أحد معلمينا الخبراء لتقييم مستواك الحالي.', 
    icon: <Coffee className="w-6 h-6" />,
    x: 30, y: 20, 
    color: '#10B981' 
  },
  { 
    id: 3, 
    title: 'الخطة المخصصة', 
    description: 'بناء منهج تعليمي مصمم خصيصاً لنقاط قوتك وضعفك لضمان أسرع تقدم ممكن.', 
    icon: <ClipboardList className="w-6 h-6" />,
    x: 50, y: 70, 
    color: '#F59E0B' 
  },
  { 
    id: 4, 
    title: 'نظام المعلمين المزدوج', 
    description: 'معلم أساسي للحصص ومعلم مساعد للمتابعة والتحفيز على مدار الساعة.', 
    icon: <Users className="w-6 h-6" />,
    x: 70, y: 30, 
    color: '#EF4444' 
  },
  { 
    id: 5, 
    title: 'المختبر والتقييم', 
    description: 'اختبارات شهرية دقيقة لقياس تقدمك في كل مستوى دراسي (A1-C1).', 
    icon: <ShieldCheck className="w-6 h-6" />,
    x: 90, y: 80, 
    color: '#8B5CF6' 
  },
  { 
    id: 6, 
    title: 'الاختبارات المفاجئة', 
    description: 'اختبارين أسبوعياً لضمان بقاء معلوماتك حاضرة وتطوير مهارات الاسترجاع السريع.', 
    icon: <Zap className="w-6 h-6" />,
    x: 110, y: 40, 
    color: '#EC4899' 
  },
];

export default function LearningPathPage() {
  return (
    <MarketingFrame>
      
      {/* Hero Section */}
      <section className="relative border-b border-[#dfe5dd] bg-[#f4f6f0] py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] font-bold tracking-[.2em] text-[#147050]">THE LEARNING PATH</p>
            <h1 className="mt-3 text-4xl font-black text-[#1e2b29] mb-6 leading-tight md:text-5xl">
              خريطة <span className="text-[#147050]">التعلم العملية</span>
            </h1>
            <p className="max-w-3xl mx-auto leading-8 text-[#66736e]">
              لماذا تختار Be Fluent؟ لأننا لا نقدم مجرد دروس، بل نبني لك طريقاً متكاملاً نحو الطلاقة يبدأ من تحديد أهدافك وحتى الاحتراف.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="relative overflow-hidden py-16">
        <div className="container mx-auto px-4">
          <div className="relative h-[800px] md:h-[600px] w-full max-w-6xl mx-auto">
            {/* SVG Path */}
            <svg viewBox="0 0 120 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-20 hidden md:block" preserveAspectRatio="none">
              <motion.path
                d="M 10 80 Q 20 50 30 20 T 50 70 T 70 30 T 90 80 T 110 40"
                fill="none"
                stroke="#10B981"
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>

            {/* Steps */}
            <div className="grid grid-cols-1 md:block h-full relative">
              {pathSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="mb-5 border border-[#dbe3dc] bg-[#fffefa] p-5 transition-all hover:border-[#147050] md:absolute md:mb-0 md:w-64"
                  style={{ 
                    left: `${step.x - 10}%`, 
                    top: `${step.y}%` 
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div 
                      className="flex h-11 w-11 items-center justify-center bg-[#147050] text-white transition-transform"
                    >
                      {step.icon}
                    </div>
                    <span className="font-mono text-3xl font-black text-[#dbe3dc]">0{step.id}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#1e2b29]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#68756f]">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Features Section */}
      <section className="border-y border-[#dfe5dd] bg-[#f4f6f0] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-black text-[#1e2b29] md:text-4xl">نظام يناسب التزامك</h2>
            <p className="text-[#68756f]">طريقتان واضحتان للتعلم، بنفس المتابعة الجادة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Private Classes */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="relative overflow-hidden border border-[#dbe3dc] bg-[#fffefa] p-7"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center bg-[#147050] text-white">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1e2b29]">الدروس الخاصة</h3>
                  <span className="text-sm font-bold text-[#147050]">دعم فردي كامل</span>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#53615c]">
                  <div className="h-1.5 w-1.5 bg-[#147050]"></div>
                  <span>مرونة تامة في اختيار وتعديل أوقات الحصص</span>
                </li>
                <li className="flex items-center gap-3 text-[#53615c]">
                  <div className="h-1.5 w-1.5 bg-[#147050]"></div>
                  <span>دعم مباشر 24/7 من المعلم الأساسي والمساعد</span>
                </li>
                <li className="flex items-center gap-3 text-[#53615c]">
                  <div className="h-1.5 w-1.5 bg-[#147050]"></div>
                  <span>تعديل الخطة الدراسية بناءً على سرعتك الشخصية</span>
                </li>
              </ul>
            </motion.div>

            {/* Group Classes */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="relative overflow-hidden border border-[#dbe3dc] bg-[#fffefa] p-7"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center bg-[#1e2b29] text-white">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1e2b29]">الحصص الجماعية</h3>
                  <span className="text-sm font-bold text-[#147050]">تفاعل اجتماعي محفز</span>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[#53615c]">
                  <div className="h-1.5 w-1.5 bg-[#147050]"></div>
                  <span>مجموعات صغيرة جداً (بحد أقصى 3 طلاب فقط) لضمان المشاركة</span>
                </li>
                <li className="flex items-center gap-3 text-[#53615c]">
                  <div className="h-1.5 w-1.5 bg-[#147050]"></div>
                  <span>بيئة تنافسية ودية تساعد على كسر حاجز الخوف من التحدث</span>
                </li>
                <li className="flex items-center gap-3 text-[#53615c]">
                  <div className="h-1.5 w-1.5 bg-[#147050]"></div>
                  <span>تكلفة اقتصادية مع الحفاظ على جودة التعليم العالية</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

    </MarketingFrame>
  );
}