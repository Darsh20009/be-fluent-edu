'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FileText, Clock, CheckCircle, Send, Upload, X, Star, MessageSquare,
  Video, Image as ImageIcon, File, List, AlignLeft, AlertCircle,
  ChevronRight, Play, Download
} from 'lucide-react'
import { toast } from 'react-hot-toast'

/* ─── Types ─────────────────────────────────────────────── */
type QType = 'TEXT' | 'MCQ' | 'VIDEO' | 'IMAGE' | 'FILE'

interface ParsedQuestion {
  id: number
  type: QType
  text: string
  opts?: string[]
  ans?: number
}

interface Assignment {
  id: string
  title: string
  description: string | null
  type: string
  dueDate: string | null
  attachmentUrls?: string | null
  multipleChoice?: string | null
  session: { title: string } | null
  submissions: Array<{
    id: string
    textAnswer?: string | null
    selectedOption?: number | null
    attachedFiles?: string | null
    grade: number | null
    feedback: string | null
    submittedAt: string
  }>
}

/* ─── Config ─────────────────────────────────────────────── */
const Q_TYPES: Record<QType, { label: string; icon: any; color: string; bg: string; border: string }> = {
  TEXT:  { label: 'كتابي',   icon: AlignLeft,  color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  MCQ:   { label: 'اختياري', icon: List,        color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  VIDEO: { label: 'فيديو',   icon: Video,       color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
  IMAGE: { label: 'صورة',    icon: ImageIcon,   color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  FILE:  { label: 'ملف',     icon: File,        color: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200' },
}

/* ─── Parse questions from assignment ───────────────────── */
function parseQuestions(a: Assignment): ParsedQuestion[] {
  if (a.multipleChoice) {
    try {
      const p = JSON.parse(a.multipleChoice)
      // New v2 format
      if (p.v === 2 && Array.isArray(p.questions)) {
        return p.questions.map((q: any) => ({
          id: q.id, type: q.type as QType,
          text: q.text, opts: q.opts, ans: q.ans
        }))
      }
      // Old: array of MCQ
      if (Array.isArray(p)) {
        return p.map((q: any, i: number) => ({
          id: i, type: 'MCQ' as QType,
          text: q.question, opts: q.options, ans: q.correctAnswer
        }))
      }
      // Old: single MCQ
      if (p.question) {
        return [{ id: 0, type: 'MCQ', text: p.question, opts: p.options, ans: p.correctAnswer }]
      }
    } catch {}
  }
  // Legacy single-type assignment
  const qtype: QType = a.type === 'MULTIPLE_CHOICE' ? 'MCQ' : (a.type as QType) || 'TEXT'
  return [{ id: 0, type: qtype, text: a.description || '' }]
}

function isVideoUrl(url: string) { return /\.(mp4|mov|avi|webm|mkv|m4v)(\?|$)/i.test(url) }
function isImageUrl(url: string) { return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) }

/* ─── Countdown helper ───────────────────────────────────── */
function DueCountdown({ dueDate }: { dueDate: string }) {
  const diff = new Date(dueDate).getTime() - Date.now()
  if (diff < 0) return <span className="text-red-500 font-bold text-xs">انتهت المهلة</span>
  const days = Math.floor(diff / 86400000)
  const hrs = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return (
    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
      <Clock className="w-3 h-3" />
      {days > 0 ? `${days}ي ${hrs}س` : hrs > 0 ? `${hrs}س ${mins}د` : `${mins} دقيقة`}
    </span>
  )
}

/* ═══════════════════════ MAIN ═══════════════════════════ */
export default function HomeworkTab({ isActive }: { isActive: boolean }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'submitted'>('pending')

  // Submission state
  const [openAssignment, setOpenAssignment] = useState<Assignment | null>(null)
  const [answers, setAnswers] = useState<Record<number, { text?: string; opt?: number | null; files?: string[] }>>({})
  const [uploading, setUploading] = useState<number | null>(null)  // question id being uploaded
  const [submitting, setSubmitting] = useState(false)
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => { fetchAssignments() }, [])

  async function fetchAssignments() {
    setLoading(true)
    try {
      const res = await fetch('/api/assignments/student')
      if (res.ok) setAssignments(await res.json())
      else if (res.status === 401) setAssignments([])
    } catch { toast.error('فشل تحميل الواجبات') }
    finally { setLoading(false) }
  }

  async function handleFileUpload(file: File, qId: number) {
    setUploading(qId)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        setAnswers(prev => ({
          ...prev,
          [qId]: { ...prev[qId], files: [...(prev[qId]?.files || []), url] }
        }))
        toast.success('تم رفع الملف')
      } else toast.error('فشل رفع الملف')
    } catch { toast.error('خطأ في الرفع') }
    finally { setUploading(null) }
  }

  function removeFile(qId: number, idx: number) {
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...prev[qId], files: (prev[qId]?.files || []).filter((_, i) => i !== idx) }
    }))
  }

  async function handleSubmit() {
    if (!openAssignment) return
    const questions = parseQuestions(openAssignment)

    // Validate
    for (const q of questions) {
      const a = answers[q.id]
      if (q.type === 'TEXT' && !a?.text?.trim()) return toast.error(`أجب على السؤال ${q.id + 1} أولاً`)
      if (q.type === 'MCQ' && (a?.opt === undefined || a?.opt === null)) return toast.error(`اختر إجابة للسؤال ${q.id + 1}`)
      if (['VIDEO', 'IMAGE', 'FILE'].includes(q.type) && (!a?.files || a.files.length === 0)) return toast.error(`ارفع ملفاً للسؤال ${q.id + 1}`)
    }

    setSubmitting(true)
    try {
      // Build payload
      const answersList = questions.map(q => {
        const a = answers[q.id] || {}
        return {
          qi: q.id, type: q.type,
          ...(q.type === 'TEXT' ? { text: a.text } : {}),
          ...(q.type === 'MCQ' ? { opt: a.opt } : {}),
          ...(['VIDEO', 'IMAGE', 'FILE'].includes(q.type) ? { files: a.files } : {}),
        }
      })

      const body: any = {
        assignmentId: openAssignment.id,
        textAnswer: JSON.stringify({ v: 2, answers: answersList })
      }

      // Backward compat for single MCQ
      if (questions.length === 1 && questions[0].type === 'MCQ') {
        body.selectedOption = answers[0]?.opt
      }
      // Backward compat for single file
      if (questions.length === 1 && ['VIDEO', 'IMAGE', 'FILE'].includes(questions[0].type)) {
        body.attachedFiles = JSON.stringify(answers[0]?.files || [])
      }

      const res = await fetch('/api/assignments/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success('تم تسليم الواجب! 🎉')
        setOpenAssignment(null)
        setAnswers({})
        fetchAssignments()
      } else {
        const err = await res.json()
        toast.error(err.error || 'فشل التسليم')
      }
    } catch { toast.error('خطأ في التسليم') }
    finally { setSubmitting(false) }
  }

  const pendingAssignments = assignments.filter(a => a.submissions.length === 0)
  const submittedAssignments = assignments.filter(a => a.submissions.length > 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Show soft warning if not active but still show assignments
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-black text-gray-900">واجباتي</h2>
        <p className="text-sm text-gray-500 mt-0.5">{pendingAssignments.length} واجب معلق • {submittedAssignments.length} مسلّم</p>
      </div>

      {!isActive && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 font-medium">حسابك غير مفعّل بالكامل — بعض الواجبات قد لا تظهر حتى اكتمال الاشتراك.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {([['pending', `معلقة (${pendingAssignments.length})`], ['submitted', `مسلّمة (${submittedAssignments.length})`]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Assignment list */}
      {tab === 'pending' && (
        pendingAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <CheckCircle className="w-12 h-12 text-emerald-300 mb-3" />
            <h3 className="text-lg font-black text-gray-800 mb-1">ما شاء الله! أنجزت كل شيء</h3>
            <p className="text-sm text-gray-400">لا توجد واجبات معلقة الآن</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAssignments.map(a => {
              const questions = parseQuestions(a)
              const typeSet = [...new Set(questions.map(q => q.type))]
              return (
                <div key={a.id} onClick={() => { setOpenAssignment(a); setAnswers({}) }}
                  className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-md transition cursor-pointer group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-gray-900 truncate">{a.title}</h3>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          {a.session && <span className="text-xs text-gray-400">{a.session.title}</span>}
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{questions.length} سؤال</span>
                          {typeSet.map(t => {
                            const cfg = Q_TYPES[t]; const Icon = cfg.icon
                            return <span key={t} className={`text-[10px] font-bold ${cfg.color} ${cfg.bg} px-2 py-0.5 rounded-full flex items-center gap-1`}><Icon className="w-2.5 h-2.5" />{cfg.label}</span>
                          })}
                          {a.dueDate && <DueCountdown dueDate={a.dueDate} />}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition flex-shrink-0" />
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {tab === 'submitted' && (
        submittedAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <FileText className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">لم تسلّم أي واجب بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submittedAssignments.map(a => {
              const sub = a.submissions[0]
              return (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-black text-gray-900">{a.title}</h3>
                      {a.session && <p className="text-xs text-gray-400 mt-0.5">{a.session.title}</p>}
                    </div>
                    {sub.grade !== null ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-lg shadow-lg shadow-emerald-200 flex-shrink-0">
                        <Star className="w-4 h-4 fill-current" />
                        {sub.grade}/100
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold flex-shrink-0">
                        بانتظار التصحيح
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    سُلِّم {new Date(sub.submittedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Show submitted answers */}
                  {sub.textAnswer && (() => {
                    try {
                      const p = JSON.parse(sub.textAnswer)
                      if (p.v === 2 && p.answers) {
                        const questions = parseQuestions(a)
                        return (
                          <div className="space-y-2 mb-3">
                            {(p.answers as any[]).map((ans: any, i: number) => {
                              const q = questions.find(q => q.id === ans.qi) || questions[i]
                              const cfg = Q_TYPES[ans.type as QType] || Q_TYPES.TEXT
                              return (
                                <div key={i} className={`border ${cfg.border} rounded-xl overflow-hidden`}>
                                  <div className={`px-3 py-1.5 ${cfg.bg} flex items-center gap-2`}>
                                    <span className={`text-[10px] font-black ${cfg.color}`}>س{(ans.qi || i) + 1}</span>
                                    {q && <span className="text-[10px] text-gray-500 truncate flex-1">{q.text.slice(0, 60)}</span>}
                                  </div>
                                  <div className="p-3">
                                    {ans.text && <p className="text-sm text-gray-700">{ans.text}</p>}
                                    {ans.opt !== undefined && q?.opts && (
                                      <p className="text-sm font-bold text-gray-700">
                                        {String.fromCharCode(65 + ans.opt)} — {q.opts[ans.opt]}
                                        {q.ans === ans.opt
                                          ? <span className="text-emerald-600 mr-2">✓ صحيح</span>
                                          : <span className="text-red-500 mr-2">✗ خطأ</span>}
                                      </p>
                                    )}
                                    {ans.files && ans.files.length > 0 && (
                                      <div className="flex flex-wrap gap-2">
                                        {(ans.files as string[]).map((url: string, fi: number) => (
                                          isVideoUrl(url) ? (
                                            <div key={fi} className="rounded-xl overflow-hidden border border-gray-200 w-full">
                                              <video controls preload="metadata" className="w-full max-h-40 bg-black" src={url} />
                                            </div>
                                          ) : isImageUrl(url) ? (
                                            <a key={fi} href={url} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 block">
                                              <img src={url} alt="" className="w-full h-full object-cover" />
                                            </a>
                                          ) : (
                                            <a key={fi} href={url} target="_blank" rel="noopener noreferrer"
                                              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-emerald-400 transition">
                                              <File className="w-3.5 h-3.5" /> {url.split('/').pop() || 'ملف'} <Download className="w-3 h-3" />
                                            </a>
                                          )
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      }
                    } catch {}
                    // Legacy text answer
                    return <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 mb-3">{sub.textAnswer}</div>
                  })()}

                  {sub.feedback && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-blue-700 mb-0.5">تعليق المعلم</p>
                        <p className="text-sm text-blue-800">{sub.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ── SUBMISSION MODAL ──────────────────────────────── */}
      {openAssignment && (() => {
        const questions = parseQuestions(openAssignment)
        const teacherFiles: string[] = (() => {
          try { return JSON.parse(openAssignment.attachmentUrls || '[]').map((f: any) => f.url || f) } catch { return [] }
        })()
        const totalAnswered = questions.filter(q => {
          const a = answers[q.id]
          if (q.type === 'TEXT') return !!a?.text?.trim()
          if (q.type === 'MCQ') return a?.opt !== undefined && a?.opt !== null
          return (a?.files?.length ?? 0) > 0
        }).length

        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto" dir="rtl">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 sm:rounded-t-2xl rounded-t-3xl flex items-start justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-white font-black text-lg leading-tight">{openAssignment.title}</h2>
                  <p className="text-emerald-100 text-sm mt-1">{questions.length} سؤال • {totalAnswered}/{questions.length} أُجيب عليه</p>
                </div>
                <button onClick={() => setOpenAssignment(null)} className="p-2 hover:bg-white/20 rounded-xl transition flex-shrink-0">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Description */}
                {openAssignment.description && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm text-emerald-800 leading-relaxed">
                    {openAssignment.description}
                  </div>
                )}

                {/* Due date */}
                {openAssignment.dueDate && (
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-600">الموعد النهائي:</span>
                    <DueCountdown dueDate={openAssignment.dueDate} />
                  </div>
                )}

                {/* Teacher attachments */}
                {teacherFiles.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">مواد مساعدة من المعلم</p>
                    <div className="flex flex-wrap gap-2">
                      {teacherFiles.map((url, i) => (
                        <a key={i} href={typeof url === 'string' ? url : (url as any).url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-emerald-400 transition">
                          <Download className="w-3.5 h-3.5" /> مرفق {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── QUESTIONS ───────────────────────── */}
                {questions.map((q, qi) => {
                  const cfg = Q_TYPES[q.type]
                  const Icon = cfg.icon
                  const ans = answers[q.id] || {}
                  const isAnswered = q.type === 'TEXT' ? !!ans.text?.trim() :
                    q.type === 'MCQ' ? ans.opt !== undefined && ans.opt !== null :
                    (ans.files?.length ?? 0) > 0

                  return (
                    <div key={q.id} className={`border-2 rounded-2xl overflow-hidden transition ${isAnswered ? 'border-emerald-300' : cfg.border}`}>
                      {/* Question header */}
                      <div className={`px-4 py-3 flex items-center gap-3 ${isAnswered ? 'bg-emerald-50' : cfg.bg}`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${isAnswered ? 'bg-emerald-600 text-white' : 'bg-white border ' + cfg.border + ' ' + cfg.color}`}>
                          {isAnswered ? <CheckCircle className="w-4 h-4" /> : qi + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 leading-snug">{q.text || `السؤال ${qi + 1}`}</p>
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] font-bold ${cfg.color} ${cfg.bg} px-2 py-1 rounded-lg border ${cfg.border} flex-shrink-0`}>
                          <Icon className="w-2.5 h-2.5" /> {cfg.label}
                        </span>
                      </div>

                      {/* Answer area */}
                      <div className="p-4 bg-white space-y-3">
                        {/* TEXT */}
                        {q.type === 'TEXT' && (
                          <textarea
                            value={ans.text || ''}
                            onChange={e => setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], text: e.target.value } }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                            rows={4}
                            placeholder="اكتب إجابتك هنا..."
                          />
                        )}

                        {/* MCQ */}
                        {q.type === 'MCQ' && q.opts && (
                          <div className="space-y-2">
                            {q.opts.map((opt, oi) => (
                              <button key={oi} type="button"
                                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], opt: oi } }))}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-right transition ${ans.opt === oi ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${ans.opt === oi ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                  {String.fromCharCode(65 + oi)}
                                </div>
                                <span className={`text-sm font-medium flex-1 ${ans.opt === oi ? 'text-purple-900 font-bold' : 'text-gray-700'}`}>{opt}</span>
                                {ans.opt === oi && <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* FILE UPLOAD (VIDEO / IMAGE / FILE) */}
                        {['VIDEO', 'IMAGE', 'FILE'].includes(q.type) && (
                          <div className="space-y-3">
                            <div
                              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition"
                              onClick={() => fileRefs.current[q.id]?.click()}>
                              <Icon className={`w-8 h-8 mx-auto mb-2 ${cfg.color}`} />
                              <p className="text-sm font-bold text-gray-700">
                                {q.type === 'VIDEO' ? 'اضغط لرفع فيديو تسجيلك' :
                                 q.type === 'IMAGE' ? 'اضغط لرفع صورة' :
                                 'اضغط لرفع ملف'}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {q.type === 'VIDEO' ? 'MP4, MOV (حتى 50MB)' :
                                 q.type === 'IMAGE' ? 'JPG, PNG, WEBP' :
                                 'جميع أنواع الملفات'}
                              </p>
                              {uploading === q.id && (
                                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[200px] mx-auto">
                                  <div className="h-full bg-emerald-500 animate-pulse w-2/3" />
                                </div>
                              )}
                              <input
                                ref={el => { fileRefs.current[q.id] = el }}
                                type="file"
                                className="hidden"
                                accept={q.type === 'VIDEO' ? 'video/*' : q.type === 'IMAGE' ? 'image/*' : '*'}
                                multiple={q.type === 'FILE'}
                                onChange={e => Array.from(e.target.files || []).forEach(f => handleFileUpload(f, q.id))}
                              />
                            </div>

                            {/* Uploaded files preview */}
                            {ans.files && ans.files.length > 0 && (
                              <div className="space-y-2">
                                {ans.files.map((url, fi) => (
                                  <div key={fi} className="rounded-xl overflow-hidden border border-gray-200">
                                    {isVideoUrl(url) || q.type === 'VIDEO' ? (
                                      <>
                                        <div className="bg-gray-900 px-3 py-2 flex items-center gap-2">
                                          <Play className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                                          <span className="text-xs text-gray-300 flex-1 truncate">{url.split('/').pop()}</span>
                                          <button onClick={() => removeFile(q.id, fi)} className="p-1 hover:bg-white/10 rounded">
                                            <X className="w-3.5 h-3.5 text-gray-400" />
                                          </button>
                                        </div>
                                        <video controls preload="metadata" className="w-full max-h-48 bg-black" src={url} />
                                      </>
                                    ) : isImageUrl(url) ? (
                                      <div className="relative group">
                                        <img src={url} alt="" className="w-full max-h-48 object-contain bg-gray-50" />
                                        <button onClick={() => removeFile(q.id, fi)}
                                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-3 p-3">
                                        <File className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-700 flex-1 truncate">{url.split('/').pop()}</span>
                                        <button onClick={() => removeFile(q.id, fi)} className="p-1 text-red-400 hover:text-red-600">
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Progress indicator */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${questions.length > 0 ? (totalAnswered / questions.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-sm font-black text-gray-600">{totalAnswered}/{questions.length}</span>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pb-2">
                  <button onClick={handleSubmit} disabled={submitting || totalAnswered < questions.length}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base transition disabled:opacity-50 shadow-xl shadow-emerald-200">
                    {submitting ? 'جاري التسليم...' : totalAnswered < questions.length ? `أجب على ${questions.length - totalAnswered} سؤال متبقي` : 'تسليم الواجب 🎉'}
                  </button>
                  <button onClick={() => setOpenAssignment(null)} className="px-5 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
