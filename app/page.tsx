import Link from "next/link";
import Image from "next/image";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import AppHeader from "@/components/layout/AppHeader";
import { BookOpen, Video, Users, Award, Globe, Sparkles, MessageCircle, Target, ArrowRight, CheckCircle, Star, Zap, Heart, Bot } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937]">
      <AppHeader variant="marketing">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <Image src="/logo.png" alt="Be Fluent" width={40} height={40} className="rounded-lg shadow-sm" />
          </div>
          <span className="text-2xl font-black text-[#1F2937] tracking-tight">Be Fluent</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 mr-auto px-10">
          <Link href="/" className="text-gray-600 hover:text-[#10B981] font-bold transition-colors">
            الرئيسية
          </Link>
          <Link href="/packages" className="text-gray-600 hover:text-[#10B981] font-bold transition-colors">
            باقاتنا
          </Link>
          <Link href="/placement-test" className="text-gray-600 hover:text-[#10B981] font-bold transition-colors">
            اختبار المستوى
          </Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-[#1F2937] hover:text-[#10B981] transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 text-sm font-black rounded-xl bg-[#10B981] text-white hover:bg-[#059669] transition-all shadow-md"
          >
            انضم إلينا
          </Link>
        </div>
      </AppHeader>

      <main className="w-full overflow-x-hidden relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10B981]/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-[#10B981]/10 rounded-full blur-[100px]"></div>
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[80px]"></div>
        </div>

        {/* Hero Section */}
        <section className="relative w-full pt-20 pb-24 lg:pt-32 lg:pb-40 bg-white">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 text-right" dir="rtl">
                <div className="inline-block bg-[#10B981]/10 px-4 py-2 rounded-lg mb-6">
                  <span className="text-sm font-bold text-[#10B981] uppercase tracking-wide">مستقبلك يبدأ هنا</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-[#1F2937] mb-8 leading-tight">
                  تعلم <span className="text-[#10B981]">الإنجليزية</span> بأسلوب احترافي
                </h1>
                <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl font-medium">
                  Be Fluent هي المنصة المتكاملة لتعلم اللغة الإنجليزية بأساليب حديثة ومبتكرة تناسب الجميع.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-start">
                  <Link
                    href="/auth/register"
                    className="px-10 py-5 bg-[#10B981] text-white rounded-xl text-lg font-bold shadow-lg hover:bg-[#059669] transition-all"
                  >
                    ابدأ الآن مجاناً
                  </Link>
                  <a
                    href="https://api.whatsapp.com/send/?phone=201091515594"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-10 py-5 bg-white border-2 border-gray-100 text-[#1F2937] rounded-xl text-lg font-bold hover:bg-gray-50 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5 text-[#10B981]" />
                    تواصل معنا
                  </a>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-50">
                  <Image src="/assets/hero-why-us.png" alt="Be Fluent" width={800} height={600} className="w-full h-auto" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Path Section */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  <Image src="/assets/hero-path.png" alt="Path" width={800} height={600} className="w-full h-auto" />
                </div>
              </div>
              <div className="lg:w-1/2 text-right" dir="rtl">
                <h2 className="text-4xl font-black text-[#1F2937] mb-8 leading-tight">
                  طريقك نحو <span className="text-[#10B981]">الطلاقة</span> يبدأ بخطة مدروسة
                </h2>
                <div className="space-y-6">
                  {[
                    { title: "أساليب حديثة", desc: "نستخدم أحدث التقنيات والأساليب التعليمية العالمية.", icon: <Sparkles className="w-6 h-6" /> },
                    { title: "متابعة مستمرة", desc: "فريقنا معك دائماً لضمان تحقيق أهدافك التعليمية.", icon: <CheckCircle className="w-6 h-6" /> },
                    { title: "مجتمع تفاعلي", desc: "انضم لآلاف الطلاب الذين غيروا حياتهم مع Be Fluent.", icon: <Users className="w-6 h-6" /> }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div className="w-12 h-12 shrink-0 bg-[#10B981]/10 rounded-xl flex items-center justify-center text-[#10B981]">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#1F2937] mb-1">{item.title}</h4>
                        <p className="text-gray-600 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-[#1F2937] mb-4">لماذا Be Fluent؟</h2>
              <p className="text-lg text-gray-600 font-medium">نحن نوفر لك كل ما تحتاجه للنجاح في رحلتك التعليمية</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "حصص مباشرة", desc: "تفاعل مباشر مع معلمين محترفين في بيئة تعليمية محفزة.", icon: <Video className="w-8 h-8" /> },
                { title: "ذكاء اصطناعي", desc: "مساعد ذكي متاح 24/7 للإجابة على جميع استفساراتك.", icon: <Bot className="w-8 h-8" /> },
                { title: "محتوى حصري", desc: "دروس وفيديوهات تعليمية مصممة خصيصاً لتسريع تعلمك.", icon: <BookOpen className="w-8 h-8" /> },
                { title: "اختبارات دورية", desc: "تقييمات مستمرة لمستوى تقدمك مع تقارير مفصلة.", icon: <Target className="w-8 h-8" /> },
                { title: "تعلم تفاعلي", desc: "نظام تعليمي يجمع بين المتعة والاحترافية.", icon: <Zap className="w-8 h-8" /> },
                { title: "دعم فني", desc: "دعم فني متاح دائماً لمساعدتك في أي مشكلة.", icon: <MessageCircle className="w-8 h-8" /> }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-[#10B981] transition-all hover:shadow-xl group">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#10B981] mb-6 shadow-sm group-hover:bg-[#10B981] group-hover:text-white transition-all">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1F2937] mb-4">{f.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed">{f.desc}</p>
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

        {/* Other sections follow */}
        <FloatingContactButtons />
      </main>
    </div>
  )
}
