'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ClipboardList, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface PlacementTestResult {
  id: string
  userId: string
  userName: string
  userEmail: string
  score: number
  level: string
  completedAt: string
  answers: any[]
}

export default function PlacementTestTab() {
  const [results, setResults] = useState<PlacementTestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<PlacementTestResult | null>(null)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/admin/placement-tests')
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Error fetching placement test results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      'A1': 'bg-red-100 text-red-700',
      'A2': 'bg-orange-100 text-orange-700',
      'B1': 'bg-yellow-100 text-yellow-700',
      'B2': 'bg-green-100 text-green-700',
      'C1': 'bg-blue-100 text-blue-700',
      'C2': 'bg-purple-100 text-purple-700',
    }
    return colors[level] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <Card variant="elevated" className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004E89]"></div>
          <span className="mr-3 text-gray-600">جاري التحميل...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="h-6 w-6 text-[#004E89]" />
          <h2 className="text-xl font-bold text-gray-900">اختبارات تحديد المستوى</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">إجمالي الاختبارات</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-1">{results.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">المستوى B1+</span>
            </div>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {results.filter(r => ['B1', 'B2', 'C1', 'C2'].includes(r.level)).length}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="text-sm text-orange-600 font-medium">مبتدئين</span>
            </div>
            <p className="text-2xl font-bold text-orange-700 mt-1">
              {results.filter(r => ['A1', 'A2'].includes(r.level)).length}
            </p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد نتائج حتى الآن</h3>
            <p className="text-gray-500">سيتم عرض نتائج اختبارات تحديد المستوى هنا</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">الطالب</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">المستوى</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">النتيجة</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">التاريخ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{result.userName}</p>
                        <p className="text-xs text-gray-500">{result.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${getLevelBadgeColor(result.level)}`}>
                        {result.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium text-gray-900">{result.score}%</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {new Date(result.completedAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedResult(result)}
                      >
                        عرض
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedResult(null)}>
          <Card variant="elevated" className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">تفاصيل الاختبار</h3>
                <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">الطالب</p>
                    <p className="font-medium">{selectedResult.userName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                    <p className="font-medium">{selectedResult.userEmail}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">المستوى</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${getLevelBadgeColor(selectedResult.level)}`}>
                      {selectedResult.level}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">النتيجة</p>
                    <p className="font-bold text-lg">{selectedResult.score}%</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
