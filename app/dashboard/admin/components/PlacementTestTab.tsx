'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ClipboardList, Users, CheckCircle, AlertCircle, Plus, Trash2, Edit3, Save,
  X, Search, Filter, RefreshCw, BookOpen, Target, ChevronDown, ChevronUp,
  BarChart2, Eye, EyeOff, Settings, Download, Upload, Zap, Star, Award,
  ArrowLeft, Check, HelpCircle, FileText, Layers
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'
import PlacementSpeakingQueue from './PlacementSpeakingQueue'

/* ─── Types ───────────────────────────────────────────────── */
type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
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
  band?: string
  testType: string
  category?: string
  order: number
}

type ApiQuestion = Omit<Question, 'options'> & { options?: string | string[] | null }

interface TestResult {
  id: string
  userId: string
  userName: string
  userEmail: string
  score: number
  level: string
  completedAt: string
  answers?: unknown[]
}

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const BANDS = LEVELS.flatMap(level => [1, 2, 3, 4].map(index => `${level}.${index}`))
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
  C2: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

const LEVEL_BG: Record<string, string> = {
  A1: 'from-red-500 to-rose-600',
  A2: 'from-orange-500 to-amber-600',
  B1: 'from-yellow-500 to-amber-500',
  B2: 'from-green-500 to-emerald-600',
  C1: 'from-blue-500 to-indigo-600',
  C2: 'from-indigo-600 to-violet-700',
}

const emptyQuestion = (): Partial<Question> => ({
  question: '', questionAr: '', questionType: 'MCQ',
  options: ['', '', '', ''], correctAnswer: '',
  explanation: '', points: 1, level: 'A1', band: 'A1.1',
  testType: 'PLACEMENT', category: '', order: 0,
})

/* ──────────────────────────────────────────────────────────── */
export default function PlacementTestTab() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [generationOpen, setGenerationOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generationBand, setGenerationBand] = useState('A1.1')
  const [generationCount, setGenerationCount] = useState(3)
  const [generationTopic, setGenerationTopic] = useState('')
  const [generatedDrafts, setGeneratedDrafts] = useState<Array<Question & { draftId: string }>>([])
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)
  const qTypeLabel = (value: string) => {
    const type = Q_TYPES.find((item) => item.value === value)
    if (!type) return value
    const english: Record<string, string> = { MCQ: 'Multiple choice', TRUE_FALSE: 'True or false', FILL_BLANK: 'Fill in the blank', WRITTEN: 'Written response' }
    return t(type.label, english[value] || type.label)
  }
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
        const data = await res.json() as ApiQuestion[]
        setQuestions(data.map((q: ApiQuestion) => ({
          ...q,
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) as string[] : q.options) : []
        })))
      }
    } catch { toast.error(t('فشل تحميل الأسئلة', 'Failed to load questions')) }
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
    byBand: BANDS.reduce((acc, band) => ({ ...acc, [band]: questions.filter(q => q.band === band).length }), {} as Record<string, number>),
    results: results.length,
    advanced: results.filter(r => ['B1','B2','C1','C2'].includes(r.level)).length,
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
    if (!editingQ.question?.trim()) { toast.error(t('أدخل نص السؤال', 'Enter the question text')); return }
    if (editingQ.questionType === 'MCQ' && (!editingQ.options || editingQ.options.filter(o=>o.trim()).length < 2)) {
      toast.error(t('أضف خيارين على الأقل', 'Add at least two options')); return
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
      toast.success(isEditing ? t('تم تعديل السؤال ✓', 'Question updated ✓') : t('تم إضافة السؤال ✓', 'Question added ✓'))
      if (editingDraftId) {
        setGeneratedDrafts(drafts => drafts.filter(draft => draft.draftId !== editingDraftId))
        setEditingDraftId(null)
      }
      setShowForm(false)
      setIsEditing(null)
      setEditingQ(emptyQuestion())
      await fetchQuestions()
    } catch { toast.error(t('فشل حفظ السؤال', 'Failed to save question')) }
    finally { setSaving(false) }
  }

  async function handleGenerateQuestions() {
    setGenerating(true)
    try {
      const response = await fetch('/api/admin/placement-test/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          band: generationBand,
          count: generationCount,
          topic: generationTopic.trim(),
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || !Array.isArray(payload?.drafts)) {
        throw new Error(typeof payload?.error === 'string' ? payload.error : t('تعذر توليد الأسئلة الآن.', 'Question generation is unavailable right now.'))
      }
      const drafts = payload.drafts.map((draft: Omit<Question, 'id'>, index: number) => ({
        ...draft,
        id: '',
        draftId: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
      }))
      setGeneratedDrafts(current => [...current, ...drafts])
      setGenerationOpen(false)
      toast.success(t('تم إنشاء مسودات للمراجعة', 'Draft questions generated for review'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر توليد الأسئلة الآن.', 'Question generation is unavailable right now.'))
    } finally {
      setGenerating(false)
    }
  }

  function loadDraftIntoEditor(draft: Question & { draftId: string }) {
    setEditingQ({
      question: draft.question,
      questionAr: draft.questionAr || '',
      questionType: 'MCQ',
      options: [...(draft.options || [])],
      correctAnswer: draft.correctAnswer || '',
      explanation: draft.explanation || '',
      points: draft.points || 1,
      level: draft.level,
      band: draft.band,
      testType: 'PLACEMENT',
      category: draft.category || '',
      order: 0,
    })
    setIsEditing(null)
    setEditingDraftId(draft.draftId)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id: string) {
    if (!confirm(t('هل أنت متأكد من حذف هذا السؤال؟', 'Are you sure you want to delete this question?'))) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/placement-test/questions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(t('تم حذف السؤال', 'Question deleted'))
      setQuestions(q => q.filter(x => x.id !== id))
    } catch { toast.error(t('فشل الحذف', 'Delete failed')) }
    finally { setDeleting(null) }
  }

  function startEdit(q: Question) {
    setEditingQ({ ...q, options: q.options?.length ? q.options : ['', '', '', ''] })
    setIsEditing(q.id)
    setEditingDraftId(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setIsEditing(null)
    setEditingDraftId(null)
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
    <div className="space-y-6" dir={localeDirection(language)}>
      <PlacementSpeakingQueue />
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-600" />
            {t('بنك الأسئلة واختبار تحديد المستوى', 'Question bank and placement test')}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{t('إدارة الأسئلة، مراجعة النتائج، وضبط إعدادات الاختبار', 'Manage questions, review results, and configure test settings')}</p>
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
          <p className="text-xs font-bold text-gray-500 mb-1">{t('إجمالي الأسئلة', 'Total questions')}</p>
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
          <p className="text-xs font-bold text-gray-500 mb-1">{t('إجمالي الاختبارات', 'Total tests')}</p>
          <p className="text-3xl font-black text-blue-600">{stats.results}</p>
          <p className="text-xs text-gray-400 mt-1">{t('من الطلاب المسجلين', 'From registered students')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">{t('متوسط وأعلى', 'Intermediate and above')}</p>
          <p className="text-3xl font-black text-green-600">{stats.advanced}</p>
          <p className="text-xs text-gray-400 mt-1">{t('مستوى B1 فأعلى', 'Level B1 and above')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 mb-1">{t('المبتدئون', 'Beginners')}</p>
          <p className="text-3xl font-black text-orange-600">{stats.beginner}</p>
          <p className="text-xs text-gray-400 mt-1">{t('مستوى A1 أو A2', 'Level A1 or A2')}</p>
        </div>
      </div>
      <section className="border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-800">{t('عدد الأسئلة في كل نطاق', 'Questions in each placement band')}</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {BANDS.map(band => (
            <div key={band} className="flex items-center justify-between border border-gray-200 px-2 py-1.5 text-xs">
              <span className="font-medium text-gray-600">{band}</span>
              <span className="font-semibold text-gray-900">{stats.byBand[band]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── View Tabs ──────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {[
          { key: 'bank', label: t('بنك الأسئلة', 'Question bank'), icon: BookOpen },
          { key: 'results', label: t('نتائج الطلاب', 'Student results'), icon: Users },
          { key: 'settings', label: t('إعدادات الاختبار', 'Test settings'), icon: Settings },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveView(key as 'bank' | 'results' | 'settings')}
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
                  {isEditing ? t('تعديل السؤال', 'Edit question') : t('إضافة سؤال جديد', 'Add a new question')}
                </h3>
                <button onClick={cancelForm} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Question text */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('السؤال (إنجليزي) *', 'Question (English) *')}</label>
                    <textarea value={editingQ.question || ''} onChange={e => setEditingQ(q=>({...q,question:e.target.value}))}
                      rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                      placeholder="Type the question in English..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('السؤال (عربي) — اختياري', 'Question (Arabic) — optional')}</label>
                    <textarea value={editingQ.questionAr || ''} onChange={e => setEditingQ(q=>({...q,questionAr:e.target.value}))}
                      rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                      placeholder={t('ترجمة السؤال بالعربي (اختياري)...', 'Arabic question translation (optional)…')} />
                  </div>
                </div>

                {/* Meta */}
                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('المستوى *', 'Level *')}</label>
                    <select value={editingQ.level || 'A1'} onChange={e => setEditingQ(q=>({...q,level:e.target.value as Level,band:`${e.target.value}.1`}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('النطاق الفرعي', 'Placement band')}</label>
                    <select
                      value={editingQ.band || `${editingQ.level || 'A1'}.1`}
                      onChange={e => setEditingQ(q => ({ ...q, band: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white"
                    >
                      {BANDS.filter(band => band.startsWith(`${editingQ.level || 'A1'}.`)).map(band => (
                        <option key={band} value={band}>{band}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('نوع السؤال *', 'Question type *')}</label>
                    <select value={editingQ.questionType || 'MCQ'} onChange={e => setEditingQ(q=>({...q,questionType:e.target.value as QType}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
                      {Q_TYPES.map(type => <option key={type.value} value={type.value}>{qTypeLabel(type.value)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('النقاط', 'Points')}</label>
                    <input type="number" min={1} max={10} value={editingQ.points || 1} onChange={e => setEditingQ(q=>({...q,points:Number(e.target.value)}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('التصنيف', 'Category')}</label>
                    <input type="text" value={editingQ.category || ''} onChange={e => setEditingQ(q=>({...q,category:e.target.value}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                      placeholder="Grammar, Vocabulary..." />
                  </div>
                </div>

                {/* MCQ Options */}
                {editingQ.questionType === 'MCQ' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-2">{t('خيارات الإجابة *', 'Answer options *')}</label>
                    <div className="space-y-2">
                      {(editingQ.options || ['','']).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <button onClick={() => setEditingQ(q=>({...q,correctAnswer:opt}))}
                            className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm transition border-2 ${
                              editingQ.correctAnswer === opt && opt
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg'
                                : 'border-gray-200 text-gray-400 hover:border-emerald-300'
                            }`}
                            title={t('اضغط لتعيين هذا الخيار كإجابة صحيحة', 'Click to mark this option as correct')}>
                            {editingQ.correctAnswer === opt && opt ? <Check className="w-4 h-4" /> : String.fromCharCode(65+i)}
                          </button>
                          <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
                            className={`flex-1 px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none ${
                              editingQ.correctAnswer === opt && opt ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
                            }`}
                            placeholder={t(`الخيار ${String.fromCharCode(65+i)}`, `Option ${String.fromCharCode(65+i)}`)} />
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
                          <Plus className="w-3 h-3" /> {t('إضافة خيار', 'Add option')}
                        </button>
                      )}
                      {editingQ.correctAnswer && (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> {t('الإجابة الصحيحة:', 'Correct answer:')} &quot;{editingQ.correctAnswer}&quot;
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* True/False */}
                {editingQ.questionType === 'TRUE_FALSE' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-2">{t('الإجابة الصحيحة', 'Correct answer')}</label>
                    <div className="flex gap-3">
                      {['True', 'False'].map(opt => (
                        <button key={opt} onClick={() => setEditingQ(q=>({...q,correctAnswer:opt}))}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition ${
                            editingQ.correctAnswer === opt
                              ? opt === 'True' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          {opt === 'True' ? t('✓ صح', '✓ True') : t('✗ خطأ', '✗ False')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill blank / Written */}
                {(editingQ.questionType === 'FILL_BLANK' || editingQ.questionType === 'WRITTEN') && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1.5">
                      {editingQ.questionType === 'FILL_BLANK' ? t('الكلمة / العبارة الصحيحة', 'Correct word / phrase') : t('الإجابة النموذجية (اختياري)', 'Model answer (optional)')}
                    </label>
                    <input type="text" value={editingQ.correctAnswer || ''} onChange={e => setEditingQ(q=>({...q,correctAnswer:e.target.value}))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                      placeholder={editingQ.questionType === 'FILL_BLANK' ? t('الإجابة الصحيحة...', 'Correct answer…') : t('نموذج الإجابة (للمراجعة)...', 'Model answer (for review)…')} />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">{t('شرح الإجابة (اختياري)', 'Answer explanation (optional)')}</label>
                  <textarea value={editingQ.explanation || ''} onChange={e => setEditingQ(q=>({...q,explanation:e.target.value}))}
                    rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                    placeholder={t('شرح يظهر للطالب بعد الإجابة...', 'Explanation shown to students after answering…')} />
                </div>

                {/* Save */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button onClick={cancelForm} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition disabled:opacity-60">
                    <Save className="w-4 h-4" />
                    {saving ? t('جاري الحفظ...', 'Saving…') : isEditing ? t('حفظ التعديلات', 'Save changes') : t('إضافة السؤال', 'Add question')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {generationOpen && (
            <section className="space-y-4 border border-gray-200 bg-white p-4 sm:p-5" aria-label={t('توليد مسودات أسئلة', 'Generate question drafts')}>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t('توليد مسودات بالذكاء الاصطناعي', 'Generate AI question drafts')}</h3>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {t('ستظهر الأسئلة للمراجعة فقط ولن تُحفظ في البنك حتى تراجعها وتضيفها يدويًا.', 'Questions appear as drafts only. They are not saved to the bank until you review and add them.')}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="text-xs font-semibold text-gray-600">
                  {t('النطاق', 'Placement band')}
                  <select value={generationBand} onChange={event => setGenerationBand(event.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800">
                    {BANDS.map(band => <option key={band} value={band}>{band}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-gray-600">
                  {t('عدد المسودات', 'Number of drafts')}
                  <select value={generationCount} onChange={event => setGenerationCount(Number(event.target.value))}
                    className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800">
                    {[1, 2, 3, 4, 5].map(count => <option key={count} value={count}>{count}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-gray-600 sm:col-span-2">
                  {t('الموضوع (اختياري)', 'Topic (optional)')}
                  <input value={generationTopic} onChange={event => setGenerationTopic(event.target.value)}
                    maxLength={120}
                    className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800"
                    placeholder={t('مثل: المضارع البسيط أو السفر', 'e.g. present simple or travel')} />
                </label>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button onClick={() => setGenerationOpen(false)} disabled={generating}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  {t('إلغاء', 'Cancel')}
                </button>
                <button onClick={handleGenerateQuestions} disabled={generating}
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                  <Zap className="h-4 w-4" />
                  {generating ? t('جارٍ التوليد...', 'Generating…') : t('إنشاء مسودات', 'Generate drafts')}
                </button>
              </div>
            </section>
          )}

          {generatedDrafts.length > 0 && (
            <section className="space-y-3 border border-amber-200 bg-amber-50/50 p-4 sm:p-5" aria-label={t('مسودات الأسئلة المولدة', 'Generated question drafts')}>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t('مسودات تحتاج إلى مراجعتك', 'Drafts awaiting your review')} ({generatedDrafts.length})</h3>
                <p className="mt-1 text-xs text-gray-600">{t('تحقق من السؤال والإجابة الصحيحة قبل إضافته إلى بنك الاختبار.', 'Check each question and its correct answer before adding it to the test bank.')}</p>
              </div>
              {generatedDrafts.map(draft => (
                <article key={draft.draftId} className="space-y-3 border border-gray-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{draft.question}</p>
                      {draft.questionAr && <p className="mt-1 text-sm text-gray-600">{draft.questionAr}</p>}
                    </div>
                    <span className="shrink-0 border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">{draft.band} · {draft.category}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(draft.options || []).map((option, index) => (
                      <div key={`${draft.draftId}-${index}`} className={`border px-3 py-2 text-sm ${option === draft.correctAnswer ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-700'}`}>
                        <span className="me-2 font-semibold">{String.fromCharCode(65 + index)}.</span>{option}
                        {option === draft.correctAnswer && <span className="ms-2 text-xs font-semibold">{t('الإجابة الصحيحة', 'Correct answer')}</span>}
                      </div>
                    ))}
                  </div>
                  {draft.explanation && <p className="text-xs leading-5 text-gray-600">{draft.explanation}</p>}
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setGeneratedDrafts(current => current.filter(item => item.draftId !== draft.draftId))}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                      {t('تجاهل', 'Discard')}
                    </button>
                    <button onClick={() => loadDraftIntoEditor(draft)}
                      className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                      {t('مراجعة وتعديل ثم إضافة', 'Review, edit, and add')}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!showForm && (
              <>
                <button onClick={() => { setShowForm(true); setIsEditing(null); setEditingDraftId(null); setEditingQ(emptyQuestion()) }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition">
                  <Plus className="w-4 h-4" />
                  {t('إضافة سؤال جديد', 'Add a new question')}
                </button>
                <button onClick={() => setGenerationOpen(open => !open)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-emerald-200 bg-white text-emerald-800 rounded-xl font-bold text-sm hover:bg-emerald-50 transition">
                  <Zap className="w-4 h-4" />
                  {t('توليد مسودات', 'Generate drafts')}
                </button>
              </>
            )}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                placeholder={t('ابحث في الأسئلة...', 'Search questions…')} />
            </div>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
              <option value="ALL">{t('كل المستويات', 'All levels')}</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
              <option value="ALL">{t('كل الأنواع', 'All types')}</option>
              {Q_TYPES.map(type => <option key={type.value} value={type.value}>{qTypeLabel(type.value)}</option>)}
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{t('عرض', 'Showing')} <span className="font-bold text-gray-800">{filtered.length}</span> {t('من', 'of')} {questions.length} {t('سؤال', 'questions')}</span>
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
              <h3 className="text-lg font-bold text-gray-500">{t('لا توجد أسئلة', 'No questions found')}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {questions.length === 0 ? t('اضغط على "إضافة سؤال جديد" لبدء بناء بنك الأسئلة', 'Click "Add a new question" to start building the question bank') : t('لا توجد أسئلة تطابق بحثك', 'No questions match your search')}
              </p>
              {questions.length === 0 && (
                <button onClick={() => setShowForm(true)}
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm mx-auto">
                  <Plus className="w-4 h-4" /> {t('إضافة أول سؤال', 'Add the first question')}
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
                        {qTypeLabel(q.questionType)}
                      </span>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        {q.points} {t('نقطة', 'points')}
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
                          <p className="text-xs font-bold text-gray-400 mb-1">{t('السؤال بالعربي:', 'Question in Arabic:')}</p>
                          <p className="text-sm text-gray-700">{q.questionAr}</p>
                        </div>
                      )}
                      {q.options && q.options.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 mb-2">{t('الخيارات:', 'Options:')}</p>
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
                          <span className="text-sm font-bold text-emerald-700">{t('الإجابة الصحيحة:', 'Correct answer:')} {q.correctAnswer}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-xs font-bold text-blue-400 mb-1">{t('الشرح:', 'Explanation:')}</p>
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
              <h3 className="text-lg font-bold text-gray-500">{t('لا توجد نتائج حتى الآن', 'No results yet')}</h3>
              <p className="text-gray-400 text-sm">{t('ستظهر نتائج الطلاب هنا بعد إجراء الاختبار', 'Student results will appear here after a test is completed')}</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                {LEVELS.map(l => {
                  const count = results.filter(r => r.level === l).length
                  return (
                    <div key={l} className={`p-4 rounded-2xl bg-gradient-to-br ${LEVEL_BG[l]} text-white`}>
                      <div className="text-3xl font-black">{count}</div>
                      <div className="text-white/80 text-sm font-bold mt-1">{t('مستوى', 'Level')} {l}</div>
                    </div>
                  )
                })}
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-start text-xs font-black text-gray-600">{t('الطالب', 'Student')}</th>
                      <th className="px-5 py-3 text-center text-xs font-black text-gray-600">{t('المستوى', 'Level')}</th>
                      <th className="px-5 py-3 text-center text-xs font-black text-gray-600">{t('النتيجة', 'Score')}</th>
                      <th className="px-5 py-3 text-center text-xs font-black text-gray-600">{t('التاريخ', 'Date')}</th>
                      <th className="px-5 py-3 text-center text-xs font-black text-gray-600">{t('تفاصيل', 'Details')}</th>
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
                            {t('عرض', 'View')}
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
                <h3 className="text-xl font-black">{t('نتيجة الاختبار', 'Test result')}</h3>
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
                  <p className="text-xs text-gray-500 font-bold mb-1">{t('الطالب', 'Student')}</p>
                  <p className="font-bold text-gray-900 text-sm">{selectedResult.userName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-bold mb-1">{t('البريد الإلكتروني', 'Email')}</p>
                  <p className="font-bold text-gray-900 text-sm break-all">{selectedResult.userEmail}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-bold mb-1">{t('تاريخ الاختبار', 'Test date')}</p>
                  <p className="font-bold text-gray-900 text-sm">{new Date(selectedResult.completedAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className={`rounded-xl p-3 ${LEVEL_COLORS[selectedResult.level]}`}>
                  <p className="text-xs font-bold opacity-70 mb-1">{t('المستوى المحدد', 'Assigned level')}</p>
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
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
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
      toast.success(t('تم حفظ الإعدادات ✓', 'Settings saved ✓'))
    } catch { toast.error(t('فشل حفظ الإعدادات', 'Failed to save settings')) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          {t('إعدادات اختبار تحديد المستوى', 'Placement test settings')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">{t('عدد الأسئلة في الاختبار', 'Number of questions in the test')}</label>
            <input type="number" min={5} max={100} value={settings.questionsCount} onChange={e => setSettings(s=>({...s,questionsCount:Number(e.target.value)}))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none text-lg font-bold" />
            <p className="text-xs text-gray-400 mt-1">{t('عدد الأسئلة التي تظهر للطالب من بنك الأسئلة', 'Number of questions shown to the student from the question bank')}</p>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">{t('مدة الاختبار (دقيقة)', 'Test duration (minutes)')}</label>
            <input type="number" min={5} max={180} value={settings.timeLimitMins} onChange={e => setSettings(s=>({...s,timeLimitMins:Number(e.target.value)}))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none text-lg font-bold" />
            <p className="text-xs text-gray-400 mt-1">{t('الوقت الإجمالي المتاح لإتمام الاختبار', 'Total time available to complete the test')}</p>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">{t('درجة النجاح (%)', 'Passing score (%)')}</label>
            <input type="number" min={1} max={100} value={settings.passScore} onChange={e => setSettings(s=>({...s,passScore:Number(e.target.value)}))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none text-lg font-bold" />
            <p className="text-xs text-gray-400 mt-1">{t('الحد الأدنى للنجاح (مرجع فقط)', 'Minimum passing score (reference only)')}</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-bold text-gray-700">{t('خلط ترتيب الأسئلة', 'Shuffle question order')}</p>
              <p className="text-xs text-gray-400">{t('كل طالب يحصل على ترتيب مختلف', 'Each student receives a different order')}</p>
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
            {saving ? t('جاري الحفظ...', 'Saving…') : t('حفظ الإعدادات', 'Save settings')}
          </button>
        </div>
      </div>

      {/* Placement band map */}
      <div className="border border-gray-200 bg-white p-6">
        <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          {t('نطاقات المستوى في بنك الأسئلة', 'Placement bands in the question bank')}
        </h4>
        <p className="mb-4 text-sm leading-6 text-gray-600">
          {t('يتدرج الاختبار بين 24 نطاقاً فرعياً بناءً على إجابات الطالب. لا تعتمد النتيجة على حدود نسبة ثابتة، وتُراجع توصية التحدث إدارياً.', 'The test adapts across 24 bands based on the student’s answers. Results do not use fixed percentage thresholds, and speaking recommendations are reviewed by an administrator.')}
        </p>
        <div className="space-y-2">
          {[
            { level: 'A1', range: 'A1.1–A1.4', desc: t('مبتدئ', 'Beginner'), color: 'from-red-500 to-rose-600' },
            { level: 'A2', range: 'A2.1–A2.4', desc: t('مبتدئ متقدم', 'Elementary'), color: 'from-orange-500 to-amber-600' },
            { level: 'B1', range: 'B1.1–B1.4', desc: t('متوسط', 'Intermediate'), color: 'from-yellow-500 to-amber-500' },
            { level: 'B2', range: 'B2.1–B2.4', desc: t('متوسط متقدم', 'Upper-intermediate'), color: 'from-green-500 to-emerald-600' },
            { level: 'C1', range: 'C1.1–C1.4', desc: t('متقدم', 'Advanced'), color: 'from-blue-500 to-indigo-600' },
            { level: 'C2', range: 'C2.1–C2.4', desc: t('إتقان', 'Proficient'), color: 'from-indigo-600 to-violet-700' },
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
