'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FileText, Plus, CheckCircle, Clock, Send, Upload, X, Trash2,
  Video, Image as ImageIcon, File, AlignLeft, List, AlertCircle,
  ChevronDown, ChevronUp, User, Calendar, Star, MessageSquare,
  Download, Play, GripVertical, Pencil
} from 'lucide-react'
import { toast } from 'react-hot-toast'

/* ─── Types ─────────────────────────────────────────────── */
type QType = 'TEXT' | 'MCQ' | 'VIDEO' | 'IMAGE' | 'FILE'

interface Question {
  id: number
  type: QType
  text: string
  opts: string[]
  ans: number
}

interface UploadedFile { url: string; name: string; size: number; type: string }
interface Session { id: string; title: string }
interface Student { id: string; name: string; email: string }

interface Assignment {
  id: string
  title: string
  description: string | null
  type: string
  dueDate: string | null
  attachmentUrls: string | null
  Session: { title: string } | null
  Submission: Array<{
    id: string
    User: { name: string }
    textAnswer: string | null
    selectedOption: number | null
    attachedFiles: string | null
    grade: number | null
    feedback: string | null
    submittedAt: string
  }>
}

/* ─── Config ─────────────────────────────────────────────── */
const Q_TYPES: Record<QType, { label: string; icon: any; color: string; bg: string; border: string }> = {
  TEXT:  { label: 'كتابي',     icon: AlignLeft,  color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  MCQ:   { label: 'اختياري',   icon: List,        color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  VIDEO: { label: 'فيديو',     icon: Video,       color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
  IMAGE: { label: 'صورة',      icon: ImageIcon,   color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  FILE:  { label: 'ملف',       icon: File,        color: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200' },
}

const emptyQuestion = (id: number): Question => ({ id, type: 'TEXT', text: '', opts: ['', '', '', ''], ans: 0 })

const emptyForm = {
  title: '', description: '', sessionId: '', dueDate: '',
  selectedStudents: [] as string[],
  attachmentUrls: [] as UploadedFile[],
  questions: [emptyQuestion(0)] as Question[]
}

/* ─── Helpers ───────────────────────────────────────────── */
function isVideoUrl(url: string) { return /\.(mp4|mov|avi|webm|mkv|m4v)(\?|$)/i.test(url) }
function isImageUrl(url: string) { return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) }

function parseStudentAnswers(sub: Assignment['Submission'][0]) {
  if (!sub.textAnswer) return null
  try {
    const p = JSON.parse(sub.textAnswer)
    if (p.v === 2 && p.answers) return p.answers as Array<{ qi: number; type: QType; text?: string; opt?: number; files?: string[] }>
  } catch {}
  return null
}

function SubmissionFiles({ files }: { files: string[] }) {
  const videos = files.filter(isVideoUrl)
  const images = files.filter(f => isImageUrl(f) && !isVideoUrl(f))
  const others = files.filter(f => !isVideoUrl(f) && !isImageUrl(f))
  return (
    <div className="space-y-2">
      {videos.map((url, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
          <div className="bg-gray-900 px-3 py-2 flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-red-400 fill-red-400 flex-shrink-0" />
            <span className="text-xs font-bold text-gray-300 flex-1 truncate">{url.split('/').pop() || 'تسجيل الطالب'}</span>
            <a href={url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold text-gray-400 transition">
              <Download className="w-3 h-3" /> تحميل
            </a>
          </div>
          <video controls preload="metadata" className="w-full max-h-56 bg-black" src={url} />
        </div>
      ))}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 block">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
            </a>
          ))}
        </div>
      )}
      {others.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition">
          <File className="w-3.5 h-3.5" />
          {url.split('/').pop() || 'ملف'}
          <Download className="w-3 h-3 mr-auto" />
        </a>
      ))}
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────── */
export default function AssignmentsTab({ teacherProfileId }: { teacherProfileId: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm, questions: [emptyQuestion(0)] })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' })
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [nextQId, setNextQId] = useState(1)
  const fileRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [aRes, sRes, stRes] = await Promise.all([
        fetch('/api/teacher/assignments'),
        fetch('/api/teacher/sessions'),
        fetch('/api/teacher/students')
      ])
      if (aRes.ok) setAssignments(await aRes.json())
      if (sRes.ok) setSessions(await sRes.json())
      if (stRes.ok) setStudents(await stRes.json())
    } catch { toast.error('فشل تحميل البيانات') }
    finally { setLoading(false) }
  }

  async function handleFileUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setForm(f => ({ ...f, attachmentUrls: [...f.attachmentUrls, { url: data.url, name: file.name, size: file.size, type: file.type }] }))
        toast.success('تم رفع الملف')
      } else toast.error('فشل رفع الملف')
    } catch { toast.error('خطأ في رفع الملف') }
    finally { setUploading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الواجب؟ سيتم حذف جميع التسليمات.')) return
    setIsDeleting(id)
    try {
      const res = await fetch(`/api/teacher/assignments/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('تم حذف الواجب'); fetchData() }
      else toast.error('فشل الحذف')
    } catch { toast.error('خطأ في الحذف') }
    finally { setIsDeleting(null) }
  }

  async function handleCreate() {
    if (!form.title.trim()) return toast.error('أدخل عنوان الواجب')
    const validQuestions = form.questions.filter(q => q.text.trim())
    if (validQuestions.length === 0) return toast.error('أضف سؤالاً واحداً على الأقل')

    setSubmitting(true)
    try {
      // Build v2 questions JSON
      const questionsJson = JSON.stringify({
        v: 2,
        questions: validQuestions.map((q, i) => ({
          id: i, type: q.type, text: q.text,
          ...(q.type === 'MCQ' ? { opts: q.opts.filter(Boolean), ans: q.ans } : {})
        }))
      })

      // Determine overall type
      const types = [...new Set(validQuestions.map(q => q.type))]
      const overallType = types.length === 1 ? (types[0] === 'MCQ' ? 'MULTIPLE_CHOICE' : types[0]) : 'TEXT'

      const body: any = {
        title: form.title,
        description: form.description,
        type: overallType,
        sessionId: form.sessionId || undefined,
        dueDate: form.dueDate || undefined,
        attachmentUrls: JSON.stringify(form.attachmentUrls),
        studentIds: form.selectedStudents,
        multipleChoice: questionsJson
      }

      const res = await fetch('/api/teacher/assignments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      if (res.ok) {
        toast.success('تم إنشاء الواجب بنجاح')
        setForm({ ...emptyForm, questions: [emptyQuestion(0)] })
        setNextQId(1)
        setShowForm(false)
        fetchData()
      } else toast.error('فشل إنشاء الواجب')
    } catch { toast.error('خطأ في إنشاء الواجب') }
    finally { setSubmitting(false) }
  }

  async function handleGrade(submissionId: string) {
    if (!gradeData.grade) return toast.error('أدخل الدرجة')
    setGradingId(submissionId)
    try {
      const res = await fetch(`/api/teacher/assignments/${submissionId}/grade`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: parseFloat(gradeData.grade), feedback: gradeData.feedback })
      })
      if (res.ok) {
        toast.success('تم تسليم الدرجة'); setSelectedSubmission(null)
        setGradeData({ grade: '', feedback: '' }); fetchData()
      } else toast.error('فشل تسليم الدرجة')
    } catch { toast.error('خطأ في التقييم') }
    finally { setGradingId(null) }
  }

  function addQuestion() {
    const id = nextQId; setNextQId(id + 1)
    setForm(f => ({ ...f, questions: [...f.questions, emptyQuestion(id)] }))
  }

  function updateQuestion(idx: number, patch: Partial<Question>) {
    setForm(f => ({ ...f, questions: f.questions.map((q, i) => i === idx ? { ...q, ...patch } : q) }))
  }

  function removeQuestion(idx: number) {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }))
  }

  const pendingCount = assignments.reduce((acc, a) => acc + a.Submission.filter(s => s.grade === null).length, 0)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">الواجبات</h2>
          <p className="text-sm text-gray-500 mt-0.5">{assignments.length} واجب • {pendingCount} بانتظار التقييم</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition">
          <Plus className="w-4 h-4" /> واجب جديد
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <p className="font-bold text-orange-800 text-sm">{pendingCount} تسليم بانتظار التقييم</p>
        </div>
      )}

      {/* ── CREATE FORM ─────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" dir="rtl">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-black text-lg">إنشاء واجب جديد</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X className="w-5 h-5 text-white" /></button>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">عنوان الواجب *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="مثال: واجب درس المضارع التام" />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">التعليمات العامة (اختياري)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" rows={2}
                placeholder="تعليمات عامة للواجب..." />
            </div>

            {/* ── QUESTIONS BUILDER ─── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">الأسئلة ({form.questions.length})</label>
                <button type="button" onClick={addQuestion}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition">
                  <Plus className="w-3.5 h-3.5" /> إضافة سؤال
                </button>
              </div>

              <div className="space-y-4">
                {form.questions.map((q, qi) => {
                  const cfg = Q_TYPES[q.type]
                  const Icon = cfg.icon
                  return (
                    <div key={q.id} className={`border-2 ${cfg.border} rounded-2xl overflow-hidden`}>
                      {/* Question header */}
                      <div className={`${cfg.bg} px-4 py-3 flex items-center gap-3`}>
                        <div className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center text-xs font-black ${cfg.color} border ${cfg.border}`}>
                          {qi + 1}
                        </div>
                        {/* Type selector */}
                        <div className="flex flex-wrap gap-1.5 flex-1">
                          {(Object.entries(Q_TYPES) as [QType, typeof Q_TYPES[QType]][]).map(([key, c]) => {
                            const QIcon = c.icon
                            return (
                              <button key={key} type="button"
                                onClick={() => updateQuestion(qi, { type: key })}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                                  q.type === key ? `${c.bg} ${c.color} border ${c.border} shadow-sm` : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                                }`}>
                                <QIcon className="w-3 h-3" /> {c.label}
                              </button>
                            )
                          })}
                        </div>
                        {form.questions.length > 1 && (
                          <button type="button" onClick={() => removeQuestion(qi)}
                            className="p-1.5 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Question body */}
                      <div className="p-4 space-y-3 bg-white">
                        <div>
                          <label className="text-[11px] font-bold text-gray-400 block mb-1">نص السؤال *</label>
                          <textarea value={q.text} onChange={e => updateQuestion(qi, { text: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                            rows={2} placeholder={
                              q.type === 'TEXT' ? 'اكتب سؤالاً يتطلب إجابة كتابية...' :
                              q.type === 'MCQ' ? 'اكتب سؤال الاختيار من متعدد...' :
                              q.type === 'VIDEO' ? 'اكتب تعليمات التسجيل...' :
                              q.type === 'IMAGE' ? 'اكتب تعليمات رفع الصورة...' :
                              'اكتب تعليمات رفع الملف...'
                            } />
                        </div>

                        {/* MCQ options */}
                        {q.type === 'MCQ' && (
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-gray-400">الخيارات (حدد الإجابة الصحيحة)</label>
                            {q.opts.map((opt, oi) => (
                              <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition ${q.ans === oi ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}>
                                <input type="radio" checked={q.ans === oi} onChange={() => updateQuestion(qi, { ans: oi })}
                                  className="w-4 h-4 accent-purple-600 flex-shrink-0" title="الإجابة الصحيحة" />
                                <span className={`text-xs font-black w-5 flex-shrink-0 ${q.ans === oi ? 'text-purple-700' : 'text-gray-400'}`}>
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                <input value={opt} onChange={e => {
                                    const opts = [...q.opts]; opts[oi] = e.target.value
                                    updateQuestion(qi, { opts })
                                  }}
                                  className="flex-1 bg-transparent outline-none text-sm"
                                  placeholder={`الخيار ${oi + 1}`} />
                                {q.opts.length > 2 && (
                                  <button type="button" onClick={() => {
                                      const opts = q.opts.filter((_, idx) => idx !== oi)
                                      const ans = q.ans >= opts.length ? 0 : q.ans
                                      updateQuestion(qi, { opts, ans })
                                    }} className="text-red-300 hover:text-red-500 flex-shrink-0">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            {q.opts.length < 6 && (
                              <button type="button" onClick={() => updateQuestion(qi, { opts: [...q.opts, ''] })}
                                className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1 mt-1">
                                <Plus className="w-3 h-3" /> إضافة خيار
                              </button>
                            )}
                          </div>
                        )}

                        {/* Info box for file types */}
                        {['VIDEO', 'IMAGE', 'FILE'].includes(q.type) && (
                          <div className={`flex items-center gap-2 p-3 rounded-xl ${cfg.bg} border ${cfg.border} text-xs font-bold ${cfg.color}`}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {q.type === 'VIDEO' ? 'سيرفع الطالب ملف فيديو كإجابة' :
                             q.type === 'IMAGE' ? 'سيرفع الطالب صورة كإجابة' :
                             'سيرفع الطالب ملفاً كإجابة'}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <button type="button" onClick={addQuestion}
                className="w-full mt-3 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> إضافة سؤال جديد
              </button>
            </div>

            {/* Target */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">الجلسة (اختياري)</label>
                <select value={form.sessionId} onChange={e => setForm(f => ({ ...f, sessionId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option value="">للجميع (بث عام)</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">تاريخ التسليم</label>
                <input type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            {/* Students */}
            {students.length > 0 && (
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-2">تعيين لطلاب محددين (اختياري)</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {students.map(st => {
                    const sel = form.selectedStudents.includes(st.id)
                    return (
                      <button key={st.id} type="button"
                        onClick={() => setForm(f => ({ ...f, selectedStudents: sel ? f.selectedStudents.filter(id => id !== st.id) : [...f.selectedStudents, st.id] }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${sel ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'}`}>
                        <User className="w-3 h-3" /> {st.name}
                        {sel && <CheckCircle className="w-3 h-3" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">مرفقات للطالب (مواد مساعدة)</label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400'}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); Array.from(e.dataTransfer.files).forEach(handleFileUpload) }}>
                <Upload className={`w-6 h-6 mx-auto mb-2 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
                <p className="text-sm font-bold text-gray-500">{uploading ? 'جاري الرفع...' : 'اسحب أو اضغط لرفع ملف'}</p>
                <p className="text-xs text-gray-400 mt-1">صور، فيديو، PDF • حتى 50MB</p>
                <input ref={fileRef} type="file" className="hidden" multiple onChange={e => Array.from(e.target.files || []).forEach(handleFileUpload)} />
              </div>
              {form.attachmentUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.attachmentUrls.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                      <File className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700 font-medium max-w-[120px] truncate">{f.name}</span>
                      <button onClick={() => setForm(ff => ({ ...ff, attachmentUrls: ff.attachmentUrls.filter((_, idx) => idx !== i) }))}>
                        <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} disabled={submitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 shadow-lg shadow-emerald-200">
                {submitting ? 'جاري الإنشاء...' : `إنشاء الواجب (${form.questions.filter(q => q.text.trim()).length} سؤال)`}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGNMENTS LIST ────────────────────────────── */}
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-200 mb-4" />
          <h3 className="text-lg font-black text-gray-900 mb-2">لا توجد واجبات بعد</h3>
          <p className="text-sm text-gray-400">أنشئ أول واجب الآن</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => {
            const ungraded = assignment.Submission.filter(s => s.grade === null).length
            const isExpanded = expandedAssignment === assignment.id

            // Parse questions
            let questions: Array<{ id: number; type: QType; text: string }> = []
            try {
              if (assignment.type && (assignment as any).multipleChoice) {
                const p = JSON.parse((assignment as any).multipleChoice)
                if (p.v === 2 && p.questions) questions = p.questions
              }
            } catch {}

            return (
              <div key={assignment.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Assignment header */}
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-gray-900 truncate">{assignment.title}</h3>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-0.5">
                        {assignment.Session && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {assignment.Session.title}
                          </span>
                        )}
                        {questions.length > 0 && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {questions.length} سؤال
                          </span>
                        )}
                        {ungraded > 0 && (
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            {ungraded} بانتظار التقييم
                          </span>
                        )}
                        {assignment.Submission.length > 0 && ungraded === 0 && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> تم التقييم
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setExpandedAssignment(isExpanded ? null : assignment.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition">
                      {assignment.Submission.length} تسليم
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDelete(assignment.id)} disabled={isDeleting === assignment.id}
                      className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Questions preview */}
                {isExpanded && questions.length > 0 && (
                  <div className="px-5 pb-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {questions.map((q, i) => {
                        const qcfg = Q_TYPES[q.type] || Q_TYPES.TEXT
                        const QIcon = qcfg.icon
                        return (
                          <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${qcfg.border} ${qcfg.bg} text-xs font-bold ${qcfg.color}`}>
                            <QIcon className="w-3 h-3" /> س{i + 1}: {q.text.slice(0, 30)}{q.text.length > 30 ? '...' : ''}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Submissions */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">التسليمات</p>
                    {assignment.Submission.length === 0 ? (
                      <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Clock className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-400">لم يسلّم أي طالب بعد</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {assignment.Submission.map(sub => {
                          const parsedAnswers = parseStudentAnswers(sub)
                          return (
                            <div key={sub.id} className={`p-4 rounded-2xl border transition-all ${sub.grade !== null ? 'bg-white border-emerald-100' : 'bg-orange-50/50 border-orange-100'}`}>
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 ${sub.grade !== null ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-orange-200 text-orange-700'}`}>
                                    {sub.User.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-gray-900">{sub.User.name}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(sub.submittedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                </div>
                                {sub.grade !== null ? (
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-xl text-sm font-black">
                                    <Star className="w-3.5 h-3.5 fill-current" /> {sub.grade}/100
                                  </div>
                                ) : (
                                  <button onClick={() => { setSelectedSubmission(sub); setGradeData({ grade: '', feedback: '' }) }}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black hover:bg-orange-700 transition shadow-lg shadow-orange-200">
                                    <Send className="w-3.5 h-3.5" /> تقييم
                                  </button>
                                )}
                              </div>

                              {/* Multi-question answers */}
                              {parsedAnswers && parsedAnswers.length > 0 ? (
                                <div className="space-y-2">
                                  {parsedAnswers.map((ans, ai) => {
                                    const qInfo = questions[ans.qi] || null
                                    const qcfg = Q_TYPES[ans.type] || Q_TYPES.TEXT
                                    return (
                                      <div key={ai} className="border border-gray-100 rounded-xl overflow-hidden">
                                        <div className={`px-3 py-1.5 flex items-center gap-2 ${qcfg.bg}`}>
                                          <span className={`text-[10px] font-black ${qcfg.color}`}>س{ans.qi + 1}</span>
                                          {qInfo && <span className="text-[10px] text-gray-500 truncate flex-1">{qInfo.text.slice(0, 50)}</span>}
                                        </div>
                                        <div className="p-3">
                                          {ans.type === 'TEXT' && ans.text && (
                                            <p className="text-sm text-gray-700 leading-relaxed">{ans.text}</p>
                                          )}
                                          {ans.type === 'MCQ' && ans.opt !== undefined && (
                                            <p className="text-sm font-bold text-gray-700">
                                              الإجابة: {String.fromCharCode(65 + ans.opt)}
                                              {(() => {
                                                const q = questions.find((_, i) => i === ans.qi) as any
                                                return q?.opts ? ` — ${q.opts[ans.opt]}` : ''
                                              })()}
                                            </p>
                                          )}
                                          {ans.files && ans.files.length > 0 && <SubmissionFiles files={ans.files} />}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <>
                                  {sub.textAnswer && !sub.textAnswer.startsWith('{') && (
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 mb-2">{sub.textAnswer}</div>
                                  )}
                                  {sub.attachedFiles && (() => {
                                    try { const f = JSON.parse(sub.attachedFiles) as string[]; return f.length > 0 ? <SubmissionFiles files={f} /> : null }
                                    catch { return null }
                                  })()}
                                </>
                              )}

                              {sub.feedback && (
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 flex gap-2 mt-2">
                                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                  <p>{sub.feedback}</p>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── GRADE MODAL ──────────────────────────────────── */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-white font-black">تقييم تسليم الطالب</h3>
                <p className="text-orange-100 text-xs font-bold mt-0.5">{selectedSubmission.User.name}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Files */}
              {selectedSubmission.attachedFiles && (() => {
                try { const f = JSON.parse(selectedSubmission.attachedFiles) as string[]; return f.length > 0 ? <><p className="text-xs font-black text-gray-500 mb-2 flex items-center gap-2"><Video className="w-3.5 h-3.5 text-red-500" /> مرفقات الطالب</p><SubmissionFiles files={f} /></> : null }
                catch { return null }
              })()}
              {/* Text answer */}
              {selectedSubmission.textAnswer && !selectedSubmission.textAnswer.startsWith('{') && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 mb-2">إجابة الطالب:</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedSubmission.textAnswer}</p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">الدرجة (من 100) *</label>
                  <input type="number" min="0" max="100" value={gradeData.grade} onChange={e => setGradeData(g => ({ ...g, grade: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center font-black text-3xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                    placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">تعليق للطالب (اختياري)</label>
                  <textarea value={gradeData.feedback} onChange={e => setGradeData(g => ({ ...g, feedback: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none" rows={3}
                    placeholder="أضف ملاحظات..." />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleGrade(selectedSubmission.id)} disabled={!!gradingId}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 shadow-lg shadow-orange-200">
                    {gradingId ? 'جاري الحفظ...' : 'تسليم التقييم'}
                  </button>
                  <button onClick={() => setSelectedSubmission(null)} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
