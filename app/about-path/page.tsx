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

export default function AboutPathPage() {
  const levels = [
    { 
      id: 'A1', 
      name: 'مبتدئ (Beginner)', 
      description: 'فهم واستخدام التعبيرات اليومية المألوفة والجمل البسيطة جداً.',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'A2', 
      name: 'ابتدائي (Elementary)', 
      description: 'فهم الجمل والتعبيرات المتكررة المرتبطة بالمجالات ذات الأهمية المباشرة.',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'B1', 
      name: 'متوسط (Intermediate)', 
      description: 'التعامل مع معظم المواقف التي قد تنشأ أثناء السفر في منطقة يتحدث بها الناس الإنجليزية.',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'B2', 
      name: 'فوق المتوسط (Upper Intermediate)', 
      description: 'فهم الأفكار الرئيسية للنصوص المعقدة في المواضيع الملموسة والمجردة.',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'C1', 
      name: 'متقدم (Advanced)', 
      description: 'فهم مجموعة واسعة من النصوص الطويلة والمتطلبة والتعرف على المعاني الضمنية.',
      color: 'from-red-500 to-red-600'
    }
  ];

  const steps = [
    {
      title: 'تحديد المستوى',
      desc: 'نبدأ باختبار دقيق وشامل لتحديد مستواك الحالي في اللغة.',
      icon: <Target className="w-6 h-6" />
    },
    {
      title: 'خطة تعليمية مخصصة',
      desc: 'بناءً على نتيجتك، نحدد لك المسار الدراسي والدروس المناسبة لأهدافك.',
      icon: <Map className="w-6 h-6" />
    },
    {
      title: 'التفاعل المباشر',
      desc: 'حصص تفاعلية مباشرة مع معلمين خبراء لتدريبك على النطق والتحدث.',
      icon: <MessageCircle className="w-6 h-6" />
    },
    {
      title: 'الممارسة اليومية',
      desc: 'أدوات ذكية للمفردات، الكتابة الحرة، واختبارات دورية لضمان التقدم.',
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: 'الوصول للطلاقة',
      desc: 'متابعة مستمرة حتى تصل لمرحلة التحدث بطلاقة وثقة تامة.',
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
          <p className="mb-4 text-[10px] font-bold tracking-[.2em] text-[#8bcfb0]">A CLEAR WAY FORWARD</p>
          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight md:text-5xl">
            اعرف طريقك للطلاقة مع <span className="underline decoration-white/30">Be Fluent</span>
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            نحن هنا لنأخذ بيدك من البداية وحتى التحدث بالإنجليزية مثل أهلها، من خلال منهجية علمية وأدوات تعليمية متطورة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register" className="bg-[#e6efe7] px-6 py-3 text-[11px] font-bold text-[#17342d] transition hover:bg-white">
              ابدأ رحلتك الآن
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
                هدف المنصة
              </div>
              <h2 className="mb-6 text-3xl font-bold text-[#1e2b29] md:text-4xl">لماذا Be Fluent؟</h2>
              <p className="mb-6 leading-8 text-[#68756f]">
                هدفنا في Be Fluent ليس مجرد تعليم كلمات وقواعد، بل تمكينك من "استخدام" اللغة في حياتك اليومية والعملية. نحن نؤمن أن تعلم اللغة يجب أن يكون تجربة ممتعة وتفاعلية ومبنية على الممارسة الحقيقية.
              </p>
              <ul className="space-y-4">
                {[
                  'توفير بيئة تعليمية عربية داعمة.',
                  'التركيز على مهارات التحدث والاستماع.',
                  'استخدام تقنيات التكرار المتباعد لحفظ الكلمات.',
                  'متابعة دورية عبر واتساب لضمان الالتزام.'
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
                     <div className="text-sm text-gray-500">طالب نشط</div>
                   </div>
                   <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                     <Lightbulb className="w-10 h-10 text-[#10B981] mb-2" />
                     <div className="font-bold text-2xl">100+</div>
                     <div className="text-sm text-gray-500">خبير تعليمي</div>
                   </div>
                   <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                     <MessageCircle className="w-10 h-10 text-[#10B981] mb-2" />
                     <div className="font-bold text-2xl">24/7</div>
                     <div className="text-sm text-gray-500">دعم فني</div>
                   </div>
                   <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                     <Flag className="w-10 h-10 text-[#10B981] mb-2" />
                     <div className="font-bold text-2xl">98%</div>
                     <div className="text-sm text-gray-500">نسبة الرضا</div>
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
          <h2 className="text-3xl md:text-5xl font-bold text-[#1F2937] mb-4">مستويات اللغة الإنجليزية (CEFR)</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">نعتمد الإطار الأوروبي المرجعي الموحد للغات لضمان جودة ومصداقية تعليمك.</p>
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
          <h2 className="text-3xl md:text-5xl font-bold text-[#1F2937] mb-4">مسار الطالب في Be Fluent</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">خطة واضحة ومدروسة تأخذك من الصفر إلى الاحتراف خطوة بخطوة.</p>
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
            هل أنت مستعد لتغيير مستواك <br className="hidden md:block" /> في الإنجليزية للأبد؟
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            انضم اليوم لآلاف الطلاب الناجحين وابدأ رحلتك التعليمية مع أفضل نظام متابعة في العالم العربي.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="/auth/register" className="bg-[#147050] px-7 py-4 text-[11px] font-bold text-white transition-colors hover:bg-[#0e5940]">
              سجل الآن مجاناً
            </Link>
            <Link href="/contact" className="border border-white/30 px-7 py-4 text-[11px] font-bold text-white transition-colors hover:bg-white/10">
              تحدث مع مستشار تعليمي
            </Link>
          </div>
        </div>
      </section>
    </MarketingFrame>
  );
}
