'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { CheckCircle, AlertCircle, Clock, Trophy, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

const LEVEL_INFO: Record<string, { label: string; color: string; bg: string; border: string; desc: string }> = {
  A1: { label: 'A1 — مبتدئ', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', desc: 'أنت في المرحلة الأولى من رحلة تعلم اللغة الإنجليزية. سنبني معك الأساس خطوة بخطوة.' },
  A2: { label: 'A2 — مبتدئ متقدم', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'لديك معرفة أساسية باللغة الإنجليزية وستنتقل بسرعة للمستوى التالي مع منهجنا.' },
  B1: { label: 'B1 — متوسط', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'مستواك جيد! ستستطيع التحدث في مواضيع عديدة وستتطور بشكل ملحوظ.' },
  B2: { label: 'B2 — متوسط متقدم', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200', desc: 'مستواك متقدم جداً. يمكنك التواصل بثقة وستصل للطلاقة قريباً.' },
  C1: { label: 'C1 — متقدم', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', desc: 'مستواك ممتاز! أنت قادر على التعبير بطلاقة في معظم المواقف.' },
};

export default function PlacementTestContent() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRegistration = searchParams.get('fromRegistration') === 'true';

  const fetchQuestions = useCallback(async () => {
    try {
      const testType = searchParams.get('testType') || 'PLACEMENT';
      const res = await fetch(`/api/student/placement-test/submit?testType=${testType}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
      } else {
        toast.error('لا توجد أسئلة متاحة للاختبار حالياً');
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'i')) {
        e.preventDefault();
        toast.error('النسخ واللصق غير مسموح به أثناء الاختبار');
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden && !result) {
        toast.error('تحذير: تم رصد مغادرة نافذة الاختبار.');
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    fetchQuestions();
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [result, fetchQuestions]);

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const submitTest = async () => {
    if (Object.keys(answers).length < questions.length) {
      setShowSubmitConfirm(true);
      return;
    }
    await doSubmitTest();
  };

  const doSubmitTest = async () => {
    setShowSubmitConfirm(false);
    setSubmitting(true);
    try {
      const testType = searchParams.get('testType') || 'PLACEMENT';
      const res = await fetch('/api/student/placement-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, testType, fromRegistration })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        toast.success('تم إنهاء الاختبار بنجاح!');
      } else {
        toast.error(data.error || 'فشل إرسال الاختبار');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">جاري تحميل الاختبار...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">لا توجد أسئلة متاحة</h2>
          <p className="text-gray-500 mb-6">لم يتم إضافة أسئلة اختبار تحديد المستوى بعد. يرجى التواصل مع الإدارة.</p>
          <Link href="/" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    const levelInfo = LEVEL_INFO[result.level] || LEVEL_INFO['A1'];
    if (fromRegistration) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-emerald-600" />
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">تم تحديد مستواك!</h1>
            <p className="text-gray-500 mb-8">شكراً لإتمام اختبار تحديد المستوى</p>

            <div className={`${levelInfo.bg} ${levelInfo.border} border-2 rounded-2xl p-6 mb-8`}>
              <div className={`text-5xl font-black ${levelInfo.color} mb-2`}>{result.level}</div>
              <div className={`text-lg font-bold ${levelInfo.color} mb-3`}>{levelInfo.label}</div>
              <p className="text-gray-600 text-sm leading-relaxed">{levelInfo.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">الدرجة</div>
                <div className="text-2xl font-black text-gray-900">{result.score} / {questions.length}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="text-sm text-gray-500 mb-1">النسبة</div>
                <div className="text-2xl font-black text-gray-900">{Math.round(result.percentage)}%</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-right">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-800 mb-1">حسابك قيد المراجعة</h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    سيتم مراجعة إيصال الدفع من قبل الإدارة وتفعيل حسابك خلال 24 ساعة. سنتواصل معك عبر البريد الإلكتروني أو واتساب.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/auth/login"
                className="w-full bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                تسجيل الدخول عند التفعيل
              </Link>
              <Link
                href="/"
                className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">نتيجة اختبار تحديد المستوى</h1>
          <p className="text-gray-500 mb-8">تم حفظ مستواك الحالي في ملفك الشخصي</p>

          <div className={`${levelInfo.bg} ${levelInfo.border} border-2 rounded-2xl p-6 mb-8`}>
            <div className={`text-5xl font-black ${levelInfo.color} mb-2`}>{result.level}</div>
            <div className={`text-lg font-bold ${levelInfo.color} mb-3`}>{levelInfo.label}</div>
            <p className="text-gray-600 text-sm leading-relaxed">{levelInfo.desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-sm text-gray-500 mb-1">الدرجة</div>
              <div className="text-2xl font-black text-gray-900">{result.score} / {questions.length}</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="text-sm text-gray-500 mb-1">النسبة</div>
              <div className="text-2xl font-black text-gray-900">{Math.round(result.percentage)}%</div>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/student')}
            className="w-full bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            الذهاب للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];
  const options = currentQ?.options ? (typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options) : [];
  const answeredCount = Object.keys(answers).length;
  const progressPct = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-8 select-none">

        {fromRegistration && (
          <div className="bg-emerald-600 text-white rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <p className="font-medium text-sm">
              تم إنشاء حسابك بنجاح! أكمل اختبار تحديد المستوى لنتمكن من وضع خطة تعليمية مناسبة لك.
            </p>
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-l from-emerald-700 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">اختبار تحديد المستوى</h2>
              <div className="flex items-center gap-2 bg-emerald-700/50 px-3 py-1.5 rounded-full text-sm font-bold">
                <span>{currentStep + 1}</span>
                <span>/</span>
                <span>{questions.length}</span>
              </div>
            </div>
            <div className="h-2 bg-emerald-800/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-emerald-100 text-xs mt-2">
              <span>تم الإجابة: {answeredCount} / {questions.length}</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
                السؤال {currentStep + 1}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 leading-relaxed mb-2">
                {currentQ?.question}
              </h3>
              {currentQ?.questionAr && (
                <p className="text-gray-500 text-base">{currentQ.questionAr}</p>
              )}
            </div>

            <div className="grid gap-3">
              {options.map((option: string, idx: number) => {
                const isSelected = answers[currentQ.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(currentQ.id, option)}
                    className={`p-4 text-right rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-gray-100 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 group-hover:border-emerald-300'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <span className={`font-medium text-base ${isSelected ? 'text-emerald-800 font-bold' : 'text-gray-700'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8 flex justify-between items-center gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ArrowRight className="w-4 h-4" />
              السابق
            </button>

            {currentStep === questions.length - 1 ? (
              <button
                onClick={submitTest}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-200"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    إنهاء الاختبار
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
              >
                التالي
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          نظام الحماية مفعّل — النسخ واللصق معطّل ومراقبة مغادرة الصفحة نشطة
        </p>
      </div>

      <ConfirmModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={doSubmitTest}
        title="إرسال الاختبار"
        message={`لم تجب على ${questions.length - answeredCount} سؤال. هل تريد الإرسال على أي حال؟`}
        confirmText="إرسال الآن"
        cancelText="متابعة الاختبار"
        variant="warning"
      />
    </div>
  );
}
