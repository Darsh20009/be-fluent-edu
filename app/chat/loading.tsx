export default function ChatLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#f4f1e8] flex items-center justify-center" dir="rtl">
      <div className="w-full max-w-5xl p-5 space-y-4">
        <div className="h-16 bg-[#e8eee7] border border-[#d6d2c3] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-[19rem_1fr] gap-4 h-[65dvh]">
          <div className="hidden lg:block bg-[#e8eee7] border border-[#d6d2c3] animate-pulse" />
          <div className="bg-[#fbfaf5] border border-[#d6d2c3] p-6">
            <div className="h-5 w-40 bg-[#e8eee7] animate-pulse mb-8" />
            <div className="space-y-4"><div className="h-12 w-2/3 bg-[#edf1e9] animate-pulse" /><div className="h-12 w-1/2 mr-auto bg-[#e8eee7] animate-pulse" /></div>
          </div>
        </div>
      </div>
    </div>
  )
}