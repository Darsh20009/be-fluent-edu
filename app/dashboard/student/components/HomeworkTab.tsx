'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FileText, Clock, CheckCircle, Send, Upload, X, Star, MessageSquare,
  Video, Image, File, List, AlignLeft, AlertCircle, ChevronDown, Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'

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

const TYPE_CONFIG: Record<string, { labelAr: string; icon: any; color: string; bg: string }> = {
  TEXT:            { labelAr: 'كتابي',     icon: AlignLeft, color: 'text-blue-600',   bg: 'bg-blue-50' },
  MULTIPLE_CHOICE: { labelAr: 'اختياري',   icon: List,      color: 'text-purple-600', bg: 'bg-purple-50' },
  VIDEO:           { labelAr: 'فيديو',     icon: Video,     color: 'text-red-600',    bg: 'bg-red-50' },
  IMAGE:           { labelAr: 'صورة',      icon: Image,     color: 'text-orange-600', bg: 'bg-orange-50' },
  FILE:            { labelAr: 'ملف',       icon: File,      color: 'text-gray-600',   bg: 'bg-gray-50' },
}

export default function HomeworkTab({ isActive }: { isActive: boolean }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [answer, setAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState<'pending' | 'submitted'>('pending')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchAssignments() }, [])

  async function fetchAssignments() {
    try {
      const res = await fetch('/api/assignments/student')
      if (res.ok) setAssignments(await res.json())
    } catch {
      toast.error('فشل تحميل الواجبات')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const { url } = await res.json()
        setAttachedFiles(f => [...f, url])
        toast.success('تم رفع الملف')
      } else {
        toast.error('فشل رفع الملف')
      }
    } catch {
      toast.error('خطأ في رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit() {
    if (!selectedAssignment) return

    if (selectedAssignment.type === 'TEXT' && !answer.trim()) {
      return toast.error('اكتب إجابتك أولاً')
    }
    if (selectedAssignment.type === 'MULTIPLE_CHOICE' && selectedOption === null) {
      return toast.error('اختر إجابة أولاً')
    }
    if (['VIDEO', 'IMAGE', 'FILE'].includes(selectedAssignment.type) && attachedFiles.length === 0) {
      return toast.error('ارفع الملف أولاً')
    }

    setSubmitting(true)
    try {
      const body: any = { assignmentId: selectedAssignment.id }
      if (selectedAssignment.type === 'TEXT') body.textAnswer = answer
      else if (selectedAssignment.type === 'MULTIPLE_CHOICE') body.selectedOption = selectedOption
      else body.attachedFiles = JSON.stringify(attachedFiles)

      const res = await fetch('/api/assignments/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success('تم تسليم الواجب بنجاح! 🎉')
        setSelectedAssignment(null)
        setAnswer('')
        setSelectedOption(null)
        setAttachedFiles([])
        fetchAssignments()
      } else {
        const err = await res.json()
        toast.error(err.error || 'فشل التسليم')
      }
    } catch {
      toast.error('خطأ في التسليم')
    } finally {
      setSubmitting(false)
    }
  }

  const pendingAssignments = assignments.filter(a => a.submissions.length === 0)
  const submittedAssignments = assignments.filter(a => a.submissions.length > 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isActive) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
        <AlertCircle className="w-10 h-10 text-orange-400" />
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">الحساب غير مفعّل</h3>
      <p className="text-gray-500 max-w-xs text-sm">فعّل حسابك بالاشتراك في إحدى الباقات لتتمكن من استلام وتسليم الواجبات.</p>
    </div>
  )

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-black text-gray-900">واجباتي</h2>
        <p className="text-sm text-gray-500 mt-0.5">{pendingAssignments.length} واجب معلق • {submittedAssignments.length} مسلّم</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('pending')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${tab === 'pending' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          معلق ({pendingAssignments.length})
        </button>
        <button
          onClick={() => setTab('submitted')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${tab === 'submitted' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          مسلّم ({submittedAssignments.length})
        </button>
      </div>

      {/* Pending */}
      {tab === 'pending' && (
        pendingAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
            <p className="font-black text-gray-900">أحسنت! لا توجد واجبات معلقة</p>
            <p className="text-sm text-gray-400 mt-1">ستظهر الواجبات الجديدة هنا فور إرسالها من معلمك</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAssignments.map(a => {
              const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.TEXT
              const Icon = cfg.icon
              const isOverdue = a.dueDate && new Date(a.dueDate) < new Date()
              return (
                <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-emerald-200 transition">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-black text-gray-900">{a.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.color}`}>{cfg.labelAr}</span>
                            {isOverdue && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold">متأخر</span>}
                            {a.session && <span className="text-xs text-gray-400">{a.session.title}</span>}
                          </div>
                          {a.description && <p className="text-sm text-gray-600 mt-1.5">{a.description}</p>}
                          {a.dueDate && (
                            <p className={`text-xs mt-1.5 flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                              <Clock className="w-3 h-3" />
                              موعد التسليم: {new Date(a.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {a.attachmentUrls && (
                            <a href={a.attachmentUrls} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition border border-blue-200"
                            >
                              <Eye className="w-3 h-3" />
                              عرض
                            </a>
                          )}
                          <button
                            onClick={() => { setSelectedAssignment(a); setAnswer(''); setSelectedOption(null); setAttachedFiles([]) }}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-200"
                          >
                            <Send className="w-3 h-3" />
                            تسليم
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Submitted */}
      {tab === 'submitted' && (
        submittedAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-bold text-gray-500">لم تسلّم أي واجب بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submittedAssignments.map(a => {
              const sub = a.submissions[0]
              const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.TEXT
              const Icon = cfg.icon
              return (
                <div key={a.id} className={`bg-white rounded-2xl border p-5 ${sub.grade !== null ? 'border-emerald-200' : 'border-gray-200'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-black text-gray-900">{a.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">سُلِّم: {new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</p>
                        </div>
                        {sub.grade !== null ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-black">
                            <Star className="w-3.5 h-3.5 fill-emerald-500" />
                            {sub.grade}/100
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-xl text-xs font-bold">قيد المراجعة</span>
                        )}
                      </div>

                      {sub.textAnswer && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-400 font-bold mb-1">إجابتك:</p>
                          <p className="text-sm text-gray-700">{sub.textAnswer}</p>
                        </div>
                      )}

                      {sub.attachedFiles && (() => {
                        try {
                          const files = JSON.parse(sub.attachedFiles) as string[]
                          return (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {files.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                                >
                                  <File className="w-3 h-3" />
                                  الملف المرفق {i + 1}
                                </a>
                              ))}
                            </div>
                          )
                        } catch { return null }
                      })()}

                      {sub.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-xs text-blue-600 font-bold mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> تعليق المعلم:</p>
                          <p className="text-sm text-blue-700">{sub.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Submit Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg" dir="rtl">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 rounded-t-3xl sm:rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-white font-black">{selectedAssignment.title}</h3>
                <p className="text-emerald-100 text-xs mt-0.5">{TYPE_CONFIG[selectedAssignment.type]?.labelAr || selectedAssignment.type}</p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {selectedAssignment.description && (
                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                  {selectedAssignment.description}
                </div>
              )}

              {selectedAssignment.attachmentUrls && (
                <a href={selectedAssignment.attachmentUrls} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  <Eye className="w-4 h-4" />
                  عرض مواد الواجب
                </a>
              )}

              {selectedAssignment.type === 'MULTIPLE_CHOICE' && selectedAssignment.multipleChoice && (
                <div className="space-y-2">
                  <p className="font-bold text-gray-900 text-sm">{JSON.parse(selectedAssignment.multipleChoice).question}</p>
                  <div className="space-y-2">
                    {JSON.parse(selectedAssignment.multipleChoice).options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-right p-3.5 rounded-xl border-2 transition text-sm font-bold ${
                          selectedOption === idx ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 hover:border-emerald-400 text-gray-700'
                        }`}
                      >
                        <span className="inline-block w-6 h-6 rounded-full bg-white/20 border border-current text-center leading-6 text-xs ml-2">{String.fromCharCode(65 + idx)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssignment.type === 'TEXT' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">إجابتك</label>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                    rows={5}
                    placeholder="اكتب إجابتك هنا..."
                  />
                </div>
              )}

              {['VIDEO', 'IMAGE', 'FILE'].includes(selectedAssignment.type) && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1.5">
                    {selectedAssignment.type === 'VIDEO' ? 'ارفع مقطع فيديو إجابتك' :
                     selectedAssignment.type === 'IMAGE' ? 'ارفع صورة إجابتك' : 'ارفع ملف إجابتك'}
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-600">اضغط لاختيار ملف</p>
                    {uploading && <p className="text-xs text-emerald-600 mt-2 font-bold animate-pulse">جاري الرفع...</p>}
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept={selectedAssignment.type === 'VIDEO' ? 'video/*' : selectedAssignment.type === 'IMAGE' ? 'image/*' : '*'}
                      multiple
                      onChange={e => Array.from(e.target.files || []).forEach(f => handleFileUpload(f))}
                    />
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachedFiles.map((url, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-xs text-gray-700 flex-1 truncate">{url.split('/').pop()}</span>
                          <button onClick={() => setAttachedFiles(f => f.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 shadow-lg shadow-emerald-200"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'جاري التسليم...' : 'تسليم الواجب'}
                </button>
                <button onClick={() => setSelectedAssignment(null)} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
