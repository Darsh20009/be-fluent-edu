'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FileText, Clock, CheckCircle, Send, Upload, X, Star, MessageSquare,
  Video, Image, File, List, AlignLeft, AlertCircle, ChevronDown, Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'

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
    <div className="flex flex-col items-center justify-center py-20 text-center" dir="rtl">
      <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-5">
        <AlertCircle className="w-10 h-10 text-orange-400" />
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">الحساب غير مفعّل</h3>
      <p className="text-gray-500 max-w-xs text-sm">فعّل حسابك بالاشتراك في إحدى الباقات لتتمكن من استلام وتسليم الواجبات.</p>
    </div>
  )

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">واجباتي اليومية</h2>
          <p className="text-gray-500 mt-1">تابع مهامك وطور مهاراتك من خلال التطبيق العملي</p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1.5 rounded-[1.25rem] w-fit">
          <button
            onClick={() => setTab('pending')}
            className={`px-6 py-2.5 rounded-[1rem] text-sm font-black transition-all ${tab === 'pending' ? 'bg-white shadow-sm text-[#10B981]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            بانتظارك ({pendingAssignments.length})
          </button>
          <button
            onClick={() => setTab('submitted')}
            className={`px-6 py-2.5 rounded-[1rem] text-sm font-black transition-all ${tab === 'submitted' ? 'bg-white shadow-sm text-[#10B981]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            تم التسليم ({submittedAssignments.length})
          </button>
        </div>
      </div>

      {/* Pending */}
      {tab === 'pending' && (
        pendingAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900">أنت رائع! لا توجد واجبات</h3>
            <p className="text-gray-400 mt-2 max-w-xs font-medium">استمتع بوقتك أو راجع دروسك السابقة حتى يرسل لك المعلم مهام جديدة.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingAssignments.map(a => {
              const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.TEXT
              const Icon = cfg.icon
              const isOverdue = a.dueDate && new Date(a.dueDate) < new Date()
              
              // Countdown logic
              let dueLabel = 'غير محدد'
              if (a.dueDate) {
                const diff = new Date(a.dueDate).getTime() - new Date().getTime()
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                if (isOverdue) dueLabel = 'انتهى الموعد'
                else if (days === 0) dueLabel = 'ينتهي اليوم'
                else if (days === 1) dueLabel = 'ينتهي غداً'
                else dueLabel = `ينتهي خلال ${days} أيام`
              }

              return (
                <div key={a.id} className="group bg-white rounded-[2rem] border border-gray-100 p-6 hover:border-[#10B981]/30 hover:shadow-xl hover:shadow-[#10B981]/5 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className={`w-14 h-14 ${cfg.bg} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                        <Icon className={`w-7 h-7 ${cfg.color}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-gray-900">{a.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>{cfg.labelAr}</span>
                          {isOverdue && <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-wider">متأخر</span>}
                        </div>
                        {a.description && <p className="text-sm text-gray-500 font-medium line-clamp-1">{a.description}</p>}
                        <div className="flex items-center gap-4 pt-1">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${isOverdue ? 'text-rose-500' : 'text-gray-400'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{dueLabel}</span>
                          </div>
                          {a.session && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{a.session.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => { setSelectedAssignment(a); setAnswer(''); setSelectedOption(null); setAttachedFiles([]) }}
                      className="bg-[#10B981] text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      <span>ابدأ الحل</span>
                      <Send className="w-4 h-4" />
                    </button>
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
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-black text-gray-400">لم تقم بتسليم أي واجب بعد</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submittedAssignments.map(a => {
              const sub = a.submissions[0]
              const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.TEXT
              const Icon = cfg.icon
              return (
                <div key={a.id} className={`bg-white rounded-[2rem] border p-6 transition-all ${sub.grade !== null ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-black text-gray-900">{a.title}</h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">تاريخ التسليم: {new Date(sub.submittedAt).toLocaleDateString('ar-EG')}</p>
                        </div>
                        {sub.grade !== null ? (
                          <div className="bg-white px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">الدرجة</p>
                              <p className="text-lg font-black text-emerald-600 leading-none">{sub.grade}/100</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                              <Star className="w-5 h-5 fill-current" />
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-2 bg-orange-50 text-orange-600 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            قيد المراجعة
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        {sub.textAnswer && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">إجابتك:</p>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{sub.textAnswer}</p>
                          </div>
                        )}

                        {sub.attachedFiles && (() => {
                          try {
                            const files = JSON.parse(sub.attachedFiles) as string[]
                            return (
                              <div className="flex flex-wrap gap-2">
                                {files.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition border border-blue-100"
                                  >
                                    <File className="w-3.5 h-3.5" />
                                    <span>المرفق {files.length > 1 ? i + 1 : ''}</span>
                                  </a>
                                ))}
                              </div>
                            )
                          } catch { return null }
                        })()}

                        {sub.feedback && (
                          <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4" />
                              <p className="text-[10px] font-black uppercase tracking-widest">تعليق المعلم:</p>
                            </div>
                            <p className="text-sm font-medium leading-relaxed">{sub.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {selectedAssignment && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom duration-300" dir="rtl">
            <div className="bg-[#10B981] px-8 py-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  {(() => {
                    const Icon = TYPE_CONFIG[selectedAssignment.type]?.icon || FileText
                    return <Icon className="w-6 h-6" />
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedAssignment.title}</h3>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-0.5">
                    {TYPE_CONFIG[selectedAssignment.type]?.labelAr || selectedAssignment.type}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
              {selectedAssignment.description && (
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-gray-600 text-sm leading-relaxed font-medium">
                  {selectedAssignment.description}
                </div>
              )}

              {selectedAssignment.attachmentUrls && (() => {
                let urls: string[] = []
                try { urls = JSON.parse(selectedAssignment.attachmentUrls!) } catch { urls = [selectedAssignment.attachmentUrls!] }
                return urls.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">مواد مساعدة من المعلم:</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm font-black text-blue-700 hover:bg-blue-100 transition group"
                        >
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Eye className="w-5 h-5" />
                          </div>
                          <span>عرض الملف {urls.length > 1 ? i + 1 : ''}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null
              })()}

              <div className="border-t border-gray-100 pt-8">
                <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-[#10B981] rounded-full" />
                  إجابتك على المهمة
                </h4>

                {selectedAssignment.type === 'MULTIPLE_CHOICE' && selectedAssignment.multipleChoice && (() => {
                  let parsed: any = null
                  try { parsed = JSON.parse(selectedAssignment.multipleChoice) } catch { return null }
                  const questions: Array<{question:string,options:string[],correctAnswer:number}> = Array.isArray(parsed) ? parsed : [parsed]
                  return (
                    <div className="space-y-6">
                      {questions.map((q, qi) => (
                        <div key={qi} className="space-y-4">
                          <p className="font-black text-gray-900 text-base">{q.question}</p>
                          <div className="grid gap-3">
                            {q.options.map((opt: string, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedOption(qi * 100 + idx)}
                                className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                                  selectedOption === (qi * 100 + idx) 
                                    ? 'bg-[#10B981] text-white border-[#10B981] shadow-lg shadow-emerald-100' 
                                    : 'border-gray-100 hover:border-emerald-200 text-gray-700 bg-white'
                                }`}
                              >
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${
                                  selectedOption === (qi * 100 + idx) ? 'bg-white/20 border-white' : 'bg-gray-50 border-gray-100'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="font-bold">{opt}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {selectedAssignment.type === 'TEXT' && (
                  <div className="space-y-2">
                    <textarea
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      className="w-full px-6 py-4 border-2 border-gray-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-emerald-50 focus:border-[#10B981] outline-none resize-none transition-all"
                      rows={6}
                      placeholder="اكتب إجابتك هنا بالتفصيل..."
                    />
                  </div>
                )}

                {['VIDEO', 'IMAGE', 'FILE'].includes(selectedAssignment.type) && (
                  <div className="space-y-6">
                    <div
                      className="group border-2 border-dashed border-gray-200 rounded-[2rem] p-10 text-center cursor-pointer hover:border-[#10B981] hover:bg-emerald-50/30 transition-all relative overflow-hidden"
                      onClick={() => fileRef.current?.click()}
                    >
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#10B981]" />
                        </div>
                        <p className="text-base font-black text-gray-900">اسحب الملف أو اضغط للاختيار</p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
                          {selectedAssignment.type === 'VIDEO' ? 'MP4, MOV (بحد أقصى 50MB)' : selectedAssignment.type === 'IMAGE' ? 'JPG, PNG, WEBP' : 'جميع الملفات مدعومة'}
                        </p>
                      </div>
                      
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                          <div className="w-full max-w-xs px-8">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-black text-[#10B981]">جاري الرفع...</span>
                              <span className="text-xs font-black text-[#10B981]">60%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#10B981] animate-pulse" style={{ width: '60%' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      
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
                      <div className="space-y-3">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">الملفات المرفقة ({attachedFiles.length}):</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {attachedFiles.map((url, i) => (
                            <div key={i} className="group relative aspect-square bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                              {selectedAssignment.type === 'IMAGE' ? (
                                <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                  <File className="w-8 h-8 text-gray-300 mb-2" />
                                  <span className="text-[10px] font-bold text-gray-400 truncate w-full text-center">
                                    {url.split('/').pop()}
                                  </span>
                                </div>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); setAttachedFiles(f => f.filter((_, idx) => idx !== i)) }}
                                className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedAssignment.type === 'VIDEO' && (
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <p className="font-black text-blue-800 mb-1">تسجيل الفيديو</p>
                          <p className="text-blue-600/80 font-medium">تأكد من وضوح الصوت والإضاءة عند التسجيل. يمكنك استخدام هاتفك ورفع الفيديو مباشرة.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || uploading}
                  className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#10B981] hover:bg-emerald-600 text-white rounded-2xl font-black text-base transition-all disabled:opacity-50 shadow-xl shadow-emerald-100"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري التسليم...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>تأكيد وتسليم الواجب</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setSelectedAssignment(null)} 
                  className="px-8 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-base hover:bg-gray-100 transition-all"
                >
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
