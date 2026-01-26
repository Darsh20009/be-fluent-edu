import Link from "next/link";
import Image from "next/image";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import AppHeader from "@/components/layout/AppHeader";
import { BookOpen, Video, Users, Award, Globe, Sparkles, MessageCircle, Target, ArrowRight, CheckCircle, Star, Zap, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1F2937] text-white">
      <AppHeader variant="marketing">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <Image src="/logo.png" alt="Be Fluent" width={40} height={40} className="relative rounded-lg shadow-lg" />
          </div>
          <span className="text-2xl font-[1000] text-white tracking-tighter">Be Fluent</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 mr-auto px-10">
          <Link href="/" className="relative text-gray-400 hover:text-white font-bold transition-colors group">
            الرئيسية
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/packages" className="relative text-gray-400 hover:text-white font-bold transition-colors group">
            باقاتنا
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/placement-test" className="relative text-gray-400 hover:text-white font-bold transition-colors group">
            اختبار المستوى
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] transition-all group-hover:w-full"></span>
          </Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm font-black text-gray-400 hover:text-white transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3.5 text-sm font-black rounded-2xl bg-[#10B981] text-white hover:bg-[#34D399] transition-all duration-300 shadow-xl shadow-[#10B981]/20 hover:-translate-y-0.5"
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
        <section className="relative w-full pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden bg-[#1F2937] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="lg:w-1/2 text-right lg:text-right order-2 lg:order-1" dir="rtl">
                <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2.5 rounded-2xl mb-8 border border-white/10 shadow-xl shadow-[#10B981]/5 transform transition-all hover:scale-105 hover:-rotate-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
                  </span>
                  <span className="text-sm font-black text-[#10B981] uppercase tracking-wider">مستقبلك يبدأ بطلاقة لسانك</span>
                </div>
                
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-[1000] text-white mb-8 leading-[1.1] tracking-tight">
                  أتقن <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#10B981] via-[#34D399] to-[#059669]">الإنجليزية</span> <br />
                  بلمسة إبداع
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-400 mb-12 leading-relaxed max-w-2xl font-medium">
                  ليست مجرد دروس، بل رحلة غامرة نحو الطلاقة. ندمج الذكاء الاصطناعي مع التفاعل البشري لنصنع منك متحدثاً واثقاً.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-start">
                  <Link
                    href="/auth/register"
                    className="group relative px-12 py-6 bg-[#10B981] text-white rounded-[2rem] text-xl font-black shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#059669] to-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 flex items-center gap-3">
                      ابدأ رحلتك الآن
                      <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" />
                    </span>
                  </Link>
                  <a
                    href="https://api.whatsapp.com/send/?phone=201091515594"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-12 py-6 bg-white/5 backdrop-blur-sm border-2 border-white/10 text-white rounded-[2rem] text-xl font-black hover:bg-white/10 hover:border-[#10B981] transition-all duration-500 text-center flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-6 h-6 text-[#10B981]" />
                    <span>تواصل معنا</span>
                  </a>
                </div>
              </div>
              
              <div className="lg:w-1/2 relative order-1 lg:order-2">
                <div className="relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981]/20 to-transparent rounded-[3rem] blur-2xl -z-10 animate-pulse"></div>
                  <div className="relative rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(16,185,129,0.3)] border-[12px] border-white/80 backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-all duration-700 ease-out group">
                    <Image 
                      src="/assets/hero-why-us.png" 
                      alt="Why Be Fluent" 
                      width={800} 
                      height={600} 
                      className="w-full h-auto object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Floating Stats Card */}
                  <div className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white z-20 animate-bounce-slow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#10B981] rounded-2xl flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-[#1F2937]">+5000</p>
                        <p className="text-xs font-bold text-gray-500 uppercase">طالب ملتحق</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Path Section - Immersive Design */}
        <section className="py-32 bg-[#1F2937] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#10B981] rounded-full blur-[150px]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="lg:w-1/2 group">
                <div className="relative p-4">
                  <div className="absolute inset-0 bg-[#10B981]/20 rounded-[3.5rem] rotate-3 group-hover:rotate-0 transition-transform duration-500 blur-xl"></div>
                  <div className="relative rounded-[3rem] overflow-hidden shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-all duration-700 hover:scale-105 border border-white/10 backdrop-blur-sm">
                    <Image 
                      src="/assets/hero-path.png" 
                      alt="Path to Fluency" 
                      width={800} 
                      height={600} 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2 text-right" dir="rtl">
                <h2 className="text-4xl sm:text-6xl font-[1000] text-white mb-10 leading-tight">
                  رحلة <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">الاحتراف</span> <br />
                  تبدأ بخطوة واثقة
                </h2>
                <div className="grid grid-cols-1 gap-8">
                  {[
                    { title: "بيئة غامرة", desc: "ندخلك في صلب اللغة من اليوم الأول بتمارين تحاكي الواقع", icon: <Globe className="w-6 h-6" /> },
                    { title: "ذكاء اصطناعي مُسخّر", desc: "تقنياتنا تتعرف على نقاط ضعفك وتقويها بشكل آلي", icon: <Zap className="w-6 h-6" /> },
                    { title: "دعم بشري حقيقي", desc: "نحن معك خطوة بخطوة، لسنا مجرد تطبيق جامد", icon: <Heart className="w-6 h-6" /> }
                  ].map((item, i) => (
                    <div key={i} className="group flex items-start gap-6 p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#10B981]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-[#10B981]/10">
                      <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center text-2xl shadow-[0_10px_20px_rgba(16,185,129,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-white mb-2">{item.title}</h4>
                        <p className="text-gray-400 text-lg font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Grid Reinvented */}
        <section className="py-32 bg-[#1F2937] relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl sm:text-6xl font-[1000] text-white mb-6">ابتكار في كل تفصيلة</h2>
              <p className="text-xl text-gray-400 font-medium leading-relaxed">
                صممنا Be Fluent لتكون المنصة الأكثر تطوراً وإمتاعاً في الوطن العربي
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                { icon: "🎨", title: "تصميم عصري", color: "bg-blue-500" },
                { icon: "🤖", title: "مساعد ذكي", color: "bg-purple-500" },
                { icon: "🎮", title: "تعلم باللعب", color: "bg-[#10B981]" },
                { icon: "📊", title: "تقارير دقيقة", color: "bg-orange-500" },
                { icon: "🔒", title: "خصوصية تامة", color: "bg-red-500" },
                { icon: "🌍", title: "عالم بلا حدود", color: "bg-indigo-500" }
              ].map((f, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-white/5 rounded-[3rem] transform rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                  <div className="relative p-10 bg-white/5 border border-white/10 rounded-[3rem] shadow-xl hover:shadow-2xl hover:bg-white/10 transition-all duration-500 group-hover:-translate-y-4">
                    <div className={`w-20 h-20 ${f.color} rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-lg transform group-hover:rotate-12 transition-transform`}>
                      {f.icon}
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4">{f.title}</h3>
                    <p className="text-gray-400 font-medium">تجربة فريدة تدمج التكنولوجيا بالفن لتقديم أفضل رحلة تعليمية ممكنة.</p>
                  </div>
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
