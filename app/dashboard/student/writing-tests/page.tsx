'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, Send, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
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
  WritingTestSubmission: Array<{
    id: string
    content: string
    manuscriptUrl: string | null
    grade: number | null
    feedback: string | null
    grammarErrors: string | null
    submittedAt: string
    gradedAt: string | null
  }>
}

export default function WritingTestsPage() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [tests, setTests] = useState<WritingTest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTest, setSelectedTest] = useState<WritingTest | null>(null)
  const [content, setContent] = useState('')
  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null)
  const [manuscriptPreview, setManuscriptPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [viewingSubmission, setViewingSubmission] = useState<WritingTest['WritingTestSubmission'][0] | null>(null)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    checkSubscription()
    fetchTests()
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

  async function fetchTests() {
    try {
      const response = await fetch('/api/student/writing-tests')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setTests(data)
        } else {
          console.error('Invalid response format:', data)
          setTests([])
        }
      } else {
        console.error('Failed to fetch tests, status:', response.status)
        setTests([])
      }
    } catch (error) {
      console.error('Error fetching writing tests:', error)
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!selectedTest || !content.trim()) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('testId', selectedTest.id)
      formData.append('content', content)
      if (manuscriptFile) {
        formData.append('manuscript', manuscriptFile)
      }

      const response = await fetch('/api/student/writing-tests-submit', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await fetchTests()
        setContent('')
        setManuscriptFile(null)
        setManuscriptPreview(null)
        setSelectedTest(null)
        toast.success(t('تم إرسال اختبار الكتابة بنجاح!', 'Writing test submitted successfully!'))
      } else {
        const error = await response.json()
        toast.error(error.error || t('فشل إرسال الاختبار', 'Failed to submit test'))
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      toast.error(t('حدث خطأ. يرجى المحاولة مرة أخرى.', 'An error occurred. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  function handleManuscriptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setManuscriptFile(file)
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setManuscriptPreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setManuscriptPreview(null)
      }
    }
  }

  const pendingTests = tests.filter(t => t.WritingTestSubmission.length === 0)
  const submittedTests = tests.filter(t => t.WritingTestSubmission.length > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg border-2 border-[#E5E7EB]">
          <div className="mb-4 flex justify-center">
            <div className="bg-blue-500 p-4 rounded-full">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#10B981] mb-3">{t('ميزة للمشتركين', 'Premium feature')}</h2>
          <p className="text-gray-700 mb-6">
            {t('هذه الميزة متاحة فقط للمشتركين', 'This feature is only available to subscribers')}
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-[#F5F5DC] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#10B981] mb-2">
          {t('اختبارات الكتابة', 'Writing tests')}
        </h1>
        <p className="text-gray-600">{t('أكمل اختبارات الكتابة واطّلع على الملاحظات', 'Complete your writing tests and view feedback')}</p>
      </div>

      {tests.length === 0 && !loading && (
        <Alert variant="info">
          <FileText className="h-5 w-5" />
          <div>
            <p className="font-semibold">{t('لا توجد اختبارات كتابة', 'No writing tests available')}</p>
            <p className="text-sm">{t('لم ينشئ معلمك اختبارات كتابة بعد، أو ليس لديك اشتراك نشط.', 'Your teacher has not created any writing tests yet, or you do not have an active subscription.')}</p>
          </div>
        </Alert>
      )}

      {pendingTests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('اختبارات معلقة', 'Pending tests')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingTests.map((test) => {
              const isOverdue = test.dueDate && new Date(test.dueDate) < new Date()
              return (
                <Card key={test.id} variant="elevated">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{language === 'ar' ? test.titleAr || test.title : test.title}</h3>
                    </div>
                    {isOverdue ? (
                      <Badge variant="error">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {t('متأخر', 'Overdue')}
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('معلق', 'Pending')}
                      </Badge>
                    )}
                  </div>

                  {test.instructions && (
                    <div className="mb-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{language === 'ar' ? test.instructionsAr || test.instructions : test.instructions}</p>
                    </div>
                  )}

                  {test.dueDate && (
                    <p className="text-sm text-gray-600 mb-3">
                      {t('موعد التسليم: ', 'Due: ')}{new Date(test.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  )}

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setSelectedTest(test)}
                  >
                    <FileText className="h-4 w-4 ml-2" />
                    {t('ابدأ الكتابة', 'Start writing')}
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {submittedTests.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('الاختبارات المرسلة', 'Submitted tests')}
          </h2>
          <div className="space-y-4">
            {submittedTests.map((test) => {
              const submission = test.WritingTestSubmission[0]
              return (
                <Card key={test.id} variant="elevated">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{language === 'ar' ? test.titleAr || test.title : test.title}</h3>
                    </div>
                    {submission.grade !== null ? (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('الدرجة: ', 'Graded: ')}{submission.grade}/100
                      </Badge>
                    ) : (
                      <Badge variant="info">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('قيد المراجعة', 'Under review')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span>{t('تاريخ الإرسال: ', 'Submitted: ')}{new Date(submission.submittedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    {submission.gradedAt && (
                      <span>• {t('تم التصحيح: ', 'Graded: ')}{new Date(submission.gradedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setViewingSubmission(submission)}
                  >
                    {t('عرض الإجابة والملاحظات', 'View submission & feedback')}
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {selectedTest && (
        <Modal
          isOpen={!!selectedTest}
          onClose={() => {
            setSelectedTest(null)
            setContent('')
          }}
          title={`${t('اكتب: ', 'Write: ')}${language === 'ar' ? selectedTest.titleAr || selectedTest.title : selectedTest.title}`}
        >
          <div className="space-y-4">
            {selectedTest.instructions && (
              <Alert variant="info">
                <div>
                  <p className="font-semibold mb-1">{t('التعليمات:', 'Instructions:')}</p>
                  <p className="text-sm">{language === 'ar' ? selectedTest.instructionsAr || selectedTest.instructions : selectedTest.instructions}</p>
                </div>
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('كتابتك', 'Your writing')}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                rows={12}
                placeholder={t('ابدأ الكتابة هنا...', 'Start writing here...')}
              />
              <p className="text-sm text-gray-500 mt-1">
                {t('عدد الكلمات: ', 'Word count: ')}{content.trim().split(/\s+/).filter(Boolean).length}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {t('إجابة مكتوبة بخط اليد (اختياري)', 'Handwritten answer (optional)')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleManuscriptChange}
                  className="hidden"
                  id="manuscript-upload"
                />
                <label htmlFor="manuscript-upload" className="cursor-pointer">
                  {manuscriptFile ? (
                    <div>
                      <p className="text-sm font-medium text-green-600">✓ {manuscriptFile.name}</p>
                      {manuscriptPreview && (
                        <img
                          src={manuscriptPreview}
                           alt={t('معاينة الإجابة المكتوبة', 'Handwritten answer preview')}
                          className="mt-2 max-h-48 mx-auto rounded"
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">{t('ارفع الإجابة المكتوبة بخط اليد', 'Upload handwritten answer')}</p>
                      <p className="text-xs text-gray-500 mt-1">{t('صور أو ملف PDF', 'Images or PDF')}</p>
                    </div>
                  )}
                </label>
              </div>
              {manuscriptFile && (
                <button
                  onClick={() => {
                    setManuscriptFile(null)
                    setManuscriptPreview(null)
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                   ✕ {t('إزالة الملف', 'Remove file')}
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
              >
                {submitting ? t('جارٍ الإرسال...', 'Submitting...') : (
                  <>
                    <Send className="h-4 w-4 ml-2" />
                    {t('إرسال الكتابة', 'Submit writing')}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setSelectedTest(null)
                  setContent('')
                }}
              >
                {t('إلغاء', 'Cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {viewingSubmission && (
        <Modal
          isOpen={!!viewingSubmission}
          onClose={() => setViewingSubmission(null)}
          title={t('تفاصيل الإرسال', 'Submission details')}
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('كتابتك:', 'Your writing:')}</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{viewingSubmission.content}</p>
              </div>
            </div>

            {viewingSubmission.manuscriptUrl && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('إجابتك المكتوبة بخط اليد:', 'Your handwritten answer:')}</h3>
                {viewingSubmission.manuscriptUrl.startsWith('data:image') ? (
                  <img
                    src={viewingSubmission.manuscriptUrl}
                    alt={t('الإجابة المكتوبة بخط اليد', 'Handwritten answer')}
                    className="max-h-96 rounded-lg border border-gray-200"
                  />
                ) : (
                  <a
                    href={viewingSubmission.manuscriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#10B981] hover:underline"
                  >
                    {t('عرض الإجابة المكتوبة', 'View manuscript')}
                  </a>
                )}
              </div>
            )}

            {viewingSubmission.grade !== null && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('الدرجة:', 'Grade:')}</h3>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-[#10B981]">
                    {viewingSubmission.grade}/100
                  </div>
                </div>
              </div>
            )}

            {viewingSubmission.feedback && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('ملاحظات المعلم:', 'Teacher feedback:')}</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingSubmission.feedback}</p>
                </div>
              </div>
            )}

            {viewingSubmission.grammarErrors && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('تصحيحات القواعد:', 'Grammar corrections:')}</h3>
                <div className="p-4 bg-yellow-50 rounded-lg space-y-2">
                  {JSON.parse(viewingSubmission.grammarErrors).map((error: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-yellow-400 pl-3">
                      <p className="text-sm font-semibold text-gray-900">{error.text}</p>
                      <p className="text-sm text-green-700">{t('التصحيح: ', 'Correction: ')}{error.correction}</p>
                      {error.explanation && (
                        <p className="text-xs text-gray-600">{error.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              onClick={() => setViewingSubmission(null)}
            >
              {t('إغلاق', 'Close')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
