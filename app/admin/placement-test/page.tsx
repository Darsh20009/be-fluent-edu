'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminPlacementQuestions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    questionAr: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    level: 'A1',
    category: 'Grammar'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/placement-test/questions');
      const data = await res.json();
      setQuestions(data);
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
      const res = await fetch('/api/admin/placement-test/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      if (res.ok) {
        toast.success('تم إضافة السؤال بنجاح');
        setNewQuestion({
          question: '',
          questionAr: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          level: 'A1',
          category: 'Grammar'
        });
        fetchQuestions();
      }
    } catch (error) {
      toast.error('خطأ في الإضافة');
    }
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">إدارة بنك أسئلة تحديد المستوى</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-green-600">إضافة سؤال جديد</h2>
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
              <input 
                type="text" 
                placeholder="التصنيف (Grammar...)"
                value={newQuestion.category}
                onChange={e => setNewQuestion({...newQuestion, category: e.target.value})}
                className="p-3 border rounded-lg"
              />
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
              حفظ السؤال في البنك
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-bold">الأسئلة الحالية ({questions.length})</h2>
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex justify-between items-start">
            <div>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded mb-2 mr-2">{q.level}</span>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded mb-2">{q.category}</span>
              <h3 className="text-lg font-bold">{q.question}</h3>
              <p className="text-gray-500 text-sm mb-4">{q.questionAr}</p>
              <div className="grid grid-cols-2 gap-2">
                {JSON.parse(q.options).map((opt: string, idx: number) => (
                  <div key={idx} className={`text-sm p-2 rounded ${opt === q.correctAnswer ? 'bg-green-50 text-green-700 font-bold border border-green-200' : 'bg-gray-50 text-gray-500'}`}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
