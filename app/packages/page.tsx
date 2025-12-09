import Link from 'next/link'
import { Check, ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import AppHeader from '@/components/layout/AppHeader'

export const dynamic = 'force-dynamic'

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  })

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <AppHeader variant="marketing">
        <Link
          href="/"
          className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg border-2 border-[#004E89] text-[#004E89] hover:bg-[#004E89] hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Home / العودة للرئيسية</span>
          <span className="sm:hidden">Back / عودة</span>
        </Link>
        <Link
          href="/auth/login"
          className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg bg-[#004E89] text-white hover:bg-[#003A6B] transition-colors text-sm sm:text-base"
        >
          Login / تسجيل الدخول
        </Link>
      </AppHeader>

      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3 sm:mb-4">
            Our Packages / باقاتنا
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-black max-w-3xl mx-auto px-4">
            Choose the perfect learning package for your English journey
          </p>
          <p className="text-base sm:text-lg md:text-xl text-black max-w-3xl mx-auto px-4" dir="rtl">
            اختر الباقة المثالية لرحلتك في تعلم اللغة الإنجليزية
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto mb-8 sm:mb-10 md:mb-12">
          {packages.map((pkg, index) => {
            const isRecommended = pkg.title === 'Monthly' || pkg.titleAr === 'شهري'
            const isPopular = pkg.lessonsCount === 12

            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 ${
                  isRecommended ? 'ring-4 ring-[#004E89]' : ''
                }`}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-[#004E89] text-white px-3 sm:px-4 py-1 rounded-bl-lg font-semibold text-xs sm:text-sm">
                    Recommended / موصى به
                  </div>
                )}

                <div className={`p-4 sm:p-6 md:p-8 ${isRecommended ? 'bg-gradient-to-br from-[#004E89] to-[#1a6ba8]' : 'bg-[#F5F1E8]'}`}>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isRecommended ? 'text-white' : 'text-black'}`}>
                    {pkg.title}
                  </h3>
                  <p className={`text-base sm:text-lg ${isRecommended ? 'text-white/90' : 'text-black'}`}>
                    {pkg.titleAr}
                  </p>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2">
                      {pkg.price}
                      <span className="text-xl sm:text-2xl text-black"> SAR</span>
                    </p>
                    <p className="text-sm sm:text-base text-black">
                      {Math.ceil(pkg.durationDays / 30)} month(s) / شهر
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#004E89] flex-shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base text-black">
                        {pkg.lessonsCount} live sessions / حصة مباشرة
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#004E89] flex-shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base text-black">
                        60-minute interactive classes / حصص تفاعلية 60 دقيقة
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#004E89] flex-shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base text-black">
                        Homework & corrections / واجبات وتصحيح
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#004E89] flex-shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base text-black">
                        Vocabulary tracking / تتبع الكلمات
                      </p>
                    </div>
                    {pkg.description && (
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#004E89] flex-shrink-0 mt-0.5" />
                        <p className="text-black">{pkg.description}</p>
                      </div>
                    )}
                    {pkg.descriptionAr && (
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-[#004E89] flex-shrink-0 mt-0.5" />
                        <p className="text-black" dir="rtl">{pkg.descriptionAr}</p>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/auth/register"
                    className={`block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                      isRecommended
                        ? 'bg-[#004E89] text-white hover:bg-[#003A6A]'
                        : 'bg-gray-200 text-[#004E89] hover:bg-gray-300'
                    }`}
                  >
                    Get Started / ابدأ الآن
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-[#F5F1E8] rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto border-2 border-[#d4c9b8]">
          <h3 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6 text-center">
            How It Works / كيف يعمل
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#004E89] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                1
              </div>
              <h4 className="font-semibold text-black mb-2 text-sm sm:text-base">Register / سجل</h4>
              <p className="text-xs sm:text-sm text-black">
                Create your account and select a package
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#004E89] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                2
              </div>
              <h4 className="font-semibold text-black mb-2 text-sm sm:text-base">Pay / ادفع</h4>
              <p className="text-xs sm:text-sm text-black">
                Contact us via WhatsApp for payment details
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#004E89] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                3
              </div>
              <h4 className="font-semibold text-black mb-2 text-sm sm:text-base">Learn / تعلم</h4>
              <p className="text-xs sm:text-sm text-black">
                Start attending live interactive sessions
              </p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm sm:text-base text-black mb-2 sm:mb-3 px-4">
              Need help choosing? Contact us on WhatsApp
            </p>
            <p className="text-sm sm:text-base text-black mb-3 sm:mb-4 px-4" dir="rtl">
              تحتاج مساعدة في الاختيار؟ تواصل معنا عبر الواتساب
            </p>
            <a
              href="https://wa.me/201091515594"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              Contact WhatsApp / واتساب
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-[#F5F1E8] text-black py-6 sm:py-8 mt-8 sm:mt-12 md:mt-16 border-t-2 border-[#d4c9b8]">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="mb-3 sm:mb-2 text-base sm:text-lg">Contact Us: youspeak.help@gmail.com</p>
          <p className="mb-3 sm:mb-2 text-base sm:text-lg">WhatsApp: +201091515594</p>
          <p className="text-sm sm:text-base mt-4 sm:mt-4">Made with ❤️ by MA3K Company</p>
        </div>
      </footer>

      <FloatingContactButtons />
    </div>
  )
}