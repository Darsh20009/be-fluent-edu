'use client'

import { Suspense } from 'react'
import ScheduleSessionsContent from './ScheduleSessionsContent'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ScheduleSessionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ScheduleSessionsContent />
    </Suspense>
  )
}
