'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, Send, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'

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
        alert('✓ Writing test submitted successfully!\n\nتم إرسال الاختبار بنجاح!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('An error occurred')
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
        <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg border-2 border-[#d4c9b8]">
          <div className="mb-4 flex justify-center">
            <div className="bg-blue-500 p-4 rounded-full">
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl bg-[#F5F5DC] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#10B981] mb-2">
          Writing Tests / اختبارات الكتابة
        </h1>
        <p className="text-gray-600">Complete your writing tests and view feedback</p>
      </div>

      {tests.length === 0 && !loading && (
        <Alert variant="info">
          <FileText className="h-5 w-5" />
          <div>
            <p className="font-semibold">No Writing Tests Available / لا توجد اختبارات كتابة</p>
            <p className="text-sm">Your teacher hasn't created any writing tests yet, or you don't have an active subscription.</p>
            <p className="text-sm mt-1">لم يقم معلمك بإنشاء أي اختبارات كتابة بعد، أو ليس لديك اشتراك نشط.</p>
          </div>
        </Alert>
      )}

      {pendingTests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Pending Tests / اختبارات معلقة
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingTests.map((test) => {
              const isOverdue = test.dueDate && new Date(test.dueDate) < new Date()
              return (
                <Card key={test.id} variant="elevated">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{test.title}</h3>
                      {test.titleAr && (
                        <p className="text-gray-600">{test.titleAr}</p>
                      )}
                    </div>
                    {isOverdue ? (
                      <Badge variant="error">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue / متأخر
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending / معلق
                      </Badge>
                    )}
                  </div>

                  {test.instructions && (
                    <div className="mb-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{test.instructions}</p>
                      {test.instructionsAr && (
                        <p className="text-sm text-gray-700 mt-1">{test.instructionsAr}</p>
                      )}
                    </div>
                  )}

                  {test.dueDate && (
                    <p className="text-sm text-gray-600 mb-3">
                      Due: {new Date(test.dueDate).toLocaleDateString('ar-EG')}
                    </p>
                  )}

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setSelectedTest(test)}
                  >
                    <FileText className="h-4 w-4 ml-2" />
                    Start Writing / ابدأ الكتابة
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
            Submitted Tests / الاختبارات المرسلة
          </h2>
          <div className="space-y-4">
            {submittedTests.map((test) => {
              const submission = test.WritingTestSubmission[0]
              return (
                <Card key={test.id} variant="elevated">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{test.title}</h3>
                      {test.titleAr && (
                        <p className="text-gray-600">{test.titleAr}</p>
                      )}
                    </div>
                    {submission.grade !== null ? (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Graded: {submission.grade}/100
                      </Badge>
                    ) : (
                      <Badge variant="info">
                        <Clock className="h-3 w-3 mr-1" />
                        Under Review / قيد المراجعة
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString('ar-EG')}</span>
                    {submission.gradedAt && (
                      <span>• Graded: {new Date(submission.gradedAt).toLocaleDateString('ar-EG')}</span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setViewingSubmission(submission)}
                  >
                    View Submission & Feedback / عرض الإرسال والتغذية الراجعة
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
          title={`Write: ${selectedTest.title}`}
        >
          <div className="space-y-4">
            {selectedTest.instructions && (
              <Alert variant="info">
                <div>
                  <p className="font-semibold mb-1">Instructions:</p>
                  <p className="text-sm">{selectedTest.instructions}</p>
                  {selectedTest.instructionsAr && (
                    <p className="text-sm mt-1">{selectedTest.instructionsAr}</p>
                  )}
                </div>
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Writing / كتابتك
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                rows={12}
                placeholder="Start writing here... ابدأ الكتابة هنا..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Word count: {content.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Handwritten Answer (Optional) / الإجابة المكتوبة بخط اليد (اختياري)
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
                          alt="Manuscript preview"
                          className="mt-2 max-h-48 mx-auto rounded"
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">📎 Upload handwritten answer</p>
                      <p className="text-xs text-gray-500 mt-1">Images or PDF</p>
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
                  ✕ Remove file
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
                {submitting ? 'Submitting...' : (
                  <>
                    <Send className="h-4 w-4 ml-2" />
                    Submit Writing / إرسال الكتابة
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
                Cancel / إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {viewingSubmission && (
        <Modal
          isOpen={!!viewingSubmission}
          onClose={() => setViewingSubmission(null)}
          title="Submission Details / تفاصيل الإرسال"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Writing:</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{viewingSubmission.content}</p>
              </div>
            </div>

            {viewingSubmission.manuscriptUrl && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Handwritten Answer:</h3>
                {viewingSubmission.manuscriptUrl.startsWith('data:image') ? (
                  <img
                    src={viewingSubmission.manuscriptUrl}
                    alt="Handwritten answer"
                    className="max-h-96 rounded-lg border border-gray-200"
                  />
                ) : (
                  <a
                    href={viewingSubmission.manuscriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#10B981] hover:underline"
                  >
                    📎 View Manuscript
                  </a>
                )}
              </div>
            )}

            {viewingSubmission.grade !== null && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Grade / الدرجة:</h3>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-[#10B981]">
                    {viewingSubmission.grade}/100
                  </div>
                </div>
              </div>
            )}

            {viewingSubmission.feedback && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Teacher Feedback / ملاحظات المعلم:</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingSubmission.feedback}</p>
                </div>
              </div>
            )}

            {viewingSubmission.grammarErrors && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Grammar Corrections / تصحيحات القواعد:</h3>
                <div className="p-4 bg-yellow-50 rounded-lg space-y-2">
                  {JSON.parse(viewingSubmission.grammarErrors).map((error: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-yellow-400 pl-3">
                      <p className="text-sm font-semibold text-gray-900">{error.text}</p>
                      <p className="text-sm text-green-700">Correction: {error.correction}</p>
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
              Close / إغلاق
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
