'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, BookOpen, Video, FileText, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import toast from 'react-hot-toast'

interface Lesson {
  id: string
  title: string
  titleAr: string
  description: string | null
  descriptionAr: string | null
  order: number
  level: string
  category: string | null
  categoryAr: string | null
  videoUrl: string | null
  videoDuration: number | null
  articleContent: string | null
  articleContentAr: string | null
  thumbnailUrl: string | null
  isPublished: boolean
  exerciseCount: number
  studentsCount: number
}

interface Exercise {
  id: string
  type: string
  order: number
  question: string
  questionAr: string | null
  options: string | null
  correctAnswer: string
  explanation: string | null
  explanationAr: string | null
  sentence: string | null
  sentenceAr: string | null
  dragItems: string | null
  blanks: string | null
  points: number
}

interface LessonsTabProps {
  isActive: boolean
}

export default function LessonsTab({ isActive }: LessonsTabProps) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showExerciseForm, setShowExerciseForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; type: 'lesson' | 'exercise'; id?: string }>({ open: false, type: 'lesson' })

  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    level: 'BEGINNER',
    category: '',
    categoryAr: '',
    videoUrl: '',
    videoDuration: '',
    articleContent: '',
    articleContentAr: '',
    thumbnailUrl: '',
    isPublished: false
  })

  const [exerciseForm, setExerciseForm] = useState({
    type: 'MULTIPLE_CHOICE',
    question: '',
    questionAr: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    explanationAr: '',
    sentence: '',
    sentenceAr: '',
    dragItems: [''],
    blanks: [''],
    points: 10
  })

  useEffect(() => {
    if (isActive) {
      fetchLessons()
    }
  }, [isActive])

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/admin/lessons')
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExercises = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}/exercises`)
      if (response.ok) {
        const data = await response.json()
        setExercises(data)
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingLesson 
        ? `/api/admin/lessons/${editingLesson.id}` 
        : '/api/admin/lessons'
      const method = editingLesson ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          videoDuration: formData.videoDuration ? parseInt(formData.videoDuration) : null
        })
      })

      if (response.ok) {
        fetchLessons()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
    }
  }

  const handleDelete = (id: string) => {
    setConfirmModal({ open: true, type: 'lesson', id })
  }

  const doDeleteLesson = async () => {
    const id = confirmModal.id
    if (!id) return
    setConfirmModal({ open: false, type: 'lesson' })
    try {
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('تم حذف الدرس')
        fetchLessons()
      } else {
        toast.error('فشل حذف الدرس')
      }
    } catch (error) {
      toast.error('خطأ في الحذف')
    }
  }

  const togglePublish = async (lesson: Lesson) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !lesson.isPublished })
      })
      if (response.ok) {
        fetchLessons()
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
    }
  }

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      titleAr: lesson.titleAr,
      description: lesson.description || '',
      descriptionAr: lesson.descriptionAr || '',
      level: lesson.level,
      category: lesson.category || '',
      categoryAr: lesson.categoryAr || '',
      videoUrl: lesson.videoUrl || '',
      videoDuration: lesson.videoDuration?.toString() || '',
      articleContent: lesson.articleContent || '',
      articleContentAr: lesson.articleContentAr || '',
      thumbnailUrl: lesson.thumbnailUrl || '',
      isPublished: lesson.isPublished
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingLesson(null)
    setFormData({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      level: 'BEGINNER',
      category: '',
      categoryAr: '',
      videoUrl: '',
      videoDuration: '',
      articleContent: '',
      articleContentAr: '',
      thumbnailUrl: '',
      isPublished: false
    })
  }

  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expandedLesson) return

    try {
      const exerciseData: Record<string, unknown> = {
        type: exerciseForm.type,
        question: exerciseForm.question,
        questionAr: exerciseForm.questionAr,
        correctAnswer: exerciseForm.correctAnswer,
        explanation: exerciseForm.explanation,
        explanationAr: exerciseForm.explanationAr,
        points: exerciseForm.points
      }

      if (exerciseForm.type === 'MULTIPLE_CHOICE' || exerciseForm.type === 'TRUE_FALSE') {
        exerciseData.options = exerciseForm.options.filter(o => o.trim())
      }
      if (exerciseForm.type === 'FILL_BLANK') {
        exerciseData.sentence = exerciseForm.sentence
        exerciseData.blanks = exerciseForm.blanks.filter(b => b.trim())
      }
      if (exerciseForm.type === 'DRAG_DROP') {
        exerciseData.dragItems = exerciseForm.dragItems.filter(d => d.trim())
        exerciseData.correctAnswer = JSON.stringify(exerciseData.dragItems)
      }
      if (exerciseForm.type === 'SENTENCE_READING') {
        exerciseData.sentence = exerciseForm.sentence
        exerciseData.sentenceAr = exerciseForm.sentenceAr
        exerciseData.correctAnswer = 'completed'
      }

      if (editingExercise) {
        await fetch(`/api/admin/lessons/${expandedLesson}/exercises`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseId: editingExercise.id, ...exerciseData })
        })
      } else {
        await fetch(`/api/admin/lessons/${expandedLesson}/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exerciseData)
        })
      }

      fetchExercises(expandedLesson)
      resetExerciseForm()
    } catch (error) {
      console.error('Error saving exercise:', error)
    }
  }

  const handleDeleteExercise = (exerciseId: string) => {
    if (!expandedLesson) return
    setConfirmModal({ open: true, type: 'exercise', id: exerciseId })
  }

  const doDeleteExercise = async () => {
    const exerciseId = confirmModal.id
    if (!exerciseId || !expandedLesson) return
    setConfirmModal({ open: false, type: 'exercise' })
    try {
      await fetch(`/api/admin/lessons/${expandedLesson}/exercises?exerciseId=${exerciseId}`, {
        method: 'DELETE'
      })
      toast.success('تم حذف التمرين')
      fetchExercises(expandedLesson)
    } catch (error) {
      toast.error('خطأ في حذف التمرين')
    }
  }

  const resetExerciseForm = () => {
    setShowExerciseForm(false)
    setEditingExercise(null)
    setExerciseForm({
      type: 'MULTIPLE_CHOICE',
      question: '',
      questionAr: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      explanationAr: '',
      sentence: '',
      sentenceAr: '',
      dragItems: [''],
      blanks: [''],
      points: 10
    })
  }

  const toggleExpand = (lessonId: string) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null)
      setExercises([])
    } else {
      setExpandedLesson(lessonId)
      fetchExercises(lessonId)
    }
  }

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      BEGINNER: 'مبتدئ',
      INTERMEDIATE: 'متوسط',
      ADVANCED: 'متقدم'
    }
    return labels[level] || level
  }

  const getExerciseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MULTIPLE_CHOICE: 'اختيار من متعدد',
      FILL_BLANK: 'ملء الفراغ',
      DRAG_DROP: 'سحب وإفلات',
      SENTENCE_READING: 'قراءة جمل',
      TRUE_FALSE: 'صح أو خطأ'
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981]"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">إدارة الدروس</h2>
          <p className="text-sm text-gray-600">Manage Lessons</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#003A6A] transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة درس جديد
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">
            {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان الدرس (English)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان الدرس (العربية)
                </label>
                <input
                  type="text"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  dir="rtl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المستوى
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                >
                  <option value="BEGINNER">مبتدئ</option>
                  <option value="INTERMEDIATE">متوسط</option>
                  <option value="ADVANCED">متقدم</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفئة (English)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="Grammar, Vocabulary..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الفئة (العربية)
                </label>
                <input
                  type="text"
                  value={formData.categoryAr}
                  onChange={(e) => setFormData({ ...formData, categoryAr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  dir="rtl"
                  placeholder="قواعد، مفردات..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط الفيديو
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مدة الفيديو (بالثواني)
                </label>
                <input
                  type="number"
                  value={formData.videoDuration}
                  onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                محتوى المقال (العربية)
              </label>
              <textarea
                value={formData.articleContentAr}
                onChange={(e) => setFormData({ ...formData, articleContentAr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                rows={4}
                dir="rtl"
                placeholder="يمكنك استخدام HTML..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                محتوى المقال (English)
              </label>
              <textarea
                value={formData.articleContent}
                onChange={(e) => setFormData({ ...formData, articleContent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                rows={4}
                placeholder="You can use HTML..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-[#10B981] border-gray-300 rounded focus:ring-[#10B981]"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                نشر الدرس (مرئي للطلاب)
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#003A6A] transition-colors"
              >
                {editingLesson ? 'حفظ التعديلات' : 'إضافة الدرس'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {lessons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد دروس</h3>
            <p className="text-gray-500">ابدأ بإضافة درس جديد</p>
          </div>
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-800">{lesson.titleAr}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      lesson.isPublished 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lesson.isPublished ? 'منشور' : 'مسودة'}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                      {getLevelLabel(lesson.level)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{lesson.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {lesson.videoUrl && (
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        فيديو
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {lesson.exerciseCount} تمرين
                    </span>
                    <span>{lesson.studentsCount} طالب</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(lesson)}
                    className={`p-2 rounded-lg transition-colors ${
                      lesson.isPublished 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={lesson.isPublished ? 'إلغاء النشر' : 'نشر'}
                  >
                    {lesson.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleExpand(lesson.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedLesson === lesson.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {expandedLesson === lesson.id && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-700">التمارين</h4>
                    <button
                      onClick={() => setShowExerciseForm(true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#10B981] text-white rounded-lg hover:bg-[#003A6A] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة تمرين
                    </button>
                  </div>

                  {showExerciseForm && (
                    <div className="bg-white rounded-lg p-4 mb-4 border">
                      <form onSubmit={handleExerciseSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              نوع التمرين
                            </label>
                            <select
                              value={exerciseForm.type}
                              onChange={(e) => setExerciseForm({ ...exerciseForm, type: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                            >
                              <option value="MULTIPLE_CHOICE">اختيار من متعدد</option>
                              <option value="FILL_BLANK">ملء الفراغ</option>
                              <option value="DRAG_DROP">سحب وإفلات</option>
                              <option value="SENTENCE_READING">قراءة جمل</option>
                              <option value="TRUE_FALSE">صح أو خطأ</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              النقاط
                            </label>
                            <input
                              type="number"
                              value={exerciseForm.points}
                              onChange={(e) => setExerciseForm({ ...exerciseForm, points: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            السؤال (English)
                          </label>
                          <input
                            type="text"
                            value={exerciseForm.question}
                            onChange={(e) => setExerciseForm({ ...exerciseForm, question: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            السؤال (العربية)
                          </label>
                          <input
                            type="text"
                            value={exerciseForm.questionAr}
                            onChange={(e) => setExerciseForm({ ...exerciseForm, questionAr: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                            dir="rtl"
                          />
                        </div>

                        {(exerciseForm.type === 'MULTIPLE_CHOICE' || exerciseForm.type === 'TRUE_FALSE') && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                الخيارات
                              </label>
                              {exerciseForm.options.map((option, index) => (
                                <input
                                  key={index}
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...exerciseForm.options]
                                    newOptions[index] = e.target.value
                                    setExerciseForm({ ...exerciseForm, options: newOptions })
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent mb-2"
                                  placeholder={`الخيار ${index + 1}`}
                                />
                              ))}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                الإجابة الصحيحة
                              </label>
                              <input
                                type="text"
                                value={exerciseForm.correctAnswer}
                                onChange={(e) => setExerciseForm({ ...exerciseForm, correctAnswer: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                                required
                              />
                            </div>
                          </>
                        )}

                        {exerciseForm.type === 'FILL_BLANK' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                الجملة (استخدم ___ للفراغ)
                              </label>
                              <input
                                type="text"
                                value={exerciseForm.sentence}
                                onChange={(e) => setExerciseForm({ ...exerciseForm, sentence: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                                placeholder="I ___ to school every day."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                الإجابات الصحيحة (للفراغات بالترتيب)
                              </label>
                              {exerciseForm.blanks.map((blank, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={blank}
                                    onChange={(e) => {
                                      const newBlanks = [...exerciseForm.blanks]
                                      newBlanks[index] = e.target.value
                                      setExerciseForm({ ...exerciseForm, blanks: newBlanks })
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                                    placeholder={`الفراغ ${index + 1}`}
                                  />
                                  {index === exerciseForm.blanks.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setExerciseForm({ ...exerciseForm, blanks: [...exerciseForm.blanks, ''] })}
                                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                    >
                                      +
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {exerciseForm.type === 'DRAG_DROP' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              العناصر للترتيب (بالترتيب الصحيح)
                            </label>
                            {exerciseForm.dragItems.map((item, index) => (
                              <div key={index} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newItems = [...exerciseForm.dragItems]
                                    newItems[index] = e.target.value
                                    setExerciseForm({ ...exerciseForm, dragItems: newItems })
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                                  placeholder={`العنصر ${index + 1}`}
                                />
                                {index === exerciseForm.dragItems.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setExerciseForm({ ...exerciseForm, dragItems: [...exerciseForm.dragItems, ''] })}
                                    className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {exerciseForm.type === 'SENTENCE_READING' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                الجملة (English)
                              </label>
                              <input
                                type="text"
                                value={exerciseForm.sentence}
                                onChange={(e) => setExerciseForm({ ...exerciseForm, sentence: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                الترجمة (العربية)
                              </label>
                              <input
                                type="text"
                                value={exerciseForm.sentenceAr}
                                onChange={(e) => setExerciseForm({ ...exerciseForm, sentenceAr: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                                dir="rtl"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            التوضيح (العربية)
                          </label>
                          <textarea
                            value={exerciseForm.explanationAr}
                            onChange={(e) => setExerciseForm({ ...exerciseForm, explanationAr: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                            rows={2}
                            dir="rtl"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#003A6A] transition-colors"
                          >
                            {editingExercise ? 'حفظ' : 'إضافة'}
                          </button>
                          <button
                            type="button"
                            onClick={resetExerciseForm}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {exercises.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">لا توجد تمارين</p>
                  ) : (
                    <div className="space-y-2">
                      {exercises.map((exercise, index) => (
                        <div key={exercise.id} className="bg-white rounded-lg p-3 border flex items-center gap-3">
                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{exercise.questionAr || exercise.question}</p>
                            <p className="text-sm text-gray-500">{getExerciseTypeLabel(exercise.type)}</p>
                          </div>
                          <span className="text-sm text-[#10B981] font-medium">{exercise.points} نقطة</span>
                          <button
                            onClick={() => handleDeleteExercise(exercise.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: confirmModal.type })}
        onConfirm={confirmModal.type === 'exercise' ? doDeleteExercise : doDeleteLesson}
        title={confirmModal.type === 'exercise' ? 'حذف التمرين' : 'حذف الدرس'}
        message={
          confirmModal.type === 'exercise'
            ? 'هل أنت متأكد من حذف هذا التمرين؟ لا يمكن التراجع عن هذا الإجراء.'
            : 'هل أنت متأكد من حذف هذا الدرس؟ سيتم حذف جميع التمارين المرتبطة به.'
        }
        confirmText="حذف"
        cancelText="إلغاء"
        variant="danger"
      />
    </div>
  )
}
