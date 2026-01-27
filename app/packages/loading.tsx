'use client';

import { Loader2 } from 'lucide-react';

export default function PackagesLoading() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#10B981]" />
        <p className="text-gray-600 text-lg">جاري تحميل الباقات...</p>
      </div>
    </div>
  );
}
