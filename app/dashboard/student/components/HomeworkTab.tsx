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
    fetchAssignments()
  }, [])

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
      } else {
        const err = await response.json()
        alert(err.error || 'Failed to submit')
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Error submitting')
    } finally {
      setSubmitting(false)
    }
  }

  const pendingAssignments = assignments.filter(a => a.submissions.length === 0)
  const submittedAssignments = assignments.filter(a => a.submissions.length > 0)

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
          My Homework / واجباتي
        </h2>
        {!isActive && (
          <Badge variant="warning">Account Inactive / الحساب غير نشط</Badge>
        )}
      </div>

      {!isActive && pendingAssignments.length === 0 && (
        <Alert variant="warning">
          <p>Activate your account to receive assignments from your teacher.</p>
          <p>قم بتفعيل حسابك لتتمكن من استلام الواجبات من معلمك.</p>
        </Alert>
      )}

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
                <div className="flex items-start justify-between p-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#10B981]/10 rounded-lg">
                        <FileText className="h-6 w-6 text-[#10B981]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="warning">Pending / معلق</Badge>
                          <Badge variant="info" className="text-[10px] uppercase">{assignment.type}</Badge>
                        </div>
                      </div>
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
                          Due: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {assignment.attachmentUrls && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(assignment.attachmentUrls!, '_blank')}
                      >
                        View Material / عرض المادة
                      </Button>
                    )}
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
                      Answer / إجابة
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {submittedAssignments.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Submitted / واجبات مسلّمة ({submittedAssignments.length})
          </h3>
          <div className="space-y-4">
            {submittedAssignments.map((assignment) => {
              const submission = assignment.submissions[0]
              return (
                <Card key={assignment.id} variant="elevated">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-[#10B981]" />
                        <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                        {submission.grade !== null ? (
                          <Badge variant="success">Graded: {submission.grade}/100</Badge>
                        ) : (
                          <Badge variant="info">Under Review / قيد المراجعة</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {submission.textAnswer && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-2">
                      <p className="text-xs text-gray-500 mb-1">Your Answer:</p>
                      <p className="text-sm">{submission.textAnswer}</p>
                    </div>
                  )}
                  {submission.feedback && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 font-bold mb-1">Feedback / ملاحظات:</p>
                      <p className="text-sm text-blue-800">{submission.feedback}</p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {selectedAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAssignment(null)}
          title={selectedAssignment.title}
        >
          <div className="space-y-4">
            {selectedAssignment.description && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                {selectedAssignment.description}
              </div>
            )}

            {selectedAssignment.type === 'MULTIPLE_CHOICE' && selectedAssignment.multipleChoice && (
              <div className="space-y-3">
                <p className="font-bold text-gray-900">{JSON.parse(selectedAssignment.multipleChoice).question}</p>
                <div className="grid gap-2">
                  {JSON.parse(selectedAssignment.multipleChoice).options.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      className={`p-3 text-left rounded-xl border transition-all ${selectedOption === idx ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-white border-gray-200 hover:border-[#10B981]'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedAssignment.type !== 'MULTIPLE_CHOICE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer / إجابتك:
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] min-h-[150px]"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={submitting}
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
