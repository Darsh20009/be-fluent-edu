'use client';

import { Loader2 } from 'lucide-react';

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#004E89]" />
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );
}
