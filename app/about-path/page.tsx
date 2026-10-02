'use client';

import React from 'react';
import { 
  Trophy, 
  Target, 
  Map, 
  CheckCircle2, 
  Flag, 
  ArrowRight,
  Lightbulb,
  Users,
  MessageCircle,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { MarketingFrame } from '@/components/marketing/MarketingFrame';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { localeText } from '@/lib/locale';

export default function AboutPathPage() {
  const { language } = useTheme();
  const t = (ar: string, en: string) => localeText(language, ar, en);
  const levels = [
    { 
      id: 'A1', 
      name: t('مبتدئ', 'Beginner'),
      description: t('فهم واستخدام التعبيرات اليومية المألوفة والجمل البسيطة جداً.', 'Understand and use familiar everyday expressions and very simple sentences.'),
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'A2', 
      name: t('ابتدائي', 'Elementary'),
      description: t('فهم الجمل والتعبيرات المتكررة المرتبطة بالمجالات ذات الأهمية المباشرة.', 'Understand frequently used expressions related to areas of immediate relevance.'),
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'B1', 
      name: t('متوسط', 'Intermediate'),
      description: t('التعامل مع معظم المواقف التي قد تنشأ أثناء السفر في منطقة يتحدث بها الناس الإنجليزية.', 'Handle most situations that may arise while travelling in an English-speaking area.'),
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'B2', 
      name: t('فوق المتوسط', 'Upper Intermediate'),
      description: t('فهم الأفكار الرئيسية للنصوص المعقدة في المواضيع الملموسة والمجردة.', 'Understand the main ideas of complex texts on concrete and abstract topics.'),
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'C1', 
      name: t('متقدم', 'Advanced'),
      description: t('فهم مجموعة واسعة من النصوص الطويلة والمتطلبة والتعرف على المعاني الضمنية.', 'Understand a wide range of demanding, longer texts and recognize implicit meaning.'),
      color: 'from-red-500 to-red-600'
    }
  ];

  const steps = [
    {
      title: t('تحديد المستوى', 'Level assessment'),
      desc: t('نبدأ باختبار دقيق وشامل لتحديد مستواك الحالي في اللغة.', 'We begin with a thorough assessment to determine your current level.'),
      icon: <Target className="w-6 h-6" />
    },
    {
      title: t('خطة تعليمية مخصصة', 'A personalized learning plan'),
      desc: t('بناءً على نتيجتك، نحدد لك المسار الدراسي والدروس المناسبة لأهدافك.', 'Based on your results, we choose the learning path and lessons that fit your goals.'),
      icon: <Map className="w-6 h-6" />
    },
    {
      title: t('التفاعل المباشر', 'Live interaction'),
      desc: t('حصص تفاعلية مباشرة مع معلمين خبراء لتدريبك على النطق والتحدث.', 'Live interactive lessons with expert teachers to practice pronunciation and speaking.'),
      icon: <MessageCircle className="w-6 h-6" />
    },
    {
      title: t('الممارسة اليومية', 'Daily practice'),
      desc: t('أدوات ذكية للمفردات، الكتابة الحرة، واختبارات دورية لضمان التقدم.', 'Smart vocabulary tools, free writing, and regular tests to ensure progress.'),
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: t('الوصول للطلاقة', 'Achieve fluency'),
      desc: t('متابعة مستمرة حتى تصل لمرحلة التحدث بطلاقة وثقة تامة.', 'Ongoing support until you can speak fluently and confidently.'),
      icon: <Trophy className="w-6 h-6" />
    }
  ];

  return (
    <MarketingFrame>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1c332e] px-4 py-16 text-[#fffefa]">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <p className="mb-4 text-[10px] font-bold tracking-[.2em] text-[#8bcfb0]">{t('طريق واضح نحو التقدم', 'A CLEAR WAY FORWARD')}</p>
          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight md:text-5xl">
            {t('اعرف طريقك للطلاقة مع', 'Find your path to fluency with')} <span className="underline decoration-white/30">Be Fluent</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('نحن هنا لنأخذ بيدك من البداية وحتى التحدث بالإنجليزية مثل أهلها، من خلال منهجية علمية وأدوات تعليمية متطورة.', 'We guide you from the very beginning to speaking English naturally, through a proven method and modern learning tools.')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register" className="bg-[#e6efe7] px-6 py-3 text-[11px] font-bold text-[#17342d] transition hover:bg-white">
              {t('ابدأ رحلتك الآن', 'Start your journey')}
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Goal */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-12 border border-[#dbe3dc] bg-[#fffefa] p-7 md:flex-row md:p-10">
            <div className="md:w-1/2">
                <div className="mb-6 inline-flex items-center gap-2 border border-[#b8d4c5] bg-[#edf6ef] px-3 py-2 text-xs font-bold text-[#147050]">
                <Target className="w-4 h-4" />
                {t('هدف المنصة', 'Our mission')}
              </div>
              <h2 className="mb-6 text-3xl font-bold text-[#1e2b29] md:text-4xl">{t('لماذا Be Fluent؟', 'Why Be Fluent?')}</h2>
              <p className="mb-6 leading-8 text-[#68756f]">
                {t('هدفنا في Be Fluent ليس مجرد تعليم كلمات وقواعد، بل تمكينك من "استخدام" اللغة في حياتك اليومية والعملية. نحن نؤمن أن تعلم اللغة يجب أن يكون تجربة ممتعة وتفاعلية ومبنية على الممارسة الحقيقية.', 'Our goal at Be Fluent is not just to teach words and grammar, but to help you use English in daily life and at work. Learning should be enjoyable, interactive, and grounded in real practice.')}
              </p>
              <ul className="space-y-4">
                {[
                  t('توفير بيئة تعليمية عربية داعمة.', 'A supportive Arabic-speaking learning environment.'),
                  t('التركيز على مهارات التحدث والاستماع.', 'A focus on speaking and listening skills.'),
                  t('استخدام تقنيات التكرار المتباعد لحفظ الكلمات.', 'Spaced repetition techniques to remember vocabulary.'),
                  t('متابعة دورية عبر واتساب لضمان الالتزام.', 'Regular WhatsApp check-ins to help you stay on track.')
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#53615c]">
                    <CheckCircle2 className="h-5 w-5 text-[#147050]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute inset-0 aspect-square w-full rotate-3 bg-[#d9ebdf]"></div>
              <div className="relative z-10 border border-[#dbe3dc] bg-[#fffefa] p-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                     <Users className="w-10 h-10 text-[#10B981] mb-2" />
                     <div className="font-bold text-2xl">5000+</div>
                      <div className="text-sm text-gray-500">{t('طالب نشط', 'Active students')}</div>
                   </div>
                   <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                     <Lightbulb className="w-10 h-10 text-[#10B981] mb-2" />
                     <div className="font-bold text-2xl">100+</div>
                      <div className="text-sm text-gray-500">{t('خبير تعليمي', 'Learning experts')}</div>
                   </div>
                   <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                     <MessageCircle className="w-10 h-10 text-[#10B981] mb-2" />
                     <div className="font-bold text-2xl">24/7</div>
                      <div className="text-sm text-gray-500">{t('دعم فني', 'Support')}</div>
                   </div>
                   <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                     <Flag className="w-10 h-10 text-[#10B981] mb-2" />
                     <div className="font-bold text-2xl">98%</div>
                      <div className="text-sm text-gray-500">{t('نسبة الرضا', 'Satisfaction')}</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="border-y border-[#dfe5dd] bg-[#f4f6f0] py-16">
        <div className="max-w-6xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#1F2937] mb-4">{t('مستويات اللغة الإنجليزية (CEFR)', 'English levels (CEFR)')}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('نعتمد الإطار الأوروبي المرجعي الموحد للغات لضمان جودة ومصداقية تعليمك.', 'We use the Common European Framework of Reference to ensure a consistent, credible learning experience.')}</p>
        </div>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {levels.map((level) => (
             <div key={level.id} className="group relative border border-[#dbe3dc] bg-[#fffefa] p-6 transition-all hover:-translate-y-1 hover:border-[#147050]">
               <div className="mb-5 flex h-12 w-12 items-center justify-center bg-[#147050] font-mono text-lg font-black text-white">
                {level.id}
              </div>
               <h3 className="mb-3 text-xl font-bold text-[#1e2b29]">{level.name}</h3>
               <p className="mb-6 leading-relaxed text-[#68756f]">{level.description}</p>
               <div className="h-px w-12 bg-[#b8d4c5] transition-all duration-500 group-hover:w-full"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Path Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#1F2937] mb-4">{t('مسار الطالب في Be Fluent', 'Your learning journey at Be Fluent')}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('خطة واضحة ومدروسة تأخذك من الصفر إلى الاحتراف خطوة بخطوة.', 'A clear, thoughtful plan that takes you from beginner to advanced, step by step.')}</p>
        </div>
        <div className="max-w-4xl mx-auto px-4 relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#10B981] to-transparent hidden md:block opacity-20"></div>
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Number Circle */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-[#10B981] shadow-xl flex items-center justify-center text-[#10B981] font-black text-xl z-10">
                  {index + 1}
                </div>
                
                {/* Content Box */}
                <div className="md:w-1/2 w-full pl-20 md:pl-0">
                  <div className={`bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12'}`}>
                    <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-[#1F2937]">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                <div className="md:w-1/2 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden bg-[#1c332e] p-8 text-center md:p-14">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981] blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 blur-[120px] opacity-10"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 relative z-10 leading-tight">
            {t('هل أنت مستعد لتغيير مستواك في الإنجليزية للأبد؟', 'Ready to transform your English for good?')}
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            {t('انضم اليوم لآلاف الطلاب الناجحين وابدأ رحلتك التعليمية مع أفضل نظام متابعة في العالم العربي.', 'Join thousands of successful learners and start with one of the region’s most supportive learning programs.')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="/auth/register" className="bg-[#147050] px-7 py-4 text-[11px] font-bold text-white transition-colors hover:bg-[#0e5940]">
              {t('سجل الآن مجاناً', 'Register for free')}
            </Link>
            <Link href="/contact" className="border border-white/30 px-7 py-4 text-[11px] font-bold text-white transition-colors hover:bg-white/10">
              {t('تحدث مع مستشار تعليمي', 'Talk to a learning advisor')}
            </Link>
          </div>
        </div>
      </section>
    </MarketingFrame>
  );
}
