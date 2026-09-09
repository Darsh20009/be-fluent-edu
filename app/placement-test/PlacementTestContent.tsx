'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Trophy, ArrowLeft, Loader2, ChevronLeft } from 'lucide-react';

const LEVEL_INFO: Record<string, { label: string; color: string; bg: string; border: string; desc: string }> = {
  A1: { label: 'مبتدئ', color: 'text-[#1e2b29]', bg: 'bg-[#f4f6f0]', border: 'border-[#dbe3dc]', desc: 'أنت في البداية — وهذا رائع! سنبني معك أساساً قوياً خطوة بخطوة.' },
  A2: { label: 'مبتدئ متقدم', color: 'text-[#147050]', bg: 'bg-[#edf6ef]', border: 'border-[#b8d4c5]', desc: 'لديك قاعدة جيدة وستتطور بسرعة مع منهجنا المصمم لمستواك.' },
  B1: { label: 'متوسط', color: 'text-[#147050]', bg: 'bg-[#edf6ef]', border: 'border-[#b8d4c5]', desc: 'مستواك جيد جداً! يمكنك التواصل في مواقف كثيرة وستصل للطلاقة قريباً.' },
  B2: { label: 'متوسط متقدم', color: 'text-[#147050]', bg: 'bg-[#edf6ef]', border: 'border-[#b8d4c5]', desc: 'مستواك متقدم ومميز. أنت تتواصل بثقة وستصل للاحترافية قريباً.' },
  C1: { label: 'متقدم', color: 'text-[#1e2b29]', bg: 'bg-[#f4f6f0]', border: 'border-[#dbe3dc]', desc: 'مستواك ممتاز! أنت قادر على التعبير بطلاقة في معظم المواقف.' },
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
        alert('فشل تحميل الاختبار، حاول مرة أخرى.');
      }
    } catch {
      setPhase('intro');
      alert('تعذر الاتصال بالخادم، حاول مرة أخرى.');
    }
  }, []);

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
        alert('حدث خطأ أثناء حفظ النتيجة.');
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
      alert('خطأ في تحميل السؤال التالي.');
    }

    setLoadingNext(false);
    setConfirmed(false);
  }, [selected, question, confirmed, answers, history, questionNum]);

  if (phase === 'intro') {
    return (
      <div className="min-h-[100dvh] bg-[#f4f6f0] flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-lg border border-[#dbe3dc] bg-[#fffefa] p-8 text-center sm:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-[#147050] text-xl font-bold text-white">
            BF
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">اختبار تحديد المستوى</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            {TOTAL} أسئلة بسيطة لنعرف مستواك في الإنجليزية ونضع لك خطة مثالية
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div className="border border-[#e0e6df] bg-[#f6f8f3] p-4">
              <div className="text-sm font-bold text-gray-700">١٠ دقائق</div>
              <div className="text-xs text-gray-400">مدة الاختبار</div>
            </div>
            <div className="border border-[#e0e6df] bg-[#f6f8f3] p-4">
              <div className="text-sm font-bold text-gray-700">{TOTAL} أسئلة</div>
              <div className="text-xs text-gray-400">اختيار من متعدد</div>
            </div>
            <div className="border border-[#e0e6df] bg-[#f6f8f3] p-4">
              <div className="text-sm font-bold text-gray-700">فوري</div>
              <div className="text-xs text-gray-400">ظهور النتيجة</div>
            </div>
          </div>
          <button
            onClick={startTest}
            className="mb-4 w-full bg-[#147050] py-4 text-xl font-bold text-white transition-colors hover:bg-[#0e5940]"
          >
            ابدأ الاختبار الآن
          </button>
          <Link href="/" className="block text-gray-400 text-sm hover:text-gray-600 transition">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-[100dvh] bg-[#f4f6f0] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-600 font-medium text-lg">جاري تحضير اختبارك...</p>
          <p className="text-gray-400 text-sm mt-2">لحظة من فضلك</p>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    const info = LEVEL_INFO[result.level] || LEVEL_INFO['A1'];
    return (
      <div className="min-h-[100dvh] bg-[#f4f6f0] flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-lg border border-[#dbe3dc] bg-[#fffefa] p-8 text-center sm:p-12">
          <div className="mb-4 font-mono text-4xl font-black text-[#147050]">{result.level}</div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">تم تحديد مستواك!</h1>
          <p className="text-gray-500 mb-8">إليك نتيجة اختبارك</p>

          <div className={`${info.bg} ${info.border} border-2 rounded-2xl p-6 mb-6`}>
            <div className={`text-5xl font-black ${info.color} mb-1`}>{result.level}</div>
            <div className={`text-xl font-bold ${info.color} mb-3`}>{info.label}</div>
            <p className="text-gray-600 text-sm leading-relaxed">{info.desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">الإجابات الصحيحة</div>
              <div className="text-3xl font-black text-gray-900">{result.score}<span className="text-lg text-gray-400">/{result.total}</span></div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-xs text-gray-400 mb-1">نسبة النجاح</div>
              <div className="text-3xl font-black text-emerald-600">{result.percentage}%</div>
            </div>
          </div>

          {fromRegistration && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-right">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 text-sm mb-1">حسابك قيد المراجعة</p>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    سيتم تفعيل حسابك خلال 24 ساعة بعد مراجعة إيصال الدفع. سنتواصل معك عبر واتساب أو البريد الإلكتروني.
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
                تسجيل الدخول عند التفعيل
              </Link>
            ) : (
              <button
                onClick={() => router.push('/dashboard/student')}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                الذهاب للوحة التحكم
              </button>
            )}
            <Link href="/" className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-medium hover:bg-gray-200 transition text-center">
              الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'testing' && question) {
    const progress = (questionNum / TOTAL) * 100;
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-gray-500">
              السؤال <span className="text-emerald-600 font-black">{questionNum}</span> من {TOTAL}
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
                {question.category === 'grammar' ? 'قواعد اللغة' : question.category === 'vocabulary' ? 'المفردات' : 'الفهم والقراءة'}
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
                        {letters[idx]}
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
                    جاري المعالجة...
                  </>
                ) : questionNum === TOTAL ? (
                  <>
                    <Trophy className="w-5 h-5" />
                    إنهاء الاختبار
                  </>
                ) : (
                  <>
                    السؤال التالي
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
