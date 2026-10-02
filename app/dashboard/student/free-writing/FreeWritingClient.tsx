'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Send, FileText, CheckCircle, Clock, AlertTriangle, ArrowLeft, Sparkles 
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import GrammarErrorHighlighter from '@/components/GrammarErrorHighlighter'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

interface FreeWriting {
  id: string
  title: string
  content: string
  grade: number | null
  feedback: string | null
  grammarErrors: string | null
  submittedAt: string
  gradedAt: string | null
  TeacherProfile: {
    User: {
      name: string
      email: string
    }
  } | null
}

const SUGGESTED_TOPICS = [
  { en: 'My Favorite Book', ar: 'كتابي المفضل' },
  { en: 'A Memorable Journey', ar: 'رحلة لا تنسى' },
  { en: 'My Dream Job', ar: 'وظيفة أحلامي' },
  { en: 'Technology in Our Lives', ar: 'التكنولوجيا في حياتنا' },
  { en: 'The Importance of Learning English', ar: 'أهمية تعلم اللغة الإنجليزية' },
  { en: 'My Best Friend', ar: 'أفضل صديق لي' },
  { en: 'A Day in My Life', ar: 'يوم في حياتي' },
  { en: 'My Hometown', ar: 'مسقط رأسي' },
]

export default function FreeWritingClient() {
  const router = useRouter()
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [writings, setWritings] = useState<FreeWriting[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewWriting, setShowNewWriting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [viewingWriting, setViewingWriting] = useState<FreeWriting | null>(null)
  const [migrationError, setMigrationError] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    checkSubscription()
    fetchWritings()
  }, [])

  async function checkSubscription() {
    try {
      const response = await fetch('/api/student/subscription-status')
      if (response.ok) {
        const data = await response.json()
        setHasSubscription(data.hasApprovedSubscription)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  async function fetchWritings() {
    try {
      const response = await fetch('/api/student/free-writing')
      if (response.ok) {
        const data = await response.json()
        setWritings(data.writings || [])
        setMigrationError(false)
      } else if (response.status === 500) {
        // Likely migration not applied
        setMigrationError(true)
      }
    } catch (error) {
      console.error('Error fetching free writings:', error)
      setMigrationError(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/student/free-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })

      if (response.ok) {
        await fetchWritings()
        setTitle('')
        setContent('')
        setShowNewWriting(false)
        toast.success(t('تم إرسال الكتابة بنجاح!', 'Writing submitted successfully!'))
      } else {
        const error = await response.json()
        toast.error(error.error || t('فشل إرسال الكتابة', 'Failed to submit writing'))
      }
    } catch (error) {
      console.error('Error submitting writing:', error)
      toast.error(t('حدث خطأ. يرجى المحاولة مرة أخرى.', 'An error occurred. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4" dir={localeDirection(language)}>
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg border-2 border-[#E5E7EB]">
          <div className="mb-4 flex justify-center">
            <div className="bg-purple-500 p-4 rounded-full">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#10B981] mb-3">{t('ميزة للمشتركين', 'Premium feature')}</h2>
          <p className="text-gray-700 mb-6">
            {t('هذه الميزة متاحة للمشتركين فقط', 'This feature is available to subscribers only')}
          </p>
          <a
            href="/dashboard/student?tab=packages"
            className="block w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            ✨ {t('اشترك الآن', 'Subscribe now')} ✨
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (migrationError) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]" dir={localeDirection(language)}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Link href="/dashboard/student">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('العودة للوحة التحكم', 'Back to dashboard')}
            </Button>
          </Link>
          
          <Alert variant="warning">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <p className="font-semibold">
                {t('يتطلب تشغيل ميزة الكتابة الحرة تطبيق ترحيل قاعدة البيانات. يرجى مراجعة ملف تعليمات الترحيل في جذر المشروع.', 'The Free Writing feature requires a database migration. Please see the migration instructions in the project root.')}
              </p>
            </div>
          </Alert>
        </div>
      </div>
    )
  }

  const pendingWritings = writings.filter(w => w.grade === null)
  const gradedWritings = writings.filter(w => w.grade !== null)

  return (
    <div className="min-h-screen bg-[#F9FAFB]" dir={localeDirection(language)}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('العودة للوحة التحكم', 'Back to dashboard')}
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#10B981] mb-2">
                {t('الكتابة الحرة', 'Free writing')}
              </h1>
              <p className="text-gray-600">
                {t('اكتب بحرية في أي موضوع واحصل على ملاحظات من معلمك', 'Write freely on any topic and get feedback from your teacher')}
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowNewWriting(true)}
              className="shadow-lg"
            >
              <Send className="h-5 w-5 mr-2" />
              {t('اكتب مقالة جديدة', 'Write a new article')}
            </Button>
          </div>
        </div>

        {/* Under Review Section */}
        {pendingWritings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t(`قيد المراجعة (${pendingWritings.length})`, `Under review (${pendingWritings.length})`)}
            </h2>
            <div className="space-y-4">
              {pendingWritings.map((writing) => (
                <Card key={writing.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-[#10B981]" />
                        <h3 className="text-lg font-bold text-[#10B981]">{writing.title}</h3>
                        <Badge variant="warning">
                          <Clock className="h-3 w-3 mr-1" />
                          {t('قيد المراجعة', 'Under review')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {t('تاريخ الإرسال: ', 'Submitted: ')}{new Date(writing.submittedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-gray-700 line-clamp-2">{writing.content.substring(0, 150)}...</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingWriting(writing)}
                    >
                      {t('عرض', 'View')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Graded Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t(`تم التقييم (${gradedWritings.length})`, `Graded (${gradedWritings.length})`)}
          </h2>
          {gradedWritings.length === 0 ? (
            <Alert variant="info">
              <FileText className="h-5 w-5" />
              <p>{t('لا توجد كتابات مقيمة بعد. ابدأ الكتابة للحصول على ملاحظات!', 'No graded writings yet. Start writing to get feedback!')}</p>
            </Alert>
          ) : (
            <div className="space-y-4">
              {gradedWritings.map((writing) => (
                <Card key={writing.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <FileText className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900">{writing.title}</h3>
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('الدرجة: ', 'Grade: ')}{writing.grade}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {t('تاريخ التقييم: ', 'Graded: ')}{writing.gradedAt && new Date(writing.gradedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </p>
                      {writing.TeacherProfile && (
                        <p className="text-sm text-gray-600 mb-2">
                          {t('المعلم: ', 'Teacher: ')}{writing.TeacherProfile.User.name}
                        </p>
                      )}
                      {writing.feedback && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            {t('الملاحظات:', 'Feedback:')}
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">{writing.feedback}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingWriting(writing)}
                    >
                      {t('عرض التفاصيل', 'View details')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* New Writing Modal */}
        {showNewWriting && (
          <Modal
            isOpen={true}
            onClose={() => {
              setShowNewWriting(false)
              setTitle('')
              setContent('')
            }}
            title={t('اكتب مقالة جديدة', 'Write a new article')}
            size="lg"
          >
            <div className="space-y-4">
              {/* Suggested Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  {t('مواضيع مقترحة:', 'Suggested topics:')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_TOPICS.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => setTitle(language === 'ar' ? topic.ar : topic.en)}
                      className="text-left p-2 border border-gray-300 rounded-lg hover:border-[#10B981] hover:bg-blue-50 transition-colors text-sm"
                    >
                        <p className="font-medium text-gray-900">{language === 'ar' ? topic.ar : topic.en}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('عنوان المقالة *', 'Article title *')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder={t('أدخل عنوانك الخاص...', 'Enter your own title...')}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {t('كتابتك *', 'Your writing *')}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  rows={15}
                  placeholder={t('ابدأ الكتابة هنا... اكتب ما لا يقل عن 100 كلمة للحصول على أفضل ملاحظات.', 'Start writing here... Write at least 100 words for the best feedback.')}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t(`عدد الكلمات: ${content.trim().split(/\s+/).filter(Boolean).length}`, `Word count: ${content.trim().split(/\s+/).filter(Boolean).length}`)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !content.trim()}
                >
                  {submitting ? t('جارٍ الإرسال...', 'Submitting...') : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t('إرسال الكتابة', 'Submit writing')}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowNewWriting(false)
                    setTitle('')
                    setContent('')
                  }}
                >
                  {t('إلغاء', 'Cancel')}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* View Writing Modal */}
        {viewingWriting && (
          <Modal
            isOpen={true}
            onClose={() => setViewingWriting(null)}
            title={viewingWriting.title}
            size="lg"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={viewingWriting.grade !== null ? 'success' : 'warning'}>
                  {viewingWriting.grade !== null ? t(`الدرجة: ${viewingWriting.grade}/100`, `Grade: ${viewingWriting.grade}/100`) : t('قيد المراجعة', 'Under review')}
                </Badge>
                <p className="text-sm text-gray-600">
                  {t('تاريخ الإرسال: ', 'Submitted: ')}{new Date(viewingWriting.submittedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </p>
              </div>

              {viewingWriting.grammarErrors && JSON.parse(viewingWriting.grammarErrors).length > 0 ? (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">{t('كتابتك مع التصحيحات:', 'Your writing with corrections:')}</p>
                  <GrammarErrorHighlighter
                    studentAnswer={viewingWriting.content}
                    errors={JSON.parse(viewingWriting.grammarErrors)}
                    onErrorsChange={() => {}}
                    readonly={true}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('كتابتك:', 'Your writing:')}</p>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{viewingWriting.content}</p>
                </div>
              )}

              {viewingWriting.feedback && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {t('ملاحظات المعلم:', 'Teacher feedback:')}
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">{viewingWriting.feedback}</p>
                </div>
              )}

              <Button variant="outline" fullWidth onClick={() => setViewingWriting(null)}>
                {t('إغلاق', 'Close')}
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
