'use client'

import { useState, useEffect } from 'react'
import { Award, Download, Eye, Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CertificateTemplate from '@/components/CertificateTemplate'
import Modal from '@/components/ui/Modal'

interface Certificate {
  id: string
  level: string
  issueDate: string
  issuerName?: string
  isManual: boolean
}

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCert, setSelectedCert] = useState<any>(null)
  const [studentName, setStudentName] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
    try {
      const res = await fetch('/api/student/certificates')
      if (res.ok) {
        const data = await res.json()
        setCertificates(data.certificates)
        setStudentName(data.studentName)
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-emerald-800">شهاداتي / My Certificates</h2>
        <Award className="h-8 w-8 text-emerald-600" />
      </div>

      {certificates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Award className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">لا توجد شهادات متاحة حالياً</p>
          <p className="text-sm">ستظهر شهاداتك هنا بمجرد إتمامك للمستويات بنجاح</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-lg transition-shadow border-t-4 border-emerald-500">
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="success" className="text-lg py-1 px-4">
                      {cert.level}
                    </Badge>
                    <span className="text-xs text-gray-400 font-mono">{cert.id.split('-')[0]}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">شهادة إتمام المستوى</h3>
                  <p className="text-sm text-gray-600">
                    تاريخ الإصدار: {new Date(cert.issueDate).toLocaleDateString('ar-EG')}
                  </p>
                  {cert.issuerName && (
                    <p className="text-xs text-emerald-600 font-medium italic">
                      بواسطة: {cert.issuerName}
                    </p>
                  )}
                </div>
                <div className="mt-6 flex gap-2">
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={() => setSelectedCert(cert)}
                  >
                    <Eye className="h-4 w-4" />
                    عرض
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                    <Download className="h-4 w-4" />
                    تحميل
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedCert && (
        <Modal 
          isOpen={!!selectedCert} 
          onClose={() => setSelectedCert(null)}
          title="عرض الشهادة"
          size="xl"
        >
          <div className="overflow-x-auto p-4 bg-gray-100 rounded-lg">
            <div className="min-w-[800px] transform scale-90 origin-top">
              <CertificateTemplate 
                studentName={studentName}
                level={selectedCert.level}
                date={new Date(selectedCert.issueDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                certificateId={selectedCert.id}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => window.print()} className="gap-2">
              <Download className="h-4 w-4" />
              طباعة / تحميل PDF
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
