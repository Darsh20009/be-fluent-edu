'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, CheckCircle, Clock, Send, Upload, X } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import GrammarErrorHighlighter from '@/components/GrammarErrorHighlighter'

interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  Session: {
    title: string
  } | null
  Submission: Array<{
    id: string
    User: {
      name: string
    }
    textAnswer: string
    grade: number | null
    feedback: string | null
    grammarErrors: string | null
    submittedAt: string
  }>
}

interface Session {
  id: string
  title: string
}

interface Student {
  id: string
  name: string
  email: string
}

export default function AssignmentsTab({ teacherProfileId }: { teacherProfileId: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Assignment['Submission'][0] | null>(null)
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '', grammarErrors: [] as Array<{text: string, correction: string, explanation: string}> })
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    type: 'TEXT',
    sessionId: '',
    dueDate: '',
    selectedStudents: [] as string[],
    attachmentUrls: [] as string[],
    multipleChoice: { question: '', options: [] as string[], correctAnswer: 0 }
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [assignmentsRes, sessionsRes, studentsRes] = await Promise.all([
        fetch('/api/teacher/assignments'),
        fetch('/api/teacher/sessions'),
        fetch('/api/teacher/students')
      ])

      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json()
        setAssignments(data)
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        setSessions(data)
      }

      if (studentsRes.ok) {
        const data = await studentsRes.json()
        setStudents(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAssignment() {
    if (!newAssignment.title) {
      alert('Please enter a title')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAssignment.title,
          description: newAssignment.description,
          type: newAssignment.type,
          sessionId: newAssignment.sessionId,
          dueDate: newAssignment.dueDate,
          attachmentUrls: newAssignment.attachmentUrls,
          multipleChoice: newAssignment.type === 'MULTIPLE_CHOICE' ? newAssignment.multipleChoice : null,
          studentIds: newAssignment.selectedStudents
        })
      })

      if (response.ok) {
        await fetchData()
        setNewAssignment({ title: '', description: '', type: 'TEXT', sessionId: '', dueDate: '', selectedStudents: [], attachmentUrls: [], multipleChoice: { question: '', options: [], correctAnswer: 0 } })
        setShowCreateForm(false)
        alert('Assignment created successfully!')
      } else {
        alert('Failed to create assignment')
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
      alert('Error creating assignment')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGradeSubmission() {
    if (!selectedSubmission || !gradeData.grade) {
      alert('Please enter a grade')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/teacher/assignments/${selectedSubmission.id}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: parseFloat(gradeData.grade),
          feedback: gradeData.feedback,
          grammarErrors: JSON.stringify(gradeData.grammarErrors)
        })
      })

      if (response.ok) {
        await fetchData()
        setSelectedSubmission(null)
        setGradeData({ grade: '', feedback: '', grammarErrors: [] })
        alert('Submission graded successfully!')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const pendingGrading = assignments.flatMap(a => 
    a.Submission.filter(s => s.grade === null)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#10B981]">
          Assignments / الواجبات
        </h2>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment / إنشاء واجب
        </Button>
      </div>

      {pendingGrading.length > 0 && (
        <Card variant="elevated" className="bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pending Grading</h3>
              <p className="text-sm text-gray-700">
                {pendingGrading.length} submission(s) waiting for your review
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Alert variant="info">
            <p>No assignments created yet. Create your first assignment!</p>
            <p>لم يتم إنشاء واجبات بعد. قم بإنشاء أول واجب!</p>
          </Alert>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} variant="elevated">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-[#10B981]" />
                  <h3 className="text-lg font-bold text-[#10B981]">{assignment.title}</h3>
                  {assignment.Submission.length > 0 && (
                    <Badge variant="info">
                      {assignment.Submission.length} submission(s)
                    </Badge>
                  )}
                </div>
                {assignment.description && (
                  <p className="text-gray-700 mb-2">{assignment.description}</p>
                )}
                {assignment.Session && (
                  <p className="text-sm text-gray-600">Session: {assignment.Session.title}</p>
                )}
                {assignment.dueDate && (
                  <p className="text-sm text-gray-600">
                    Due: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                  </p>
                )}
              </div>

              {assignment.Submission.length > 0 && (
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900">Submissions:</h4>
                  {assignment.Submission.map((submission) => (
                    <div key={submission.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{submission.User.name}</p>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(submission.submittedAt).toLocaleString('ar-EG')}
                          </p>
                        </div>
                        {submission.grade !== null ? (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Graded: {submission.grade}/100
                          </Badge>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission)
                              const existingErrors = submission.grammarErrors 
                                ? JSON.parse(submission.grammarErrors) 
                                : []
                              setGradeData({ 
                                grade: submission.grade?.toString() || '', 
                                feedback: submission.feedback || '', 
                                grammarErrors: existingErrors 
                              })
                            }}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Grade
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Answer:</strong> {submission.textAnswer}
                      </p>
                      {submission.feedback && (
                        <p className="text-sm text-blue-700">
                          <strong>Your Feedback:</strong> {submission.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {showCreateForm && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateForm(false)}
          title="Create New Assignment / إنشاء واجب جديد"
        >
          <div className="space-y-4">
            <Input
              label="Assignment Title / عنوان الواجب"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              placeholder="e.g., Essay on Environmental Protection"
            />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Assignment Type / نوع الواجب
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                value={newAssignment.type}
                onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value, multipleChoice: { question: '', options: [], correctAnswer: 0 }, attachmentUrls: [] })}
              >
                <option value="TEXT">Text Assignment / واجب نصي</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice / أسئلة متعدد الخيارات</option>
                <option value="VIDEO">Video / فيديو</option>
                <option value="IMAGE">Image / صورة</option>
                <option value="FILE">File / ملف</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description / الوصف
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Assignment instructions..."
                rows={4}
              />
            </div>

            {newAssignment.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Input
                  label="Question / السؤال"
                  value={newAssignment.multipleChoice.question}
                  onChange={(e) => setNewAssignment({
                    ...newAssignment,
                    multipleChoice: { ...newAssignment.multipleChoice, question: e.target.value }
                  })}
                  placeholder="Enter the question"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Options / الخيارات
                  </label>
                  {newAssignment.multipleChoice.options.map((option, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newAssignment.multipleChoice.options]
                          newOptions[idx] = e.target.value
                          setNewAssignment({
                            ...newAssignment,
                            multipleChoice: { ...newAssignment.multipleChoice, options: newOptions }
                          })
                        }}
                        placeholder={`Option ${idx + 1}`}
                      />
                      <input
                        type="radio"
                        name="correct"
                        checked={newAssignment.multipleChoice.correctAnswer === idx}
                        onChange={() => setNewAssignment({
                          ...newAssignment,
                          multipleChoice: { ...newAssignment.multipleChoice, correctAnswer: idx }
                        })}
                        className="w-4 h-4"
                        title="Correct answer"
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (newAssignment.multipleChoice.options.length < 5) {
                        setNewAssignment({
                          ...newAssignment,
                          multipleChoice: {
                            ...newAssignment.multipleChoice,
                            options: [...newAssignment.multipleChoice.options, '']
                          }
                        })
                      }
                    }}
                  >
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {['VIDEO', 'IMAGE', 'FILE'].includes(newAssignment.type) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload Files / رفع الملفات
                </label>
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Enter file URL or click to upload
                  </p>
                  <Input
                    placeholder="https://example.com/file.mp4"
                    value={newAssignment.attachmentUrls[0] || ''}
                    onChange={(e) => setNewAssignment({
                      ...newAssignment,
                      attachmentUrls: [e.target.value]
                    })}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Linked Session (Optional) / الحصة المرتبطة (اختياري)
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                value={newAssignment.sessionId}
                onChange={(e) => setNewAssignment({ ...newAssignment, sessionId: e.target.value })}
              >
                <option value="">No session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Due Date (Optional) / تاريخ التسليم (اختياري)"
              type="datetime-local"
              value={newAssignment.dueDate}
              onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select Students (Optional) / اختر الطلاب (اختياري)
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={newAssignment.selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewAssignment({
                            ...newAssignment,
                            selectedStudents: [...newAssignment.selectedStudents, student.id]
                          })
                        } else {
                          setNewAssignment({
                            ...newAssignment,
                            selectedStudents: newAssignment.selectedStudents.filter(id => id !== student.id)
                          })
                        }
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{student.name} ({student.email})</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {newAssignment.selectedStudents.length} student(s) selected
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateAssignment}
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create / إنشاء'}
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

      {selectedSubmission && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSubmission(null)}
          title={`Grade: ${selectedSubmission.User.name}`}
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto">
            <GrammarErrorHighlighter
              studentAnswer={selectedSubmission.textAnswer}
              errors={gradeData.grammarErrors}
              onErrorsChange={(errors) => setGradeData({ ...gradeData, grammarErrors: errors })}
            />
            
            <Input
              label="Grade (0-100) / الدرجة"
              type="number"
              min="0"
              max="100"
              value={gradeData.grade}
              onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
              placeholder="e.g., 85"
            />
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                General Feedback (Optional) / التعليق العام (اختياري)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={gradeData.feedback}
                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                placeholder="Provide general feedback to the student..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleGradeSubmission}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Grade / تسليم'}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSelectedSubmission(null)}
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
