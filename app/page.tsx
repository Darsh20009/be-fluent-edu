'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, BarChart3, BookOpen, Check, ChevronDown, Clock3, Headphones, Menu, MessageCircle, ShieldCheck, UserRound, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [level, setLevel] = useState('B1');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <main dir="rtl" className="overflow-hidden bg-[#fdfdfb] text-[#1d2927]">
      <header className="h-[70px] border-b border-[#e5e9e5] bg-white">
        <div dir="ltr" className="mx-auto flex h-full max-w-[1130px] items-center justify-between px-5">
          <Link href="/" className="relative h-[38px] w-[126px] overflow-hidden" aria-label="Be Fluent">
            <Image src="/logo.png" alt="Be Fluent" width={126} height={115} className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2"/>
          </Link>
          <nav className="hidden items-center gap-6 text-[11px] font-semibold text-[#53615e] md:flex">
            <a href="#how">كيف نبدأ</a><a href="#levels">المستويات</a><a href="#packages">الباقات</a><a href="#stories">قصص النجاح</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <button className="px-3 py-2 text-[11px] font-semibold text-[#4c5a57]">EN</button>
            <Link href="/auth/login" className="border border-[#dce3df] px-4 py-2 text-[11px] font-bold transition hover:border-[#16835f]">دخول</Link>
            <Link href="/auth/register" className="bg-[#16835f] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#106a4d]">ابدأ معنا</Link>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" aria-label="القائمة">{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
        {menuOpen && <div className="absolute z-20 w-full border-b border-[#e5e9e5] bg-white p-4 md:hidden"><div className="mx-auto flex max-w-[1130px] flex-col gap-3 text-sm"><a href="#how" onClick={() => setMenuOpen(false)}>كيف نبدأ</a><a href="#packages" onClick={() => setMenuOpen(false)}>الباقات</a><Link href="/auth/login">دخول</Link><Link href="/auth/register" className="bg-[#16835f] px-4 py-3 text-center text-white">ابدأ معنا</Link></div></div>}
      </header>

      <section dir="ltr" className="mx-auto grid max-w-[1130px] grid-cols-1 border-x border-[#e5e9e5] md:min-h-[390px] md:grid-cols-2">
        <div dir="rtl" className="order-2 flex flex-col justify-center px-8 py-14 md:order-1 md:px-14">
          <p className="mb-5 font-['DM_Sans'] text-[9px] font-bold tracking-[.24em] text-[#16835f]">LEARN ENGLISH. BE ANYWHERE.</p>
          <h1 className="max-w-md text-[31px] font-extrabold leading-[1.55] tracking-tight md:text-[38px]">من أول كلمة<br/>إلى طلاقة حقيقية</h1>
          <p className="mt-5 max-w-md text-[11px] leading-7 text-[#65736f]">برنامج عملي ومنظم يساعدك تتعلم الإنجليزية خطوة بخطوة، وتتحدث بثقة في حياتك وشغلك.</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-[#16835f] px-5 py-3 text-[11px] font-bold text-white transition hover:bg-[#106a4d]">ابدأ رحلتك معنا <ArrowLeft size={14}/></Link>
            <Link href="/placement-test" className="inline-flex items-center gap-2 text-[11px] font-bold text-[#31403d]"><span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#aeb9b5]"><BarChart3 size={11}/></span> اعرف مستواك مجاناً</Link>
          </div>
          <div className="mt-8 flex gap-6 text-[9px] text-[#74817e]"><span className="flex items-center gap-1"><Clock3 size={12}/> مرونة 24/7</span><span className="flex items-center gap-1"><UserRound size={12}/> مدرسون محترفون</span><span className="flex items-center gap-1"><ShieldCheck size={12}/> متابعة حقيقية</span></div>
        </div>
        <div className="relative order-1 min-h-[290px] overflow-hidden md:order-2 md:min-h-full"><Image src={deskImage} alt="مساحة تعلم الإنجليزية" fill priority sizes="(max-width: 767px) 100vw, 50vw" className="object-cover object-center"/></div>
      </section>

      <section id="how" className="mx-auto max-w-[1130px] px-6 py-16 text-center">
        <p className="text-[9px] font-bold tracking-[.2em] text-[#16835f]">HOW IT WORKS</p><h2 className="mt-2 text-[21px] font-extrabold">خطوات بسيطة لبداية أفضل</h2><p className="mt-2 text-[10px] text-[#72807c]">رحلتك للغة الإنجليزية تبدأ بقرار واضح وخطوات مدروسة.</p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[['01','اعرف مستواك','اختبار قصير يساعدنا نحدد نقطة البداية المناسبة لك.'],['02','ابدأ مع المدرب','خطة واضحة وحصص عملية تناسب مستواك وهدفك.'],['03','طور لغتك','تطبيق ومتابعة مستمرة حتى ترى فرقاً حقيقياً.']].map(([n,t,d])=><article key={n} className="relative px-5"><span className="font-['DM_Sans'] text-xl font-bold text-[#23a474]">{n}</span><h3 className="mt-3 text-[13px] font-bold">{t}</h3><p className="mt-2 text-[10px] leading-6 text-[#6d7976]">{d}</p></article>)}
        </div>
      </section>

      <section id="levels" className="relative isolate overflow-hidden py-12 text-white"><Image src={mountainImage} alt="" fill sizes="100vw" className="-z-20 object-cover"/><div className="absolute inset-0 -z-10 bg-[#102927]/[.80]"/><div className="mx-auto max-w-[850px] px-6 text-center"><h2 className="text-[22px] font-bold">اختر مستواك وابدأ الآن</h2><p className="mt-2 text-[10px] text-white/70">لكل مستوى هدف واضح وخطة تقربك من الطلاقة.</p><div className="mt-8 grid grid-cols-5 gap-2">{['A1','A2','B1','B2','C1'].map((item)=><button key={item} onClick={()=>setLevel(item)} className={`border px-2 py-3 transition ${level===item?'border-[#28a978] bg-[#16835f]':'border-white/20 bg-white/10 hover:bg-white/20'}`}><b className="font-['DM_Sans'] block text-sm">{item}</b><span className="mt-1 block text-[8px]">{item==='A1'?'مبتدئ':item==='A2'?'أساسي':item==='B1'?'متوسط':item==='B2'?'متقدم':'احترافي'}</span></button>)}</div></div></section>

      <section className="mx-auto max-w-[1130px] px-6 py-14 text-center"><h2 className="text-[20px] font-extrabold">كل ما تحتاجه في مكان واحد</h2><div className="mt-10 grid grid-cols-2 gap-y-9 md:grid-cols-6">{[[BookOpen,'منهج عملي'],[Headphones,'تدريب استماع'],[MessageCircle,'ممارسة مستمرة'],[UserRound,'مدرب خاص'],[BarChart3,'قياس التقدم'],[ShieldCheck,'متابعة جادة']].map(([Icon,title])=>{const I=Icon as typeof BookOpen; return <div key={title as string} className="flex flex-col items-center"><I size={20} strokeWidth={1.5} className="text-[#16835f]"/><p className="mt-3 text-[10px] font-bold">{title as string}</p><span className="mt-1 text-[8px] text-[#89938f]">كل ما تحتاجه للتقدم</span></div>})}</div></section>

      <section id="packages" className="border-y border-[#e5e9e5] bg-[#fbfcfa] px-6 py-14 text-center"><p className="text-[9px] font-bold tracking-[.2em] text-[#16835f]">PLANS & PRICING</p><h2 className="mt-2 text-[21px] font-extrabold">باقات تناسب كل هدف</h2><div className="mx-auto mt-9 grid max-w-[930px] gap-4 md:grid-cols-3">{packages.map(p=><article key={p.level} className={`relative border p-6 text-right ${p.featured?'border-[#16835f] bg-[#f4fbf7] shadow-[0_8px_25px_rgba(25,68,55,.08)]':'border-[#e2e7e3] bg-white'}`}>{p.featured&&<span className="absolute -top-3 right-1/2 translate-x-1/2 bg-[#16835f] px-3 py-1 text-[8px] font-bold text-white">الأكثر اختياراً</span>}<p className="font-['DM_Sans'] text-[10px] font-bold text-[#16835f]">{p.level}</p><h3 className="mt-2 text-[15px] font-bold">{p.name}</h3><p className="mt-1 text-[9px] text-[#77837f]">{p.note}</p><div className="my-5 border-y border-[#e5e9e5] py-4"><b className="font-['DM_Sans'] text-3xl">{p.price}</b><span className="mr-1 text-[9px]">جنيه / شهرياً</span></div>{['حصص مباشرة أسبوعياً','خطة تعليم واضحة','متابعة وتقييم مستمر','شهادة عند الإتمام'].map(x=><p key={x} className="mb-3 flex items-center gap-2 text-[9px]"><Check size={13} className="text-[#16835f]"/>{x}</p>)}<Link href="/auth/register" className={`mt-4 block py-3 text-center text-[10px] font-bold ${p.featured?'bg-[#16835f] text-white':'bg-[#f1f4f1] text-[#283633]'}`}>ابدأ الآن</Link></article>)}</div><Link href="/packages" className="mt-7 inline-block text-[10px] font-bold text-[#16835f] underline underline-offset-4">عرض كل الباقات</Link></section>

      <section id="stories" className="mx-auto max-w-[1130px] px-6 py-14"><div className="text-center"><p className="text-[9px] font-bold tracking-[.2em] text-[#16835f]">STUDENT STORIES</p><h2 className="mt-2 text-[20px] font-extrabold">قصص حقيقية، نتائج حقيقية</h2></div><div className="mt-9 grid gap-4 md:grid-cols-3">{[['مريم أحمد','كنت مترددة في البداية، لكن النظام والمتابعة خلوني أتكلم بثقة في شغلي.','B1 → B2'],['عمر خالد','المنهج عملي جداً. لأول مرة أحس إني بتعلم لغة أقدر أستخدمها فعلاً.','A2 → B1'],['سارة محمد','الحصص منظمة والمدرب فاهم هدفي. فرق واضح في الاستماع والمحادثة.','A1 → A2']].map(([name,quote,level])=><article key={name} className="border border-[#e5e9e5] p-5"><div className="font-['DM_Sans'] text-lg leading-none text-[#16835f]">“</div><p className="mt-2 text-[10px] leading-6 text-[#56635f]">{quote}</p><div className="mt-5 border-t border-[#edf0ed] pt-3"><b className="text-[10px]">{name}</b><span className="mr-2 font-['DM_Sans'] text-[8px] text-[#16835f]">{level}</span></div></article>)}</div></section>

      <section className="border-y border-[#e5e9e5] bg-[#fbfcfa] px-6 py-14"><div className="mx-auto max-w-[930px]"><div className="text-center"><p className="text-[9px] font-bold tracking-[.2em] text-[#16835f]">FAQ</p><h2 className="mt-2 text-[20px] font-extrabold">أسئلة شائعة</h2></div><div className="mt-8 grid gap-x-7 md:grid-cols-2">{faqs.map((q,i)=><button key={q} onClick={()=>setOpenFaq(openFaq===i?null:i)} className="border-b border-[#dfe5e0] py-4 text-right"><span className="flex items-center justify-between text-[10px] font-bold">{q}<ChevronDown size={15} className={`transition ${openFaq===i?'rotate-180':''}`}/></span>{openFaq===i&&<p className="mt-3 pl-7 text-[9px] leading-6 text-[#6d7875]">نبدأ بتحديد مستواك وهدفك، ثم نضع لك المسار الأنسب مع متابعة مستمرة من فريقنا.</p>}</button>)}</div></div></section>

      <section className="relative isolate overflow-hidden text-white"><Image src={travelImage} alt="" fill sizes="100vw" className="-z-20 object-cover"/><div className="absolute inset-0 -z-10 bg-[#102928]/[.82]"/><div className="mx-auto max-w-[1130px] px-7 py-14"><div dir="rtl" className="mr-auto max-w-md"><h2 className="text-[25px] font-extrabold leading-relaxed">جاهز تبدأ رحلتك؟</h2><p className="mt-2 text-[10px] leading-6 text-white/75">خذ الخطوة الأولى نحو إنجليزية أقوى، وفرص أوسع.</p><div className="mt-6 flex gap-3"><Link href="/auth/register" className="bg-[#16835f] px-5 py-3 text-[10px] font-bold text-white">ابدأ رحلتك معنا</Link><Link href="/placement-test" className="border border-white/60 px-5 py-3 text-[10px] font-bold">اختبار تحديد المستوى</Link></div></div><footer className="mt-14 flex flex-col justify-between gap-5 border-t border-white/15 pt-5 text-[8px] text-white/60 md:flex-row"><div><b className="font-['DM_Sans'] text-sm text-white">Be Fluent</b><p className="mt-2">FLUENCY COMES FIRST</p></div><div className="flex gap-5"><Link href="/auth/login">دخول</Link><Link href="/packages">الباقات</Link><Link href="/placement-test">اختبار المستوى</Link></div><p>© 2025 Be Fluent Academy</p></footer></div></section>
    </main>
  );
}