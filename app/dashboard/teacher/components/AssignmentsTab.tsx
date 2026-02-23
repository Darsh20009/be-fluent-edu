'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FileText, Plus, CheckCircle, Clock, Send, Upload, X, Trash2, Pencil,
  Video, Image, File, AlignLeft, List, AlertCircle, ChevronDown, ChevronUp,
  User, Calendar, Star, MessageSquare
} from 'lucide-react'
import { toast } from 'react-hot-toast'

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
    grammarErrors: string | null
    submittedAt: string
  }>
  _count?: {
    Submission: number
  }
}

interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
}

interface Session { id: string; title: string }
interface Student { id: string; name: string; email: string }

const TYPE_CONFIG: Record<string, { label: string; labelAr: string; icon: any; color: string; bg: string }> = {
  TEXT:            { label: 'Text',            labelAr: 'نصي',         icon: AlignLeft, color: 'text-blue-600',   bg: 'bg-blue-50' },
  MULTIPLE_CHOICE: { label: 'Multiple Choice', labelAr: 'اختيارات',   icon: List,      color: 'text-purple-600', bg: 'bg-purple-50' },
  VIDEO:           { label: 'Video',           labelAr: 'فيديو',       icon: Video,     color: 'text-red-600',    bg: 'bg-red-50' },
  IMAGE:           { label: 'Image',           labelAr: 'صورة',        icon: Image,     color: 'text-orange-600', bg: 'bg-orange-50' },
  FILE:            { label: 'File',            labelAr: 'ملف',         icon: File,      color: 'text-gray-600',   bg: 'bg-gray-50' },
}

interface MCQQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

const emptyMCQ = (): MCQQuestion => ({ question: '', options: ['', '', '', ''], correctAnswer: 0 })

const emptyForm = {
  title: '', description: '', type: 'TEXT', sessionId: '', dueDate: '',
  selectedStudents: [] as string[],
  attachmentUrls: [] as UploadedFile[],
  mcqQuestions: [emptyMCQ()] as MCQQuestion[]
}

export default function AssignmentsTab({ teacherProfileId }: { teacherProfileId: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' })
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
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
    } catch (e) {
      toast.error('فشل تحميل البيانات')
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
        const data = await res.json()
        const uploadedFile: UploadedFile = {
          url: data.url,
          name: file.name,
          size: file.size,
          type: file.type
        }
        setForm(f => ({ ...f, attachmentUrls: [...f.attachmentUrls, uploadedFile] }))
        toast.success('تم رفع الملف بنجاح')
      } else {
        toast.error('فشل رفع الملف')
      }
    } catch {
      toast.error('خطأ في رفع الملف')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الواجب؟ سيتم حذف جميع التسليمات المرتبطة به.')) return
    setIsDeleting(id)
    try {
      const res = await fetch(`/api/teacher/assignments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('تم حذف الواجب')
        fetchData()
      } else {
        toast.error('فشل حذف الواجب')
      }
    } catch {
      toast.error('خطأ في الحذف')
    } finally {
      setIsDeleting(null)
    }
  }

  async function handleCreate() {
    if (!form.title.trim()) return toast.error('أدخل عنوان الواجب')
    setSubmitting(true)
    try {
      const body: any = {
        title: form.title,
        description: form.description,
        type: form.type,
        sessionId: form.sessionId || undefined,
        dueDate: form.dueDate || undefined,
        attachmentUrls: JSON.stringify(form.attachmentUrls),
        studentIds: form.selectedStudents
      }
      if (form.type === 'MULTIPLE_CHOICE') {
        // Validate MCQ questions
        const validQuestions = form.mcqQuestions.filter(q => q.question.trim() && q.options.some(o => o.trim()))
        if (validQuestions.length === 0) {
          setSubmitting(false)
          return toast.error('أضف سؤالاً وخيارات للواجب الاختياري')
        }
        body.multipleChoice = validQuestions.length === 1 ? validQuestions[0] : validQuestions
      }
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        toast.success('تم إنشاء الواجب بنجاح')
        setForm({ ...emptyForm })
        setShowForm(false)
        fetchData()
      } else {
        toast.error('فشل إنشاء الواجب')
      }
    } catch {
      toast.error('خطأ في إنشاء الواجب')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGrade(submissionId: string) {
    if (!gradeData.grade) return toast.error('أدخل الدرجة')
    setGradingId(submissionId)
    try {
      const res = await fetch(`/api/teacher/assignments/${submissionId}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: parseFloat(gradeData.grade), feedback: gradeData.feedback })
      })
      if (res.ok) {
        toast.success('تم تسليم الدرجة')
        setSelectedSubmission(null)
        setGradeData({ grade: '', feedback: '' })
        fetchData()
      } else {
        toast.error('فشل تسليم الدرجة')
      }
    } catch {
      toast.error('خطأ في التقييم')
    } finally {
      setGradingId(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      files.forEach(f => handleFileUpload(f))
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const pendingCount = assignments.reduce((acc, a) => acc + a.Submission.filter(s => s.grade === null).length, 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">الواجبات</h2>
          <p className="text-sm text-gray-500 mt-0.5">{assignments.length} واجب • {pendingCount} بانتظار التقييم</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition"
        >
          <Plus className="w-4 h-4" />
          واجب جديد
        </button>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-orange-800 text-sm">{pendingCount} تسليم بانتظار التقييم</p>
            <p className="text-xs text-orange-600 mt-0.5">راجع التسليمات أدناه وأضف الدرجات</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-black text-lg">إنشاء واجب جديد</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">عنوان الواجب *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="مثال: واجب درس المضارع التام"
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-2">نوع الواجب</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: key, attachmentUrls: [] }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition font-bold text-xs ${
                        form.type === key ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${form.type === key ? 'text-emerald-600' : 'text-gray-400'}`} />
                      {cfg.labelAr}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">التعليمات / الوصف</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                rows={3}
                placeholder="اكتب تعليمات الواجب..."
              />
            </div>

            {/* MCQ Options - Multiple Questions Support */}
            {form.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-500">أسئلة الاختيار المتعدد</p>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, mcqQuestions: [...f.mcqQuestions, emptyMCQ()] }))}
                    className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> إضافة سؤال
                  </button>
                </div>
                {form.mcqQuestions.map((q, qi) => (
                  <div key={qi} className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-purple-700">السؤال {qi + 1}</p>
                      {form.mcqQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, mcqQuestions: f.mcqQuestions.filter((_, idx) => idx !== qi) }))}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      value={q.question}
                      onChange={e => {
                        const qs = [...form.mcqQuestions]
                        qs[qi] = { ...qs[qi], question: e.target.value }
                        setForm(f => ({ ...f, mcqQuestions: qs }))
                      }}
                      className="w-full px-3 py-2.5 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none bg-white"
                      placeholder="نص السؤال..."
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-lg border-2 ${q.correctAnswer === oi ? 'border-purple-500 bg-purple-100' : 'border-purple-100 bg-white'}`}>
                          <input
                            type="radio"
                            checked={q.correctAnswer === oi}
                            onChange={() => {
                              const qs = [...form.mcqQuestions]
                              qs[qi] = { ...qs[qi], correctAnswer: oi }
                              setForm(f => ({ ...f, mcqQuestions: qs }))
                            }}
                            className="w-4 h-4 accent-purple-600"
                            title="الإجابة الصحيحة"
                          />
                          <input
                            value={opt}
                            onChange={e => {
                              const qs = [...form.mcqQuestions]
                              const opts = [...qs[qi].options]; opts[oi] = e.target.value
                              qs[qi] = { ...qs[qi], options: opts }
                              setForm(f => ({ ...f, mcqQuestions: qs }))
                            }}
                            className="flex-1 bg-transparent outline-none text-sm"
                            placeholder={`الخيار ${oi + 1}`}
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const qs = [...form.mcqQuestions]
                                const opts = qs[qi].options.filter((_, idx) => idx !== oi)
                                const correct = q.correctAnswer >= opts.length ? 0 : q.correctAnswer
                                qs[qi] = { ...qs[qi], options: opts, correctAnswer: correct }
                                setForm(f => ({ ...f, mcqQuestions: qs }))
                              }}
                              className="text-red-300 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {q.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => {
                          const qs = [...form.mcqQuestions]
                          qs[qi] = { ...qs[qi], options: [...qs[qi].options, ''] }
                          setForm(f => ({ ...f, mcqQuestions: qs }))
                        }}
                        className="text-xs text-purple-600 font-bold hover:underline"
                      >
                        + إضافة خيار
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* File Upload - Moved outside of conditional check for form.type to allow attachments for all types */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1.5">
                المرفقات (صور، فيديو، ملفات)
              </label>
              <div
                ref={dragRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30'
                }`}
                onClick={() => fileRef.current?.click()}
              >
                <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${isDragging ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <Upload className={`w-6 h-6 ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm font-bold text-gray-600">اسحب الملف هنا أو اضغط للاختيار</p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, MP4, PDF... • حتى 50MB
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept="*"
                  multiple
                  onChange={e => { Array.from(e.target.files || []).forEach(f => handleFileUpload(f)) }}
                />
                {uploading && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-[200px] overflow-hidden">
                      <div className="bg-emerald-500 h-full animate-progress-indeterminate"></div>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">جاري الرفع...</p>
                  </div>
                )}
              </div>
              {form.attachmentUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.attachmentUrls.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 group hover:border-emerald-200 transition">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <img src={file.url} className="w-full h-full object-cover rounded-lg" alt="" />
                        ) : file.type.startsWith('video/') ? (
                          <Video className="w-5 h-5 text-red-500" />
                        ) : (
                          <File className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{formatFileSize(file.size)} • {file.type.split('/')[1]}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm(f => ({ ...f, attachmentUrls: f.attachmentUrls.filter((_, idx) => idx !== i) }));
                        }} 
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">الحصة المرتبطة (اختياري)</label>
                <select value={form.sessionId} onChange={e => setForm(f => ({ ...f, sessionId: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">لا توجد حصة</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">تاريخ التسليم (اختياري)</label>
                <input type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            {/* Students */}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-2">
                تحديد الطلاب (اختياري - فارغ = للكل)
                <span className="mr-2 font-normal text-emerald-600">{form.selectedStudents.length} محدد</span>
              </label>
              <div className="border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                {students.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">لا يوجد طلاب</p>
                ) : students.map(st => (
                  <label key={st.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.selectedStudents.includes(st.id)}
                      onChange={e => setForm(f => ({
                        ...f,
                        selectedStudents: e.target.checked
                          ? [...f.selectedStudents, st.id]
                          : f.selectedStudents.filter(id => id !== st.id)
                      }))}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black text-xs">
                      {st.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{st.name}</p>
                      <p className="text-xs text-gray-400">{st.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-200">
                <Send className="w-4 h-4" />
                {submitting ? 'جاري الإنشاء...' : 'إنشاء الواجب'}
              </button>
              <button onClick={() => { setShowForm(false); setForm({ ...emptyForm }) }} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-gray-500">لا توجد واجبات حتى الآن</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition">
            + أنشئ أول واجب
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => {
            const cfg = TYPE_CONFIG[assignment.type] || TYPE_CONFIG.TEXT
            const Icon = cfg.icon
            const ungraded = assignment.Submission.filter(s => s.grade === null).length
            const isExpanded = expandedAssignment === assignment.id

            return (
              <div key={assignment.id} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isExpanded ? 'ring-2 ring-emerald-500/20 border-emerald-200 shadow-lg' : 'border-gray-200 hover:border-emerald-200'}`}>
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-emerald-50/20 transition"
                  onClick={() => setExpandedAssignment(isExpanded ? null : assignment.id)}
                >
                  <div className={`w-12 h-12 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className={`w-6 h-6 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-black text-gray-900 truncate">{assignment.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                          {cfg.labelAr}
                        </span>
                        {ungraded > 0 && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">
                            {ungraded} بانتظار التقييم
                          </span>
                        )}
                        {assignment.Submission.length > 0 && ungraded === 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> مكتمل
                          </span>
                        )}
                      </div>
                    </div>
                    {assignment.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{assignment.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-[11px] font-bold text-gray-400">
                      {assignment.Session && (
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md">
                          <FileText className="w-3 h-3" /> {assignment.Session.title}
                        </span>
                      )}
                      {assignment.dueDate && (
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${new Date(assignment.dueDate) < new Date() ? 'bg-red-50 text-red-500' : 'bg-gray-50'}`}>
                          <Clock className="w-3 h-3" /> {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md">
                        <User className="w-3 h-3" /> {assignment.Submission.length} تسليم
                      </span>
                      {assignment.attachmentUrls && (() => {
                        try {
                          const urls = JSON.parse(assignment.attachmentUrls)
                          if (urls.length > 0) return (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                              <Plus className="w-3 h-3" /> {urls.length} مرفقات
                            </span>
                          )
                        } catch { return null }
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(assignment.id); }}
                      disabled={isDeleting === assignment.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="حذف الواجب"
                    >
                      {isDeleting === assignment.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <div className={`p-1 rounded-lg transition ${isExpanded ? 'bg-emerald-50 text-emerald-600 rotate-180' : 'text-gray-400'}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Materials */}
                    {assignment.attachmentUrls && (() => {
                      try {
                        const files = JSON.parse(assignment.attachmentUrls) as UploadedFile[]
                        if (files.length === 0) return null
                        return (
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">مواد الواجب</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {files.map((file, idx) => (
                                <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" 
                                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-100">
                                    {file.type?.startsWith('image/') ? <Image className="w-4 h-4" /> : file.type?.startsWith('video/') ? <Video className="w-4 h-4" /> : <File className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-700 truncate">{file.name || 'ملف مرفق'}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{file.size ? formatFileSize(file.size) : '---'}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )
                      } catch { return null }
                    })()}

                    {/* Submissions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">التسليمات ({assignment.Submission.length})</h4>
                      </div>
                      {assignment.Submission.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-gray-400">لم يسلّم أي طالب هذا الواجب بعد</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {assignment.Submission.map(sub => (
                            <div key={sub.id} className={`p-4 rounded-2xl border transition-all ${sub.grade !== null ? 'bg-white border-emerald-100' : 'bg-orange-50/50 border-orange-100'}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 ${sub.grade !== null ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-white border-orange-200 text-orange-700'}`}>
                                    {sub.User.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-gray-900">{sub.User.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5" />
                                        {new Date(sub.submittedAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {sub.grade !== null ? (
                                    <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-sm shadow-emerald-200">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        {sub.grade}/100
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setSelectedSubmission(sub); setGradeData({ grade: '', feedback: '' }) }}
                                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-black hover:bg-orange-700 transition shadow-lg shadow-orange-200"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      رصد الدرجة
                                    </button>
                                  )}
                                </div>
                              </div>

                              {sub.textAnswer && (
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 mb-3 leading-relaxed">
                                  {sub.textAnswer}
                                </div>
                              )}

                              {sub.attachedFiles && (() => {
                                try {
                                  const files = JSON.parse(sub.attachedFiles) as string[]
                                  if (files.length === 0) return null
                                  return (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {files.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition group shadow-sm"
                                        >
                                          <File className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                                          {url.includes('video') || /\.(mp4|mov|avi)$/i.test(url) ? 'عرض الفيديو' : /\.(jpg|png|gif|webp)$/i.test(url) ? 'مشاهدة الصورة' : 'تحميل الملف'}
                                        </a>
                                      ))}
                                    </div>
                                  )
                                } catch { return null }
                              })()}

                              {sub.feedback && (
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 flex gap-2">
                                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                  <p>{sub.feedback}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Grade Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-white font-black">تقييم: {selectedSubmission.User.name}</h3>
              <button onClick={() => setSelectedSubmission(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedSubmission.textAnswer && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 mb-2">إجابة الطالب:</p>
                  <p className="text-sm text-gray-800">{selectedSubmission.textAnswer}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">الدرجة (من 100) *</label>
                <input
                  type="number" min="0" max="100"
                  value={gradeData.grade}
                  onChange={e => setGradeData(g => ({ ...g, grade: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center font-black text-2xl focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="0 - 100"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">تعليق (اختياري)</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={e => setGradeData(g => ({ ...g, feedback: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                  rows={3}
                  placeholder="أضف تعليقاً للطالب..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleGrade(selectedSubmission.id)}
                  disabled={!!gradingId}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-50"
                >
                  {gradingId ? 'جاري التسليم...' : 'تسليم التقييم'}
                </button>
                <button onClick={() => setSelectedSubmission(null)} className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition">
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
