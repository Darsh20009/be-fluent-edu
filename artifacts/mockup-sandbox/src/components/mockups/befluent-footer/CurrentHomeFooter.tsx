import './_group.css'
import BrandLockup from './_shared/BrandLockup'

export function CurrentHomeFooter() {
  return (
    <main className="flex min-h-screen flex-col justify-end bg-[#fffefa] text-[#26352f]">
      <footer dir="rtl" className="border-t border-[#e4eae3]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="text-right">
            <a href="/" className="inline-block" aria-label="الصفحة الرئيسية لـ Be Fluent">
              <BrandLockup size="sm" tagline="إنجليزية تُستخدم في الحياة." />
            </a>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-[11px] font-semibold text-[#5f6e64]" aria-label="روابط التذييل">
            <a href="/about-path" className="hover:text-[#28694b]">عن المنهج</a>
            <a href="/learning-path" className="hover:text-[#28694b]">مسار التعلم</a>
            <a href="/packages" className="hover:text-[#28694b]">الباقات</a>
            <a href="/contact" className="hover:text-[#28694b]">تواصل معنا</a>
            <a href="/dashboard" className="hover:text-[#28694b]">لوحة التحكم</a>
          </nav>
          <p className="text-[11px] text-[#89958c]">© Be Fluent</p>
        </div>
      </footer>
    </main>
  )
}