'use client'

import { useState, useEffect } from 'react'
import { Activity, Clock } from 'lucide-react'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'

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
        System Activity / نشاط النظام
      </h2>

      <Card variant="elevated">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-6 w-6 text-[#004E89]" />
          <h3 className="text-xl font-bold text-[#004E89]">
            Recent Activity Logs / سجلات النشاط الأخيرة
          </h3>
        </div>
        
        {logs.length === 0 ? (
          <Alert variant="info">
            <p>No activity logs yet.</p>
            <p>لا توجد سجلات نشاط بعد.</p>
          </Alert>
        ) : (
          <div className="space-y-2">
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

      <Card variant="elevated">
        <h3 className="text-xl font-bold text-[#004E89] mb-4">
          System Information / معلومات النظام
        </h3>
        <div className="space-y-2 text-gray-700">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Platform Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Database Status</span>
            <span className="font-medium text-green-600">Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>Last Backup</span>
            <span className="font-medium">Automatic</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
