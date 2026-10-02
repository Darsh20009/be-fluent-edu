'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Plus, Trash2, Pencil, ChevronDown, ChevronUp, Save, X, Send,
  CheckCircle, List, AlignLeft, Video, Image, Settings2, BookOpen,
  GripVertical, RotateCcw, Upload, Eye, ChevronLeft, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { localeText, localeDirection } from '@/lib/locale';

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
  const { language } = useTheme();
  const t = (ar: string, en: string) => localeText(language, ar, en);
  const testName = (id: string, name: string) => t(name, ({
    PLACEMENT: 'Placement test', A1_FINAL: 'A1 - Beginner', A2_FINAL: 'A2 - Elementary',
    B1_FINAL: 'B1 - Intermediate', B2_FINAL: 'B2 - Upper intermediate', C1_FINAL: 'C1 - Advanced',
  } as Record<string, string>)[id] || name);
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
  const [studentNameInput, setStudentNameInput] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [testStats, setTestStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchQuestions();
    fetchSettings();
    fetchTestStats();
  }, [activeTestType]);

  const fetchTestStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.placementTestCounts) {
        setTestStats(data.placementTestCounts);
      }
    } catch {}
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/placement-test/questions?testType=${activeTestType}`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t('فشل تحميل الأسئلة', 'Failed to load questions'));
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
      if (res.ok) toast.success(t('تم حفظ إعدادات الاختبار', 'Test settings saved'));
      else toast.error(t('فشل الحفظ', 'Save failed'));
    } catch {
      toast.error(t('خطأ في الحفظ', 'Error saving'));
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
        toast.success(t('تم رفع الملف', 'File uploaded'));
      } else {
        toast.error(t('فشل رفع الملف', 'File upload failed'));
      }
    } catch {
      toast.error(t('خطأ في رفع الملف', 'Error uploading file'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim()) return toast.error(t('أدخل نص السؤال', 'Enter the question text'));
    if (form.questionType === 'MCQ') {
      if (form.options.some(o => !o.trim())) return toast.error(t('أكمل جميع الخيارات', 'Complete all answer options'));
      if (!form.correctAnswer) return toast.error(t('حدد الإجابة الصحيحة', 'Select the correct answer'));
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
        toast.success(editingId ? t('تم تحديث السؤال', 'Question updated') : t('تم إضافة السؤال', 'Question added'));
        resetForm();
        fetchQuestions();
      } else {
        toast.error(t('خطأ في الحفظ', 'Error saving'));
      }
    } catch {
      toast.error(t('خطأ في العملية', 'Operation failed'));
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

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, id });
  };

  const doDeleteQuestion = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    setDeleteConfirm({ open: false, id: null });
    try {
      const res = await fetch(`/api/admin/placement-test/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('تم حذف السؤال', 'Question deleted'));
        fetchQuestions();
      } else {
        toast.error(t('فشل حذف السؤال', 'Failed to delete question'));
      }
    } catch {
      toast.error(t('خطأ في الحذف', 'Error deleting'));
    }
  };

  const handleSendLink = async () => {
    if (!emailInput) return toast.error(t('أدخل البريد الإلكتروني', 'Enter an email address'));
    setEmailLoading(true);
    try {
      const testLink = `${window.location.origin}/placement-test`;
      const res = await fetch('/api/admin/send-test-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, link: testLink, studentName: studentNameInput || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t(`تم إرسال الرابط إلى ${emailInput}`, `Link sent to ${emailInput}`));
        setEmailInput('');
        setStudentNameInput('');
      } else {
        toast.error(data.error || t('فشل إرسال الرابط', 'Failed to send link'));
      }
    } catch {
      toast.error(t('فشل الإرسال', 'Failed to send'));
    } finally {
      setEmailLoading(false);
    }
  };

  const activeType = TEST_TYPES.find(type => type.id === activeTestType);
  const selectedQType = QUESTION_TYPES.find(t => t.id === form.questionType);

  return (
    <div className="min-h-screen bg-[#f4f1e9] text-[#1f2924] [&_button]:rounded-none [&_input]:rounded-none [&_select]:rounded-none [&_textarea]:rounded-none" dir={localeDirection(language)}>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-[#d7d4ca] bg-[#f8f6f0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="border border-[#c9c7bc] p-2 text-[#174d3a] transition hover:bg-[#e8eee8]">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#174d3a]">{t('إدارة الاختبارات والأسئلة', 'Manage tests and questions')}</h1>
              <p className="text-sm text-[#667168]">{t('تحكم كامل في بنوك الأسئلة وإعدادات الاختبار', 'Manage question banks and test settings')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="hidden items-center gap-2 border border-[#c9c7bc] bg-[#eeece5] px-4 py-2 text-sm font-bold text-[#1f2924] transition hover:bg-[#e4e1d8] sm:flex"
            >
              <Settings2 className="w-4 h-4" />
              {t('إعدادات الاختبار', 'Test settings')}
            </button>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyQuestion, testType: activeTestType }); }}
              className="flex items-center gap-2 bg-[#174d3a] px-4 py-2 text-sm font-bold text-[#f8f6f0] transition hover:bg-[#123c2d]"
            >
              <Plus className="w-4 h-4" />
              {t('إضافة سؤال', 'Add question')}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">

        {/* Test Type Tabs */}
        <div className="flex flex-wrap gap-1 border border-[#d7d4ca] bg-[#f8f6f0] p-2">
          {TEST_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => { setActiveTestType(type.id); setShowForm(false); }}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTestType === type.id
                  ? 'bg-[#174d3a] text-[#f8f6f0]'
                  : 'text-[#667168] hover:bg-[#eeece5]'
              }`}
            >
              {testName(type.id, type.name)}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTestType === type.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {testStats[type.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-600" />
              {t('إعدادات اختبار:', 'Test settings:')} {activeType ? testName(activeType.id, activeType.name) : ''}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('عدد الأسئلة للطالب', 'Questions per student')}</label>
                <input
                  type="number" min="1" max="100"
                  value={settings.questionsCount}
                  onChange={e => setSettings(s => ({ ...s, questionsCount: +e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl text-center font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('المدة (دقيقة)', 'Duration (minutes)')}</label>
                <input
                  type="number" min="1" max="180"
                  value={settings.timeLimitMins}
                  onChange={e => setSettings(s => ({ ...s, timeLimitMins: +e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl text-center font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('درجة النجاح (%)', 'Passing score (%)')}</label>
                <input
                  type="number" min="1" max="100"
                  value={settings.passScore}
                  onChange={e => setSettings(s => ({ ...s, passScore: +e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl text-center font-black text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('خلط الأسئلة', 'Shuffle questions')}</label>
                <button
                  onClick={() => setSettings(s => ({ ...s, shuffleQuestions: !s.shuffleQuestions }))}
                  className={`w-full p-3 border rounded-xl font-bold text-sm transition ${
                    settings.shuffleQuestions
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {settings.shuffleQuestions ? t('✓ مفعّل', '✓ Enabled') : t('غير مفعّل', 'Disabled')}
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
                {savingSettings ? t('جاري الحفظ...', 'Saving…') : t('حفظ الإعدادات', 'Save settings')}
              </button>
            </div>
          </div>
        )}

        {/* Send Test Link */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-emerald-900 text-sm">{t('إرسال رابط اختبار تحديد المستوى', 'Send a placement test link')}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{t('أرسل رابطاً مباشراً للطالب عبر بريده الإلكتروني', 'Send a direct link to a student by email')}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder={t('اسم الطالب (اختياري)', 'Student name (optional)')}
              value={studentNameInput}
              onChange={e => setStudentNameInput(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-emerald-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-400 outline-none"
            />
            <input
              type="email"
              placeholder={t('البريد الإلكتروني...', 'Email address…')}
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendLink()}
              className="flex-1 px-4 py-2.5 border border-emerald-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-400 outline-none"
            />
            <button
              onClick={handleSendLink}
              disabled={emailLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              {emailLoading ? t('جاري الإرسال...', 'Sending…') : t('إرسال الرابط', 'Send link')}
            </button>
          </div>
        </div>

        {/* Add/Edit Question Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-black text-lg">
                {editingId ? t('تعديل السؤال', 'Edit question') : t('إضافة سؤال جديد', 'Add a question')}
              </h2>
              <button onClick={resetForm} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Question Type Selector */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-2">{t('نوع السؤال', 'Question type')}</label>
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
                        {t(qt.label, ({ MCQ: 'Multiple choice', WRITTEN: 'Written response', VIDEO_RECORDING: 'Video recording', IMAGE: 'Image question' } as Record<string, string>)[qt.id])}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('نص السؤال (بالإنجليزية) *', 'Question text (English) *')}</label>
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
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('نص السؤال (بالعربي - اختياري)', 'Question text (Arabic - optional)')}</label>
                  <textarea
                    value={form.questionAr}
                    onChange={e => setForm(f => ({ ...f, questionAr: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-right"
                    rows={3}
                    placeholder={t('اكتب السؤال بالعربي...', 'Enter the question in Arabic…')}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Media Upload for IMAGE/VIDEO types */}
              {(form.questionType === 'IMAGE' || form.questionType === 'VIDEO_RECORDING') && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">
                    {form.questionType === 'IMAGE' ? t('صورة السؤال', 'Question image') : t('فيديو السؤال (تعليمي)', 'Question video (instructional)')}
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
                            {t('إزالة', 'Remove')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-3">{t('اسحب الملف هنا أو', 'Drag a file here or')}</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {uploading ? t('جاري الرفع...', 'Uploading…') : t('اختر ملف', 'Choose file')}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept={form.questionType === 'IMAGE' ? 'image/*' : 'image/*,video/*'}
                          onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        />
                        <div className="mt-3">
                          <input
                            type="url"
                            placeholder={t('أو أدخل رابط URL...', 'Or enter a URL…')}
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
                  <label className="text-xs font-bold text-gray-500 block mb-2">{t('الخيارات * (اختر الإجابة الصحيحة بالنقر عليها)', 'Options * (select the correct answer by clicking it)')}</label>
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
                          placeholder={t(`الخيار ${i + 1}`, `Option ${i + 1}`)}
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
                        + {t('إضافة خيار', 'Add option')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('شرح الإجابة (اختياري)', 'Answer explanation (optional)')}</label>
                <textarea
                  value={form.explanation}
                  onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm"
                  rows={2}
                  placeholder={t('شرح يظهر للطالب بعد الإجابة...', 'Explanation shown to the student after answering…')}
                />
              </div>

              {/* Meta fields */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('المستوى', 'Level')}</label>
                  <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('التصنيف', 'Category')}</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('النقاط', 'Points')}</label>
                  <input type="number" min="1" max="10" value={form.points} onChange={e => setForm(f => ({ ...f, points: +e.target.value }))} className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('البنك', 'Bank')}</label>
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
                  {saving ? t('جاري الحفظ...', 'Saving…') : editingId ? t('تحديث السؤال', 'Update question') : t('إضافة السؤال', 'Add question')}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">
                  {t('إلغاء', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900">
              {t('أسئلة', 'Questions')} {activeType ? testName(activeType.id, activeType.name) : ''}
              <span className="mr-2 text-sm font-bold text-gray-400">({questions.length} {t('سؤال', 'questions')})</span>
            </h2>
            <div className="text-sm text-gray-500">
              {t('الطلاب سيرون:', 'Students will see:')} <strong className="text-emerald-600">{settings.questionsCount}</strong> {t('سؤال', 'questions')}
              | {t('مدة:', 'Duration:')} <strong className="text-emerald-600">{settings.timeLimitMins}</strong> {t('دقيقة', 'minutes')}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">{t('لا توجد أسئلة في هذا البنك', 'No questions in this bank')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('أضف أول سؤال باستخدام زر "إضافة سؤال"', 'Add the first question using the "Add question" button')}</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition"
              >
                + {t('إضافة أول سؤال', 'Add the first question')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => {
                const qType = QUESTION_TYPES.find(t => t.id === (q.questionType || 'MCQ'));
                const QIcon = qType?.icon || List;
                return (
                      <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-50 transition group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-1.5 h-full ${
                          q.questionType === 'MCQ' ? 'bg-blue-500' :
                          q.questionType === 'WRITTEN' ? 'bg-green-500' :
                          q.questionType === 'VIDEO_RECORDING' ? 'bg-purple-500' : 'bg-orange-500'
                        }`} />
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-black text-gray-500">
                              {i + 1}
                            </span>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                              q.questionType === 'MCQ' ? 'bg-blue-50' :
                              q.questionType === 'WRITTEN' ? 'bg-green-50' :
                              q.questionType === 'VIDEO_RECORDING' ? 'bg-purple-50' : 'bg-orange-50'
                            }`}>
                              <QIcon className={`w-5 h-5 ${
                                q.questionType === 'MCQ' ? 'text-blue-600' :
                                q.questionType === 'WRITTEN' ? 'text-green-600' :
                                q.questionType === 'VIDEO_RECORDING' ? 'text-purple-600' : 'text-orange-600'
                              }`} />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">{q.level}</span>
                              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                                q.questionType === 'MCQ' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                q.questionType === 'WRITTEN' ? 'bg-green-50 text-green-700 border-green-100' :
                                q.questionType === 'VIDEO_RECORDING' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                'bg-orange-50 text-orange-700 border-orange-100'
                              }`}>{qType?.label || q.questionType}</span>
                              {q.category && <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-100">{q.category}</span>}
                              <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-yellow-100">{q.points} {t('نقطة', 'points')}</span>
                            </div>
                            <p className="font-bold text-gray-900 text-base leading-relaxed">{q.question}</p>
                            {q.questionAr && <p className="text-gray-500 text-sm mt-1 text-right font-medium" dir="rtl">{q.questionAr}</p>}

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
                          <div className="mt-4">
                            {q.questionType === 'IMAGE' ? (
                              <img src={q.mediaUrl} alt="Q media" className="max-h-32 rounded-xl object-cover border border-gray-100 shadow-sm" />
                            ) : (
                              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                                <Video className="w-4 h-4 text-purple-600" />
                                <a href={q.mediaUrl} target="_blank" className="text-xs text-blue-600 hover:underline font-bold">{t('عرض الفيديو المرفق', 'View attached video')}</a>
                              </div>
                            )}
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-xs text-gray-400 mt-2 italic">💡 {q.explanation}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => handleEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title={t('تعديل', 'Edit')}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title={t('حذف', 'Delete')}>
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
      <ConfirmModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={doDeleteQuestion}
        title={t('حذف السؤال', 'Delete question')}
        message={t('هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.', 'Are you sure you want to delete this question? This action cannot be undone.')}
        confirmText={t('حذف', 'Delete')}
        cancelText={t('إلغاء', 'Cancel')}
        variant="danger"
      />
    </div>
  );
}
