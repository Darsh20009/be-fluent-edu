"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Video, Map, Users, Zap, Calendar, Star, GraduationCap, CheckCircle2, BookOpen, Loader2 } from 'lucide-react';

const iconMap: Record<string, any> = {
  Target, Video, Map, Users, Zap, Calendar, Star, GraduationCap, CheckCircle2, BookOpen
};

const defaultSteps = [
  {
    id: 'goal',
    title: 'تحديد الهدف',
    desc: 'نبدأ بتحليل مستواك وتحديد أهدافك بدقة (عمل، سفر، أو تطوير ذاتي).',
    icon: 'Target',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'trial',
    title: 'الحصة التجريبية',
    desc: 'تجربة حية مع أحد معلمينا لتقييم مهارات التحدث والاستماع.',
    icon: 'Video',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    id: 'plan',
    title: 'خطة مخصصة',
    desc: 'نصمم لك منهجاً خاصاً يناسب وقتك وسرعة تعلمك.',
    icon: 'Map',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    id: 'dual',
    title: 'نظام المعلمين المزدوج',
    desc: 'معلم أساسي للحصص، ومعلم متابع للدعم (24/7)، ومختبر لتقييم تقدمك بشكل حيادي.',
    icon: 'Users',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    id: 'exams',
    title: 'نظام الاختبارات والقياس',
    desc: 'اختبارين مفاجئين أسبوعياً واختبار مستوى شهري (Level Test) لضمان انتقالك للمستوى التالي.',
    icon: 'Zap',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200'
  }
];

export default function LearningPathMap() {
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.learningPath) {
          try {
            const parsed = JSON.parse(data.learningPath);
            setSteps(Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultSteps);
          } catch (e) {
            setSteps(defaultSteps);
          }
        } else {
          setSteps(defaultSteps);
        }
      })
      .catch(() => setSteps(defaultSteps))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative py-20 overflow-hidden bg-white">
      {/* Creative SVG Connection Path */}
      <div className="absolute inset-0 opacity-10 pointer-events-none hidden lg:block">
        <svg className="w-full h-full" viewBox="0 0 1000 400" fill="none">
          <path 
            d="M100,200 C250,100 400,300 500,200 C600,100 750,300 900,200" 
            stroke="#10B981" 
            strokeWidth="4" 
            strokeDasharray="10 10"
            className="animate-pulse"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-700 px-6 py-3 rounded-full mb-6 font-bold shadow-sm border border-emerald-200"
          >
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>خارطة طريقك الفريدة للطلاقة</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            لماذا تختار <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Be Fluent</span>؟
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            نحن لا نقدم مجرد دروس، بل نبني لك مساراً تعليمياً متكاملاً يعتمد على التفاعل والمتابعة اللحظية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 relative">
          {steps.map((step, index) => {
            const IconComponent = iconMap[step.icon] || Target;
            return (
              <motion.div
                key={step.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-[2.5rem] border-2 ${step.borderColor || 'border-gray-100'} ${step.bgColor || 'bg-white'} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden`}
              >
                {/* Decorative Background Element */}
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="absolute top-4 left-4 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm flex items-center justify-center font-black text-emerald-600 border border-emerald-100">
                  {index + 1}
                </div>
                <div className={`${step.color || 'text-emerald-600'} mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 text-base leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Exclusive Features Section */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-gradient-to-br from-white to-emerald-50/30 p-8 md:p-16 rounded-[4rem] shadow-2xl shadow-emerald-900/10 border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-gray-900 mb-10 leading-tight">
              مميزات <span className="text-emerald-600 underline decoration-emerald-200 decoration-8 underline-offset-8">حصرية</span> تناسب طموحك
            </h3>
            <div className="space-y-8">
              {[
                { 
                  title: 'الدروس الخاصة (Private)', 
                  desc: 'دعم فردي كامل، مرونة تامة في اختيار المواعيد، ومنهج مكثف مصمم لك وحدك لتحقيق أهدافك في أسرع وقت.',
                  icon: <Zap className="w-6 h-6" />
                },
                { 
                  title: 'المجموعات (Groups)', 
                  desc: 'مجموعات صغيرة جداً (بحد أقصى 3 طلاب) لضمان حصول كل طالب على وقت كافٍ للتحدث والممارسة التفاعلية.',
                  icon: <Users className="w-6 h-6" />
                },
                { 
                  title: 'نظام المتابعة والمختبر', 
                  desc: 'فريق متكامل معك: معلم للحصص، مساعد للمتابعة اليومية، ومختبر لتقييمك بانتظام لضمان جودة التعلم.',
                  icon: <CheckCircle2 className="w-6 h-6" />
                }
              ].map((benefit, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex gap-6 group"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-white shadow-xl shadow-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">{benefit.title}</h4>
                    <p className="text-gray-600 text-lg leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-[3rem] p-10 flex flex-col justify-center text-center border border-white shadow-xl">
            <div className="mb-8 inline-flex mx-auto p-6 bg-emerald-600 rounded-[2rem] shadow-2xl shadow-emerald-200 animate-bounce-slow">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
            <h4 className="text-3xl font-black text-gray-900 mb-6">هل أنت مستعد للتغيير؟</h4>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              انضم لمجتمع Be Fluent اليوم وابدأ رحلتك باختبار تحديد مستوى مجاني تماماً وحصة تجريبية لرؤية الفرق بنفسك.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-2xl shadow-emerald-200">
                ابدأ رحلتك مجاناً
              </button>
              <button className="bg-white text-emerald-600 border-2 border-emerald-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-emerald-50 transition-all transform hover:scale-105">
                تواصل معنا
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}