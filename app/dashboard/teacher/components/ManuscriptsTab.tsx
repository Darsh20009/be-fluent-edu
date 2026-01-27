'use client'

import { useState, useEffect } from 'react'
import { FileText, Eye } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface Manuscript {
  id: string
  manuscriptUrl: string
  content: string
  submittedAt: string
  grade: number | null
  User: {
    id: string
    name: string
    email: string
  }
  WritingTest: {
    id: string
    title: string
    titleAr: string | null
  }
}

export default function ManuscriptsTab({ teacherProfileId }: { teacherProfileId: string }) {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingManuscript, setViewingManuscript] = useState<Manuscript | null>(null)

  useEffect(() => {
    fetchManuscripts()
    
    const interval = setInterval(() => {
      fetchManuscripts()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  async function fetchManuscripts() {
    try {
      const response = await fetch('/api/teacher/manuscripts')
      if (response.ok) {
        const data = await response.json()
        setManuscripts(data)
      }
    } catch (error) {
      console.error('Error fetching manuscripts:', error)
    } finally {
      setLoading(false)
    }
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
      <h2 className="text-3xl font-bold text-[#10B981]">
        Student Manuscripts / مخطوطات الطلاب
      </h2>

      {manuscripts.length === 0 ? (
        <Alert variant="info">
          <FileText className="h-5 w-5 mr-2 inline" />
          <div className="inline-block">
            <p>No pending manuscripts to review.</p>
            <p>لا توجد مخطوطات معلقة للمراجعة.</p>
          </div>
        </Alert>
      ) : (
        <div className="space-y-4">
          {manuscripts.map((manuscript) => (
            <Card key={manuscript.id} variant="elevated">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#10B981] mb-1">
                    {manuscript.WritingTest.title}
                  </h3>
                  {manuscript.WritingTest.titleAr && (
                    <p className="text-gray-600 text-sm mb-2">{manuscript.WritingTest.titleAr}</p>
                  )}
                  <div className="flex gap-3 text-sm text-gray-600">
                    <span>📝 {manuscript.User.name}</span>
                    <span>📧 {manuscript.User.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {new Date(manuscript.submittedAt).toLocaleString('ar-EG')}
                  </p>
                </div>
                <Badge variant="warning">
                  <FileText className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </div>

              {manuscript.content && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-3">{manuscript.content}</p>
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                onClick={() => setViewingManuscript(manuscript)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Manuscript & Grade / عرض المخطوطة والتقييم
              </Button>
            </Card>
          ))}
        </div>
      )}

      {viewingManuscript && (
        <Modal
          isOpen={!!viewingManuscript}
          onClose={() => setViewingManuscript(null)}
          title={`Manuscript - ${viewingManuscript.User.name}`}
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Test: {viewingManuscript.WritingTest.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{viewingManuscript.WritingTest.titleAr}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Student Writing:</h3>
              <div className="p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{viewingManuscript.content}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Handwritten Manuscript:</h3>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                {viewingManuscript.manuscriptUrl.startsWith('data:image') ? (
                  <img
                    src={viewingManuscript.manuscriptUrl}
                    alt="Student manuscript"
                    className="max-h-96 w-full object-contain rounded"
                  />
                ) : (
                  <a
                    href={viewingManuscript.manuscriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#10B981] hover:underline font-medium"
                  >
                    📎 Download Manuscript
                  </a>
                )}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                💡 To grade this submission, go to the <strong>Writing Tests</strong> tab and select the test "{viewingManuscript.WritingTest.title}" to add your grade and feedback.
              </p>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setViewingManuscript(null)}
            >
              Close / إغلاق
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
