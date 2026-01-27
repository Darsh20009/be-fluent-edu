'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Headphones, Plus, Upload, Trash2, Edit, Eye, Music, Video, 
  Save, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

interface ListeningContent {
  id: string
  title: string
  titleAr: string
  description: string | null
  descriptionAr: string | null
  mediaType: 'AUDIO' | 'VIDEO'
  mediaUrl: string
  thumbnailUrl: string | null
  duration: number | null
  level: string
  category: string | null
  categoryAr: string | null
  transcript: string | null
  transcriptAr: string | null
  order: number
  isPublished: boolean
  exercisesCount?: number
}

interface Exercise {
  id?: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'WORD_ORDER'
  order: number
  question: string
  questionAr: string
  options: string[]
  correctAnswer: string
  explanation: string
  explanationAr: string
  points: number
  timestamp: number | null
}

interface ListeningTabProps {
  isActive: boolean
}

export default function ListeningTab({ isActive }: ListeningTabProps) {
  const [contents, setContents] = useState<ListeningContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [editingContent, setEditingContent] = useState<ListeningContent | null>(null)
  const [showExercisesModal, setShowExercisesModal] = useState(false)
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    mediaType: 'AUDIO' as 'AUDIO' | 'VIDEO',
    mediaUrl: '',
    thumbnailUrl: '',
    duration: '',
    level: 'BEGINNER',
    category: '',
    categoryAr: '',
    transcript: '',
    transcriptAr: '',
    order: '0',
    isPublished: true
  })

  useEffect(() => {
    if (isActive) {
      fetchContents()
    }
  }, [isActive])

  const fetchContents = async () => {
    try {
      const res = await fetch('/api/listening?all=true')
      const data = await res.json()
      setContents(data)
    } catch (err) {
      setError('فشل في تحميل المحتوى')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, type: 'audio' | 'video' | 'thumbnail') => {
    setUploading(true)
    setUploadProgress(`جاري رفع ${type === 'thumbnail' ? 'الصورة' : 'الملف'}...`)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/listening/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'فشل في رفع الملف')
      }

      const data = await res.json()
      
      if (type === 'thumbnail') {
        setFormData(prev => ({ ...prev, thumbnailUrl: data.url }))
      } else {
        setFormData(prev => ({ 
          ...prev, 
          mediaUrl: data.url,
          mediaType: type === 'video' ? 'VIDEO' : 'AUDIO'
        }))
      }

      setSuccess('تم رفع الملف بنجاح')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title || !formData.titleAr || !formData.mediaUrl) {
      setError('يرجى ملء جميع الحقول المطلوبة ورفع الملف')
      return
    }

    try {
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        order: parseInt(formData.order) || 0
      }

      const url = editingContent 
        ? `/api/listening/${editingContent.id}` 
        : '/api/listening'
      
      const res = await fetch(url, {
        method: editingContent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'فشل في حفظ المحتوى')
      }

      setSuccess(editingContent ? 'تم تحديث المحتوى بنجاح' : 'تم إضافة المحتوى بنجاح')
      setShowModal(false)
      resetForm()
      fetchContents()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return

    try {
      const res = await fetch(`/api/listening/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('فشل في الحذف')
      
      setSuccess('تم حذف المحتوى بنجاح')
      fetchContents()
    } catch (err) {
      setError('فشل في حذف المحتوى')
    }
  }

  const openEditModal = (content: ListeningContent) => {
    setEditingContent(content)
    setFormData({
      title: content.title,
      titleAr: content.titleAr,
      description: content.description || '',
      descriptionAr: content.descriptionAr || '',
      mediaType: content.mediaType,
      mediaUrl: content.mediaUrl,
      thumbnailUrl: content.thumbnailUrl || '',
      duration: content.duration?.toString() || '',
      level: content.level,
      category: content.category || '',
      categoryAr: content.categoryAr || '',
      transcript: content.transcript || '',
      transcriptAr: content.transcriptAr || '',
      order: content.order.toString(),
      isPublished: content.isPublished
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      mediaType: 'AUDIO',
      mediaUrl: '',
      thumbnailUrl: '',
      duration: '',
      level: 'BEGINNER',
      category: '',
      categoryAr: '',
      transcript: '',
      transcriptAr: '',
      order: '0',
      isPublished: true
    })
    setEditingContent(null)
  }

  const openExercisesModal = async (contentId: string) => {
    setSelectedContentId(contentId)
    try {
      const res = await fetch(`/api/listening/${contentId}`)
      const data = await res.json()
      setExercises(data.exercises.map((ex: any) => ({
        ...ex,
        options: ex.options ? JSON.parse(ex.options) : []
      })))
      setShowExercisesModal(true)
    } catch (err) {
      setError('فشل في تحميل التمارين')
    }
  }

  const addExercise = () => {
    setExercises(prev => [...prev, {
      type: 'MULTIPLE_CHOICE',
      order: prev.length,
      question: '',
      questionAr: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      explanationAr: '',
      points: 10,
      timestamp: null
    }])
  }

  const updateExercise = (index: number, field: string, value: any) => {
    setExercises(prev => prev.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    ))
  }

  const updateExerciseOption = (exerciseIndex: number, optionIndex: number, value: string) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exerciseIndex) return ex
      const newOptions = [...ex.options]
      newOptions[optionIndex] = value
      return { ...ex, options: newOptions }
    }))
  }

  const removeExercise = async (index: number) => {
    const exercise = exercises[index]
    if (exercise.id) {
      try {
        await fetch(`/api/listening/exercises?id=${exercise.id}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Error deleting exercise:', err)
      }
    }
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const saveExercises = async () => {
    if (!selectedContentId) return

    try {
      for (const exercise of exercises) {
        const payload = {
          ...exercise,
          contentId: selectedContentId,
          options: exercise.type === 'MULTIPLE_CHOICE' ? exercise.options : undefined
        }

        if (exercise.id) {
          await fetch('/api/listening/exercises', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: exercise.id, ...payload })
          })
        } else {
          await fetch('/api/listening/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        }
      }

      setSuccess('تم حفظ التمارين بنجاح')
      setShowExercisesModal(false)
      fetchContents()
    } catch (err) {
      setError('فشل في حفظ التمارين')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Headphones className="w-8 h-8 text-[#10B981]" />
          <h2 className="text-2xl font-bold text-gray-800">نظام الاستماع</h2>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="w-5 h-5 ml-2" />
          إضافة محتوى جديد
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">العنوان</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">النوع</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">المستوى</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">التمارين</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contents.map(content => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{content.titleAr}</p>
                      <p className="text-sm text-gray-500">{content.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {content.mediaType === 'VIDEO' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <Video className="w-4 h-4" /> فيديو
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <Music className="w-4 h-4" /> صوت
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      content.level === 'BEGINNER' ? 'bg-green-100 text-green-700' :
                      content.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {content.level === 'BEGINNER' ? 'مبتدئ' :
                       content.level === 'INTERMEDIATE' ? 'متوسط' : 'متقدم'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => openExercisesModal(content.id)}
                      className="text-[#10B981] hover:underline"
                    >
                      {content.exercisesCount || 0} تمرين
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {content.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" /> منشور
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <AlertCircle className="w-4 h-4" /> مسودة
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(content)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <a
                        href={`/listening/${content.id}`}
                        target="_blank"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="معاينة"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Headphones className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>لا يوجد محتوى استماع حالياً</p>
                    <p className="text-sm">اضغط على "إضافة محتوى جديد" للبدء</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); resetForm(); }}
          title={editingContent ? 'تعديل محتوى الاستماع' : 'إضافة محتوى استماع جديد'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="العنوان (English)"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Input
                label="العنوان (عربي)"
                value={formData.titleAr}
                onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                required
                className="text-right"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (English)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (عربي)</label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-right"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <p className="text-center text-gray-600 mb-4">رفع ملف الصوت أو الفيديو</p>
              <div className="flex justify-center gap-4">
                <input
                  type="file"
                  ref={audioInputRef}
                  accept="audio/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'audio')}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Music className="w-4 h-4 ml-2" />
                  رفع صوت MP3
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Video className="w-4 h-4 ml-2" />
                  رفع فيديو MP4
                </Button>
              </div>
              {uploadProgress && (
                <p className="text-center text-sm text-[#10B981] mt-2">{uploadProgress}</p>
              )}
              {formData.mediaUrl && (
                <p className="text-center text-sm text-green-600 mt-2">
                  <CheckCircle className="w-4 h-4 inline ml-1" />
                  تم رفع الملف: {formData.mediaType === 'VIDEO' ? 'فيديو' : 'صوت'}
                </p>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <p className="text-center text-gray-600 mb-2">صورة مصغرة (اختياري)</p>
              <input
                type="file"
                ref={thumbnailInputRef}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'thumbnail')}
                className="hidden"
              />
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 ml-2" />
                  رفع صورة
                </Button>
              </div>
              {formData.thumbnailUrl && (
                <p className="text-center text-sm text-green-600 mt-2">
                  <CheckCircle className="w-4 h-4 inline ml-1" />
                  تم رفع الصورة
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="BEGINNER">مبتدئ</option>
                  <option value="INTERMEDIATE">متوسط</option>
                  <option value="ADVANCED">متقدم</option>
                </select>
              </div>
              <Input
                label="المدة (ثواني)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="مثال: 120"
              />
              <Input
                label="الترتيب"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="التصنيف (English)"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="مثال: Conversation"
              />
              <Input
                label="التصنيف (عربي)"
                value={formData.categoryAr}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryAr: e.target.value }))}
                placeholder="مثال: محادثة"
                className="text-right"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">النص المكتوب (English)</label>
                <textarea
                  value={formData.transcript}
                  onChange={(e) => setFormData(prev => ({ ...prev, transcript: e.target.value }))}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="نص المحتوى للمتابعة..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">النص المكتوب (عربي)</label>
                <textarea
                  value={formData.transcriptAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, transcriptAr: e.target.value }))}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-right"
                  placeholder="نص المحتوى للمتابعة بالعربي..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 accent-[#10B981]"
              />
              <label htmlFor="isPublished" className="text-sm text-gray-700">نشر المحتوى</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                إلغاء
              </Button>
              <Button type="submit" disabled={uploading}>
                <Save className="w-4 h-4 ml-2" />
                {editingContent ? 'تحديث' : 'حفظ'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {showExercisesModal && (
        <Modal
          isOpen={showExercisesModal}
          onClose={() => setShowExercisesModal(false)}
          title="إدارة التمارين"
          size="lg"
        >
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {exercises.map((exercise, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-700">تمرين {index + 1}</span>
                  <button
                    onClick={() => removeExercise(index)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع التمرين</label>
                    <select
                      value={exercise.type}
                      onChange={(e) => updateExercise(index, 'type', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="MULTIPLE_CHOICE">اختيار من متعدد</option>
                      <option value="TRUE_FALSE">صح أو خطأ</option>
                      <option value="FILL_BLANK">ملء الفراغ</option>
                      <option value="WORD_ORDER">ترتيب الكلمات</option>
                    </select>
                  </div>
                  <Input
                    label="النقاط"
                    type="number"
                    value={exercise.points}
                    onChange={(e) => updateExercise(index, 'points', parseInt(e.target.value) || 10)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="السؤال (English)"
                    value={exercise.question}
                    onChange={(e) => updateExercise(index, 'question', e.target.value)}
                  />
                  <Input
                    label="السؤال (عربي)"
                    value={exercise.questionAr}
                    onChange={(e) => updateExercise(index, 'questionAr', e.target.value)}
                    className="text-right"
                  />
                </div>

                {exercise.type === 'MULTIPLE_CHOICE' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">الخيارات</label>
                    <div className="grid grid-cols-2 gap-2">
                      {exercise.options.map((option, optIndex) => (
                        <Input
                          key={optIndex}
                          placeholder={`الخيار ${optIndex + 1}`}
                          value={option}
                          onChange={(e) => updateExerciseOption(index, optIndex, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <Input
                  label="الإجابة الصحيحة"
                  value={exercise.correctAnswer}
                  onChange={(e) => updateExercise(index, 'correctAnswer', e.target.value)}
                  className="mb-4"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="شرح الإجابة (English)"
                    value={exercise.explanation}
                    onChange={(e) => updateExercise(index, 'explanation', e.target.value)}
                  />
                  <Input
                    label="شرح الإجابة (عربي)"
                    value={exercise.explanationAr}
                    onChange={(e) => updateExercise(index, 'explanationAr', e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addExercise} className="w-full">
              <Plus className="w-4 h-4 ml-2" />
              إضافة تمرين جديد
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => setShowExercisesModal(false)}>
              إلغاء
            </Button>
            <Button onClick={saveExercises}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التمارين
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
