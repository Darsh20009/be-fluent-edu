"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Video, Map, Users, Zap, Calendar, Star, GraduationCap, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    id: 'goal',
    title: 'تحديد الهدف',
    desc: 'نبدأ بتحليل مستواك وتحديد أهدافك بدقة (عمل، سفر، أو تطوير ذاتي).',
    icon: <Target className="w-8 h-8" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'trial',
    title: 'الحصة التجريبية',
    desc: 'تجربة حية مع أحد معلمينا لتقييم مهارات التحدث والاستماع.',
    icon: <Video className="w-8 h-8" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    id: 'plan',
    title: 'خطة مخصصة',
    desc: 'نصمم لك منهجاً خاصاً يناسب وقتك وسرعة تعلمك.',
    icon: <Map className="w-8 h-8" />,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    id: 'dual',
    title: 'نظام المعلمين المزدوج',
    desc: 'معلم أساسي للحصص، ومعلم متابع للدعم، ومختبر لتقييم تقدمك.',
    icon: <Users className="w-8 h-8" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    id: 'exams',
    title: 'نظام الاختبارات المستمر',
    desc: 'اختبارين مفاجئين أسبوعياً واختبار مستوى شهري لضمان الإتقان.',
    icon: <Zap className="w-8 h-8" />,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200'
  }
];

export default function LearningPathMap() {
  return (
    <div className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-4 font-bold"
          >
            <Star className="w-4 h-4" />
            <span>خارطة طريقك للطلاقة</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">رحلة تعلم <span className="text-emerald-600">فريدة</span> من نوعها</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">نظام تعليمي متكامل يضمن لك النتائج من خلال المتابعة المستمرة والتركيز الشخصي.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl border-2 ${step.borderColor} ${step.bgColor} hover:shadow-xl transition-all duration-300 group`}
            >
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-full shadow-lg border-2 border-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:text-emerald-600 transition-colors">
                {index + 1}
              </div>
              <div className={`${step.color} mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-12 rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-emerald-50">
          <div>
            <h3 className="text-3xl font-black text-gray-900 mb-8">لماذا <span className="text-emerald-600">Be Fluent</span> هي خيارك الأفضل؟</h3>
            <div className="space-y-6">
              {[
                { title: 'دروس خاصة (Private)', desc: 'دعم كامل، مرونة قصوى في الأوقات، ومميزات حصرية لكل طالب.' },
                { title: 'دروس جماعية (Groups)', desc: 'مجموعات صغيرة جداً لا تزيد عن 3 طلاب لضمان التركيز والمشاركة.' },
                { title: 'متابعة يومية', desc: 'معلم متابع معك خارج أوقات الحصة للرد على استفساراتك وتصحيح واجباتك.' }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-emerald-50 rounded-[2rem] p-8 flex flex-col justify-center text-center">
            <div className="mb-6 inline-flex mx-auto p-4 bg-white rounded-3xl shadow-lg">
              <GraduationCap className="w-12 h-12 text-emerald-600" />
            </div>
            <h4 className="text-2xl font-black text-gray-900 mb-4">انضم لأكثر من 5000 طالب</h4>
            <p className="text-gray-600 mb-8">ابدأ رحلتك اليوم واحصل على تقييم مجاني لمستواك وخطتك التعليمية الأولى.</p>
            <button className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-xl shadow-emerald-200">
              ابدأ الآن مجاناً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}