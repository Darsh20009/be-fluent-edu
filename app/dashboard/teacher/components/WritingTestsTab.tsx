'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Edit, Trash2, CheckCircle, Clock } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
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
    User: {
      id: string
      name: string
      email: string
    }
  }>
}

interface GrammarError {
  text: string
  correction: string
  explanation: string
}

export default function WritingTestsTab({ teacherProfileId }: { teacherProfileId: string }) {
  const [tests, setTests] = useState<WritingTest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [gradingSubmission, setGradingSubmission] = useState<WritingTest['WritingTestSubmission'][0] | null>(null)
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '', grammarErrors: [] as GrammarError[] })
  const [newTest, setNewTest] = useState({
    title: '',
    titleAr: '',
    instructions: '',
    instructionsAr: '',
    dueDate: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTests()
  }, [])

  async function fetchTests() {
    try {
      const response = await fetch('/api/teacher/writing-tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data)
      }
    } catch (error) {
      console.error('Error fetching writing tests:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTest() {
    if (!newTest.title) {
      alert('Please enter a title')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/teacher/writing-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      })

      if (response.ok) {
        await fetchTests()
        setNewTest({ title: '', titleAr: '', instructions: '', instructionsAr: '', dueDate: '' })
        setShowCreateForm(false)
        alert('✓ Writing test created successfully!')
      } else {
        alert('Failed to create writing test')
      }
    } catch (error) {
      console.error('Error creating test:', error)
      alert('Error creating writing test')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGradeSubmission() {
    if (!gradingSubmission || !gradeData.grade) {
      alert('Please enter a grade')
      return
    }

    const grade = parseFloat(gradeData.grade)
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert('Please enter a valid grade between 0 and 100')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/teacher/writing-tests/${gradingSubmission.id}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          feedback: gradeData.feedback,
          grammarErrors: gradeData.grammarErrors.length > 0 ? gradeData.grammarErrors : null
        })
      })

      if (response.ok) {
        await fetchTests()
        setGradingSubmission(null)
        setGradeData({ grade: '', feedback: '', grammarErrors: [] })
        alert('✓ Submission graded successfully!')
      } else {
        alert('Failed to grade submission')
      }
    } catch (error) {
      console.error('Error grading submission:', error)
      alert('Error grading submission')
    } finally {
      setSubmitting(false)
    }
  }

  function addGrammarError() {
    setGradeData(prev => ({
      ...prev,
      grammarErrors: [...prev.grammarErrors, { text: '', correction: '', explanation: '' }]
    }))
  }

  function updateGrammarError(index: number, field: keyof GrammarError, value: string) {
    setGradeData(prev => ({
      ...prev,
      grammarErrors: prev.grammarErrors.map((err, i) => 
        i === index ? { ...err, [field]: value } : err
      )
    }))
  }

  function removeGrammarError(index: number) {
    setGradeData(prev => ({
      ...prev,
      grammarErrors: prev.grammarErrors.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#10B981]">
          Writing Tests / اختبارات الكتابة
        </h2>
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-5 w-5 ml-2" />
          Create Test / إنشاء اختبار
        </Button>
      </div>

      {tests.length === 0 && !showCreateForm && (
        <Card variant="elevated" className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No writing tests created yet</p>
          <p className="text-gray-600">لا توجد اختبارات كتابة بعد</p>
        </Card>
      )}

      <div className="space-y-4">
        {tests.map((test) => {
          const totalSubmissions = test.WritingTestSubmission.length
          const gradedSubmissions = test.WritingTestSubmission.filter(s => s.grade !== null).length
          const pendingSubmissions = totalSubmissions - gradedSubmissions

          return (
            <Card key={test.id} variant="elevated">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{test.title}</h3>
                  {test.titleAr && <p className="text-gray-600">{test.titleAr}</p>}
                  {test.dueDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Due: {new Date(test.dueDate).toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="info">
                    {totalSubmissions} submission{totalSubmissions !== 1 ? 's' : ''}
                  </Badge>
                  {pendingSubmissions > 0 && (
                    <Badge variant="warning">
                      {pendingSubmissions} pending
                    </Badge>
                  )}
                </div>
              </div>

              {test.instructions && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{test.instructions}</p>
                  {test.instructionsAr && (
                    <p className="text-sm text-gray-700 mt-1">{test.instructionsAr}</p>
                  )}
                </div>
              )}

              {test.WritingTestSubmission.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Submissions:</h4>
                  {test.WritingTestSubmission.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{submission.User.name}</p>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      {submission.grade !== null ? (
                        <div className="flex items-center gap-3">
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Grade: {submission.grade}/100
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGradingSubmission(submission)
                              setGradeData({
                                grade: submission.grade?.toString() || '',
                                feedback: submission.feedback || '',
                                grammarErrors: submission.grammarErrors ? JSON.parse(submission.grammarErrors) : []
                              })
                            }}
                          >
                            View / Edit
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setGradingSubmission(submission)}
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          Grade / تصحيح
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {showCreateForm && (
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create Writing Test / إنشاء اختبار كتابة"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (English) *
              </label>
              <input
                type="text"
                value={newTest.title}
                onChange={(e) => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                placeholder="Write about your favorite book"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (Arabic)
              </label>
              <input
                type="text"
                value={newTest.titleAr}
                onChange={(e) => setNewTest(prev => ({ ...prev, titleAr: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                placeholder="اكتب عن كتابك المفضل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions (English)
              </label>
              <textarea
                value={newTest.instructions}
                onChange={(e) => setNewTest(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                rows={3}
                placeholder="Write a paragraph about your favorite book and explain why you like it..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions (Arabic)
              </label>
              <textarea
                value={newTest.instructionsAr}
                onChange={(e) => setNewTest(prev => ({ ...prev, instructionsAr: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                rows={3}
                placeholder="اكتب فقرة عن كتابك المفضل واشرح لماذا يعجبك..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={newTest.dueDate}
                onChange={(e) => setNewTest(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateTest}
                disabled={!newTest.title || submitting}
              >
                {submitting ? 'Creating...' : 'Create Test / إنشاء'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCreateForm(false)}
              >
                Cancel / إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {gradingSubmission && (
        <Modal
          isOpen={!!gradingSubmission}
          onClose={() => {
            setGradingSubmission(null)
            setGradeData({ grade: '', feedback: '', grammarErrors: [] })
          }}
          title={`Grade Submission / تصحيح الإرسال`}
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Student Writing:</h3>
              <div className="p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{gradingSubmission.content}</p>
              </div>
            </div>

            {gradingSubmission.manuscriptUrl && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Handwritten Answer:</h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  {gradingSubmission.manuscriptUrl.startsWith('data:image') ? (
                    <img
                      src={gradingSubmission.manuscriptUrl}
                      alt="Handwritten submission"
                      className="max-h-96 rounded border border-gray-300 w-full object-contain"
                    />
                  ) : (
                    <a
                      href={gradingSubmission.manuscriptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#10B981] hover:underline font-medium"
                    >
                      📎 View Manuscript File
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade (0-100) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={gradeData.grade}
                onChange={(e) => setGradeData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                placeholder="85"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (Optional)
              </label>
              <textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                rows={4}
                placeholder="Great work! Your writing is clear and well-organized..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Grammar Corrections (Optional)
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addGrammarError}
                >
                  <Plus className="h-4 w-4 ml-1" />
                  Add Error
                </Button>
              </div>

              <div className="space-y-3">
                {gradeData.grammarErrors.map((error, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
                    <input
                      type="text"
                      value={error.text}
                      onChange={(e) => updateGrammarError(index, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Error text (e.g., 'I goed to school')"
                    />
                    <input
                      type="text"
                      value={error.correction}
                      onChange={(e) => updateGrammarError(index, 'correction', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Correction (e.g., 'I went to school')"
                    />
                    <input
                      type="text"
                      value={error.explanation}
                      onChange={(e) => updateGrammarError(index, 'explanation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Explanation (e.g., 'Past tense of go is went')"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeGrammarError(index)}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                fullWidth
                onClick={handleGradeSubmission}
                disabled={!gradeData.grade || submitting}
              >
                {submitting ? 'Saving...' : 'Save Grade / حفظ الدرجة'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setGradingSubmission(null)
                  setGradeData({ grade: '', feedback: '', grammarErrors: [] })
                }}
              >
                Cancel / إلغاء
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
