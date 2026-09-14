'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, BarChart3, BookOpen, Check, ChevronDown, Clock3, Headphones, Menu, MessageCircle, ShieldCheck, UserRound, X } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import deskImage from '@/attached_assets/Screenshot_1448-03-26_at_6.59.10_PM_1788883183026.png';
import mountainImage from '@/attached_assets/Screenshot_1448-03-26_at_6.59.18_PM_1788883183031.png';
import travelImage from '@/attached_assets/Screenshot_1448-03-26_at_6.59.26_PM_1788883183031.png';

const packages = [
  { name: 'أساسيات اللغة', level: 'A1', price: '349', note: 'لبداية صحيحة وواثقة', featured: false },
  { name: 'تطوير المهارات', level: 'B1 - B2', price: '599', note: 'للتحدث بطلاقة أكثر', featured: true },
  { name: 'إتقان متقدم', level: 'C1', price: '999', note: 'للمستوى المهني والأكاديمي', featured: false },
];

const faqs = ['ما الذي يميز Be Fluent عن أي كورس آخر؟', 'هل يناسبني البرنامج إذا كنت مبتدئاً؟', 'كيف أعرف مستواي الحالي؟', 'هل الحصص أونلاين؟', 'هل يوجد متابعة بين الحصص؟', 'ماذا لو لم يناسبني الوقت؟'];

export default function HomePage() {
  const { language, toggleLanguage } = useTheme();
  const isArabic = language === 'ar';
  const tr = (arabic: string, english: string) => isArabic ? arabic : english;
  const localizedPackages = isArabic ? packages : [
    { name: 'English Foundations', level: 'A1', price: '349', note: 'For a confident, correct start', featured: false },
    { name: 'Skill Development', level: 'B1 - B2', price: '599', note: 'To speak with greater fluency', featured: true },
    { name: 'Advanced Mastery', level: 'C1', price: '999', note: 'For professional and academic goals', featured: false },
  ];
  const localizedFaqs = isArabic ? faqs : ['What makes Be Fluent different?', 'Is the program suitable for beginners?', 'How do I know my current level?', 'Are the classes online?', 'Is there follow-up between classes?', 'What if the schedule does not suit me?'];
  const [menuOpen, setMenuOpen] = useState(false);
  const [level, setLevel] = useState('B1');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="overflow-hidden bg-[#fdfdfb] text-[#1d2927]">
      <header className="h-[70px] border-b border-[#e5e9e5] bg-white">
        <div dir="ltr" className="mx-auto flex h-full max-w-[1130px] items-center justify-between px-5">
          <Link href="/" className="relative h-[38px] w-[126px] overflow-hidden" aria-label="Be Fluent">
            <Image src="/logo.png" alt="Be Fluent" width={126} height={115} className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2"/>
          </Link>
          <nav className="hidden items-center gap-6 text-[11px] font-semibold text-[#53615e] md:flex">
            <a href="#how">{tr('كيف نبدأ','How it works')}</a><a href="#levels">{tr('المستويات','Levels')}</a><a href="#packages">{tr('الباقات','Plans')}</a><a href="#stories">{tr('قصص النجاح','Success stories')}</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={toggleLanguage} className="px-3 py-2 text-[11px] font-semibold text-[#4c5a57]" aria-label={tr('عرض الموقع بالإنجليزية','View website in Arabic')}>{isArabic ? 'EN' : 'عربي'}</button>
            <Link href="/auth/login" className="border border-[#dce3df] px-4 py-2 text-[11px] font-bold transition hover:border-[#16835f]">{tr('دخول','Login')}</Link>
            <Link href="/auth/register" className="bg-[#16835f] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#106a4d]">{tr('ابدأ معنا','Get started')}</Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" aria-label={tr('القائمة','Menu')}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
        {menuOpen && <div className="absolute z-20 w-full border-b border-[#e5e9e5] bg-white p-4 md:hidden"><div className="mx-auto flex max-w-[1130px] flex-col gap-3 text-sm"><button onClick={toggleLanguage} className="text-start font-bold">{isArabic ? 'English' : 'العربية'}</button><a href="#how" onClick={() => setMenuOpen(false)}>{tr('كيف نبدأ','How it works')}</a><a href="#packages" onClick={() => setMenuOpen(false)}>{tr('الباقات','Plans')}</a><Link href="/auth/login">{tr('دخول','Login')}</Link><Link href="/auth/register" className="bg-[#16835f] px-4 py-3 text-center text-white">{tr('ابدأ معنا','Get started')}</Link></div></div>}
      </header>

      <section className="relative isolate mx-auto min-h-[360px] max-w-[1130px] overflow-hidden border-x border-[#e5e9e5] md:min-h-[405px]">
        <Image src={deskImage} alt="مساحة تعلم الإنجليزية" fill priority sizes="100vw" className="-z-20 hero-image-mobile-blur object-cover object-center"/>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#102927]/45 md:hidden"/>
        <div dir={isArabic ? 'rtl' : 'ltr'} className={`flex min-h-[360px] w-full flex-col justify-center px-7 py-12 md:min-h-[405px] md:w-[56%] md:px-14 ${isArabic ? 'md:mr-auto' : 'md:mr-auto'}`}>
          <p className="mb-5 font-['DM_Sans'] text-[9px] font-bold tracking-[.24em] text-[#16835f]">LEARN ENGLISH. BE ANYWHERE.</p>
          <h1 className="max-w-md text-[31px] font-extrabold leading-[1.55] tracking-tight md:text-[38px]">{tr('من أول كلمة','From your first word')}<br/>{tr('إلى طلاقة حقيقية','to real fluency')}</h1>
          <p className="mt-5 max-w-md text-[11px] leading-7 text-[#65736f]">{tr('برنامج عملي ومنظم يساعدك تتعلم الإنجليزية خطوة بخطوة، وتتحدث بثقة في حياتك وشغلك.','A practical, structured program that helps you learn English step by step and speak confidently in life and at work.')}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-[#16835f] px-5 py-3 text-[11px] font-bold text-white transition hover:bg-[#106a4d]">{tr('ابدأ رحلتك معنا','Start your journey')} <ArrowLeft size={14}/></Link>
            <Link href="/placement-test" className="inline-flex items-center gap-2 text-[11px] font-bold text-[#31403d]"><span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#aeb9b5]"><BarChart3 size={11}/></span>{tr('اعرف مستواك مجاناً','Take the free level test')}</Link>
          </div>
          <div className="mt-8 flex gap-6 text-[9px] text-[#74817e]"><span className="flex items-center gap-1"><Clock3 size={12}/>{tr('مرونة 24/7','24/7 flexibility')}</span><span className="flex items-center gap-1"><UserRound size={12}/>{tr('مدرسون محترفون','Expert tutors')}</span><span className="flex items-center gap-1"><ShieldCheck size={12}/>{tr('متابعة حقيقية','Real follow-up')}</span></div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1130px] px-6 py-16 text-center">
        <p className="text-[9px] font-bold tracking-[.2em] text-[#16835f]">HOW IT WORKS</p><h2 className="mt-2 text-[21px] font-extrabold">{tr('خطوات بسيطة لبداية أفضل','Simple steps to a better start')}</h2><p className="mt-2 text-[10px] text-[#72807c]">{tr('رحلتك للغة الإنجليزية تبدأ بقرار واضح وخطوات مدروسة.','Your English journey starts with a clear decision and thoughtful steps.')}</p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {(isArabic ? [['01','اعرف مستواك','اختبار قصير يساعدنا نحدد نقطة البداية المناسبة لك.'],['02','ابدأ مع المدرب','خطة واضحة وحصص عملية تناسب مستواك وهدفك.'],['03','طور لغتك','تطبيق ومتابعة مستمرة حتى ترى فرقاً حقيقياً.']] : [['01','Know your level','A short test helps us find the right starting point for you.'],['02','Meet your tutor','A clear plan and practical classes built around your level and goal.'],['03','Build your fluency','Ongoing practice and follow-up until you see real progress.']]).map(([n,t,d])=><article key={n} className="relative px-5"><span className="font-['DM_Sans'] text-xl font-bold text-[#23a474]">{n}</span><h3 className="mt-3 text-[13px] font-bold">{t}</h3><p className="mt-2 text-[10px] leading-6 text-[#6d7976]">{d}</p></article>)}
        </div>
      </section>

      <section id="levels" className="relative isolate overflow-hidden py-12 text-white"><Image src={mountainImage} alt="" fill sizes="100vw" className="-z-20 object-cover"/><div className="absolute inset-0 -z-10 bg-[#102927]/[.80]"/><div className="mx-auto max-w-[850px] px-6 text-center"><h2 className="text-[22px] font-bold">{tr('اختر مستواك وابدأ الآن','Choose your level and start now')}</h2><p className="mt-2 text-[10px] text-white/70">{tr('لكل مستوى هدف واضح وخطة تقربك من الطلاقة.','Every level has a clear goal and a plan that takes you closer to fluency.')}</p><div className="mt-8 grid grid-cols-5 gap-2">{['A1','A2','B1','B2','C1'].map((item)=><button key={item} onClick={()=>setLevel(item)} className={`border px-2 py-3 transition ${level===item?'border-[#28a978] bg-[#16835f]':'border-white/20 bg-white/10 hover:bg-white/20'}`}><b className="font-['DM_Sans'] block text-sm">{item}</b><span className="mt-1 block text-[8px]">{isArabic ? (item==='A1'?'مبتدئ':item==='A2'?'أساسي':item==='B1'?'متوسط':item==='B2'?'متقدم':'احترافي') : (item==='A1'?'Beginner':item==='A2'?'Elementary':item==='B1'?'Intermediate':item==='B2'?'Upper intermediate':'Advanced')}</span></button>)}</div></div></section>

      <section className="mx-auto max-w-[1130px] px-6 py-14 text-center"><h2 className="text-[20px] font-extrabold">{tr('كل ما تحتاجه في مكان واحد','Everything you need in one place')}</h2><div className="mt-10 grid grid-cols-2 gap-y-9 md:grid-cols-6">{[[BookOpen,tr('منهج عملي','Practical curriculum')],[Headphones,tr('تدريب استماع','Listening practice')],[MessageCircle,tr('ممارسة مستمرة','Ongoing practice')],[UserRound,tr('مدرب خاص','Personal tutor')],[BarChart3,tr('قياس التقدم','Progress tracking')],[ShieldCheck,tr('متابعة جادة','Dedicated support')]].map(([Icon,title])=>{const I=Icon as typeof BookOpen; return <div key={title as string} className="flex flex-col items-center"><I size={20} strokeWidth={1.5} className="text-[#16835f]"/><p className="mt-3 text-[10px] font-bold">{title as string}</p><span className="mt-1 text-[8px] text-[#89938f]">{tr('كل ما تحتاجه للتقدم','Built to help you progress')}</span></div>})}</div></section>

      <section id="packages" className="border-y border-[#e5e9e5] bg-[#fbfcfa] px-6 py-14 text-center"><p className="text-[9px] font-bold tracking-[.2em] text-[#16835f]">PLANS & PRICING</p><h2 className="mt-2 text-[21px] font-extrabold">{tr('باقات تناسب كل هدف','Plans for every goal')}</h2><div className="mx-auto mt-9 grid max-w-[930px] gap-4 md:grid-cols-3">{localizedPackages.map(p=><article key={p.level} className={`relative border p-6 ${isArabic ? 'text-right' : 'text-left'} ${p.featured?'border-[#16835f] bg-[#f4fbf7] shadow-[0_8px_25px_rgba(25,68,55,.08)]':'border-[#e2e7e3] bg-white'}`}>{p.featured&&<span className="absolute -top-3 right-1/2 translate-x-1/2 bg-[#16835f] px-3 py-1 text-[8px] font-bold text-white">{tr('الأكثر اختياراً','Most popular')}</span>}<p className="font-['DM_Sans'] text-[10px] font-bold text-[#16835f]">{p.level}</p><h3 className="mt-2 text-[15px] font-bold">{p.name}</h3><p className="mt-1 text-[9px] text-[#77837f]">{p.note}</p><div className="my-5 border-y border-[#e5e9e5] py-4"><b className="font-['DM_Sans'] text-3xl">{p.price}</b><span className={isArabic ? 'mr-1 text-[9px]' : 'ml-1 text-[9px]'}>{tr('جنيه / شهرياً','EGP / month')}</span></div>{(isArabic ? ['حصص مباشرة أسبوعياً','خطة تعليم واضحة','متابعة وتقييم مستمر','شهادة عند الإتمام'] : ['Weekly live classes','A clear learning plan','Continuous support and assessment','Certificate on completion']).map(x=><p key={x} className="mb-3 flex items-center gap-2 text-[9px]"><Check size={13} className="text-[#16835f]"/>{x}</p>)}<Link href="/auth/register" className={`mt-4 block py-3 text-center text-[10px] font-bold ${p.featured?'bg-[#16835f] text-white':'bg-[#f1f4f1] text-[#283633]'}`}>{tr('ابدأ الآن','Start now')}</Link></article>)}</div><Link href="/packages" className="mt-7 inline-block text-[10px] font-bold text-[#16835f] underline underline-offset-4">{tr('عرض كل الباقات','View all plans')}</Link></section>

      <section id="stories" className="mx-auto max-w-[1130px] px-6 py-14"><div className="text-center"><p className="text-[9px] font-bold tracking-[.2em] text-[#16835f]">STUDENT STORIES</p><h2 className="mt-2 text-[20px] font-extrabold">{tr('قصص حقيقية، نتائج حقيقية','Real stories, real results')}</h2></div><div className="mt-9 grid gap-4 md:grid-cols-3">{(isArabic ? [['مريم أحمد','كنت مترددة في البداية، لكن النظام والمتابعة خلوني أتكلم بثقة في شغلي.','B1 → B2','م'],['عمر خالد','المنهج عملي جداً. لأول مرة أحس إني بتعلم لغة أقدر أستخدمها فعلاً.','A2 → B1','ع'],['سارة محمد','الحصص منظمة والمدرب فاهم هدفي. فرق واضح في الاستماع والمحادثة.','A1 → A2','س']] : [['Mariam Ahmed','I was hesitant at first, but the structure and follow-up helped me speak confidently at work.','B1 → B2','M'],['Omar Khaled','The curriculum is truly practical. For the first time, I am learning a language I can actually use.','A2 → B1','O'],['Sara Mohamed','The classes are organized and my tutor understands my goal. My listening and speaking clearly improved.','A1 → A2','S']]).map(([name,quote,level,initial])=><article key={name} className="border border-[#e5e9e5] p-5"><div className="font-['DM_Sans'] text-lg leading-none text-[#16835f]">“</div><p className="mt-2 text-[10px] leading-6 text-[#56635f]">{quote}</p><div className="mt-5 flex items-center gap-2 border-t border-[#edf0ed] pt-3"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dcebe4] text-[8px] font-bold text-[#167655]">{initial}</span><div><b className="text-[10px]">{name}</b><span className={isArabic ? "mr-2 font-['DM_Sans'] text-[8px] text-[#16835f]" : "ml-2 font-['DM_Sans'] text-[8px] text-[#16835f]"}>{level}</span></div></div></article>)}</div></section>

      <section className="border-y border-[#e5e9e5] bg-[#fbfcfa] px-6 py-14"><div className="mx-auto max-w-[930px]"><div className="text-center"><p className="text-[9px] font-bold tracking-[.2em] text-[#16835f]">FAQ</p><h2 className="mt-2 text-[20px] font-extrabold">{tr('أسئلة شائعة','Frequently asked questions')}</h2></div><div className="mt-8 grid gap-x-7 md:grid-cols-2">{localizedFaqs.map((q,i)=><button key={q} onClick={()=>setOpenFaq(openFaq===i?null:i)} className={`border-b border-[#dfe5e0] py-4 ${isArabic ? 'text-right' : 'text-left'}`}><span className="flex items-center justify-between text-[10px] font-bold">{q}<ChevronDown size={15} className={`transition ${openFaq===i?'rotate-180':''}`}/></span>{openFaq===i&&<p className="mt-3 pe-7 text-[9px] leading-6 text-[#6d7875]">{tr('نبدأ بتحديد مستواك وهدفك، ثم نضع لك المسار الأنسب مع متابعة مستمرة من فريقنا.','We start by identifying your level and goal, then build the right path with continuous support from our team.')}</p>}</button>)}</div></div></section>

      <section className="relative isolate overflow-hidden text-white"><Image src={travelImage} alt="" fill sizes="100vw" className="-z-20 object-cover"/><div className="absolute inset-0 -z-10 bg-[#102928]/[.82]"/><div className="mx-auto max-w-[1130px] px-7 py-14"><div className={`${isArabic ? 'mr-auto text-right' : 'mr-auto text-left'} max-w-md`}><h2 className="text-[25px] font-extrabold leading-relaxed">{tr('جاهز تبدأ رحلتك؟','Ready to start your journey?')}</h2><p className="mt-2 text-[10px] leading-6 text-white/75">{tr('خذ الخطوة الأولى نحو إنجليزية أقوى، وفرص أوسع.','Take the first step toward stronger English and wider opportunities.')}</p><div className="mt-6 flex gap-3"><Link href="/auth/register" className="bg-[#16835f] px-5 py-3 text-[10px] font-bold text-white">{tr('ابدأ رحلتك معنا','Start your journey')}</Link><Link href="/placement-test" className="border border-white/60 px-5 py-3 text-[10px] font-bold">{tr('اختبار تحديد المستوى','Level test')}</Link></div></div><footer className="mt-14 flex flex-col justify-between gap-5 border-t border-white/15 pt-5 text-[8px] text-white/60 md:flex-row"><div><b className="font-['DM_Sans'] text-sm text-white">Be Fluent</b><p className="mt-2">FLUENCY COMES FIRST</p></div><div className="flex gap-5"><Link href="/auth/login">{tr('دخول','Login')}</Link><Link href="/packages">{tr('الباقات','Plans')}</Link><Link href="/placement-test">{tr('اختبار المستوى','Level test')}</Link></div><p>© 2025 Be Fluent Academy</p></footer><div className="mt-5 border-t border-white/10 pt-4 text-center text-[9px] text-white/55"><span>Made by </span><a href="https://qiroxstudio.online" target="_blank" rel="noopener noreferrer" className="font-bold text-white transition hover:text-[#75c7a1]">Qirox Studio group</a></div></div></section>
    </main>
  );
}