'use client';

export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-[#f4f1e8] flex items-center justify-center" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 rounded-full border-2 border-[#174c3c]/20 border-t-[#174c3c] animate-spin" />
        <p className="text-[#19372d] text-sm font-medium">جاري التحميل...</p>
        <p className="text-[#718075] text-xs">Be Fluent Academy</p>
      </div>
    </div>
  );
}
