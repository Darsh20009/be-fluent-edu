'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock, Trash2, AlertTriangle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'
import { toast } from 'react-hot-toast'

interface AuditLog {
  id: string
  action: string
  userId: string | null
  details: string | null
  createdAt: string
}

export default function SystemTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const response = await fetch('/api/admin/logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCleanup(type: 'all' | 'logs' | 'sessions') {
    setCleaning(type)
    try {
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      if (response.ok) {
        toast.success('تمت العملية بنجاح')
        if (type === 'logs') fetchLogs()
      } else {
        toast.error('حدث خطأ أثناء العملية')
      }
    } catch (error) {
      toast.error('فشل الاتصال بالخادم')
    } finally {
      setCleaning(null)
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
        System Management / إدارة النظام
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="elevated" className="border-red-100">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="text-xl font-bold">Dangerous Actions / إجراءات خطيرة</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
              <div>
                <p className="font-bold text-red-700">مسح جميع البيانات</p>
                <p className="text-xs text-red-600">سيتم مسح كل شيء باستثناء حسابات الأدمن</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                onClick={() => handleCleanup('all')}
                disabled={cleaning !== null}
              >
                {cleaning === 'all' ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div>
                <p className="font-bold text-orange-700">مسح السجلات (Logs)</p>
                <p className="text-xs text-orange-600">سيتم مسح سجلات النشاط فقط</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white"
                onClick={() => handleCleanup('logs')}
                disabled={cleaning !== null}
              >
                {cleaning === 'logs' ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center gap-3 mb-4 text-[#10B981]">
            <Activity className="h-6 w-6" />
            <h3 className="text-xl font-bold">System Status / حالة النظام</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span>Database Status</span>
              <span className="text-green-600 font-bold">Connected</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span>Email Service</span>
              <span className="text-green-600 font-bold">SMTP2GO</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Platform Version</span>
              <span className="font-bold text-gray-900">1.0.0</span>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="elevated">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-6 w-6 text-[#10B981]" />
          <h3 className="text-xl font-bold text-[#10B981]">
            Recent Activity Logs / سجلات النشاط الأخيرة
          </h3>
        </div>
        
        {logs.length === 0 ? (
          <Alert variant="info">
            <p>No activity logs yet.</p>
          </Alert>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{log.action}</p>
                    {log.details && (
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(log.createdAt).toLocaleString('ar-EG')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
