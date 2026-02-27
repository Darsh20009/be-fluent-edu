import { Suspense } from 'react'
import PlacementTestContent from './PlacementTestContent'

export default function PlacementTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل الاختبار...</p>
        </div>
      </div>
    }>
      <PlacementTestContent />
    </Suspense>
  )
}
