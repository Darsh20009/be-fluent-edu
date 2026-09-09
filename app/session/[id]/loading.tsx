export default function SessionLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#18211d] p-4 flex flex-col" dir="rtl">
      <div className="h-16 bg-[#f7f5ed] border-b border-[#d6d2c3] -m-4 mb-4 animate-pulse" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg bg-[#f7f5ed] border border-[#d6d2c3] p-10 text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-[#174c3c]/20 border-t-[#174c3c] animate-spin" />
          <p className="mt-5 text-sm text-[#19372d]">يتم فتح غرفة الحصة...</p>
        </div>
      </div>
    </div>
  )
}