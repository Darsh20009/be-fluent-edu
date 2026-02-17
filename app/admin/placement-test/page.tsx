'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminPlacementQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('PLACEMENT');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    questionAr: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    level: 'A1',
    testType: 'PLACEMENT',
    category: 'Grammar'
  });

  const testTypes = [
    { id: 'PLACEMENT', name: 'Placement Test' },
    { id: 'A1_FINAL', name: 'A1 Final' },
    { id: 'A2_FINAL', name: 'A2 Final' },
    { id: 'B1_FINAL', name: 'B1 Final' },
    { id: 'B2_FINAL', name: 'B2 Final' },
    { id: 'C1_FINAL', name: 'C1 Final' },
  ];

  useEffect(() => {
    fetchQuestions();
  }, [filterType]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/placement-test/questions?testType=${filterType}`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('فشل تحميل الأسئلة');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.correctAnswer || newQuestion.options.some(o => !o)) {
      toast.error('يرجى إكمال جميع الحقول');
      return;
    }

    try {
      const url = editingId 
        ? `/api/admin/placement-test/questions/${editingId}`
        : '/api/admin/placement-test/questions';
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      
      if (res.ok) {
        toast.success(editingId ? 'تم تحديث السؤال' : 'تم إضافة السؤال بنجاح');
        setNewQuestion({
          ...newQuestion,
          question: '',
          questionAr: '',
          options: ['', '', '', ''],
          correctAnswer: '',
        });
        setEditingId(null);
        fetchQuestions();
      }
    } catch (error) {
      toast.error('خطأ في العملية');
    }
  };

  const handleEdit = (q: any) => {
    setEditingId(q.id);
    setNewQuestion({
      question: q.question,
      questionAr: q.questionAr || '',
      options: JSON.parse(q.options),
      correctAnswer: q.correctAnswer,
      level: q.level,
      testType: q.testType,
      category: q.category || 'Grammar'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    try {
      const res = await fetch(`/api/admin/placement-test/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('تم الحذف');
        fetchQuestions();
      }
    } catch (error) {
      toast.error('خطأ في الحذف');
    }
  };

  const handleSendLink = async () => {
    if (!studentEmail) return toast.error('يرجى إدخال البريد الإلكتروني');
    setEmailLoading(true);
    try {
      // هنا نقوم بمحاكاة الإرسال، يمكنك لاحقاً ربطها بـ Nodemailer أو SendGrid
      const testLink = `${window.location.origin}/placement-test`;
      toast.success(`تم إرسال رابط الاختبار إلى ${studentEmail}`);
      setStudentEmail('');
    } catch (error) {
      toast.error('فشل الإرسال');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">إدارة بنك الأسئلة والمستويات</h1>
      
      <div className="flex gap-4 mb-8 bg-gray-100 p-4 rounded-xl">
        <span className="font-bold self-center">عرض بنك:</span>
        {testTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setFilterType(type.id)}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === type.id ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* ميزة إرسال الرابط */}
      <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-bold text-green-800">إرسال رابط اختبار تحديد المستوى</h3>
          <p className="text-sm text-green-600">أرسل رابط الاختبار المباشر لأي طالب عبر بريده الإلكتروني</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="email" 
            placeholder="البريد الإلكتروني للطالب"
            value={studentEmail}
            onChange={e => setStudentEmail(e.target.value)}
            className="p-3 border rounded-lg flex-1 md:w-64"
          />
          <button 
            onClick={handleSendLink}
            disabled={emailLoading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
          >
            إرسال الرابط
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-green-600">
          {editingId ? 'تعديل السؤال' : `إضافة سؤال جديد لبنك (${filterType})`}
        </h2>
        <form onSubmit={handleAddQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="السؤال بالإنجليزية"
              value={newQuestion.question}
              onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="text" 
              placeholder="السؤال بالعربي (اختياري)"
              value={newQuestion.questionAr}
              onChange={e => setNewQuestion({...newQuestion, questionAr: e.target.value})}
              className="w-full p-3 border rounded-lg text-right"
            />
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={newQuestion.testType}
                onChange={e => setNewQuestion({...newQuestion, testType: e.target.value})}
                className="p-3 border rounded-lg bg-green-50 font-bold"
              >
                {testTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select 
                value={newQuestion.level}
                onChange={e => setNewQuestion({...newQuestion, level: e.target.value})}
                className="p-3 border rounded-lg"
              >
                <option value="A1">A1 Beginner</option>
                <option value="A2">A2 Elementary</option>
                <option value="B1">B1 Intermediate</option>
                <option value="B2">B2 Upper Intermediate</option>
                <option value="C1">C1 Advanced</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {newQuestion.options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={`خيار ${i + 1}`}
                  value={opt}
                  onChange={e => {
                    const opts = [...newQuestion.options];
                    opts[i] = e.target.value;
                    setNewQuestion({...newQuestion, options: opts});
                  }}
                  className="flex-1 p-3 border rounded-lg"
                />
                <input 
                  type="radio" 
                  name="correct" 
                  checked={newQuestion.correctAnswer === opt && opt !== ''}
                  onChange={() => setNewQuestion({...newQuestion, correctAnswer: opt})}
                  className="mt-4"
                />
              </div>
            ))}
            <button type="submit" className="w-full bg-green-600 text-white p-4 rounded-lg font-bold hover:bg-green-700 transition">
              {editingId ? 'تحديث السؤال' : `حفظ في بنك ${newQuestion.testType}`}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingId(null);
                  setNewQuestion({
                    question: '',
                    questionAr: '',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                    level: 'A1',
                    testType: 'PLACEMENT',
                    category: 'Grammar'
                  });
                }}
                className="w-full mt-2 bg-gray-200 text-gray-700 p-4 rounded-lg font-bold"
              >
                إلغاء التعديل
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-bold">الأسئلة الحالية في بنك {filterType} ({questions.length})</h2>
        {loading ? (
          <div className="text-center p-10">جاري التحميل...</div>
        ) : questions.length === 0 ? (
          <div className="text-center p-10 text-gray-400 bg-gray-50 rounded-xl">لا توجد أسئلة في هذا البنك بعد.</div>
        ) : (
          questions.map((q, i) => (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex justify-between items-start">
              <div className="flex-1">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded mb-2 mr-2">{q.level}</span>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded mb-2 mr-2">{q.testType}</span>
                <h3 className="text-lg font-bold">{q.question}</h3>
                {q.questionAr && <p className="text-gray-500 text-sm mb-4 text-right">{q.questionAr}</p>}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {JSON.parse(q.options).map((opt: string, idx: number) => (
                    <div key={idx} className={`text-sm p-2 rounded ${opt === q.correctAnswer ? 'bg-green-50 text-green-700 font-bold border border-green-200' : 'bg-gray-50 text-gray-500'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button 
                  onClick={() => handleEdit(q)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="تعديل"
                >
                  تعديل
                </button>
                <button 
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="حذف"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
