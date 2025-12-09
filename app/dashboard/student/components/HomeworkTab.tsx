'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, Send } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import GrammarErrorHighlighter from '@/components/GrammarErrorHighlighter'

interface Assignment {
  id: string
  title: string
  description: string | null
  type: string
  dueDate: string | null
  attachmentUrls?: string | null
  multipleChoice?: string | null
  session: {
    title: string
  } | null
  submissions: Array<{
    id: string
    textAnswer?: string
    selectedOption?: number
    grade: number | null
    feedback: string | null
    grammarErrors: string | null
    submittedAt: string
  }>
}

export default function HomeworkTab({ isActive }: { isActive: boolean }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [answer, setAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isActive) {
      fetchAssignments()
    }
  }, [isActive])

  async function fetchAssignments() {
    try {
      const response = await fetch('/api/assignments/student')
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!selectedAssignment) return
    if (selectedAssignment.type === 'TEXT' && !answer.trim()) return
    if (selectedAssignment.type === 'MULTIPLE_CHOICE' && selectedOption === null) return

    setSubmitting(true)
    try {
      const body: any = {
        assignmentId: selectedAssignment.id
      }
      if (selectedAssignment.type === 'TEXT') {
        body.textAnswer = answer
      } else if (selectedAssignment.type === 'MULTIPLE_CHOICE') {
        body.selectedOption = selectedOption
      }

      const response = await fetch('/api/assignments/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await fetchAssignments()
        setAnswer('')
        setSelectedOption(null)
        setSelectedAssignment(null)
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const pendingAssignments = assignments.filter(a => a.submissions.length === 0)
  const submittedAssignments = assignments.filter(a => a.submissions.length > 0)

  if (!isActive) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-[#004E89] mb-6">
          My Homework / واجباتي
        </h2>
        <Alert variant="warning">
          <p>Activate your account to access homework / قم بتفعيل حسابك للوصول للواجبات</p>
        </Alert>
      </div>
    )
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
      <h2 className="text-3xl font-bold text-[#004E89]">
        My Homework / واجباتي
      </h2>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Pending Assignments / واجبات معلقة ({pendingAssignments.length})
        </h3>
        {pendingAssignments.length === 0 ? (
          <Alert variant="success">
            <CheckCircle className="h-5 w-5" />
            <p>Great! No pending assignments.</p>
            <p>رائع! لا توجد واجبات معلقة.</p>
          </Alert>
        ) : (
          <div className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id} variant="elevated">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-[#004E89]" />
                      <h3 className="text-lg font-bold text-[#004E89]">{assignment.title}</h3>
                      <Badge variant="warning">Pending / معلق</Badge>
                    </div>
                    {assignment.description && (
                      <p className="text-gray-700 mb-2">{assignment.description}</p>
                    )}
                    {assignment.session && (
                      <p className="text-sm text-gray-600 mb-2">
                        From session: {assignment.session.title}
                      </p>
                    )}
                    {assignment.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Due: {new Date(assignment.dueDate).toLocaleDateString('ar-EG', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  {assignment.type === 'VIDEO' || assignment.type === 'IMAGE' ? (
                    <a
                      href={assignment.attachmentUrls || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-[#004E89] text-white rounded-lg hover:bg-[#003d6b] text-sm font-medium"
                    >
                      View / عرض
                    </a>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment)
                        setAnswer('')
                        setSelectedOption(null)
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit / سلّم
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Submitted Assignments / واجبات مسلّمة ({submittedAssignments.length})
        </h3>
        {submittedAssignments.length === 0 ? (
          <Alert variant="info">
            <p>No submitted assignments yet.</p>
            <p>لم تسلّم أي واجبات بعد.</p>
          </Alert>
        ) : (
          <div className="space-y-4">
            {submittedAssignments.map((assignment) => {
              const submission = assignment.submissions[0]
              return (
                <Card key={assignment.id} variant="elevated">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                        {submission.grade !== null ? (
                          <Badge variant="success">
                            Graded: {submission.grade}/100
                          </Badge>
                        ) : (
                          <Badge variant="info">
                            Under Review / قيد المراجعة
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Submitted: {new Date(submission.submittedAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  {submission.grammarErrors && JSON.parse(submission.grammarErrors).length > 0 ? (
                    <div className="mb-3">
                      <GrammarErrorHighlighter
                        studentAnswer={submission.textAnswer || ''}
                        errors={JSON.parse(submission.grammarErrors)}
                        onErrorsChange={() => {}}
                        readonly={true}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Your Answer / إجابتك:</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{submission.textAnswer}</p>
                    </div>
                  )}
                  {submission.feedback && (
                    <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
                        General Feedback / التعليق العام:
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{submission.feedback}</p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {selectedAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit: ${selectedAssignment.title}`}
        >
          <div className="space-y-4">
            {selectedAssignment.description && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Assignment Description:</p>
                <p className="text-gray-700">{selectedAssignment.description}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Your Answer / إجابتك:
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004E89] min-h-[200px]"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... / اكتب إجابتك هنا..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={submitting || !answer.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit / تسليم'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSelectedAssignment(null)}
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
