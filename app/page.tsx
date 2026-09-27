'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Headphones,
  Menu,
  MessageCircle,
  Mic2,
  X,
} from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';

type PackageItem = {
  id: string | number;
  title: string;
  titleAr: string;
  price: string | number;
};

type PackageState =
  | { status: 'loading' }
  | { status: 'ready'; packages: PackageItem[] }
  | { status: 'empty' }
  | { status: 'error' }
  | { status: 'unavailable' };

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const packageEndpoint = '/api/packages';

export default function HomePage() {
  const { language, toggleLanguage } = useTheme();
  const isArabic = language === 'ar';
  const tr = (arabic: string, english: string) => isArabic ? arabic : english;
  const [menuOpen, setMenuOpen] = useState(false);
  const [level, setLevel] = useState('B1');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [packageState, setPackageState] = useState<PackageState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    async function loadPackages() {
      try {
        const response = await fetch(packageEndpoint, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        const body: unknown = await response.json().catch(() => null);
        const error = body && typeof body === 'object' && 'error' in body
          ? (body as { error: unknown }).error
          : undefined;
        const errorCode = error && typeof error === 'object' && 'code' in error
          ? String((error as { code: unknown }).code)
          : typeof error === 'string'
            ? error
            : '';

        if (response.status === 503 || errorCode === 'DATABASE_UNAVAILABLE') {
          setPackageState({ status: 'unavailable' });
          return;
        }
        if (!response.ok || !Array.isArray(body)) {
          setPackageState({ status: 'error' });
          return;
        }

        const items = body.filter((item): item is PackageItem => {
          if (!item || typeof item !== 'object') return false;
          const candidate = item as Record<string, unknown>;
          return (typeof candidate.id === 'string' || typeof candidate.id === 'number')
            && typeof candidate.title === 'string'
            && typeof candidate.titleAr === 'string'
            && (typeof candidate.price === 'number' || typeof candidate.price === 'string');
        });

        setPackageState(items.length ? { status: 'ready', packages: items } : { status: 'empty' });
      } catch {
        if (!controller.signal.aborted) setPackageState({ status: 'error' });
      }
    }

    void loadPackages();
    return () => controller.abort();
  }, [retryCount]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const levelDescription: Record<string, [string, string]> = {
    A1: ['البدء بالعبارات اليومية والتعريف بنفسك.', 'Start with everyday phrases and introducing yourself.'],
    A2: ['التعامل مع المواقف المألوفة بلغة بسيطة.', 'Handle familiar situations with simple language.'],
    B1: ['التعبير عن أفكارك في مواقف الحياة والعمل.', 'Share your ideas in everyday and work situations.'],
    B2: ['المشاركة بثقة في نقاشات أكثر تنوعاً.', 'Take part in a wider range of conversations with confidence.'],
    C1: ['استخدام اللغة بمرونة في سياقات متقدمة.', 'Use English flexibly in more demanding contexts.'],
    C2: ['التعبير بدقة وطلاقة في سياقات متعددة.', 'Express yourself precisely and fluently across contexts.'],
  };

  const faqItems = isArabic
    ? [
        ['كيف تبدو طريقة التعلم؟', 'مسار منظم يجمع بين الحصص المباشرة والممارسة، مع واجبات وملاحظات من المدرس وخطوات تالية واضحة.'],
        ['هل يوجد تدريب على المحادثة؟', 'نعم، تتضمن الرحلة ممارسة للتحدث إلى جانب الاستماع والمهارات الأخرى.'],
        ['كيف أختار المستوى المناسب؟', 'تعرّف على مستويات A1 إلى C2 ومسارات التعلم، ثم تواصل معنا لمناقشة نقطة البداية المناسبة لأهدافك.'],
        ['هل أحصل على ملاحظات من المدرس؟', 'تتضمن الرحلة ملاحظات من المدرس ومتابعة للواجبات لمساعدتك على معرفة ما تتدرب عليه بعد ذلك.'],
      ]
    : [
        ['What does learning look like?', 'A structured path that brings together live classes and practice, with homework, teacher feedback, and clear next steps.'],
        ['Will I practise speaking?', 'Yes. Speaking practice is part of the learning journey, alongside listening and other language skills.'],
        ['How do I choose a level?', 'Explore levels A1 to C2 and the learning paths, then contact us to discuss a starting point that fits your goals.'],
        ['Will my teacher give me feedback?', 'The learning journey includes teacher feedback and homework follow-up to help you know what to practise next.'],
      ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="min-h-[100dvh] overflow-x-clip bg-[#faf9f6] text-[#292635]">
      <header className="relative z-30 border-b border-[#e9e6e2] bg-[#faf9f6]">
        <div dir="ltr" className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="relative h-[43px] w-[127px] shrink-0 overflow-hidden" aria-label="Be Fluent home">
            <Image src="/logo.png" alt="Be Fluent" width={127} height={116} className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2" priority />
          </Link>

          <nav className="hidden items-center gap-7 text-[12px] font-semibold text-[#5f5b67] lg:flex" aria-label={tr('التنقل الرئيسي', 'Main navigation')}>
            <Link href="/about-path" className="inline-flex min-h-11 items-center transition-colors hover:text-[#4c2f79]">{tr('عن المنهج', 'Our approach')}</Link>
            <Link href="/learning-path" className="inline-flex min-h-11 items-center transition-colors hover:text-[#4c2f79]">{tr('مسار التعلم', 'Learning path')}</Link>
            <Link href="/packages" className="inline-flex min-h-11 items-center transition-colors hover:text-[#4c2f79]">{tr('الباقات', 'Packages')}</Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center transition-colors hover:text-[#4c2f79]">{tr('تواصل معنا', 'Contact')}</Link>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-sm px-3 text-[12px] font-semibold text-[#5f5b67] outline-none transition-colors hover:bg-[#f0edf3] focus-visible:ring-2 focus-visible:ring-[#4c2f79]"
              aria-label={tr('عرض الموقع بالإنجليزية', 'View website in Arabic')}
            >
              {isArabic ? 'EN' : 'العربية'}
            </button>
            <Link href="/auth/login" className="inline-flex min-h-11 items-center rounded-sm border border-[#d9d4de] px-4 text-[12px] font-bold text-[#403b49] transition-colors hover:border-[#4c2f79] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c2f79]">
              {tr('دخول', 'Log in')}
            </Link>
            <Link href="/auth/register" className="inline-flex min-h-11 items-center rounded-sm bg-[#4b3175] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#39245f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4b3175]">
              {tr('ابدأ التعلم', 'Start learning')}
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-sm px-2 text-[12px] font-semibold text-[#5f5b67] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c2f79]"
              aria-label={tr('عرض الموقع بالإنجليزية', 'View website in Arabic')}
            >
              {isArabic ? 'EN' : 'العربية'}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-sm text-[#393543] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4c2f79]"
              aria-label={menuOpen ? tr('إغلاق القائمة', 'Close menu') : tr('فتح القائمة', 'Open menu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" className="absolute inset-x-0 top-full border-b border-[#e9e6e2] bg-[#faf9f6] px-5 py-5 lg:hidden" aria-label={tr('التنقل الرئيسي', 'Main navigation')}>
            <div className="mx-auto flex max-w-[1200px] flex-col items-stretch gap-1">
              <Link href="/about-path" onClick={closeMenu} className="rounded px-3 py-3 text-sm font-semibold hover:bg-[#f0edf3]">{tr('عن المنهج', 'Our approach')}</Link>
              <Link href="/learning-path" onClick={closeMenu} className="rounded px-3 py-3 text-sm font-semibold hover:bg-[#f0edf3]">{tr('مسار التعلم', 'Learning path')}</Link>
              <Link href="/packages" onClick={closeMenu} className="rounded px-3 py-3 text-sm font-semibold hover:bg-[#f0edf3]">{tr('الباقات', 'Packages')}</Link>
              <Link href="/contact" onClick={closeMenu} className="rounded px-3 py-3 text-sm font-semibold hover:bg-[#f0edf3]">{tr('تواصل معنا', 'Contact')}</Link>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#e9e6e2] pt-4">
                <Link href="/auth/login" onClick={closeMenu} className="rounded-sm border border-[#d9d4de] px-3 py-3 text-center text-xs font-bold">{tr('دخول', 'Log in')}</Link>
                <Link href="/auth/register" onClick={closeMenu} className="rounded-sm bg-[#4b3175] px-3 py-3 text-center text-xs font-bold text-white">{tr('ابدأ التعلم', 'Start learning')}</Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <section className="mx-auto grid max-w-[1200px] items-center gap-8 px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:min-h-[580px] lg:grid-cols-[.95fr_1.05fr] lg:gap-14 lg:py-14">
        <div className={`${isArabic ? 'text-right' : 'text-left'} order-2 max-w-[540px] lg:order-1`}>
          <p className="mb-5 text-[10px] font-bold text-[#4b3175] sm:text-[11px]">
            {tr('تعلم الإنجليزية بهدف واضح', 'ENGLISH LEARNING, WITH A CLEAR PURPOSE')}
          </p>
          <h1 className="max-w-[540px] text-[34px] font-extrabold leading-[1.42] text-[#292635] sm:text-[46px] sm:leading-[1.35] lg:text-[54px]">
            {tr('الطلاقة تبدأ', 'Fluency comes')}<br />
            <span className="text-[#4b3175]">{tr('بالتعلّم الصحيح.', 'first.')}</span>
          </h1>
          <p className="mt-5 max-w-[470px] text-[13px] leading-[2] text-[#686573] sm:text-[14px]">
            {tr('رحلة تعلم منظمة من A1 إلى C2، تجمع بين الحصص المباشرة وممارسة التحدث وملاحظات المدرس؛ لتعرف دائماً خطوتك التالية.', 'A structured learning journey from A1 to C2, with live classes, speaking practice, and teacher feedback, so your next step is always clear.')}
          </p>
          <div className={`mt-7 flex flex-wrap items-center gap-3 ${isArabic ? 'justify-start' : 'justify-start'}`}>
            <Link href="/auth/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#4b3175] px-5 py-3 text-[12px] font-bold text-white transition-colors hover:bg-[#39245f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4b3175]">
              {tr('ابدأ رحلتك', 'Begin your journey')}
              {isArabic ? <ArrowLeft size={15} aria-hidden="true" /> : <ArrowUpRight size={15} aria-hidden="true" />}
            </Link>
            <Link href="/packages" className="inline-flex min-h-12 items-center gap-2 rounded-sm px-3 py-3 text-[12px] font-bold text-[#4b3175] underline decoration-[#c8bdd8] underline-offset-4 hover:decoration-[#4b3175] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b3175]">
              {tr('استكشف البرامج', 'Explore programs')}
            </Link>
          </div>
          <p className="mt-7 text-[11px] font-semibold text-[#696672]">
            <span className="me-2 inline-block h-[7px] w-[7px] rounded-full bg-[#4d8b69] align-middle" aria-hidden="true" />
            {tr('مسار عملي من المستوى A1 حتى C2', 'A practical path from A1 through C2')}
          </p>
        </div>
        <div className="relative order-1 min-h-[265px] overflow-hidden rounded-sm bg-[#e8e4dd] sm:min-h-[350px] lg:order-2 lg:min-h-[440px]">
          <Image src="/assets/home-hero-desk.png" alt={tr('مساحة هادئة لتعلم اللغة الإنجليزية', 'A calm space for learning English')} fill priority sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover object-center" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#211d2b]/30 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-sm border border-white/50 bg-[#faf9f6]/95 px-3 py-2.5 text-[10px] font-semibold text-[#393543] sm:bottom-6 sm:left-6 sm:px-4">
            <BookOpen size={15} className="text-[#4b3175]" aria-hidden="true" />
            {tr('تعلم منظّم. ممارسة حقيقية.', 'Structured learning. Real practice.')}
          </div>
        </div>
      </section>

      <div className="border-y border-[#e9e6e2] bg-[#f3f1ec]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-5 gap-y-5 px-5 py-6 sm:px-8 md:grid-cols-4 md:gap-5 md:py-7">
          {[
            [BookOpen, tr('مسار واضح', 'A clear learning path')],
            [MessageCircle, tr('ممارسة التحدث', 'Speaking practice')],
            [Headphones, tr('حصص مباشرة', 'Live classes')],
            [Check, tr('ملاحظات المدرس', 'Teacher feedback')],
          ].map(([Icon, title]) => {
            const FeatureIcon = Icon as typeof BookOpen;
            return (
              <div key={title as string} className={`flex items-center gap-3 ${isArabic ? 'justify-start' : 'justify-start'}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#e8e3ef] text-[#4b3175]">
                  <FeatureIcon size={17} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold text-[#403c49] sm:text-[12px]">{title as string}</span>
              </div>
            );
          })}
        </div>
      </div>

      <section className="mx-auto grid max-w-[1200px] gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className={isArabic ? 'text-right' : 'text-left'}>
          <p className="text-[10px] font-bold text-[#4b3175]">{tr('منهج عملي', 'A PRACTICAL APPROACH')}</p>
          <h2 className="mt-3 max-w-[410px] text-[26px] font-extrabold leading-[1.55] sm:text-[32px]">
            {tr('تعلّم اللغة لتستخدمها، لا لتكتفي بدراستها.', 'Learn English to use it, not just study it.')}
          </h2>
          <p className="mt-4 max-w-[410px] text-[12px] leading-[2] text-[#696672] sm:text-[13px]">
            {tr('كل خطوة في مسارك لها غرض: فهم أفضل، ممارسة أكثر، وتوجيه يساعدك على مواصلة التقدم.', 'Each part of your path has a purpose: clearer understanding, more practice, and guidance for what to work on next.')}
          </p>
          <Link href="/about-path" className="mt-6 inline-flex items-center gap-2 text-[12px] font-bold text-[#4b3175] underline decoration-[#c8bdd8] underline-offset-4 hover:decoration-[#4b3175]">
            {tr('تعرّف على منهجنا', 'Learn about our approach')}
            {isArabic ? <ArrowLeft size={14} aria-hidden="true" /> : <ArrowUpRight size={14} aria-hidden="true" />}
          </Link>
        </div>
        <div className="divide-y divide-[#e8e4df] border-y border-[#e8e4df]">
          {[
            [Mic2, tr('ممارسة مستمرة', 'Practice that keeps you speaking'), tr('مساحة لتطبيق ما تتعلمه والتدرّب على التعبير باللغة الإنجليزية.', 'Room to put new learning into practice and express yourself in English.')],
            [MessageCircle, tr('توجيه من المدرس', 'Feedback from your teacher'), tr('ملاحظات وواجبات تساعدك على فهم ما أتقنته وما يستحق تركيزك بعد ذلك.', 'Feedback and homework help you see what is clicking and what to focus on next.')],
            [BookOpen, tr('خطوات تالية واضحة', 'A clear next step'), tr('تعلم منظم يربط بين أهدافك ومستواك والممارسة المناسبة لك.', 'Structured learning connects your goals and level to the practice that fits.')],
          ].map(([Icon, title, body]) => {
            const FeatureIcon = Icon as typeof Mic2;
            return (
              <article key={title as string} className="flex gap-4 py-5 sm:gap-5 sm:py-6">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#eeebf2] text-[#4b3175]">
                  <FeatureIcon size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[13px] font-bold">{title as string}</h3>
                  <p className="mt-2 max-w-[490px] text-[11px] leading-[1.9] text-[#6d6975] sm:text-[12px]">{body as string}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#e9e6e2] bg-[#f2f0eb]">
        <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16">
          <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
            <div className={isArabic ? 'text-right' : 'text-left'}>
              <p className="text-[10px] font-bold text-[#4b3175]">{tr('مستويات اللغة', 'ENGLISH LEVELS')}</p>
              <h2 className="mt-2 text-[24px] font-extrabold sm:text-[30px]">{tr('ابدأ من مكانك.', 'Start where you are.')}</h2>
            </div>
            <p className={`max-w-[420px] text-[11px] leading-[1.9] text-[#686573] sm:text-[12px] ${isArabic ? 'text-right' : 'text-left'}`}>
              {tr('من A1 إلى C2، اختر مستوى لتتعرّف على محطته؛ ثم استكشف المسار الكامل.', 'From A1 to C2, choose a level to explore its focus, then see the full learning path.')}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3" role="group" aria-label={tr('اختر مستوى اللغة', 'Choose an English level')}>
            {levels.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLevel(item)}
                aria-pressed={level === item}
                className={`min-h-[67px] rounded-sm border px-3 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b3175] ${level === item ? 'border-[#4b3175] bg-[#4b3175] text-white' : 'border-[#dcd7df] bg-[#faf9f6] text-[#423d4a] hover:border-[#9989ad]'}`}
              >
                <span className="block font-['DM_Sans'] text-[15px] font-bold">{item}</span>
                <span className={`mt-1 block text-[11px] ${level === item ? 'text-white/75' : 'text-[#77727e]'}`}>{tr('المستوى', 'Level')}</span>
              </button>
            ))}
          </div>
          <div className={`mt-4 flex min-h-[93px] flex-col justify-center gap-2 rounded-sm border border-[#e2dde4] bg-[#faf9f6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
              <span className="font-['DM_Sans'] text-[19px] font-bold text-[#4b3175]">{level}</span>
              <p className="text-[11px] leading-[1.8] text-[#625e6a] sm:text-[12px]">{isArabic ? levelDescription[level][0] : levelDescription[level][1]}</p>
            </div>
            <Link href="/learning-path" className="inline-flex items-center gap-2 text-[11px] font-bold text-[#4b3175] hover:underline">
              {tr('استكشف المسار', 'Explore the path')}
              {isArabic ? <ArrowLeft size={14} aria-hidden="true" /> : <ArrowUpRight size={14} aria-hidden="true" />}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-[#4b3175]">{tr('الباقات', 'PACKAGES')}</p>
            <h2 className="mt-2 text-[24px] font-extrabold sm:text-[30px]">{tr('تفاصيل حقيقية، من المصدر.', 'Package details, straight from the source.')}</h2>
          </div>
          <Link href="/packages" className="inline-flex min-h-10 w-fit items-center gap-2 text-[11px] font-bold text-[#4b3175] underline decoration-[#c8bdd8] underline-offset-4 hover:decoration-[#4b3175]">
            {tr('عرض جميع الباقات', 'View all packages')}
            {isArabic ? <ArrowLeft size={14} aria-hidden="true" /> : <ArrowUpRight size={14} aria-hidden="true" />}
          </Link>
        </div>

        {packageState.status === 'loading' && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label={tr('جارٍ تحميل الباقات', 'Loading packages')} aria-busy="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="min-h-[170px] animate-pulse rounded-sm border border-[#e8e4df] bg-[#f3f1ec] p-6">
                <div className="h-3 w-1/3 rounded bg-[#e4e0da]" />
                <div className="mt-6 h-5 w-2/3 rounded bg-[#e4e0da]" />
                <div className="mt-5 h-3 w-1/2 rounded bg-[#e4e0da]" />
              </div>
            ))}
          </div>
        )}

        {packageState.status === 'ready' && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {packageState.packages.slice(0, 3).map((item) => (
              <article key={item.id} className="flex min-h-[190px] flex-col rounded-sm border border-[#e4e0da] bg-[#fffefa] p-5 sm:p-6">
                <p className="text-[10px] font-semibold text-[#77727e]">{tr('باقة تعليمية', 'Learning package')}</p>
                <h3 className="mt-3 text-[16px] font-bold leading-[1.6] text-[#292635]">{isArabic ? item.titleAr : item.title}</h3>
                <div className="mt-4 flex items-baseline gap-2 border-t border-[#eeebe6] pt-4">
                  <span className="text-[10px] text-[#77727e]">{tr('السعر المدرج', 'Listed price')}</span>
                  <span className="font-['DM_Sans'] text-[18px] font-bold text-[#4b3175]">{String(item.price)}</span>
                </div>
                <Link href="/packages" className="mt-auto inline-flex min-h-10 items-center gap-2 pt-3 text-[11px] font-bold text-[#4b3175] hover:underline">
                  {tr('التفاصيل', 'View details')}
                  {isArabic ? <ArrowLeft size={13} aria-hidden="true" /> : <ArrowUpRight size={13} aria-hidden="true" />}
                </Link>
              </article>
            ))}
          </div>
        )}

        {packageState.status === 'empty' && (
          <div className="mt-8 border border-dashed border-[#dcd7df] bg-[#f3f1ec] px-5 py-8 text-center">
            <p className="text-[13px] font-bold">{tr('لا توجد باقات متاحة حالياً.', 'No packages are available right now.')}</p>
            <p className="mt-2 text-[11px] text-[#6d6975]">{tr('يمكنك استكشاف مسار التعلم أو التواصل معنا لمعرفة المزيد.', 'Explore the learning path or contact us to learn more.')}</p>
          </div>
        )}

        {(packageState.status === 'error' || packageState.status === 'unavailable') && (
          <div role="alert" className="mt-8 flex flex-col gap-4 border border-[#e2d6d4] bg-[#f7f0ed] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#43343a]">
                {packageState.status === 'unavailable'
                  ? tr('خدمة الباقات غير متاحة حالياً.', 'Packages are temporarily unavailable.')
                  : tr('تعذّر تحميل الباقات.', 'We could not load the packages.')}
              </p>
              <p className="mt-1 text-[11px] leading-6 text-[#6d6065]">
                {packageState.status === 'unavailable'
                  ? tr('قاعدة البيانات غير متاحة حالياً. حاول مرة أخرى لاحقاً.', 'The database is currently unavailable. Please try again later.')
                  : tr('تحقق من اتصالك وحاول مجدداً. لن نعرض تفاصيل غير مؤكدة.', 'Check your connection and try again. We will not show unverified package details.')}
              </p>
            </div>
            <button type="button" onClick={() => { setPackageState({ status: 'loading' }); setRetryCount((count) => count + 1); }} className="min-h-10 shrink-0 rounded-sm border border-[#b8a9a8] px-4 text-[11px] font-bold text-[#43343a] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b3175]">
              {tr('إعادة المحاولة', 'Try again')}
            </button>
          </div>
        )}
      </section>

      <section className="border-y border-[#e9e6e2] bg-[#f2f0eb]">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-[#4b3175]">{tr('أسئلة شائعة', 'COMMON QUESTIONS')}</p>
            <h2 className="mt-3 text-[25px] font-extrabold leading-[1.5] sm:text-[30px]">{tr('قبل أن تبدأ', 'Before you begin')}</h2>
            <p className="mt-3 max-w-[330px] text-[11px] leading-[2] text-[#686573] sm:text-[12px]">
              {tr('إجابات مختصرة عن طريقة التعلم والخطوات التالية.', 'A few answers about the learning approach and what comes next.')}
            </p>
          </div>
          <div className="border-t border-[#ded9d3]">
            {faqItems.map(([question, answer], index) => (
              <div key={question} className="border-b border-[#ded9d3]">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={`flex min-h-[58px] w-full items-center justify-between gap-4 py-4 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4b3175] sm:text-[12px] ${isArabic ? 'text-right' : 'text-left'}`}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{question}</span>
                  <ChevronDown size={16} className={`shrink-0 text-[#4b3175] transition-transform ${openFaq === index ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {openFaq === index && (
                  <p id={`faq-answer-${index}`} className={`max-w-[620px] pb-5 pe-7 text-[11px] leading-[2] text-[#696672] ${isArabic ? 'text-right' : 'text-left'}`}>
                    {answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16">
        <div className={`flex flex-col gap-6 border border-[#e5e0e9] bg-[#eeebf2] px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-9 ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-[#4b3175]">{tr('الخطوة التالية', 'YOUR NEXT STEP')}</p>
            <h2 className="mt-2 text-[22px] font-extrabold leading-[1.5] sm:text-[27px]">{tr('خلّينا نبدأ من هدفك.', 'Let’s start with your goal.')}</h2>
            <p className="mt-2 max-w-[520px] text-[11px] leading-[1.9] text-[#625e6a] sm:text-[12px]">
              {tr('تعرّف على المسار أو تواصل مع فريق Be Fluent لمناقشة بداية مناسبة لك.', 'Explore the learning path or contact the Be Fluent team to talk through a suitable starting point.')}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/learning-path" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#4b3175] px-4 py-3 text-[11px] font-bold text-white hover:bg-[#39245f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4b3175]">
              {tr('مسار التعلم', 'Learning path')}
              {isArabic ? <ArrowLeft size={14} aria-hidden="true" /> : <ArrowUpRight size={14} aria-hidden="true" />}
            </Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-sm border border-[#c9c0d2] bg-[#faf9f6] px-4 py-3 text-[11px] font-bold text-[#4b3175] hover:border-[#4b3175] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b3175]">
              {tr('تواصل معنا', 'Contact us')}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e9e6e2] bg-[#faf9f6]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <Link href="/" className="font-['DM_Sans'] text-[16px] font-bold text-[#4b3175]">Be Fluent</Link>
            <p className="mt-1 text-[11px] font-semibold text-[#77727e]">FLUENCY COMES FIRST.</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-[10px] font-semibold text-[#625e6a]" aria-label={tr('روابط التذييل', 'Footer navigation')}>
            <Link href="/about-path" className="hover:text-[#4b3175]">{tr('عن المنهج', 'Our approach')}</Link>
            <Link href="/learning-path" className="hover:text-[#4b3175]">{tr('مسار التعلم', 'Learning path')}</Link>
            <Link href="/packages" className="hover:text-[#4b3175]">{tr('الباقات', 'Packages')}</Link>
            <Link href="/contact" className="hover:text-[#4b3175]">{tr('تواصل معنا', 'Contact')}</Link>
            <Link href="/auth/login" className="hover:text-[#4b3175]">{tr('دخول', 'Log in')}</Link>
          </nav>
          <p className="text-[11px] text-[#89848e]">© Be Fluent EDU</p>
        </div>
      </footer>
    </main>
  );
}