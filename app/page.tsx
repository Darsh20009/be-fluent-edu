'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  Menu,
  MessageCircle,
  Mic2,
  NotebookPen,
  Moon,
  Sun,
  UsersRound,
  X,
} from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import BrandLockup from '@/components/brand/BrandLockup';
import LatestCouponPopup from '@/components/LatestCouponPopup';

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
  const { language, theme, toggleTheme, toggleLanguage } = useTheme();
  const { status: authStatus } = useSession();
  const isArabic = language === 'ar';
  const isDark = theme === 'dark';
  const tr = (arabic: string, english: string) => isArabic ? arabic : english;
  const accountHref = authStatus === 'authenticated' ? '/dashboard' : '/auth/login';
  const accountLabel = authStatus === 'authenticated'
    ? tr('لوحة التحكم', 'Dashboard')
    : tr('دخول', 'Log in');
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

  const faqItems: [string, string][] = isArabic
    ? [
        ['كيف تبدو طريقة التعلم؟', 'مسار منظم يجمع بين الحصص المباشرة والممارسة، مع واجبات وملاحظات من المدرس وخطوات تالية واضحة.'],
        ['هل يوجد تدريب على المحادثة؟', 'نعم، تتضمن الرحلة ممارسة للتحدث إلى جانب الاستماع والمهارات الأخرى.'],
        ['كيف أختار المستوى المناسب؟', 'تعرّف على مستويات A1 إلى C2 ومسارات التعلم، ثم تواصل معنا لمناقشة نقطة البداية المناسبة لأهدافك.'],
        ['هل أحصل على ملاحظات من المدرس؟', 'تتضمن الرحلة ملاحظات من المدرس ومتابعة للواجبات لمساعدتك على معرفة ما تتدرب عليه بعد ذلك.'],
        ['هل توجد باقات أو اشتراكات؟', 'تظهر الباقات المتاحة وتفاصيلها في صفحة الباقات. وإذا رغبت بمساعدة في الاختيار، يسعد فريقنا بالتواصل معك.'],
      ]
    : [
        ['What does learning look like?', 'A structured path that brings together live classes and practice, with homework, teacher feedback, and clear next steps.'],
        ['Will I practise speaking?', 'Yes. Speaking practice is part of the learning journey, alongside listening and other language skills.'],
        ['How do I choose a level?', 'Explore levels A1 to C2 and the learning paths, then contact us to discuss a starting point that fits your goals.'],
        ['Will my teacher give me feedback?', 'The learning journey includes teacher feedback and homework follow-up to help you know what to practise next.'],
        ['Are packages or subscriptions available?', 'Available packages and their details are shown on the packages page. If you would like help choosing, our team is happy to talk it through.'],
      ];

  const closeMenu = () => setMenuOpen(false);
  const ArrowIcon = isArabic ? ArrowLeft : ArrowUpRight;

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} lang={isArabic ? 'ar' : 'en'} className={`bf-landing min-h-[100dvh] overflow-x-clip ${isDark ? 'bg-[#111915] text-[#e8efe9]' : 'bg-[#fffefa] text-[#26352f]'}`}>
      <header className={`relative z-30 border-b ${isDark ? 'border-[#344239] bg-[#19231d] text-[#e8efe9]' : 'border-[#e7ebe5] bg-[#fffefa] text-[#26352f]'}`}>
        <div dir="ltr" className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="shrink-0" aria-label="Be Fluent home">
            <BrandLockup size="sm" priority />
          </Link>

          <nav className="hidden items-center gap-7 text-[12px] font-semibold text-[#54635b] lg:flex" aria-label={tr('التنقل الرئيسي', 'Main navigation')}>
            <Link href="/about-path" className="inline-flex min-h-11 items-center transition-colors hover:text-[#246448]">{tr('عن المنهج', 'Our approach')}</Link>
            <Link href="/learning-path" className="inline-flex min-h-11 items-center transition-colors hover:text-[#246448]">{tr('مسار التعلم', 'Learning path')}</Link>
            <Link href="/packages" className="inline-flex min-h-11 items-center transition-colors hover:text-[#246448]">{tr('الباقات', 'Packages')}</Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center transition-colors hover:text-[#246448]">{tr('تواصل معنا', 'Contact')}</Link>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button type="button" onClick={toggleTheme} className={`grid min-h-10 min-w-10 place-items-center rounded ${isDark ? 'bg-[#26332e] text-[#e8efe9]' : 'bg-[#f1f5ef] text-[#54635b]'}`} aria-label={tr(isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن', isDark ? 'Switch to light mode' : 'Switch to dark mode')}>
              {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>
            <button type="button" onClick={toggleLanguage} className="flex min-h-11 min-w-11 items-center justify-center rounded px-3 text-[12px] font-semibold text-[#54635b] transition-colors hover:bg-[#f1f5ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28694b]" aria-label={tr('عرض الموقع بالإنجليزية', 'View website in Arabic')}>
              {isArabic ? 'EN' : 'العربية'}
            </button>
            <Link href={accountHref} className="inline-flex min-h-11 items-center rounded border border-[#d9e0d9] px-4 text-[12px] font-bold text-[#33463b] transition-colors hover:border-[#28694b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28694b]">
              {accountLabel}
            </Link>
            <Link href="/auth/register" className="inline-flex min-h-11 items-center gap-2 rounded bg-[#28694b] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#1d543b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#28694b]">
              {tr('ابدأ التعلم', 'Start learning')}<ArrowIcon size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <button type="button" onClick={toggleTheme} className="flex h-11 w-11 items-center justify-center rounded" aria-label={tr(isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن', isDark ? 'Switch to light mode' : 'Switch to dark mode')}>
              {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>
            <button type="button" onClick={toggleLanguage} className="flex min-h-11 min-w-11 items-center justify-center rounded px-2 text-[12px] font-semibold text-[#54635b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28694b]" aria-label={tr('عرض الموقع بالإنجليزية', 'View website in Arabic')}>
              {isArabic ? 'EN' : 'العربية'}
            </button>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex h-11 w-11 items-center justify-center rounded text-[#33463b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28694b]" aria-label={menuOpen ? tr('إغلاق القائمة', 'Close menu') : tr('فتح القائمة', 'Open menu')} aria-expanded={menuOpen} aria-controls="mobile-navigation">
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" className={`absolute inset-x-0 top-full border-b px-5 py-5 lg:hidden ${isDark ? 'border-[#344239] bg-[#19231d] text-[#e8efe9]' : 'border-[#e7ebe5] bg-[#fffefa] text-[#26352f]'}`} aria-label={tr('التنقل الرئيسي', 'Main navigation')}>
            <div className="mx-auto flex max-w-[1240px] flex-col items-stretch gap-1">
              <Link href="/about-path" onClick={closeMenu} className="rounded px-3 py-3 text-sm font-semibold hover:bg-[#f1f5ef]">{tr('عن المنهج', 'Our approach')}</Link>
              <Link href="/learning-path" onClick={closeMenu} className="rounded px-3 py-3 text-sm font-semibold hover:bg-[#f1f5ef]">{tr('مسار التعلم', 'Learning path')}</Link>
              <Link href="/packages" onClick={closeMenu} className="rounded px-3 py-3 text-sm font-semibold hover:bg-[#f1f5ef]">{tr('الباقات', 'Packages')}</Link>
              <Link href="/contact" onClick={closeMenu} className="rounded px-3 py-3 text-sm font-semibold hover:bg-[#f1f5ef]">{tr('تواصل معنا', 'Contact')}</Link>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#e7ebe5] pt-4">
                <Link href={accountHref} onClick={closeMenu} className="rounded border border-[#d9e0d9] px-3 py-3 text-center text-xs font-bold">{accountLabel}</Link>
                <Link href="/auth/register" onClick={closeMenu} className="rounded bg-[#28694b] px-3 py-3 text-center text-xs font-bold text-white">{tr('ابدأ التعلم', 'Start learning')}</Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <section className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:min-h-[590px] lg:grid-cols-[1.02fr_.98fr] lg:gap-12 lg:py-14">
        <div className={`${isArabic ? 'text-right' : 'text-left'} order-1 max-w-[560px]`}>
          <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold text-[#28694b]">
            <span className="h-px w-7 bg-[#8ca995]" aria-hidden="true" />
            {tr('تعلم الإنجليزية بخطوات واضحة', 'A CLEARER WAY TO LEARN ENGLISH')}
          </p>
          <h1 className={`max-w-[560px] text-[36px] font-bold leading-[1.42] text-[#26352f] sm:text-[50px] sm:leading-[1.25] lg:text-[58px] ${isArabic ? '' : 'tracking-[-0.035em]'}`}>
            {tr('إنجليزية أكثر ثقة،', 'English that feels')}<br />
            <span className="text-[#28694b]">{tr('خطوةً بعد خطوة.', 'more natural. Step by step.')}</span>
          </h1>
          <p className="mt-5 max-w-[475px] text-[14px] leading-[2] text-[#637168] sm:text-[15px]">
            {tr('مسار تعلّم من A1 إلى C2 يقوده مدرسون، ويجمع بين الحصص والمحادثة والملاحظات العملية. تعرف على ما تتعلمه وما هي خطوتك التالية.', 'A teacher-guided path from A1 to C2, with live classes, speaking practice, and useful feedback. Know what you are learning—and what to work on next.')}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/auth/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-[#28694b] px-5 py-3 text-[12px] font-bold text-white transition-colors hover:bg-[#1d543b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#28694b]">
              {tr('ابدأ رحلتك', 'Find your starting point')}<ArrowIcon size={15} aria-hidden="true" />
            </Link>
            <Link href="/learning-path" className="inline-flex min-h-12 items-center gap-2 rounded px-3 py-3 text-[12px] font-bold text-[#28694b] underline decoration-[#b7c8bb] underline-offset-4 hover:decoration-[#28694b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28694b]">
              {tr('استكشف مسار التعلم', 'Explore the learning path')}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-[#68766d]">
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#28694b]" aria-hidden="true" />{tr('مستويات A1 إلى C2', 'A1 to C2 levels')}</span>
            <span className="inline-flex items-center gap-2"><Check size={14} className="text-[#28694b]" aria-hidden="true" />{tr('توجيه من المدرس', 'Teacher-guided')}</span>
          </div>
        </div>
        <div className="relative order-2 min-h-[290px] overflow-hidden rounded-sm bg-[#e9eee8] sm:min-h-[390px] lg:min-h-[470px]">
          <Image src="/assets/home-hero-desk-optimized.webp" alt={tr('مساحة هادئة للتعلم والممارسة', 'A calm desk for learning and practice')} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#17241e]/35 to-transparent" aria-hidden="true" />
          <div className={`absolute bottom-4 ${isArabic ? 'right-4 sm:right-6' : 'left-4 sm:left-6'} flex items-center gap-3 border border-white/50 bg-[#fffefa]/95 px-4 py-3 text-[11px] font-semibold text-[#33463b] sm:bottom-6`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#e7efe8] text-[#28694b]"><BookOpen size={17} strokeWidth={1.7} aria-hidden="true" /></span>
            <span>{tr('تعلّم منظّم. تقدّم تلاحظه.', 'Structured learning. Progress you can see.')}</span>
          </div>
          <span className={`absolute top-5 ${isArabic ? 'left-5' : 'right-5'} rounded-sm bg-[#fffefa]/90 px-3 py-2 text-[10px] font-bold text-[#28694b]`}>{tr('رحلتك، بإرشاد واضح', 'A guided learning journey')}</span>
        </div>
      </section>

      <div className="border-y border-[#e4eae3] bg-[#f4f7f2]">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-5 gap-y-4 px-5 py-6 sm:px-8 md:grid-cols-4 md:gap-5 md:py-7">
          {[
            [BookOpen, tr('مسار تعلّم واضح', 'A clear learning path')],
            [Mic2, tr('ممارسة التحدث', 'Speaking practice')],
            [Headphones, tr('حصص مباشرة', 'Live classes')],
            [ClipboardCheck, tr('ملاحظات وواجبات', 'Feedback and homework')],
          ].map(([Icon, title]) => {
            const FeatureIcon = Icon as typeof BookOpen;
            return (
              <div key={title as string} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#e5eee5] text-[#28694b]">
                  <FeatureIcon size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="text-[11px] font-bold text-[#3a4c41] sm:text-[12px]">{title as string}</span>
              </div>
            );
          })}
        </div>
      </div>

      <section className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className={isArabic ? 'text-right' : 'text-left'}>
          <p className="text-[10px] font-bold text-[#28694b]">{tr('تعلم قابل للاستخدام', 'LEARNING THAT CARRIES INTO LIFE')}</p>
          <h2 className={`mt-3 max-w-[440px] text-[27px] font-bold leading-[1.55] sm:text-[34px] ${isArabic ? '' : 'tracking-[-0.025em]'}`}>
            {tr('تعلّم الإنجليزية لتستخدمها، لا لتكتفي بدراستها.', 'Learn English to use it—not just to study it.')}
          </h2>
          <p className="mt-4 max-w-[430px] text-[13px] leading-[2] text-[#637168]">
            {tr('كل خطوة في مسارك لها غرض: فهم أفضل، ممارسة أكثر، وتوجيه يساعدك على مواصلة التقدم بثقة.', 'Each part of your path has a purpose: clearer understanding, more practice, and thoughtful guidance for your next step.')}
          </p>
          <Link href="/about-path" className="mt-6 inline-flex min-h-11 items-center gap-2 text-[12px] font-bold text-[#28694b] underline decoration-[#b7c8bb] underline-offset-4 hover:decoration-[#28694b]">
            {tr('تعرّف على منهجنا', 'Learn about our approach')}<ArrowIcon size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="divide-y divide-[#e6ebe5] border-y border-[#e6ebe5]">
          {[
            [Mic2, tr('ممارسة مستمرة', 'Practice that keeps you speaking'), tr('طبّق ما تتعلمه وتدرّب على التعبير باللغة الإنجليزية في مواقف حقيقية.', 'Put new learning into practice and build comfort expressing yourself in English.')],
            [MessageCircle, tr('توجيه من المدرس', 'Guidance from your teacher'), tr('ملاحظات واضحة تساعدك على فهم ما أتقنته وما يستحق تركيزك بعد ذلك.', 'Clear feedback helps you recognise what is clicking and where to focus next.')],
            [NotebookPen, tr('واجبات بخطوة تالية', 'Homework with a purpose'), tr('ممارسة بين الحصص تعزز ما تعلمته، بدلاً من أن تتركك تتساءل عمّا تفعله.', 'Practice between classes reinforces what you learned, with a clear reason behind it.')],
          ].map(([Icon, title, body]) => {
            const FeatureIcon = Icon as typeof Mic2;
            return (
              <article key={title as string} className="flex gap-4 py-5 sm:gap-5 sm:py-6">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#edf3ec] text-[#28694b]">
                  <FeatureIcon size={18} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[13px] font-bold">{title as string}</h3>
                  <p className="mt-2 max-w-[490px] text-[12px] leading-[1.9] text-[#68766d]">{body as string}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#e4eae3] bg-[#f3f6f1]">
        <div className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-16">
          <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
            <div className={isArabic ? 'text-right' : 'text-left'}>
              <p className="text-[10px] font-bold text-[#28694b]">{tr('المستويات الأوروبية', 'THE CEFR LEVELS')}</p>
              <h2 className={`mt-2 text-[26px] font-bold sm:text-[33px] ${isArabic ? '' : 'tracking-[-0.025em]'}`}>{tr('ابدأ من مكانك.', 'Start where you are.')}</h2>
            </div>
            <p className={`max-w-[440px] text-[12px] leading-[1.9] text-[#637168] sm:text-[13px] ${isArabic ? 'text-right' : 'text-left'}`}>
              {tr('من A1 إلى C2، تعرّف على التدرّج واكتشف كيف يمكن لكل مستوى أن يقربك من أهدافك.', 'From A1 to C2, explore the progression and see how each level can move you toward your goals.')}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3" role="group" aria-label={tr('اختر مستوى اللغة', 'Choose an English level')}>
            {levels.map((item) => (
              <button key={item} type="button" onClick={() => setLevel(item)} aria-pressed={level === item} className={`min-h-[78px] rounded-sm border px-3 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28694b] ${level === item ? 'border-[#28694b] bg-[#28694b] text-white' : 'border-[#dbe3d9] bg-[#fffefa] text-[#3b4c41] hover:border-[#8ca995]'}`}>
                <span className="block text-[17px] font-bold">{item}</span>
                <span className={`mt-1 block text-[11px] ${level === item ? 'text-white/80' : 'text-[#78847b]'}`}>{tr('المستوى', 'Level')}</span>
              </button>
            ))}
          </div>
          <div className={`mt-4 flex min-h-[100px] flex-col justify-center gap-3 rounded-sm border border-[#dfe7dd] bg-[#fffefa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
              <span className="text-[21px] font-bold text-[#28694b]">{level}</span>
              <p className="text-[12px] leading-[1.8] text-[#5f6e64] sm:text-[13px]">{isArabic ? levelDescription[level][0] : levelDescription[level][1]}</p>
            </div>
            <Link href="/learning-path" className="inline-flex min-h-10 items-center gap-2 text-[12px] font-bold text-[#28694b] hover:underline">
              {tr('استكشف المسار', 'Explore the path')}<ArrowIcon size={14} aria-hidden="true" />
            </Link>
          </div>
          <p className={`mt-4 text-[11px] leading-[1.8] text-[#78847b] ${isArabic ? 'text-right' : 'text-left'}`}>
            {tr('المستويات وفق الإطار الأوروبي المرجعي العام للغات (CEFR).', 'Levels follow the Common European Framework of Reference for Languages (CEFR).')}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-[#28694b]">{tr('دعم متوازن', 'A WELL-ROUNDED PATH')}</p>
            <h2 className={`mt-2 max-w-[600px] text-[26px] font-bold leading-[1.5] sm:text-[33px] ${isArabic ? '' : 'tracking-[-0.025em]'}`}>{tr('تعلّم مع مدرس، وتقدّم بطريقتك.', 'Learn with a teacher. Move forward your way.')}</h2>
          </div>
          <p className={`max-w-[420px] text-[12px] leading-[1.9] text-[#637168] sm:text-[13px] ${isArabic ? 'text-right' : 'text-left'}`}>
            {tr('ليست حصصاً منفصلة؛ بل تجربة تعلم فيها كل جزء يدعم الجزء الآخر.', 'Not disconnected lessons. A learning experience where each part supports the next.')}
          </p>
        </div>
        <div className="mt-9 grid gap-px overflow-hidden border border-[#e2e9e1] bg-[#e2e9e1] sm:grid-cols-2 lg:grid-cols-4">
          {[
            [GraduationCap, tr('حصص يقودها مدرس', 'Teacher-led classes'), tr('تعلّم ضمن حصص مباشرة مع شرح وتوجيه يضعان هدفك في المقدمة.', 'Learn in live classes with explanation and guidance centred on your goals.')],
            [UsersRound, tr('مدرس يتابع تقدمك', 'A teacher who follows your progress'), tr('استفد من توجيه بشري وملاحظات تساعدك على معرفة أين وصلت.', 'Benefit from personal guidance and feedback that help you see how far you have come.')],
            [MessageCircle, tr('تدريب على التحدث', 'Speaking practice'), tr('حوّل المعرفة إلى استخدام فعلي، مع فرص للتعبير والمشاركة.', 'Turn knowledge into use, with opportunities to express yourself and take part.')],
            [ClipboardCheck, tr('واجبات وملاحظات', 'Homework and feedback'), tr('واصل الممارسة بين الحصص، وارجع لملاحظاتك لتعرف ما الذي يأتي بعد ذلك.', 'Keep practising between classes and use feedback to guide what comes next.')],
          ].map(([Icon, title, body], index) => {
            const FeatureIcon = Icon as typeof GraduationCap;
            return (
              <article key={title as string} className="min-h-[220px] bg-[#fffefa] p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#edf3ec] text-[#28694b]"><FeatureIcon size={19} strokeWidth={1.7} aria-hidden="true" /></span>
                  <span className="text-[11px] font-semibold text-[#93a197]">0{index + 1}</span>
                </div>
                <h3 className="mt-7 text-[14px] font-bold">{title as string}</h3>
                <p className="mt-2 text-[12px] leading-[1.9] text-[#68766d]">{body as string}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#e4eae3] bg-[#f3f6f1]">
        <div className="mx-auto grid max-w-[1240px] gap-9 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-[#28694b]">{tr('بداية منظمة', 'A CLEAR WAY FORWARD')}</p>
            <h2 className={`mt-3 text-[27px] font-bold leading-[1.5] sm:text-[34px] ${isArabic ? '' : 'tracking-[-0.025em]'}`}>{tr('كيف تبدأ رحلتك؟', 'How your journey begins')}</h2>
            <p className="mt-3 max-w-[360px] text-[13px] leading-[1.9] text-[#637168]">
              {tr('من اختيار نقطة البداية إلى الممارسة المنتظمة، كل مرحلة لها خطوة عملية تالية.', 'From finding a starting point to building a practice, each stage has a practical next step.')}
            </p>
          </div>
          <ol className="border-y border-[#dfe7dd]">
            {[
              [tr('تعرّف على نقطة البداية', 'Find your starting point'), tr('استكشف مستويات A1 إلى C2 وتعرّف على المسار الذي يناسب خبرتك الحالية.', 'Explore levels A1 to C2 and find a path that fits your current experience.')],
              [tr('اختر باقة مناسبة', 'Choose a package'), tr('اطّلع على الباقات المتاحة وتفاصيلها، ثم اختر ما يلائم أهدافك.', 'Review available packages and their details, then choose what fits your goals.')],
              [tr('ابدأ، وتابع تقدمك', 'Begin, then build on your progress'), tr('تعلّم مع مدرس، وطبّق ما تعلمته، واستخدم الملاحظات لتعرف خطوتك التالية.', 'Learn with a teacher, put it into practice, and use feedback to guide your next step.')],
            ].map(([title, body], index) => (
              <li key={title} className="flex gap-4 border-b border-[#dfe7dd] py-5 last:border-b-0 sm:gap-5 sm:py-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#b9cbbd] text-[12px] font-bold text-[#28694b]">0{index + 1}</span>
                <div>
                  <h3 className="text-[13px] font-bold">{title}</h3>
                  <p className="mt-2 max-w-[500px] text-[12px] leading-[1.9] text-[#68766d]">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-[#28694b]">{tr('الباقات والاشتراكات', 'PACKAGES & SUBSCRIPTIONS')}</p>
            <h2 className={`mt-2 text-[26px] font-bold sm:text-[33px] ${isArabic ? '' : 'tracking-[-0.025em]'}`}>{tr('اختر ما يناسب رحلتك.', 'Find the right fit for your journey.')}</h2>
            <p className="mt-2 max-w-[520px] text-[12px] leading-[1.9] text-[#68766d] sm:text-[13px]">
              {tr('تفاصيل الباقات المعروضة هنا تُحمّل مباشرة من Be Fluent.', 'Package details shown here are loaded directly from Be Fluent.')}
            </p>
          </div>
          <Link href="/packages" className="inline-flex min-h-11 w-fit items-center gap-2 text-[12px] font-bold text-[#28694b] underline decoration-[#b7c8bb] underline-offset-4 hover:decoration-[#28694b]">
            {tr('عرض جميع الباقات', 'View all packages')}<ArrowIcon size={14} aria-hidden="true" />
          </Link>
        </div>

        {packageState.status === 'loading' && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label={tr('جارٍ تحميل الباقات', 'Loading packages')} aria-busy="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="min-h-[185px] animate-pulse rounded-sm border border-[#e4eae3] bg-[#f4f7f2] p-6">
                <div className="h-3 w-1/3 rounded bg-[#e0e8de]" />
                <div className="mt-7 h-5 w-2/3 rounded bg-[#e0e8de]" />
                <div className="mt-6 h-3 w-1/2 rounded bg-[#e0e8de]" />
              </div>
            ))}
          </div>
        )}

        {packageState.status === 'ready' && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {packageState.packages.slice(0, 3).map((item) => (
              <article key={item.id} className="flex min-h-[205px] flex-col rounded-sm border border-[#e1e8df] bg-[#fffefa] p-5 sm:p-6">
                <p className="text-[10px] font-semibold text-[#78847b]">{tr('باقة تعليمية', 'Learning package')}</p>
                <h3 className="mt-3 text-[16px] font-bold leading-[1.6] text-[#26352f]">{isArabic ? item.titleAr : item.title}</h3>
                <div className="mt-4 flex items-baseline gap-2 border-t border-[#e9eee7] pt-4">
                  <span className="text-[10px] text-[#78847b]">{tr('السعر المدرج', 'Listed price')}</span>
                  <span className="text-[18px] font-bold text-[#28694b]">{String(item.price)}</span>
                </div>
                <Link href="/packages" className="mt-auto inline-flex min-h-10 items-center gap-2 pt-3 text-[11px] font-bold text-[#28694b] hover:underline">
                  {tr('التفاصيل', 'View details')}<ArrowIcon size={13} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        )}

        {packageState.status === 'empty' && (
          <div className="mt-8 border border-dashed border-[#cbd8ca] bg-[#f4f7f2] px-5 py-9 text-center">
            <p className="text-[14px] font-bold">{tr('لا توجد باقات متاحة حالياً.', 'No packages are available right now.')}</p>
            <p className="mt-2 text-[12px] leading-[1.8] text-[#68766d]">{tr('يمكنك استكشاف مسار التعلم أو التواصل معنا لمعرفة المزيد.', 'Explore the learning path or contact us to learn more.')}</p>
            <Link href="/contact" className="mt-4 inline-flex min-h-10 items-center gap-2 text-[12px] font-bold text-[#28694b] underline underline-offset-4">{tr('تواصل معنا', 'Contact us')}<ArrowIcon size={14} aria-hidden="true" /></Link>
          </div>
        )}

        {(packageState.status === 'error' || packageState.status === 'unavailable') && (
          <div role="alert" className="mt-8 flex flex-col gap-4 border border-[#e6d8d3] bg-[#fbf4f0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#4a3a35]">
                {packageState.status === 'unavailable' ? tr('خدمة الباقات غير متاحة حالياً.', 'Packages are temporarily unavailable.') : tr('تعذّر تحميل الباقات.', 'We could not load the packages.')}
              </p>
              <p className="mt-1 text-[12px] leading-[1.8] text-[#75645e]">
                {packageState.status === 'unavailable' ? tr('قاعدة البيانات غير متاحة حالياً. حاول مرة أخرى لاحقاً.', 'The database is currently unavailable. Please try again later.') : tr('حاول مرة أخرى لاحقاً. لن نعرض تفاصيل غير مؤكدة.', 'Please try again later. We will not show unverified package details.')}
              </p>
            </div>
            <button type="button" onClick={() => { setPackageState({ status: 'loading' }); setRetryCount((count) => count + 1); }} className="min-h-11 shrink-0 rounded border border-[#cfbdb6] px-4 text-[11px] font-bold text-[#4a3a35] hover:bg-[#fffefa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28694b]">
              {tr('إعادة المحاولة', 'Try again')}
            </button>
          </div>
        )}
      </section>

      <section className="border-y border-[#e4eae3] bg-[#f3f6f1]">
        <div className="mx-auto grid max-w-[1240px] gap-9 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-[#28694b]">{tr('أسئلة شائعة', 'COMMON QUESTIONS')}</p>
            <h2 className={`mt-3 text-[27px] font-bold leading-[1.5] sm:text-[33px] ${isArabic ? '' : 'tracking-[-0.025em]'}`}>{tr('قبل أن تبدأ', 'Before you begin')}</h2>
            <p className="mt-3 max-w-[350px] text-[12px] leading-[2] text-[#637168] sm:text-[13px]">
              {tr('إجابات مختصرة عن طريقة التعلم والخطوات التالية.', 'A few answers about the learning approach and what comes next.')}
            </p>
          </div>
          <div className="border-t border-[#dfe7dd]">
            {faqItems.map(([question, answer], index) => (
              <div key={question} className="border-b border-[#dfe7dd]">
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className={`flex min-h-[62px] w-full items-center justify-between gap-4 py-4 text-[12px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#28694b] sm:text-[13px] ${isArabic ? 'text-right' : 'text-left'}`} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`}>
                  <span>{question}</span>
                  <ChevronDown size={16} className={`shrink-0 text-[#28694b] transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {openFaq === index && (
                  <p id={`faq-answer-${index}`} className={`max-w-[620px] pb-5 pe-7 text-[12px] leading-[2] text-[#68766d] ${isArabic ? 'text-right' : 'text-left'}`}>{answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-16">
        <div className={`flex flex-col gap-6 border border-[#dce7dc] bg-[#eef4ed] px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-9 sm:py-9 ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-bold text-[#28694b]">{tr('الخطوة التالية', 'YOUR NEXT STEP')}</p>
            <h2 className={`mt-2 text-[23px] font-bold leading-[1.5] sm:text-[29px] ${isArabic ? '' : 'tracking-[-0.02em]'}`}>{tr('خلّينا نبدأ من هدفك.', 'Let’s start with your goal.')}</h2>
            <p className="mt-2 max-w-[540px] text-[12px] leading-[1.9] text-[#5f6e64] sm:text-[13px]">
              {tr('تعرّف على المسار أو تواصل مع فريق Be Fluent لمناقشة بداية مناسبة لك.', 'Explore the learning path or talk with the Be Fluent team about a suitable starting point.')}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/learning-path" className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#28694b] px-4 py-3 text-[11px] font-bold text-white hover:bg-[#1d543b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#28694b]">
              {tr('مسار التعلم', 'Learning path')}<ArrowIcon size={14} aria-hidden="true" />
            </Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded border border-[#c9d7c9] bg-[#fffefa] px-4 py-3 text-[11px] font-bold text-[#28694b] hover:border-[#28694b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28694b]">
              {tr('تواصل معنا', 'Contact us')}
            </Link>
          </div>
        </div>
      </section>

      <footer className={`border-t ${isDark ? 'border-[#344239] bg-[#111915]' : 'border-[#e4eae3] bg-[#fffefa]'}`}>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className={isArabic ? 'text-right' : 'text-left'}>
            <Link href="/" className="inline-block" aria-label="Be Fluent home">
              <BrandLockup size="sm" tagline={tr('إنجليزية تُستخدم في الحياة.', 'ENGLISH FOR REAL LIFE.')} />
            </Link>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-semibold text-[#5f6e64]" aria-label={tr('روابط التذييل', 'Footer navigation')}>
            <Link href="/about-path" className="hover:text-[#28694b]">{tr('عن المنهج', 'Our approach')}</Link>
            <Link href="/learning-path" className="hover:text-[#28694b]">{tr('مسار التعلم', 'Learning path')}</Link>
            <Link href="/packages" className="hover:text-[#28694b]">{tr('الباقات', 'Packages')}</Link>
            <Link href="/contact" className="hover:text-[#28694b]">{tr('تواصل معنا', 'Contact')}</Link>
            <Link href={accountHref} className="hover:text-[#28694b]">{accountLabel}</Link>
          </nav>
          <p className="text-[11px] text-[#89958c]">© Be Fluent</p>
        </div>
      </footer>
      <LatestCouponPopup />
    </main>
  );
}