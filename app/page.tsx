import Link from "next/link";
import Image from "next/image";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import AppHeader from "@/components/layout/AppHeader";
import { BookOpen, Video, Users, Award, Globe, Sparkles, MessageCircle, Target, ArrowRight, CheckCircle, Star, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937]">
      <AppHeader variant="marketing">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Be Fluent" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-bold text-[#1F2937]">Be Fluent</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 mr-auto px-8">
          <Link href="/" className="text-gray-600 hover:text-[#10B981] font-medium transition-colors">الرئيسية</Link>
          <Link href="/packages" className="text-gray-600 hover:text-[#10B981] font-medium transition-colors">باقاتنا</Link>
          <Link href="/placement-test" className="text-gray-600 hover:text-[#10B981] font-medium transition-colors">اختبار المستوى</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="px-6 py-2 text-sm font-bold rounded-xl border-2 border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white transition-all duration-300"
          >
            تسجيل الدخول
          </Link>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all">
            <span>📥</span>
            تحميل التطبيق
          </button>
        </div>
      </AppHeader>

      <main className="w-full overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative w-full py-12 sm:py-20 lg:py-32 bg-[#F9FAFB]">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 text-right lg:text-right" dir="rtl">
                <div className="inline-flex items-center gap-2 bg-[#10B981]/10 px-4 py-2 rounded-full mb-6 border border-[#10B981]/20">
                  <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold text-[#047857]">مستقبلك يبدأ بطلاقة لسانك</span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-[#1F2937] mb-6 leading-tight">
                  تعلم الإنجليزية <br />
                  <span className="text-[#10B981]">بذكاء وواقعية</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                  منصة Be Fluent توفر لك تجربة تعليمية فريدة تجمع بين الحصص المباشرة والمتابعة اليومية عبر الواتساب لضمان وصولك للطلاقة.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth/register"
                    className="px-10 py-5 bg-[#10B981] text-white rounded-2xl text-lg font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-center"
                  >
                    ابدأ رحلتك الآن
                  </Link>
                  <a
                    href="https://wa.me/201091515594"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-10 py-5 bg-white border-2 border-[#10B981] text-[#10B981] rounded-2xl text-lg font-bold hover:bg-[#10B981]/5 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <span>تواصل معنا</span>
                  </a>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                  <Image src="/logo.png" alt="Be Fluent" width={600} height={400} className="w-full h-auto object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#10B981] rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#1F2937] rounded-full opacity-10 blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-[#1F2937] mb-4">ما الذي يميز Be Fluent؟</h2>
              <div className="w-20 h-1 bg-[#10B981] mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "📱",
                  title: "متابعة يومية عبر الواتساب",
                  description: "متابعة مستمرة يومياً عبر الواتساب للإجابة على تساؤلاتك وتدريبات إضافية لضمان استمرارية تعلمك."
                },
                {
                  icon: "👥",
                  title: "حصص مباشرة تفاعلية",
                  description: "حصص حية مع مدرسين محترفين تركز على المحادثة وكسر حاجز الخوف من التحدث."
                },
                {
                  icon: "⚡",
                  title: "نظام تعلم ذكي",
                  description: "تتبع آلي لمفرداتك الجديدة وتقدمك في المستوى باستخدام أحدث تقنيات التعلم الذكي."
                },
                {
                  icon: "🛠️",
                  title: "دعم فني 24/7",
                  description: "فريق دعم متواجد على مدار الساعة لمساعدتك في أي عقبة تقنية أو تعليمية تواجهك."
                }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-3xl bg-[#F9FAFB] hover:bg-white border-2 border-transparent hover:border-[#10B981]/20 transition-all text-center group">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-4">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-[#F9FAFB]">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 w-full">
            <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 border border-gray-100 w-full">
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <div className="inline-flex items-center gap-3 bg-[#10B981]/10 border border-[#10B981]/30 px-8 py-3 rounded-full mb-6 shadow-sm">
                  <Globe className="w-6 h-6 text-[#10B981]" />
                  <span className="text-base font-bold text-[#047857] tracking-wide">
                    INVESTMENT IN YOUR FUTURE
                  </span>
                  <Globe className="w-6 h-6 text-[#10B981]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1F2937]">
                  اختر خطتك التعليمية
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  تجربة تعليمية متميزة بأسعار تنافسية
                </p>
              </div>

              <div className="flex justify-center mb-12">
                <div className="bg-gray-50 p-1 rounded-2xl shadow-inner border border-gray-200 flex">
                  <button className="px-8 py-3 rounded-xl font-bold transition-all bg-[#10B981] text-white shadow-md">
                    اشتراك Basic (جروب)
                  </button>
                  <button className="px-8 py-3 rounded-xl font-bold transition-all text-gray-500 hover:bg-gray-100">
                    اشتراك Gold (برايفت)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                {[
                  { name: "Month Basic", price: "1500", lessons: "8", duration: "1 Month", gradient: "from-green-500 to-emerald-600", popular: false },
                  { name: "3 Months Basic", price: "3500", lessons: "24", duration: "3 Months", gradient: "from-emerald-500 to-teal-600", popular: true },
                  { name: "6 Months Basic", price: "6000", lessons: "48", duration: "6 Months", gradient: "from-gray-600 to-gray-700", popular: false },
                ].map((pkg, index) => (
                  <div
                    key={index}
                    className={`relative rounded-3xl p-8 text-center transform transition-all duration-500 ${
                      pkg.popular
                        ? 'bg-[#1F2937] text-white shadow-2xl scale-105 lg:scale-110'
                        : 'bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl hover:scale-105 text-[#1F2937]'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                        <div className="bg-[#10B981] text-white px-6 py-2 rounded-full text-sm font-black shadow-xl flex items-center gap-2">
                          <Star className="w-4 h-4 fill-white" />
                          BEST VALUE
                          <Star className="w-4 h-4 fill-white" />
                        </div>
                      </div>
                    )}

                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${pkg.gradient} rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg`}>
                      {index + 1}
                    </div>

                    <h3 className={`text-2xl font-extrabold mb-6 ${pkg.popular ? 'text-white' : 'text-[#1F2937]'}`}>
                      {pkg.name}
                    </h3>

                    <div className="mb-6">
                      <div className="flex items-end justify-center gap-2">
                        <span className={`text-5xl font-black ${pkg.popular ? 'text-white' : 'text-[#10B981]'}`}>
                          {pkg.price}
                        </span>
                        <span className={`text-2xl font-bold pb-1 ${pkg.popular ? 'text-white/80' : 'text-gray-500'}`}>
                          EGP
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className={`flex items-center justify-center gap-2 ${pkg.popular ? 'text-white' : 'text-gray-600'}`}>
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                        <span className="font-semibold">{pkg.lessons} lessons</span>
                      </div>
                      <div className={`flex items-center justify-center gap-2 ${pkg.popular ? 'text-white' : 'text-gray-600'}`}>
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                        <span className="font-semibold">{pkg.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-3 px-12 py-5 bg-[#10B981] text-white rounded-2xl text-lg font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>عرض جميع الباقات</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Other sections can follow... */}
      </main>
      <FloatingContactButtons />
    </div>
  )
}
