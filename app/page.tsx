'use client';

import Link from "next/link";
import Image from "next/image";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import AppHeader from "@/components/layout/AppHeader";
import { BookOpen, Video, Users, Award, Globe, Sparkles, MessageCircle, Target, ArrowRight, CheckCircle, Star, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#E8DCC8] to-[#F5F1E8] text-black">
      <AppHeader variant="marketing">
        <nav className="hidden md:flex items-center gap-4 mr-4">
          <Link
            href="/placement-test"
            className="px-4 py-2 text-sm font-semibold text-[#004E89] hover:bg-[#004E89]/10 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <span>🎯</span>
            <span>اختبار تحديد المستوى</span>
          </Link>
          <Link
            href="/listening"
            className="px-4 py-2 text-sm font-semibold text-[#004E89] hover:bg-[#004E89]/10 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <span>🎧</span>
            <span>الاستماع</span>
          </Link>
          <Link
            href="/grammar"
            className="px-4 py-2 text-sm font-semibold text-[#004E89] hover:bg-[#004E89]/10 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <span>📚</span>
            <span>القواعد</span>
          </Link>
        </nav>
        <Link
          href="/auth/login"
          className="px-6 py-3 text-base rounded-xl bg-[#004E89] text-white hover:bg-[#003A6B] transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
        >
          Login
        </Link>
      </AppHeader>

      <main className="w-full overflow-x-hidden">
        {/* Hero Section - More Professional */}
        <section className="relative w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 overflow-hidden">

          {/* Geometric Decorations */}
          <div className="absolute top-32 right-20 w-20 h-20 border-4 border-[#004E89]/20 rounded-lg rotate-12 hidden lg:block"></div>
          <div className="absolute bottom-40 left-16 w-16 h-16 border-4 border-[#FF6B35]/20 rounded-full hidden lg:block"></div>
          <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-gradient-to-br from-[#004E89]/10 to-transparent rounded-lg rotate-45 hidden lg:block"></div>

          <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="text-center max-w-full lg:max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-[#004E89]/20 px-6 py-3 rounded-full mb-8 shadow-lg">
                <Star className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
                <span className="text-sm font-bold text-[#004E89] tracking-wide">
                  PROFESSIONAL ENGLISH LEARNING PLATFORM
                </span>
                <Star className="w-5 h-5 text-[#FFD700] fill-[#FFD700]" />
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-4 sm:mb-6 leading-tight px-4">
                <span className="block text-[#1a1a1a] mb-2 sm:mb-3">
                  Master English
                </span>
                <span className="block bg-gradient-to-r from-[#004E89] via-[#0066CC] to-[#004E89] bg-clip-text text-transparent">
                  with Excellence
                </span>
              </h1>

              {/* Subtitle */}
              <div className="max-w-3xl mx-auto mb-8 sm:mb-12 space-y-4 px-4">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 font-medium leading-relaxed">
                  Transform your future with interactive live classes led by expert instructors
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-2xl mx-auto mb-12 sm:mb-16 px-4">
                <Link
                  href="/auth/register"
                  className="group relative w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#004E89] to-[#0066CC] text-white rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 text-center overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Zap className="w-6 h-6" />
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                </Link>
                <a
                  href="https://wa.me/201091515594"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-white border-2 border-[#25D366] text-[#25D366] rounded-2xl text-base sm:text-lg font-bold hover:bg-[#25D366] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-center"
                >
                  <span className="flex items-center justify-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    Contact Us
                  </span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-6 max-w-full md:max-w-4xl mx-auto px-2 xs:px-3 sm:px-4">
                {[
                  { number: "500+", label: "Students" },
                  { number: "50+", label: "Teachers" },
                  { number: "1000+", label: "Classes" },
                  { number: "98%", label: "Satisfaction" }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-[#004E89]/10">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#004E89] mb-1 sm:mb-2">{stat.number}</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Premium Design */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 px-4">
                <span className="text-[#1a1a1a]">Why Choose </span>
                <span className="text-[#004E89]">Youspeak</span>
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-[#004E89] to-transparent mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[
                {
                  icon: <Video className="w-8 h-8 sm:w-10 sm:h-10" />,
                  gradient: "from-blue-500 to-blue-700",
                  title: "Live Interactive Classes",
                  description: "Engage in real-time 60-minute sessions with professional teachers"
                },
                {
                  icon: <Target className="w-10 h-10" />,
                  gradient: "from-orange-500 to-red-600",
                  title: "Personalized Assessment",
                  description: "Free 20-minute placement test to identify your level"
                },
                {
                  icon: <BookOpen className="w-10 h-10" />,
                  gradient: "from-green-500 to-emerald-700",
                  title: "Smart Learning System",
                  description: "AI-powered vocabulary tracking and progress monitoring"
                },
                {
                  icon: <Users className="w-10 h-10" />,
                  gradient: "from-purple-500 to-purple-700",
                  title: "Expert Instructors",
                  description: "Certified professionals with years of teaching experience"
                },
                {
                  icon: <MessageCircle className="w-10 h-10" />,
                  gradient: "from-pink-500 to-rose-700",
                  title: "24/7 Support",
                  description: "Round-the-clock assistance for your learning journey"
                },
                {
                  icon: <Award className="w-10 h-10" />,
                  gradient: "from-yellow-500 to-orange-600",
                  title: "Recognized Certificates",
                  description: "Industry-recognized completion certificates"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#004E89]/5 to-transparent rounded-bl-3xl"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages Section - Elegant Design */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-[#F5F1E8]">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 w-full">
            <div className="bg-[#F5F1E8] rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 border border-[#d4c9b8] w-full">
              <div className="text-center mb-8 sm:mb-12 md:mb-16">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#004E89]/10 to-[#0066CC]/10 border border-[#004E89]/30 px-8 py-3 rounded-full mb-6 shadow-lg">
                  <Globe className="w-6 h-6 text-[#004E89]" />
                  <span className="text-base font-bold text-[#004E89] tracking-wide">
                    INVESTMENT IN YOUR FUTURE
                  </span>
                  <Globe className="w-6 h-6 text-[#004E89]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  <span className="text-[#1a1a1a]">Choose Your </span>
                  <span className="text-[#004E89]">Package</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Premium learning experiences at competitive prices
                </p>
              </div>

              <div className="flex justify-center mb-12">
                <div className="bg-white p-1 rounded-2xl shadow-lg border border-gray-200 flex">
                  <button className="px-8 py-3 rounded-xl font-bold transition-all bg-[#004E89] text-white shadow-md">
                    اشتراك Basic (جروب)
                  </button>
                  <button className="px-8 py-3 rounded-xl font-bold transition-all text-gray-500 hover:bg-gray-100">
                    اشتراك Gold (برايفت)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                {[
                  { name: "Month Basic", price: "1500", lessons: "8", duration: "1 Month", gradient: "from-blue-500 to-blue-600", popular: false },
                  { name: "3 Months Basic", price: "3500", lessons: "24", duration: "3 Months", gradient: "from-purple-500 to-purple-600", popular: true },
                  { name: "6 Months Basic", price: "6000", lessons: "48", duration: "6 Months", gradient: "from-gray-500 to-gray-600", popular: false },
                ].map((pkg, index) => (
                  <div
                    key={index}
                    className={`relative rounded-3xl p-8 text-center transform transition-all duration-500 ${
                      pkg.popular
                        ? 'bg-gradient-to-br from-[#004E89] to-[#0066CC] text-white shadow-2xl scale-105 lg:scale-110'
                        : 'bg-white border-2 border-gray-200 shadow-xl hover:shadow-2xl hover:scale-105 text-black'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-black shadow-xl flex items-center gap-2">
                          <Star className="w-4 h-4 fill-black" />
                          BEST VALUE
                          <Star className="w-4 h-4 fill-black" />
                        </div>
                      </div>
                    )}

                    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${pkg.gradient} rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg ${pkg.popular ? 'bg-white/20' : ''}`}>
                      {index + 1}
                    </div>

                    <h3 className={`text-2xl font-extrabold mb-6 ${pkg.popular ? 'text-white' : 'text-[#1a1a1a]'}`}>
                      {pkg.name}
                    </h3>

                    <div className="mb-6">
                      <div className="flex items-end justify-center gap-2">
                        <span className={`text-5xl font-black ${pkg.popular ? 'text-white' : 'text-[#004E89]'}`}>
                          {pkg.price}
                        </span>
                        <span className={`text-2xl font-bold pb-1 ${pkg.popular ? 'text-white/80' : 'text-gray-600'}`}>
                          EGP
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className={`flex items-center justify-center gap-2 ${pkg.popular ? 'text-white' : 'text-gray-700'}`}>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">{pkg.lessons} lessons</span>
                      </div>
                      <div className={`flex items-center justify-center gap-2 ${pkg.popular ? 'text-white' : 'text-gray-700'}`}>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">{pkg.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-[#004E89] to-[#0066CC] text-white rounded-2xl text-lg font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>View All Packages</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Free Resources Section */}
        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 px-8 py-3 rounded-full mb-6 shadow-lg">
                <Sparkles className="w-6 h-6 text-green-600" />
                <span className="text-base font-bold text-green-700 tracking-wide">
                  مجاناً بدون اشتراك - FREE RESOURCES
                </span>
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                <span className="text-[#1a1a1a]">تعلم </span>
                <span className="text-[#004E89]">مجاناً</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                استمتع بموارد تعليمية مجانية لتحسين مهاراتك في اللغة الإنجليزية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {/* Placement Test Card */}
              <Link
                href="/placement-test"
                className="group relative bg-gradient-to-br from-orange-50 to-amber-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-orange-200 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg text-4xl">
                    🎯
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-4">
                    اختبار تحديد المستوى
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    اكتشف مستواك الحقيقي في اللغة الإنجليزية من خلال اختبار شامل يقيس جميع المهارات.
                  </p>
                  <ul className="text-gray-700 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>20 سؤال متنوع</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>قراءة، مفردات، قواعد</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>نتيجة فورية مع توصيات</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>مستويات A1 - C1</span>
                    </li>
                  </ul>
                  <div className="inline-flex items-center gap-2 text-orange-600 font-bold group-hover:gap-4 transition-all">
                    <span>ابدأ الاختبار الآن</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>

              {/* Listening Card */}
              <Link
                href="/listening"
                className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-blue-200 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg text-4xl">
                    🎧
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-4">
                    نظام الاستماع
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    استمع لمقاطع صوتية وفيديو تعليمية مع تمارين تفاعلية. تغيير سرعة الصوت، إعادة التشغيل، ونص مكتوب للمتابعة.
                  </p>
                  <ul className="text-gray-700 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>15+ محتوى صوتي وفيديو</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>تمارين بعد كل استماع</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>تحكم في سرعة الصوت</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>مستويات مبتدئ - متوسط - متقدم</span>
                    </li>
                  </ul>
                  <div className="inline-flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
                    <span>ابدأ الاستماع الآن</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>

              {/* Grammar Card */}
              <Link
                href="/grammar"
                className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-purple-200 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg text-4xl">
                    📚
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-4">
                    قواعد اللغة
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    تعلم قواعد اللغة الإنجليزية بطريقة مبسطة مع شرح عربي وأمثلة واضحة لكل قاعدة.
                  </p>
                  <ul className="text-gray-700 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>30+ قاعدة نحوية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>شرح بالعربي والإنجليزي</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>أمثلة عملية لكل قاعدة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>بحث وتصفية سهلة</span>
                    </li>
                  </ul>
                  <div className="inline-flex items-center gap-2 text-purple-600 font-bold group-hover:gap-4 transition-all">
                    <span>تصفح القواعد الآن</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Professional */}
      <footer className="relative w-full bg-gradient-to-b from-white/60 to-white/80 backdrop-blur-md border-t-2 border-[#004E89]/10 text-black py-6 sm:py-8 md:py-12 lg:py-16 mt-8 sm:mt-12 md:mt-16 lg:mt-20">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Youspeak Logo"
                  width={56}
                  height={56}
                  className="w-14 h-14"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
              <span className="text-4xl font-extrabold bg-gradient-to-r from-[#004E89] to-[#0066CC] bg-clip-text text-transparent">
                Youspeak
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <a href="mailto:youspeak.help@gmail.com" className="flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200">
                <div className="w-10 h-10 bg-[#004E89] rounded-lg flex items-center justify-center text-white">
                  📧
                </div>
                <span className="font-semibold text-gray-700">youspeak.help@gmail.com</span>
              </a>
              <a href="tel:+201091515594" className="flex items-center justify-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200">
                <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center text-white">
                  📱
                </div>
                <span className="font-semibold text-gray-700">+201091515594</span>
              </a>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#004E89]/30 to-transparent mb-8"></div>

            <p className="text-base font-semibold text-gray-700">
              © 2024 Youspeak - All Rights Reserved
            </p>
          </div>
        </div>

        {/* Bottom Credit */}
        <div className="mt-8 pt-6 border-t border-[#004E89]/10">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            Crafted with <span className="text-red-500">❤️</span> by MA3K Company
          </p>
        </div>
      </footer>

      <FloatingContactButtons />
    </div>
  );
}