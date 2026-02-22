'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  Plus, Trash2, Pencil, ChevronDown, ChevronUp, Save, X, Send,
  CheckCircle, List, AlignLeft, Video, Image, Settings2, BookOpen,
  GripVertical, RotateCcw, Upload, Eye, ChevronLeft, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const TEST_TYPES = [
  { id: 'PLACEMENT', name: 'اختبار تحديد المستوى', color: 'emerald' },
  { id: 'A1_FINAL', name: 'A1 - مبتدئ', color: 'blue' },
  { id: 'A2_FINAL', name: 'A2 - أساسي', color: 'violet' },
  { id: 'B1_FINAL', name: 'B1 - متوسط', color: 'orange' },
  { id: 'B2_FINAL', name: 'B2 - متقدم', color: 'red' },
  { id: 'C1_FINAL', name: 'C1 - متمكن', color: 'pink' },
];

const QUESTION_TYPES = [
  { id: 'MCQ', label: 'اختيارات متعددة', icon: List, color: 'blue' },
  { id: 'WRITTEN', label: 'إجابة كتابية', icon: AlignLeft, color: 'green' },
  { id: 'VIDEO_RECORDING', label: 'تسجيل فيديو', icon: Video, color: 'purple' },
  { id: 'IMAGE', label: 'سؤال بصورة', icon: Image, color: 'orange' },
];

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const CATEGORIES = ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Speaking', 'Writing'];

const emptyQuestion = {
  question: '',
  questionAr: '',
  questionType: 'MCQ',
  options: ['', '', '', ''],
  correctAnswer: '',
  mediaUrl: '',
  explanation: '',
  points: 1,
  level: 'A1',
  testType: 'PLACEMENT',
  category: 'Grammar',
};

export default function PlacementTestAdmin() {
  const [activeTestType, setActiveTestType] = useState('PLACEMENT');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyQuestion, testType: 'PLACEMENT' });
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ questionsCount: 10, timeLimitMins: 30, passScore: 60, shuffleQuestions: true });
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchQuestions();
    fetchSettings();
  }, [activeTestType]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/placement-test/questions?testType=${activeTestType}`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('فشل تحميل الأسئلة');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/admin/test-settings?testType=${activeTestType}`);
      if (res.ok) setSettings(await res.json());
    } catch {}
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/test-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: activeTestType, ...settings })
      });
      if (res.ok) toast.success('تم حفظ إعدادات الاختبار');
      else toast.error('فشل الحفظ');
    } catch {
      toast.error('خطأ في الحفظ');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm(f => ({ ...f, mediaUrl: url }));
        toast.success('تم رفع الملف');
      } else {
        toast.error('فشل رفع الملف');
      }
    } catch {
      toast.error('خطأ في رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim()) return toast.error('أدخل نص السؤال');
    if (form.questionType === 'MCQ') {
      if (form.options.some(o => !o.trim())) return toast.error('أكمل جميع الخيارات');
      if (!form.correctAnswer) return toast.error('حدد الإجابة الصحيحة');
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/placement-test/questions/${editingId}`
        : '/api/admin/placement-test/questions';

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          testType: activeTestType,
          options: form.questionType === 'MCQ' ? form.options : [],
        })
      });

      if (res.ok) {
        toast.success(editingId ? 'تم تحديث السؤال' : 'تم إضافة السؤال');
        resetForm();
        fetchQuestions();
      } else {
        toast.error('خطأ في الحفظ');
      }
    } catch {
      toast.error('خطأ في العملية');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyQuestion, testType: activeTestType });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (q: any) => {
    setForm({
      question: q.question,
      questionAr: q.questionAr || '',
      questionType: q.questionType || 'MCQ',
      options: q.options ? JSON.parse(q.options) : ['', '', '', ''],
      correctAnswer: q.correctAnswer || '',
      mediaUrl: q.mediaUrl || '',
      explanation: q.explanation || '',
      points: q.points || 1,
      level: q.level,
      testType: q.testType,
      category: q.category || 'Grammar',
    });
    setEditingId(q.id);
    setShowForm(true);
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
    } catch {
      toast.error('خطأ في الحذف');
    }
  };

  const handleSendLink = async () => {
    if (!emailInput) return toast.error('أدخل البريد الإلكتروني');
    setEmailLoading(true);
    try {
      const testLink = `${window.location.origin}/placement-test`;
      const res = await fetch('/api/admin/send-test-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, link: testLink })
      });
      if (res.ok) {
        toast.success(`تم إرسال الرابط إلى ${emailInput}`);
        setEmailInput('');
      } else {
        toast.error('فشل إرسال الرابط');
      }
    } catch {
      toast.error('فشل الإرسال');
    } finally {
      setEmailLoading(false);
    }
  };

  const activeType = TEST_TYPES.find(t => t.id === activeTestType);
  const selectedQType = QUESTION_TYPES.find(t => t.id === form.questionType);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-gray-900">إدارة الاختبارات والأسئلة</h1>
              <p className="text-sm text-gray-500">تحكم كامل في بنوك الأسئلة وإعدادات الاختبار</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700 transition"
            >
              <Settings2 className="w-4 h-4" />
              إعدادات الاختبار
            </button>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyQuestion, testType: activeTestType }); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold text-white transition shadow-lg shadow-emerald-200"
            >
              <Plus className="w-4 h-4" />
              إضافة سؤال
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Test Type Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-2 flex flex-wrap gap-2">
          {TEST_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => { setActiveTestType(type.id); setShowForm(false); }}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTestType === type.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {type.name}
              <span className="mr-2 text-xs opacity-70">
                {activeTestType === type.id ? `(${questions.length})` : ''}
              </span>
            </button>
          ))}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-600" />
              إعدادات اختبار: {activeType?.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">عدد الأسئلة للطالب</label>
                <input
                  type="number" min="1" max="100"
                  value={settings.questionsCount}
                  onChange={e => setSettings(s => ({ ...s, questionsCount: +e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl text-center font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">المدة (دقيقة)</label>
                <input
                  type="number" min="1" max="180"
                  value={settings.timeLimitMins}
                  onChange={e => setSettings(s => ({ ...s, timeLimitMins: +e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl text-center font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">درجة النجاح (%)</label>
                <input
                  type="number" min="1" max="100"
                  value={settings.passScore}
                  onChange={e => setSettings(s => ({ ...s, passScore: +e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl text-center font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">خلط الأسئلة</label>
                <button
                  onClick={() => setSettings(s => ({ ...s, shuffleQuestions: !s.shuffleQuestions }))}
                  className={`w-full p-3 border rounded-xl font-bold text-sm transition ${
                    settings.shuffleQuestions
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {settings.shuffleQuestions ? '✓ مفعّل' : 'غير مفعّل'}
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        )}

        {/* Send Test Link */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="font-bold text-emerald-900 text-sm">إرسال رابط اختبار تحديد المستوى</p>
            <p className="text-xs text-emerald-600 mt-0.5">أرسل رابطاً مباشراً للطالب عبر بريده الإلكتروني</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="البريد الإلكتروني..."
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className="flex-1 sm:w-60 px-4 py-2.5 border border-emerald-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-400 outline-none"
            />
            <button
              onClick={handleSendLink}
              disabled={emailLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {emailLoading ? '...' : 'إرسال'}
            </button>
          </div>
        </div>

        {/* Add/Edit Question Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-black text-lg">
                {editingId ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h2>
              <button onClick={resetForm} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Question Type Selector */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-2">نوع السؤال</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {QUESTION_TYPES.map(qt => {
                    const Icon = qt.icon;
                    const isSelected = form.questionType === qt.id;
                    return (
                      <button
                        key={qt.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, questionType: qt.id, options: qt.id === 'MCQ' ? ['', '', '', ''] : f.options }))}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition font-bold text-sm ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                        {qt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">نص السؤال (بالإنجليزية) *</label>
                  <textarea
                    value={form.question}
                    onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    rows={3}
                    placeholder="Enter question text..."
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">نص السؤال (بالعربي - اختياري)</label>
                  <textarea
                    value={form.questionAr}
                    onChange={e => setForm(f => ({ ...f, questionAr: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-right"
                    rows={3}
                    placeholder="اكتب السؤال بالعربي..."
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Media Upload for IMAGE/VIDEO types */}
              {(form.questionType === 'IMAGE' || form.questionType === 'VIDEO_RECORDING') && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">
                    {form.questionType === 'IMAGE' ? 'صورة السؤال' : 'فيديو السؤال (تعليمي)'}
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-5">
                    {form.mediaUrl ? (
                      <div className="flex items-center gap-4">
                        {form.questionType === 'IMAGE' ? (
                          <img src={form.mediaUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                        ) : (
                          <video src={form.mediaUrl} className="w-40 h-24 object-cover rounded-lg" controls />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700 break-all">{form.mediaUrl}</p>
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, mediaUrl: '' }))}
                            className="text-xs text-red-500 hover:text-red-700 mt-1"
                          >
                            إزالة
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-3">اسحب الملف هنا أو</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {uploading ? 'جاري الرفع...' : 'اختر ملف'}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept={form.questionType === 'IMAGE' ? 'image/*' : 'video/*'}
                          onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        />
                        <div className="mt-3">
                          <input
                            type="url"
                            placeholder="أو أدخل رابط URL..."
                            value={form.mediaUrl}
                            onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MCQ Options */}
              {form.questionType === 'MCQ' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">الخيارات * (اختر الإجابة الصحيحة بالنقر عليها)</label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition cursor-pointer ${
                        form.correctAnswer === opt && opt !== ''
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200'
                      }`} onClick={() => opt && setForm(f => ({ ...f, correctAnswer: opt }))}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                          form.correctAnswer === opt && opt !== '' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                        }`}>
                          {form.correctAnswer === opt && opt !== '' && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onClick={e => e.stopPropagation()}
                          onChange={e => {
                            const opts = [...form.options];
                            const wasCorrect = form.correctAnswer === opts[i];
                            opts[i] = e.target.value;
                            setForm(f => ({
                              ...f,
                              options: opts,
                              correctAnswer: wasCorrect ? e.target.value : f.correctAnswer
                            }));
                          }}
                          className="flex-1 bg-transparent outline-none text-sm font-medium"
                          placeholder={`الخيار ${i + 1}`}
                        />
                        {form.options.length > 2 && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); const opts = form.options.filter((_, idx) => idx !== i); setForm(f => ({ ...f, options: opts, correctAnswer: f.correctAnswer === opt ? '' : f.correctAnswer })); }}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {form.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, options: [...f.options, ''] }))}
                        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition font-bold"
                      >
                        + إضافة خيار
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">شرح الإجابة (اختياري)</label>
                <textarea
                  value={form.explanation}
                  onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm"
                  rows={2}
                  placeholder="شرح يظهر للطالب بعد الإجابة..."
                />
              </div>

              {/* Meta fields */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">المستوى</label>
                  <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">التصنيف</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">النقاط</label>
                  <input type="number" min="1" max="10" value={form.points} onChange={e => setForm(f => ({ ...f, points: +e.target.value }))} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">البنك</label>
                  <select value={activeTestType} disabled className="w-full p-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500">
                    {TEST_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-200"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'جاري الحفظ...' : editingId ? 'تحديث السؤال' : 'إضافة السؤال'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900">
              أسئلة {activeType?.name}
              <span className="mr-2 text-sm font-bold text-gray-400">({questions.length} سؤال)</span>
            </h2>
            <div className="text-sm text-gray-500">
              الطلاب سيرون: <strong className="text-emerald-600">{settings.questionsCount}</strong> سؤال
              | مدة: <strong className="text-emerald-600">{settings.timeLimitMins}</strong> دقيقة
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">لا توجد أسئلة في هذا البنك</p>
              <p className="text-sm text-gray-400 mt-1">أضف أول سؤال باستخدام زر "إضافة سؤال"</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition"
              >
                + إضافة أول سؤال
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => {
                const qType = QUESTION_TYPES.find(t => t.id === (q.questionType || 'MCQ'));
                const QIcon = qType?.icon || List;
                return (
                  <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-emerald-200 transition group">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-black text-gray-500">
                          {i + 1}
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          q.questionType === 'MCQ' ? 'bg-blue-50' :
                          q.questionType === 'WRITTEN' ? 'bg-green-50' :
                          q.questionType === 'VIDEO_RECORDING' ? 'bg-purple-50' : 'bg-orange-50'
                        }`}>
                          <QIcon className={`w-4 h-4 ${
                            q.questionType === 'MCQ' ? 'text-blue-600' :
                            q.questionType === 'WRITTEN' ? 'text-green-600' :
                            q.questionType === 'VIDEO_RECORDING' ? 'text-purple-600' : 'text-orange-600'
                          }`} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">{q.level}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">{qType?.label || q.questionType}</span>
                          {q.category && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{q.category}</span>}
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">{q.points} نقطة</span>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{q.question}</p>
                        {q.questionAr && <p className="text-gray-500 text-xs mt-0.5 text-right" dir="rtl">{q.questionAr}</p>}

                        {q.questionType === 'MCQ' && q.options && (
                          <div className="grid grid-cols-2 gap-1.5 mt-3">
                            {JSON.parse(q.options).map((opt: string, idx: number) => (
                              <div key={idx} className={`text-xs p-2 rounded-lg ${
                                opt === q.correctAnswer
                                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                                  : 'bg-gray-50 text-gray-500'
                              }`}>
                                {opt === q.correctAnswer && <CheckCircle className="w-3 h-3 inline ml-1" />}
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.mediaUrl && (
                          <div className="mt-2">
                            {q.questionType === 'IMAGE' ? (
                              <img src={q.mediaUrl} alt="Q media" className="h-20 rounded-lg object-cover" />
                            ) : (
                              <a href={q.mediaUrl} target="_blank" className="text-xs text-blue-600 underline">عرض الفيديو</a>
                            )}
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-xs text-gray-400 mt-2 italic">💡 {q.explanation}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => handleEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="تعديل">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
