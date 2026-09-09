export default function InvoiceLoading() {
  return (
    <div className="min-h-[100dvh] bg-[#f4f1e8] p-5 sm:p-10" dir="rtl">
      <div className="max-w-4xl mx-auto bg-[#fbfaf5] border border-[#d6d2c3] animate-pulse">
        <div className="h-48 bg-[#174c3c]" />
        <div className="p-8 space-y-7">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">{[1,2,3,4].map((item) => <div key={item} className="h-16 bg-[#e8eee7]" />)}</div>
          <div className="h-32 bg-[#f1eee4]" />
          <div className="h-24 bg-[#e8eee7]" />
        </div>
      </div>
    </div>
  )
}