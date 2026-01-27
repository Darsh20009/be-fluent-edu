'use client';

import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#10B981]" />
        <p className="text-gray-600 text-lg">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  );
}
