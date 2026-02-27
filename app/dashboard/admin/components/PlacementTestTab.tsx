'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ClipboardList, Users, CheckCircle, AlertCircle, Plus, Trash2, Edit3, Save,
  X, Search, Filter, RefreshCw, BookOpen, Target, ChevronDown, ChevronUp,
  BarChart2, Eye, EyeOff, Settings, Download, Upload, Zap, Star, Award,
  ArrowLeft, Check, HelpCircle, FileText, Layers
} from 'lucide-react'
import { toast } from 'react-hot-toast'

/* ─── Types ───────────────────────────────────────────────── */
type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
type QType = 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'WRITTEN'

interface Question {
  id: string
  question: string
  questionAr?: string
  questionType: QType
  options?: string[]
  correctAnswer?: string
  explanation?: string
  points: number
  level: Level
  testType: string
  category?: string
  order: number
}

interface TestResult {
  id: string
  userId: string
  userName: string
  userEmail: string
  score: number
  level: string
  completedAt: string
  answers?: any[]
}

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1']
const Q_TYPES: { value: QType; label: string }[] = [
  { value: 'MCQ',        label: 'اختيار متعدد (MCQ)' },
  { value: 'TRUE_FALSE', label: 'صح أم خطأ' },
  { value: 'FILL_BLANK', label: 'ملء الفراغ' },
  { value: 'WRITTEN',   label: 'إجابة مكتوبة' },
]

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-red-100 text-red-700 border-red-200',
  A2: 'bg-orange-100 text-orange-700 border-orange-200',
  B1: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  B2: 'bg-green-100 text-green-700 border-green-200',
  C1: 'bg-blue-100 text-blue-700 border-blue-200',
}

const LEVEL_BG: Record<string, string> = {
  A1: 'from-red-500 to-rose-600',
  A2: 'from-orange-500 to-amber-600',
  B1: 'from-yellow-500 to-amber-500',
  B2: 'from-green-500 to-emerald-600',
  C1: 'from-blue-500 to-indigo-600',
}

const emptyQuestion = (): Partial<Question> => ({
  question: '', questionAr: '', questionType: 'MCQ',
  options: ['', '', '', ''], correctAnswer: '',
  explanation: '', points: 1, level: 'A1',
  testType: 'PLACEMENT', category: '', order: 0,
})

/* ──────────────────────────────────────────────────────────── */
export default function PlacementTestTab() {
  const [activeView, setActiveView] = useState<'bank' | 'results' | 'settings'>('bank')
  const [questions, setQuestions] = useState<Question[]>([])
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Filters
  const [filterLevel, setFilterLevel] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchQ, setSearchQ] = useState('')
  const [expandedQ, setExpandedQ] = useState<string | null>(null)

  // Add/Edit form
  const [showForm, setShowForm] = useState(false)
  const [editingQ, setEditingQ] = useState<Partial<Question>>(emptyQuestion())
  const [isEditing, setIsEditing] = useState<string | null>(null)

  // Selected result
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)

  useEffect(() => {
    fetchQuestions()
    fetchResults()
  }, [])

  /* ── Fetch ──────────────────────────────────────────────── */
  async function fetchQuestions() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/placement-test/questions?testType=PLACEMENT')
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.map((q: any) => ({
          ...q,
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
        })))
      }
    } catch { toast.error('فشل تحميل الأسئلة') }
    finally { setLoading(false) }
  }

  async function fetchResults() {
    try {
      const res = await fetch('/api/admin/placement-tests')
      if (res.ok) setResults(await res.json())
    } catch {}
  }

  /* ── Stats ────────────────────────────────────────────────── */
  const stats = {
    total: questions.length,
    byLevel: LEVELS.reduce((acc, l) => ({ ...acc, [l]: questions.filter(q => q.level === l).length }), {} as Record<string, number>),
    results: results.length,
    advanced: results.filter(r => ['B1','B2','C1'].includes(r.level)).length,
    beginner: results.filter(r => ['A1','A2'].includes(r.level)).length,
  }

  /* ── Filter ────────────────────────────────────────────────── */
  const filtered = questions.filter(q => {
    if (filterLevel !== 'ALL' && q.level !== filterLevel) return false
    if (filterType !== 'ALL' && q.questionType !== filterType) return false
    if (searchQ && !q.question.toLowerCase().includes(searchQ.toLowerCase()) &&
        !q.questionAr?.includes(searchQ)) return false
    return true
  })

  /* ── Save question ─────────────────────────────────────────── */
  async function handleSave() {
    if (!editingQ.question?.trim()) { toast.error('أدخل نص السؤال'); return }
    if (editingQ.questionType === 'MCQ' && (!editingQ.options || editingQ.options.filter(o=>o.trim()).length < 2)) {
      toast.error('أضف خيارين على الأقل'); return
    }
    setSaving(true)
    try {
      const body = {
        ...editingQ,
        options: editingQ.questionType === 'MCQ' ? editingQ.options?.filter(o => o.trim()) : undefined,
        testType: 'PLACEMENT',
      }
      const url = isEditing ? `/api/admin/placement-test/questions/${isEditing}` : '/api/admin/placement-test/questions'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error()
      toast.success(isEditing ? 'تم تعديل السؤال ✓' : 'تم إضافة السؤال ✓')
      setShowForm(false)
      setIsEditing(null)
      setEditingQ(emptyQuestion())
      fetchQuestions()
    } catch { toast.error('فشل حفظ السؤال') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/placement-test/questions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف السؤال')
      setQuestions(q => q.filter(x => x.id !== id))
    } catch { toast.error('فشل الحذف') }
    finally { setDeleting(null) }
  }

  function startEdit(q: Question) {
    setEditingQ({ ...q, options: q.options?.length ? q.options : ['', '', '', ''] })
    setIsEditing(q.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setIsEditing(null)
    setEditingQ(emptyQuestion())
  }

  const updateOption = (idx: number, val: string) =>
    setEditingQ(q => ({ ...q, options: q.options?.map((o, i) => i === idx ? val : o) }))

  const addOption = () =>
    setEditingQ(q => ({ ...q, options: [...(q.options || []), ''] }))

  const removeOption = (idx: number) =>
    setEditingQ(q => ({ ...q, options: q.options?.filter((_, i) => i !== idx) }))

  /* ────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            بنك الأسئلة واختبار تحديد المستوى
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">إدارة الأسئلة، مراجعة النتائج، وضبط إعدادات الاختبار</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchQuestions(); fetchResults() }}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">إجمالي الأسئلة</p>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {LEVELS.map(l => (
              <span key={l} className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${LEVEL_COLORS[l]}`}>
                {l}: {stats.byLevel[l]}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">إجمالي الاختبارات</p>
          <p className="text-3xl font-black text-blue-600">{stats.results}</p>
          <p className="text-xs text-gray-400 mt-1">من الطلاب المسجلين</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">متوسط وأعلى</p>
          <p className="text-3xl font-black text-green-600">{stats.advanced}</p>
          <p className="text-xs text-gray-400 mt-1">مستوى B1 فأعلى</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">المبتدئون</p>
          <p className="text-3xl font-black text-orange-600">{stats.beginner}</p>
          <p className="text-xs text-gray-400 mt-1">مستوى A1 أو A2</p>
        </div>
      </div>

      {/* ── View Tabs ──────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {[
          { key: 'bank', label: 'بنك الأسئلة', icon: BookOpen },
          { key: 'results', label: 'نتائج الطلاب', icon: Users },
          { key: 'settings', label: 'إعدادات الاختبار', icon: Settings },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveView(key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeView === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════ BANK VIEW ══════════════════════════ */}
      {activeView === 'bank' && (
        <div className="space-y-4">
          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-xl shadow-emerald-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                  {isEditing ? <Edit3 className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
                  {isEditing ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
                </h3>
                <button onClick={cancelForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Question text */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">السؤال (إنجليزي) *</label>
                    <textarea value={editingQ.question || ''} onChange={e => setEditingQ(q=>({...q,question:e.target.value}))}
                      rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                      placeholder="Type the question in English..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">السؤال (عربي) — اختياري</label>
                    <textarea value={editingQ.questionAr || ''} onChange={e => setEditingQ(q=>({...q,questionAr:e.target.value}))}
                      rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                      placeholder="ترجمة السؤال بالعربي (اختياري)..." />
                  </div>
                </div>

                {/* Meta */}
                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">المستوى *</label>
                    <select value={editingQ.level || 'A1'} onChange={e => setEditingQ(q=>({...q,level:e.target.value as Level}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">نوع السؤال *</label>
                    <select value={editingQ.questionType || 'MCQ'} onChange={e => setEditingQ(q=>({...q,questionType:e.target.value as QType}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
                      {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">النقاط</label>
                    <input type="number" min={1} max={10} value={editingQ.points || 1} onChange={e => setEditingQ(q=>({...q,points:Number(e.target.value)}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">التصنيف</label>
                    <input type="text" value={editingQ.category || ''} onChange={e => setEditingQ(q=>({...q,category:e.target.value}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                      placeholder="Grammar, Vocabulary..." />
                  </div>
                </div>

                {/* MCQ Options */}
                {editingQ.questionType === 'MCQ' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-2">خيارات الإجابة *</label>
                    <div className="space-y-2">
                      {(editingQ.options || ['','']).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <button onClick={() => setEditingQ(q=>({...q,correctAnswer:opt}))}
                            className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm transition border-2 ${
                              editingQ.correctAnswer === opt && opt
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg'
                                : 'border-gray-200 text-gray-400 hover:border-emerald-300'
                            }`}
                            title="اضغط لتعيين هذا الخيار كإجابة صحيحة">
                            {editingQ.correctAnswer === opt && opt ? <Check className="w-4 h-4" /> : String.fromCharCode(65+i)}
                          </button>
                          <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
                            className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none ${
                              editingQ.correctAnswer === opt && opt ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
                            }`}
                            placeholder={`الخيار ${String.fromCharCode(65+i)}`} />
                          {(editingQ.options?.length || 0) > 2 && (
                            <button onClick={() => removeOption(i)} className="p-2 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {(editingQ.options?.length || 0) < 6 && (
                        <button onClick={addOption} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition">
                          <Plus className="w-3 h-3" /> إضافة خيار
                        </button>
                      )}
                      {editingQ.correctAnswer && (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> الإجابة الصحيحة: "{editingQ.correctAnswer}"
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* True/False */}
                {editingQ.questionType === 'TRUE_FALSE' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-2">الإجابة الصحيحة</label>
                    <div className="flex gap-3">
                      {['True', 'False'].map(opt => (
                        <button key={opt} onClick={() => setEditingQ(q=>({...q,correctAnswer:opt}))}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition ${
                            editingQ.correctAnswer === opt
                              ? opt === 'True' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          {opt === 'True' ? '✓ صح (True)' : '✗ خطأ (False)'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill blank / Written */}
                {(editingQ.questionType === 'FILL_BLANK' || editingQ.questionType === 'WRITTEN') && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">
                      {editingQ.questionType === 'FILL_BLANK' ? 'الكلمة / العبارة الصحيحة' : 'الإجابة النموذجية (اختياري)'}
                    </label>
                    <input type="text" value={editingQ.correctAnswer || ''} onChange={e => setEditingQ(q=>({...q,correctAnswer:e.target.value}))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                      placeholder={editingQ.questionType === 'FILL_BLANK' ? 'الإجابة الصحيحة...' : 'نموذج الإجابة (للمراجعة)...'} />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">شرح الإجابة (اختياري)</label>
                  <textarea value={editingQ.explanation || ''} onChange={e => setEditingQ(q=>({...q,explanation:e.target.value}))}
                    rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                    placeholder="شرح يظهر للطالب بعد الإجابة..." />
                </div>

                {/* Save */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button onClick={cancelForm} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                    إلغاء
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition disabled:opacity-60">
                    <Save className="w-4 h-4" />
                    {saving ? 'جاري الحفظ...' : isEditing ? 'حفظ التعديلات' : 'إضافة السؤال'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!showForm && (
              <button onClick={() => { setShowForm(true); setIsEditing(null); setEditingQ(emptyQuestion()) }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition">
                <Plus className="w-4 h-4" />
                إضافة سؤال جديد
              </button>
            )}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                placeholder="ابحث في الأسئلة..." />
            </div>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
              <option value="ALL">كل المستويات</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
              <option value="ALL">كل الأنواع</option>
              {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>عرض <span className="font-bold text-gray-800">{filtered.length}</span> من {questions.length} سؤال</span>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setFilterLevel(l === filterLevel ? 'ALL' : l)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                    filterLevel === l ? LEVEL_COLORS[l] : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  {l} ({stats.byLevel[l]})
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="flex items-center justify-center h-40 bg-white rounded-2xl border border-gray-200">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-500">لا توجد أسئلة</h3>
              <p className="text-gray-400 text-sm mt-1">
                {questions.length === 0 ? 'اضغط على "إضافة سؤال جديد" لبدء بناء بنك الأسئلة' : 'لا توجد أسئلة تطابق بحثك'}
              </p>
              {questions.length === 0 && (
                <button onClick={() => setShowForm(true)}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm mx-auto">
                  <Plus className="w-4 h-4" /> إضافة أول سؤال
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((q, idx) => (
                <div key={q.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    expandedQ === q.id ? 'border-emerald-200 shadow-md shadow-emerald-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}>
                  {/* Question header */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${LEVEL_BG[q.level]} text-white flex items-center justify-center text-xs font-black flex-shrink-0`}>
                      {q.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{q.question}</p>
                      {q.questionAr && <p className="text-xs text-gray-400 truncate">{q.questionAr}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="hidden sm:block text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                        {Q_TYPES.find(t => t.value === q.questionType)?.label || q.questionType}
                      </span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        {q.points} نقطة
                      </span>
                      <button onClick={() => setExpandedQ(p => p === q.id ? null : q.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                        {expandedQ === q.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => startEdit(q)} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} disabled={deleting === q.id}
                        className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedQ === q.id && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                      {q.questionAr && (
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs font-bold text-gray-400 mb-1">السؤال بالعربي:</p>
                          <p className="text-sm text-gray-700">{q.questionAr}</p>
                        </div>
                      )}
                      {q.options && q.options.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 mb-2">الخيارات:</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {q.options.map((opt, i) => (
                              <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm ${
                                opt === q.correctAnswer
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                                  : 'bg-gray-50 border-gray-100 text-gray-600'
                              }`}>
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                  opt === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                  {opt === q.correctAnswer ? <Check className="w-3 h-3" /> : String.fromCharCode(65+i)}
                                </span>
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {q.correctAnswer && q.questionType !== 'MCQ' && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-700">الإجابة الصحيحة: {q.correctAnswer}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-xs font-bold text-blue-400 mb-1">الشرح:</p>
                          <p className="text-sm text-blue-700">{q.explanation}</p>
                        </div>
                      )}
                      {q.category && (
                        <span className="inline-block text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                          {q.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ RESULTS VIEW ═══════════════════════ */}
      {activeView === 'results' && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-500">لا توجد نتائج حتى الآن</h3>
              <p className="text-gray-400 text-sm">سيتم عرض نتائج الطلاب هنا بعد إجراء الاختبار</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                {LEVELS.map(l => {
                  const count = results.filter(r => r.level === l).length
                  return (
                    <div key={l} className={`p-4 rounded-2xl bg-gradient-to-br ${LEVEL_BG[l]} text-white`}>
                      <div className="text-3xl font-black">{count}</div>
                      <div className="text-white/80 text-sm font-bold mt-1">مستوى {l}</div>
                    </div>
                  )
                })}
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-right text-xs font-black text-gray-600">الطالب</th>
                      <th className="px-5 py-3 text-center text-xs font-black text-gray-600">المستوى</th>
                      <th className="px-5 py-3 text-center text-xs font-black text-gray-600">النتيجة</th>
                      <th className="px-5 py-3 text-center text-xs font-black text-gray-600">التاريخ</th>
                      <th className="px-5 py-3 text-center text-xs font-black text-gray-600">تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <p className="font-bold text-gray-900 text-sm">{r.userName}</p>
                          <p className="text-xs text-gray-400">{r.userEmail}</p>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-black border ${LEVEL_COLORS[r.level] || 'bg-gray-100 text-gray-700'}`}>
                            {r.level}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="font-black text-gray-900">{r.score}%</span>
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.score}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center text-sm text-gray-500">
                          {new Date(r.completedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => setSelectedResult(r)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition">
                            عرض
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════ SETTINGS VIEW ══════════════════════ */}
      {activeView === 'settings' && (
        <TestSettingsPanel />
      )}

      {/* ── Result Detail Modal ─────────────────────────────── */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedResult(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`p-6 bg-gradient-to-r ${LEVEL_BG[selectedResult.level] || 'from-gray-500 to-gray-600'} text-white`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black">نتيجة الاختبار</h3>
                <button onClick={() => setSelectedResult(null)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <div className="text-6xl font-black mb-2">{selectedResult.level}</div>
                <div className="text-5xl font-black opacity-90">{selectedResult.score}%</div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-bold mb-1">الطالب</p>
                  <p className="font-bold text-gray-900 text-sm">{selectedResult.userName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-bold mb-1">البريد الإلكتروني</p>
                  <p className="font-bold text-gray-900 text-sm break-all">{selectedResult.userEmail}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-bold mb-1">تاريخ الاختبار</p>
                  <p className="font-bold text-gray-900 text-sm">{new Date(selectedResult.completedAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className={`rounded-xl p-3 ${LEVEL_COLORS[selectedResult.level]}`}>
                  <p className="text-xs font-bold opacity-70 mb-1">المستوى المحدد</p>
                  <p className="font-black text-2xl">{selectedResult.level}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Test Settings Panel ────────────────────────────────── */
function TestSettingsPanel() {
  const [settings, setSettings] = useState({ questionsCount: 20, timeLimitMins: 30, passScore: 50, shuffleQuestions: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/test-settings?testType=PLACEMENT')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSettings({ questionsCount: d.questionsCount, timeLimitMins: d.timeLimitMins, passScore: d.passScore, shuffleQuestions: d.shuffleQuestions }) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/test-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'PLACEMENT', ...settings })
      })
      if (!res.ok) throw new Error()
      toast.success('تم حفظ الإعدادات ✓')
    } catch { toast.error('فشل حفظ الإعدادات') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          إعدادات اختبار تحديد المستوى
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">عدد الأسئلة في الاختبار</label>
            <input type="number" min={5} max={100} value={settings.questionsCount} onChange={e => setSettings(s=>({...s,questionsCount:Number(e.target.value)}))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none text-lg font-bold" />
            <p className="text-xs text-gray-400 mt-1">عدد الأسئلة التي تظهر للطالب من بنك الأسئلة</p>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">مدة الاختبار (دقيقة)</label>
            <input type="number" min={5} max={180} value={settings.timeLimitMins} onChange={e => setSettings(s=>({...s,timeLimitMins:Number(e.target.value)}))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none text-lg font-bold" />
            <p className="text-xs text-gray-400 mt-1">الوقت الإجمالي المتاح لإتمام الاختبار</p>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">درجة النجاح (%)</label>
            <input type="number" min={1} max={100} value={settings.passScore} onChange={e => setSettings(s=>({...s,passScore:Number(e.target.value)}))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none text-lg font-bold" />
            <p className="text-xs text-gray-400 mt-1">الحد الأدنى للنجاح (مرجع فقط)</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-bold text-gray-700">خلط ترتيب الأسئلة</p>
              <p className="text-xs text-gray-400">كل طالب يحصل على ترتيب مختلف</p>
            </div>
            <button onClick={() => setSettings(s=>({...s,shuffleQuestions:!s.shuffleQuestions}))}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.shuffleQuestions ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${settings.shuffleQuestions ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>

      {/* Level thresholds info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          نظام تحديد المستوى
        </h4>
        <div className="space-y-2">
          {[
            { level: 'A1', range: '0% - 20%', desc: 'مبتدئ تماماً', color: 'from-red-500 to-rose-600' },
            { level: 'A2', range: '21% - 40%', desc: 'مبتدئ متقدم', color: 'from-orange-500 to-amber-600' },
            { level: 'B1', range: '41% - 60%', desc: 'متوسط', color: 'from-yellow-500 to-amber-500' },
            { level: 'B2', range: '61% - 80%', desc: 'متوسط متقدم', color: 'from-green-500 to-emerald-600' },
            { level: 'C1', range: '81% - 100%', desc: 'متقدم', color: 'from-blue-500 to-indigo-600' },
          ].map(({ level, range, desc, color }) => (
            <div key={level} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center text-sm font-black`}>
                {level}
              </div>
              <div className="flex-1">
                <span className="font-bold text-gray-800 text-sm">{desc}</span>
                <span className="text-gray-400 text-xs mr-2">({range})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
