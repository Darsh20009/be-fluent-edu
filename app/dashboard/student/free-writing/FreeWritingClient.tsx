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
        alert('✓ Writing submitted successfully!\n\nتم إرسال الكتابة بنجاح!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit writing')
      }
    } catch (error) {
      console.error('Error submitting writing:', error)
      alert('An error occurred / حدث خطأ')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg border-2 border-[#E5E7EB]">
          <div className="mb-4 flex justify-center">
            <div className="bg-purple-500 p-4 rounded-full">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#10B981] mb-3">Premium Feature</h2>
          <p className="text-gray-700 mb-6">
            هذه الميزة متاحة فقط للمشتركين / This feature is only available for subscribers
          </p>
          <a
            href="/dashboard/student?tab=packages"
            className="block w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            ✨ اشترك الآن / Subscribe Now ✨
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
      <div className="min-h-screen bg-[#F9FAFB]">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Link href="/dashboard/student">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard / العودة للوحة التحكم
            </Button>
          </Link>
          
          <Alert variant="warning">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <p className="font-bold text-lg mb-2">Database Migration Required</p>
              <p className="font-bold text-lg mb-4">يتطلب ترحيل قاعدة البيانات</p>
              <p className="mb-2">
                The Free Writing feature requires a database migration to be applied.
              </p>
              <p className="mb-4">
                تتطلب ميزة الكتابة الحرة تطبيق ترحيل قاعدة البيانات.
              </p>
              <p className="font-semibold mb-2">
                Please see <strong>MIGRATION_INSTRUCTIONS.md</strong> in the project root for detailed instructions.
              </p>
              <p className="font-semibold">
                يرجى الاطلاع على ملف <strong>MIGRATION_INSTRUCTIONS.md</strong> في جذر المشروع للحصول على تعليمات مفصلة.
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard / العودة للوحة التحكم
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#10B981] mb-2">
                Free Writing / الكتابة الحرة
              </h1>
              <p className="text-gray-600">
                Write freely on any topic and get feedback from your teacher
                <br />
                اكتب بحرية في أي موضوع واحصل على ملاحظات من معلمك
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowNewWriting(true)}
              className="shadow-lg"
            >
              <Send className="h-5 w-5 mr-2" />
              Write New Article / اكتب مقالة جديدة
            </Button>
          </div>
        </div>

        {/* Under Review Section */}
        {pendingWritings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Under Review / قيد المراجعة ({pendingWritings.length})
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
                          Under Review / قيد المراجعة
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Submitted: {new Date(writing.submittedAt).toLocaleString('ar-EG', {
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
                      View / عرض
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
            Graded / تم التقييم ({gradedWritings.length})
          </h2>
          {gradedWritings.length === 0 ? (
            <Alert variant="info">
              <FileText className="h-5 w-5" />
              <p>No graded writings yet. Start writing to get feedback!</p>
              <p>لا توجد كتابات مقيمة بعد. ابدأ الكتابة للحصول على ملاحظات!</p>
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
                          Grade: {writing.grade}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Graded: {writing.gradedAt && new Date(writing.gradedAt).toLocaleString('ar-EG')}
                      </p>
                      {writing.TeacherProfile && (
                        <p className="text-sm text-gray-600 mb-2">
                          Teacher: {writing.TeacherProfile.User.name}
                        </p>
                      )}
                      {writing.feedback && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Feedback / الملاحظات:
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
                      View Details / عرض التفاصيل
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
            title="Write New Article / اكتب مقالة جديدة"
            size="lg"
          >
            <div className="space-y-4">
              {/* Suggested Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  Suggested Topics / مواضيع مقترحة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_TOPICS.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => setTitle(topic.en)}
                      className="text-left p-2 border border-gray-300 rounded-lg hover:border-[#10B981] hover:bg-blue-50 transition-colors text-sm"
                    >
                      <p className="font-medium text-gray-900">{topic.en}</p>
                      <p className="text-xs text-gray-600">{topic.ar}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Article Title / عنوان المقالة *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="Enter your own title... / أدخل عنوانك الخاص..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Your Writing / كتابتك *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  rows={15}
                  placeholder="Start writing here... Write at least 100 words for best feedback.\n\nابدأ الكتابة هنا... اكتب ما لا يقل عن 100 كلمة للحصول على أفضل ملاحظات."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Word count: {content.trim().split(/\s+/).filter(Boolean).length} words
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
                  {submitting ? 'Submitting...' : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Writing / إرسال الكتابة
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
                  Cancel / إلغاء
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
                  {viewingWriting.grade !== null ? `Grade: ${viewingWriting.grade}/100` : 'Under Review'}
                </Badge>
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(viewingWriting.submittedAt).toLocaleString('ar-EG')}
                </p>
              </div>

              {viewingWriting.grammarErrors && JSON.parse(viewingWriting.grammarErrors).length > 0 ? (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Your Writing with Corrections:</p>
                  <GrammarErrorHighlighter
                    studentAnswer={viewingWriting.content}
                    errors={JSON.parse(viewingWriting.grammarErrors)}
                    onErrorsChange={() => {}}
                    readonly={true}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Writing:</p>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{viewingWriting.content}</p>
                </div>
              )}

              {viewingWriting.feedback && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Teacher Feedback / ملاحظات المعلم:
                  </p>
                  <p className="text-blue-800 dark:text-blue-200">{viewingWriting.feedback}</p>
                </div>
              )}

              <Button variant="outline" fullWidth onClick={() => setViewingWriting(null)}>
                Close / إغلاق
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
