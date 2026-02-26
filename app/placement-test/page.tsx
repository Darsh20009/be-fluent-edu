'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function PlacementTestPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Anti-cheat: Disable context menu and copy
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'i')) {
        e.preventDefault();
        toast.error('النسخ واللصق غير مسموح به أثناء الاختبار');
      }
    };
    
    // Anti-cheat: Detect tab switching
    const handleVisibilityChange = () => {
      if (document.hidden && !result) {
        toast.error('تحذير: تم رصد مغادرة نافذة الاختبار. سيتم تسجيل ذلك.');
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
  }, [result]);

  const fetchQuestions = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const testType = urlParams.get('testType') || 'PLACEMENT';
      const res = await fetch(`/api/student/placement-test/submit?testType=${testType}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        toast.error('فشل تحميل الأسئلة');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
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
      const urlParams = new URLSearchParams(window.location.search);
      const testType = urlParams.get('testType') || 'PLACEMENT';
      const res = await fetch('/api/student/placement-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, testType })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        toast.success('تم إنهاء الاختبار بنجاح');
      } else {
        toast.error(data.error || 'فشل إرسال الاختبار');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">جاري تحميل الاختبار...</div>;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white shadow-xl rounded-2xl mt-10">
        <h1 className="text-3xl font-bold text-green-600 mb-6">نتيجة اختبار تحديد المستوى</h1>
        <div className="text-6xl font-bold text-gray-800 mb-4">{result.level}</div>
        <p className="text-xl text-gray-600 mb-8">مستواك الحالي في اللغة الإنجليزية هو: <span className="font-bold">{result.level}</span></p>
        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="text-sm text-gray-500">الدرجة</div>
            <div className="text-2xl font-bold">{result.score} / {questions.length}</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="text-sm text-gray-500">النسبة</div>
            <div className="text-2xl font-bold">{result.percentage}%</div>
          </div>
        </div>
        <button 
          onClick={() => router.push('/dashboard/student')}
          className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition"
        >
          الذهاب للوحة التحكم
        </button>
      </div>
    );
  }

  const currentQ = questions[currentStep];
  const options = currentQ?.options ? JSON.parse(currentQ.options) : [];

  return (
    <div className="max-w-3xl mx-auto p-6 select-none">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">اختبار تحديد المستوى الرسمي</h2>
          <div className="text-sm bg-green-700 px-3 py-1 rounded-full">
            سؤال {currentStep + 1} من {questions.length}
          </div>
        </div>
        
        <div className="p-8">
          <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">{currentQ?.question}</h3>
            {currentQ?.questionAr && (
              <p className="text-gray-500 text-right font-arabic">{currentQ.questionAr}</p>
            )}
          </div>

          <div className="grid gap-4">
            {options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(currentQ.id, option)}
                className={`p-4 text-left rounded-xl border-2 transition-all flex items-center gap-4 ${
                  answers[currentQ.id] === option 
                    ? 'border-green-500 bg-green-50 text-green-700 font-bold' 
                    : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQ.id] === option ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {answers[currentQ.id] === option && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-between">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-2 rounded-lg font-bold text-gray-600 disabled:opacity-30"
          >
            السابق
          </button>
          
          {currentStep === questions.length - 1 ? (
            <button 
              onClick={submitTest}
              disabled={submitting}
              className="px-10 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'جاري الإرسال...' : 'إنهاء الاختبار'}
            </button>
          ) : (
            <button 
              onClick={nextStep}
              className="px-10 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
            >
              التالي
            </button>
          )}
        </div>
      </div>
      <div className="mt-6 text-center text-sm text-gray-400">
        نظام الحماية مفعل: النسخ واللصق معطل - مراقبة مغادرة الصفحة مفعلة
      </div>
      <ConfirmModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={doSubmitTest}
        title="إرسال الاختبار"
        message={`لم تجب على ${questions.length - Object.keys(answers).length} سؤال. هل تريد الإرسال على أي حال؟`}
        confirmText="إرسال الآن"
        cancelText="متابعة الاختبار"
        variant="warning"
      />
    </div>
  );
}
