import './_group.css'
import BrandLockup from './_shared/BrandLockup'

export function SharedMarketingFooter() {
  return (
    <main className="flex min-h-screen flex-col justify-end bg-[#fdfcf8]">
      <footer dir="rtl" className="bg-[#152b27] text-[#eff1e9]">
        <div className="mx-auto max-w-[1130px] px-6 py-12">
          <div className="grid gap-8 border-b border-white/15 pb-9 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <BrandLockup size="md" tone="light" tagline="الطلاقة أولاً" className="mb-3" />
              <p className="max-w-xs text-[10px] leading-6 text-white/65">
                تعليم إنجليزي منظم وعملي، مبني حول ما تحتاج أن تقوله في حياتك بالفعل.
              </p>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-[.18em] text-[#75c7a1]">استكشف</p>
              <div className="flex flex-col gap-2 text-[11px] text-white/75">
                <a href="/about-path">عن المنهج</a>
                <a href="/learning-path">مسار التعلم</a>
                <a href="/packages">الباقات</a>
                <a href="/grammar">القواعد</a>
                <a href="/placement-test">اختبار المستوى</a>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-[.18em] text-[#75c7a1]">تواصل</p>
              <p className="text-[11px] text-white/75">support@befluent-edu.online</p>
              <p dir="ltr" className="mt-2 text-[11px] text-white/75">+20 109 151 5594</p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-2 pt-5 text-[9px] text-white/45 md:flex-row">
            <span>الطلاقة أولاً</span>
            <span>© 2026 Be Fluent Academy</span>
          </div>
          <div className="mt-5 border-t border-white/10 pt-4 text-center text-[10px] text-white/65">
            <a
              href="https://qiroxstudio.online"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Made by Qirox Studio Group"
              className="inline-flex items-center justify-center gap-2 font-bold text-white transition hover:text-[#75c7a1]"
            >
              <img src="/__mockup/images/qirox-studio-logo.png" alt="" aria-hidden="true" className="h-7 w-7 object-contain" />
              <span dir="ltr">Made by Qirox Studio Group</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}