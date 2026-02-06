"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Coffee, ClipboardList, Users, ShieldCheck, Zap, Clock, UserPlus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
    <main className="min-h-screen bg-white font-sans overflow-x-hidden" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              خريطة <span className="text-[#10B981]">التعلم الذكية</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              لماذا تختار Be Fluent؟ لأننا لا نقدم مجرد دروس، بل نبني لك طريقاً متكاملاً نحو الطلاقة يبدأ من تحديد أهدافك وحتى الاحتراف.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-20 relative overflow-hidden">
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
                  className="mb-8 md:mb-0 md:absolute bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hover:border-[#10B981] transition-all group z-10 w-full md:w-64"
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
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.icon}
                    </div>
                    <span className="text-4xl font-black text-gray-100 group-hover:text-gray-200 transition-colors">0{step.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">مميزات حصرية لضمان نجاحك</h2>
            <p className="text-gray-600">نظام تعليمي مرن يتكيف مع احتياجاتك الخاصة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Private Classes */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-br-[4rem] -ml-6 -mt-6"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#10B981] flex items-center justify-center text-white">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">الدروس الخاصة (Private)</h3>
                  <span className="text-[#10B981] font-bold">دعم فردي كامل</span>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  <span>مرونة تامة في اختيار وتعديل أوقات الحصص</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  <span>دعم مباشر 24/7 من المعلم الأساسي والمساعد</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  <span>تعديل الخطة الدراسية بناءً على سرعتك الشخصية</span>
                </li>
              </ul>
            </motion.div>

            {/* Group Classes */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-br-[4rem] -ml-6 -mt-6"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
                  <UserPlus className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">الحصص الجماعية</h3>
                  <span className="text-blue-500 font-bold">تفاعل اجتماعي محفز</span>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>مجموعات صغيرة جداً (بحد أقصى 3 طلاب فقط) لضمان المشاركة</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>بيئة تنافسية ودية تساعد على كسر حاجز الخوف من التحدث</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>تكلفة اقتصادية مع الحفاظ على جودة التعليم العالية</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}