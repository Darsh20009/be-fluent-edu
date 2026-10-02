'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Trophy, ArrowLeft, Loader2, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { localeText } from '@/lib/locale';
import LanguageToggle from '@/components/LanguageToggle';

const LEVEL_INFO: Record<string, { label: string; labelEn: string; color: string; bg: string; border: string; desc: string; descEn: string }> = {
  A1: { label: 'مبتدئ', labelEn: 'Beginner', desc: 'أنت في البداية — وهذا رائع! سنبني معك أساساً قوياً خطوة بخطوة.', descEn: 'You are at the beginning—and that is great! We will build a strong foundation step by step.', color: 'text-[#1e2b29]', bg: 'bg-[#f4f6f0]', border: 'border-[#dbe3dc]' },
  A2: { label: 'مبتدئ متقدم', labelEn: 'Elementary', desc: 'لديك قاعدة جيدة وستتطور بسرعة مع منهجنا المصمم لمستواك.', descEn: 'You have a good foundation and will progress quickly with our tailored program.', color: 'text-[#147050]', bg: 'bg-[#edf6ef]', border: 'border-[#b8d4c5]' },
  B1: { label: 'متوسط', labelEn: 'Intermediate', desc: 'مستواك جيد جداً! يمكنك التواصل في مواقف كثيرة وستصل للطلاقة قريباً.', descEn: 'You are doing very well! You can communicate in many situations and are on your way to fluency.', color: 'text-[#147050]', bg: 'bg-[#edf6ef]', border: 'border-[#b8d4c5]' },
  B2: { label: 'متوسط متقدم', labelEn: 'Upper intermediate', desc: 'مستواك متقدم ومميز. أنت تتواصل بثقة وستصل للاحترافية قريباً.', descEn: 'You are an advanced learner and communicate confidently. Keep going toward mastery.', color: 'text-[#147050]', bg: 'bg-[#edf6ef]', border: 'border-[#b8d4c5]' },
  C1: { label: 'متقدم', labelEn: 'Advanced', desc: 'مستواك ممتاز! أنت قادر على التعبير بطلاقة في معظم المواقف.', descEn: 'Excellent work! You can express yourself fluently in most situations.', color: 'text-[#1e2b29]', bg: 'bg-[#f4f6f0]', border: 'border-[#dbe3dc]' },
};

interface AnswerRecord {
  question: string;
  answer: string;
  correct: boolean;
  level: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correct: string;
  level: string;
  category: string;
}

export default function PlacementTestContent() {
  const { language } = useTheme();
  const t = (ar: string, en: string) => localeText(language, ar, en);
  const [phase, setPhase] = useState<'intro' | 'testing' | 'loading' | 'result'>('intro');
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [result, setResult] = useState<{ level: string; score: number; total: number; percentage: number } | null>(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [loadingNext, setLoadingNext] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRegistration = searchParams.get('fromRegistration') === 'true';

  const TOTAL = 10;

  const startTest = useCallback(async () => {
    setPhase('loading');
    try {
      const res = await fetch('/api/ai/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (data.success && data.question) {
        setQuestion(data.question);
        setQuestionNum(1);
        setPhase('testing');
      } else {
        setPhase('intro');
        alert(t('فشل تحميل الاختبار، حاول مرة أخرى.', 'Could not load the test. Please try again.'));
      }
    } catch {
      setPhase('intro');
      alert(t('تعذر الاتصال بالخادم، حاول مرة أخرى.', 'Could not connect to the server. Please try again.'));
    }
  }, [language]);

  const confirmAnswer = useCallback(async () => {
    if (!selected || !question || confirmed) return;
    setConfirmed(true);
    setLoadingNext(true);

    const isCorrect = selected === question.correct;
    const newRecord: AnswerRecord = {
      question: question.text,
      answer: selected,
      correct: isCorrect,
      level: question.level,
    };

    const newAnswers = [...answers, newRecord];
    const newHistory = [...history, newRecord];
    setAnswers(newAnswers);
    setHistory(newHistory);

    if (questionNum >= TOTAL) {
      try {
        const res = await fetch('/api/ai/placement-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'finish', answers: newAnswers }),
        });
        const data = await res.json();
        if (data.success) {
          setResult(data);
          setPhase('result');
        }
      } catch {
        alert(t('حدث خطأ أثناء حفظ النتيجة.', 'An error occurred while saving your result.'));
      }
      setLoadingNext(false);
      setConfirmed(false);
      return;
    }

    try {
      const res = await fetch('/api/ai/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'next',
          history: newHistory,
          isCorrect,
        }),
      });
      const data = await res.json();
      if (data.success && data.question) {
        setQuestion(data.question);
        setQuestionNum(prev => prev + 1);
        setSelected(null);
      }
    } catch {
      alert(t('خطأ في تحميل السؤال التالي.', 'There was an error loading the next question.'));
    }

    setLoadingNext(false);
    setConfirmed(false);
  }, [selected, question, confirmed, answers, history, questionNum, language]);

  if (phase === 'intro') {
    return (
        <div className="min-h-[100dvh] bg-[#f4f6f0] flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-lg border border-[#dbe3dc] bg-[#fffefa] p-8 text-center sm:p-12">
          <div className="mb-4 flex justify-end"><LanguageToggle /></div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-[#147050] text-xl font-bold text-white">
            BF
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">{t('اختبار تحديد المستوى', 'Placement test')}</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            {t(`${TOTAL} أسئلة بسيطة لنعرف مستواك في الإنجليزية ونضع لك خطة مثالية`, `${TOTAL} quick questions to assess your English and create a learning plan.`)}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div className="border border-[#e0e6df] bg-[#f6f8f3] p-4">
              <div className="text-sm font-bold text-gray-700">{t('١٠ دقائق', '10 minutes')}</div>
              <div className="text-xs text-gray-400">{t('مدة الاختبار', 'Test duration')}</div>
            </div>
            <div className="border border-[#e0e6df] bg-[#f6f8f3] p-4">
              <div className="text-sm font-bold text-gray-700">{t(`${TOTAL} أسئلة`, `${TOTAL} questions`)}</div>
              <div className="text-xs text-gray-400">{t('اختيار من متعدد', 'Multiple choice')}</div>
            </div>
            <div className="border border-[#e0e6df] bg-[#f6f8f3] p-4">
              <div className="text-sm font-bold text-gray-700">{t('فوري', 'Instant')}</div>
              <div className="text-xs text-gray-400">{t('ظهور النتيجة', 'Results')}</div>
            </div>
          </div>
          <button
            onClick={startTest}
            className="mb-4 w-full bg-[#147050] py-4 text-xl font-bold text-white transition-colors hover:bg-[#0e5940]"
          >
            {t('ابدأ الاختبار الآن', 'Start the test')}
          </button>
          <Link href="/" className="block text-gray-400 text-sm hover:text-gray-600 transition">
            {t('العودة للرئيسية', 'Back to home')}
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-[100dvh] bg-[#f4f6f0] flex items-center justify-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="mb-4 flex justify-center"><LanguageToggle /></div>
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-600 font-medium text-lg">{t('جاري تحضير اختبارك...', 'Preparing your test...')}</p>
          <p className="text-gray-400 text-sm mt-2">{t('لحظة من فضلك', 'One moment, please')}</p>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const info = LEVEL_INFO[result.level] || LEVEL_INFO['A1'];
    return (
      <div className="min-h-[100dvh] bg-[#f4f6f0] flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-lg border border-[#dbe3dc] bg-[#fffefa] p-8 text-center sm:p-12">
          <div className="mb-4 flex justify-end"><LanguageToggle /></div>
          <div className="mb-4 font-mono text-4xl font-black text-[#147050]">{result.level}</div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{t('تم تحديد مستواك!', 'Your level has been assessed!')}</h1>
          <p className="text-gray-500 mb-8">{t('إليك نتيجة اختبارك', 'Here are your test results')}</p>

          <div className={`${info.bg} ${info.border} border-2 rounded-2xl p-6 mb-6`}>
            <div className={`text-5xl font-black ${info.color} mb-1`}>{result.level}</div>
            <div className={`text-xl font-bold ${info.color} mb-3`}>{language === 'ar' ? info.label : info.labelEn}</div>
            <p className="text-gray-600 text-sm leading-relaxed">{language === 'ar' ? info.desc : info.descEn}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">{t('الإجابات الصحيحة', 'Correct answers')}</div>
              <div className="text-3xl font-black text-gray-900">{result.score}<span className="text-lg text-gray-400">/{result.total}</span></div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">{t('نسبة النجاح', 'Score')}</div>
              <div className="text-3xl font-black text-emerald-600">{result.percentage}%</div>
            </div>
          </div>

          {fromRegistration && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-right">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 text-sm mb-1">{t('حسابك قيد المراجعة', 'Your account is under review')}</p>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    {t('سيتم تفعيل حسابك خلال 24 ساعة بعد مراجعة إيصال الدفع. سنتواصل معك عبر واتساب أو البريد الإلكتروني.', 'Your account will be activated within 24 hours after your payment receipt is reviewed. We will contact you by WhatsApp or email.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {fromRegistration ? (
              <Link
                href="/auth/login"
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {t('تسجيل الدخول عند التفعيل', 'Sign in once activated')}
              </Link>
            ) : (
              <button
                onClick={() => router.push('/dashboard/student')}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('الذهاب للوحة التحكم', 'Go to dashboard')}
              </button>
            )}
            <Link href="/" className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-medium hover:bg-gray-200 transition text-center">
              {t('الرئيسية', 'Home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'testing' && question) {
    const progress = (questionNum / TOTAL) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <LanguageToggle />
            <div className="text-sm font-bold text-gray-500">
              {t('السؤال', 'Question')} <span className="text-emerald-600 font-black">{questionNum}</span> {t('من', 'of')} {TOTAL}
            </div>
            <div className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
              {question.level}
            </div>
          </div>

          <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">
                {question.category === 'grammar' ? t('قواعد اللغة', 'Grammar') : question.category === 'vocabulary' ? t('المفردات', 'Vocabulary') : t('الفهم والقراءة', 'Reading comprehension')}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed mb-8">
                {question.text}
              </h2>

              <div className="grid gap-3">
                {question.options.map((option, idx) => {
                  const letters = ['أ', 'ب', 'ج', 'د'];
                  const isSelected = selected === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => !confirmed && setSelected(option)}
                      disabled={confirmed}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-right transition-all duration-150 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-gray-100 bg-gray-50 hover:border-emerald-200 hover:bg-emerald-50/40'
                      } ${confirmed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                    {language === 'ar' ? letters[idx] : ['A', 'B', 'C', 'D'][idx]}
                      </span>
                      <span className={`font-medium text-base ${isSelected ? 'text-emerald-800 font-bold' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-8 pb-8">
              <button
                onClick={confirmAnswer}
                disabled={!selected || loadingNext || confirmed}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
              >
                {loadingNext ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('جاري المعالجة...', 'Processing...')}
                  </>
                ) : questionNum === TOTAL ? (
                  <>
                    <Trophy className="w-5 h-5" />
                    {t('إنهاء الاختبار', 'Finish test')}
                  </>
                ) : (
                  <>
                    {t('السؤال التالي', 'Next question')}
                    <ChevronLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
