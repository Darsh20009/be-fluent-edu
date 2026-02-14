'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Save, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function TestEditorPage({ params }: { params: { id: string } }) {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    questionAr: '',
    type: 'MULTIPLE_CHOICE',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  });

  useEffect(() => {
    fetchTest();
  }, [params.id]);

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/admin/tests/${params.id}`);
      const data = await res.json();
      setTest(data);
    } catch (error) {
      toast.error('Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      const res = await fetch(`/api/admin/tests/${params.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      if (res.ok) {
        toast.success('Question added');
        setShowAddQuestion(false);
        setNewQuestion({
          question: '',
          questionAr: '',
          type: 'MULTIPLE_CHOICE',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1
        });
        fetchTest();
      }
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const deleteQuestion = async (qId: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/tests/${params.id}/questions/${qId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Question deleted');
        fetchTest();
      }
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!test) return <div className="p-8 text-center text-red-500">Test not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/tests" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Tests
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddQuestion(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
        <p className="text-gray-500">{test.titleAr}</p>
        <div className="flex gap-4 mt-4 text-sm text-gray-400">
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{test.level}</span>
          <span>{test.questions?.length || 0} Questions</span>
          <span>Passing Score: {test.passingScore}%</span>
        </div>
      </div>

      <div className="space-y-6">
        {test.questions?.map((q: any, idx: number) => {
          const options = q.options ? JSON.parse(q.options) : [];
          return (
            <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm group hover:border-primary/20 transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{q.question}</h3>
                    <p className="text-gray-500 text-sm mt-1">{q.questionAr}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteQuestion(q.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {options.length > 0 && (
                <div className="grid grid-cols-2 gap-3 pl-11">
                  {options.map((opt: string, i: number) => (
                    <div 
                      key={i} 
                      className={`px-3 py-2 rounded-lg border text-sm ${opt === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-gray-50 border-gray-100 text-gray-600'}`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pl-11 flex items-center gap-4 text-xs text-gray-400">
                <span>Type: {q.type}</span>
                <span>Points: {q.points}</span>
              </div>
            </div>
          );
        })}
        {(!test.questions || test.questions.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">No questions added yet. Click "Add Question" to start.</p>
          </div>
        )}
      </div>

      {showAddQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-6">Add New Question</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question (English)</label>
                  <textarea 
                    value={newQuestion.question}
                    onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 h-20 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">السؤال (بالعربي)</label>
                  <textarea 
                    value={newQuestion.questionAr}
                    onChange={e => setNewQuestion({...newQuestion, questionAr: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 h-20 outline-none focus:ring-2 focus:ring-primary/20 text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Options (Fill all 4)</label>
                <div className="grid grid-cols-2 gap-3">
                  {newQuestion.options.map((opt, i) => (
                    <input 
                      key={i}
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => {
                        const newOpts = [...newQuestion.options];
                        newOpts[i] = e.target.value;
                        setNewQuestion({...newQuestion, options: newOpts});
                      }}
                      className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer (Match exact option text)</label>
                  <select 
                    value={newQuestion.correctAnswer}
                    onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Correct Option</option>
                    {newQuestion.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt || `Option ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input 
                    type="number" 
                    value={newQuestion.points}
                    onChange={e => setNewQuestion({...newQuestion, points: parseInt(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={handleAddQuestion}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 shadow-md transition"
              >
                Add Question
              </button>
              <button 
                onClick={() => setShowAddQuestion(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
