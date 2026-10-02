'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import { toast } from 'react-hot-toast'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

interface WritingTest {
  id: string
  title: string
  titleAr: string | null
  instructions: string | null
  instructionsAr: string | null
  dueDate: string | null
  createdAt: string
  WritingTestSubmission: WritingTestSubmission[]
}

interface WritingTestSubmission {
  id: string
  content: string
  grade: number | null
  feedback: string | null
  submittedAt: string
  gradedAt: string | null
}

export default function MyWritingsPage() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [tests, setTests] = useState<WritingTest[]>([])
  const [submissions, setSubmissions] = useState<WritingTestSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTest, setSelectedTest] = useState<WritingTest | null>(null)
  const [writingContent, setWritingContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [viewingSubmission, setViewingSubmission] = useState<WritingTestSubmission | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [testsRes, submissionsRes] = await Promise.all([
        fetch('/api/student/writing-tests'),
        fetch('/api/student/writings/my-submissions')
      ])

      if (testsRes.ok) {
        const testsData = await testsRes.json()
        setTests(testsData)
      } else {
        toast.error(t('فشل تحميل مواضيع الكتابة. يرجى المحاولة مرة أخرى.', 'Could not load writing topics. Please try again.'))
      }

      if (submissionsRes.ok) {
        const subsData = await submissionsRes.json()
        setSubmissions(subsData)
      } else {
        toast.error(t('فشل تحميل كتاباتك. يرجى المحاولة مرة أخرى.', 'Could not load your writing submissions. Please try again.'))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(t('خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.', 'Network error. Check your connection and try again.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!selectedTest || !writingContent.trim()) {
      toast.error(t('يرجى كتابة المحتوى قبل الإرسال.', 'Please write your response before submitting.'))
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/student/writing-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: selectedTest.id,
          content: writingContent
        })
      })

      if (response.ok) {
        toast.success(t('تم إرسال كتابتك للمدرس بنجاح!', 'Your writing was sent to the teacher successfully!'))
        setSelectedTest(null)
        setWritingContent('')
        await fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || t('فشل إرسال الكتابة. يرجى المحاولة مرة أخرى.', 'Could not submit your writing. Please try again.'))
      }
    } catch (error) {
      console.error('Error submitting writing:', error)
      toast.error(t('خطأ في الشبكة. لم يتم إرسال كتابتك.', 'Network error. Your writing was not submitted.'))
    } finally {
      setSubmitting(false)
    }
  }

  function getStatusBadge(submission: WritingTestSubmission | undefined) {
    if (!submission) {
      return <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />{t('لم يُرسل', 'Not submitted')}</Badge>
    }
    if (submission.gradedAt && submission.grade !== null) {
      return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />{t('تم التصحيح', 'Graded')}</Badge>
    }
    return <Badge variant="info"><Clock className="h-3 w-3 mr-1" />{t('قيد المراجعة', 'Under review')}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-[#10B981]" />
          <h1 className="text-3xl font-bold text-[#10B981]">{t('كتاباتي', 'My writing')}</h1>
        </div>
        <p className="text-gray-600">{t('اطّلع على مهام الكتابة وأرسل إجاباتك', 'View and submit your writing assignments')}</p>
      </div>

      {selectedTest && (
        <Card variant="elevated" className="mb-6 bg-blue-50 border-blue-300">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{selectedTest.title}</h2>
                {selectedTest.titleAr && (
                  <h3 className="text-lg text-gray-700">{selectedTest.titleAr}</h3>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedTest(null)
                setWritingContent('')
              }}>
                {t('إلغاء', 'Cancel')}
              </Button>
            </div>

            {selectedTest.instructions && (
              <Alert variant="info" className="mb-4">
                <div className="text-sm">
                  <p className="font-semibold mb-1">{t('التعليمات:', 'Instructions:')}</p>
                  <p>{language === 'ar' ? selectedTest.instructionsAr || selectedTest.instructions : selectedTest.instructions}</p>
                </div>
              </Alert>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('كتابتك', 'Your writing')}
            </label>
            <textarea
              value={writingContent}
              onChange={(e) => setWritingContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              rows={12}
              placeholder={t('اكتب مقالك هنا...', 'Write your essay here...')}
            />
            <p className="text-sm text-gray-500 mt-2">
              {writingContent.split(/\s+/).filter(w => w.length > 0).length} {t('كلمة', 'words')}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!writingContent.trim() || submitting}
            >
              {submitting ? t('جارٍ الإرسال...', 'Submitting...') : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  {t('إرسال للمدرس', 'Submit to teacher')}
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {viewingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{t('تفاصيل الكتابة', 'Writing details')}</h3>
                <Button variant="outline" size="sm" onClick={() => setViewingSubmission(null)}>
                  {t('إغلاق', 'Close')}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">{t('تاريخ التسليم:', 'Submitted on:')}</p>
                  <p className="font-semibold">{new Date(viewingSubmission.submittedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{t('كتابتك:', 'Your writing:')}</h4>
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{viewingSubmission.content}</p>
                  </div>
                </div>

                {viewingSubmission.gradedAt && viewingSubmission.grade !== null && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-2">{t('الدرجة:', 'Grade:')}</p>
                      <p className="text-3xl font-bold text-green-600">{viewingSubmission.grade} / 100</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('تاريخ التصحيح: ', 'Graded on: ')}{new Date(viewingSubmission.gradedAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </p>
                    </div>

                    {viewingSubmission.feedback && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t('ملاحظات المدرس:', 'Teacher feedback:')}</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="whitespace-pre-wrap">{viewingSubmission.feedback}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!viewingSubmission.gradedAt && (
                  <Alert variant="info">
                    <Clock className="h-5 w-5" />
                    <p>{t('مدرسك يراجع كتابتك. سيتم إشعارك بمجرد التصحيح.', 'Your teacher is reviewing your writing. You will be notified once it is graded.')}</p>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('المواضيع المتاحة', 'Available topics')}
          </h2>
          {tests.length === 0 ? (
            <Alert variant="info">
              <AlertCircle className="h-5 w-5" />
              <p>{t('لا توجد مواضيع كتابة متاحة حالياً. سيقوم مدرسك بإنشاء مواضيع لك.', 'No writing topics are available yet. Your teacher will create topics for you.')}</p>
            </Alert>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => {
                const submission = test.WritingTestSubmission[0]
                return (
                  <Card key={test.id} variant="elevated">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{language === 'ar' ? test.titleAr || test.title : test.title}</h3>
                        </div>
                        {getStatusBadge(submission)}
                      </div>

                      {test.dueDate && (
                        <p className="text-sm text-gray-500 mb-3">
                          {t('الموعد: ', 'Due: ')}{new Date(test.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {!submission ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedTest(test)}
                          >
                            <FileText className="h-4 w-4 ml-2" />
                            {t('ابدأ الكتابة', 'Start writing')}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingSubmission(submission)}
                          >
                            {t('عرض الإجابة', 'View submission')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t(`كتاباتي المُرسلة (${submissions.length})`, `My submissions (${submissions.length})`)}
          </h2>
          {submissions.length === 0 ? (
            <Alert variant="info">
              <FileText className="h-5 w-5" />
              <p>{t('لم ترسل أي كتابات بعد.', 'You have not submitted any writing yet.')}</p>
            </Alert>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id} variant="elevated">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {new Date(submission.submittedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                        {submission.gradedAt && submission.grade !== null && (
                          <p className="font-bold text-green-600 text-lg mt-1">
                            {t('الدرجة: ', 'Grade: ')}{submission.grade} / 100
                          </p>
                        )}
                      </div>
                      {submission.gradedAt && submission.grade !== null ? (
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('تم التصحيح', 'Graded')}
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Clock className="h-3 w-3 mr-1" />
                          {t('قيد المراجعة', 'Pending')}
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingSubmission(submission)}
                    >
                      {t('عرض التفاصيل', 'View details')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
