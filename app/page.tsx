'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { BookOpen, Video, Users, Award, Globe, Sparkles, MessageCircle, Target, ArrowRight, CheckCircle, Star, Zap, ChevronLeft, ChevronRight, Headphones, GraduationCap, Trophy, Menu, X } from "lucide-react";

const heroImages = [
  { src: "/assets/hero-1.png", alt: "Why Us - Be Fluent" },
  { src: "/assets/hero-2.png", alt: "Live Sessions - Be Fluent" },
  { src: "/assets/hero-3.png", alt: "Interactive Learning - Be Fluent" },
  { src: "/assets/hero-4.png", alt: "Unlock Your Potential - Be Fluent" },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide();
    }
    if (touchStart - touchEnd < -75) {
      prevSlide();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F0FDF9] to-white text-[#1F2937]">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-md border-2 border-[#10B981]/20 group-hover:border-[#10B981] transition-all duration-300">
                <Image src="/logo.png" alt="Be Fluent" fill className="object-contain" sizes="48px" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black text-[#1F2937] tracking-tight leading-none">Be Fluent</span>
                <span className="text-[9px] md:text-[10px] text-[#10B981] font-bold tracking-widest uppercase">Fluency Comes First</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-[#10B981] font-semibold transition-colors relative group">
                الرئيسية
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/packages" className="text-gray-700 hover:text-[#10B981] font-semibold transition-colors relative group">
                باقاتنا
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/grammar" className="text-gray-700 hover:text-[#10B981] font-semibold transition-colors relative group">
                القواعد
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/listening" className="text-gray-700 hover:text-[#10B981] font-semibold transition-colors relative group">
                الاستماع
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-bold text-[#1F2937] hover:text-[#10B981] transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                انضم إلينا
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 animate-in slide-in-from-top duration-200">
              <nav className="flex flex-col gap-2">
                <Link href="/" className="px-4 py-3 text-gray-700 hover:bg-[#10B981]/10 rounded-lg font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  الرئيسية
                </Link>
                <Link href="/packages" className="px-4 py-3 text-gray-700 hover:bg-[#10B981]/10 rounded-lg font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  باقاتنا
                </Link>
                <Link href="/grammar" className="px-4 py-3 text-gray-700 hover:bg-[#10B981]/10 rounded-lg font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  القواعد
                </Link>
                <Link href="/listening" className="px-4 py-3 text-gray-700 hover:bg-[#10B981]/10 rounded-lg font-semibold transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  الاستماع
                </Link>
                <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-2">
                  <Link href="/auth/login" className="px-4 py-3 text-center text-[#1F2937] font-bold hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    تسجيل الدخول
                  </Link>
                  <Link href="/auth/register" className="mx-4 py-3 text-center bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-bold rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                    انضم إلينا
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="w-full overflow-x-hidden relative pt-16 md:pt-20">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-15%] w-[600px] h-[600px] bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#10B981]/15 to-transparent rounded-full blur-[120px] animate-[pulse_3s_ease-in-out_infinite]"></div>
          <div className="absolute top-[50%] left-[40%] w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[100px] animate-[pulse_4s_ease-in-out_infinite]"></div>
          
          {/* Floating Decorative Elements */}
          <div className="absolute top-[20%] left-[10%] w-4 h-4 bg-[#10B981] rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-[40%] right-[15%] w-3 h-3 bg-[#10B981] rounded-full opacity-40 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
          <div className="absolute bottom-[30%] left-[20%] w-5 h-5 bg-emerald-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
        </div>

        {/* Hero Section with Image Carousel */}
        <section className="relative w-full pt-8 pb-16 lg:pt-16 lg:pb-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Text Content */}
              <div className="lg:w-1/2 text-center lg:text-right order-2 lg:order-1" dir="rtl">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10B981]/20 to-[#059669]/10 px-5 py-2.5 rounded-full mb-6 border border-[#10B981]/20">
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm font-bold text-[#047857] tracking-wide">مستقبلك يبدأ هنا</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#1F2937] mb-6 leading-tight">
                  تعلم <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">الإنجليزية</span>
                  <br />
                  <span className="text-3xl sm:text-4xl lg:text-5xl">بأسلوب احترافي ومبتكر</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                  Be Fluent هي المنصة المتكاملة لتعلم اللغة الإنجليزية بأساليب حديثة تفاعلية مع معلمين محترفين ومجتمع داعم
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/auth/register"
                    className="group px-8 py-4 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>ابدأ رحلتك الآن</span>
                    <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="https://api.whatsapp.com/send/?phone=201091515594"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white border-2 border-[#10B981]/30 text-[#1F2937] rounded-2xl text-lg font-bold hover:bg-[#10B981]/5 hover:border-[#10B981] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5 text-[#10B981]" />
                    <span>تواصل معنا</span>
                  </a>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-10">
                  {[
                    { number: "500+", label: "طالب نشط" },
                    { number: "50+", label: "معلم محترف" },
                    { number: "98%", label: "نسبة الرضا" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl sm:text-3xl font-black text-[#10B981]">{stat.number}</div>
                      <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Image Carousel */}
              <div className="lg:w-1/2 order-1 lg:order-2 w-full max-w-xl mx-auto lg:max-w-none">
                <div 
                  className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-[4/3]"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Slides */}
                  <div className="relative w-full h-full">
                    {heroImages.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                          index === currentSlide 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-105'
                        }`}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className="object-contain"
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-[#10B981] hover:text-white transition-all duration-300 z-10"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-[#10B981] hover:text-white transition-all duration-300 z-10"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentSlide 
                            ? 'w-8 h-3 bg-[#10B981]' 
                            : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  {/* Decorative Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Icons Section */}
        <section className="py-12 bg-white/80 backdrop-blur-sm border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { icon: <Video className="w-8 h-8" />, label: "حصص مباشرة" },
                { icon: <BookOpen className="w-8 h-8" />, label: "دروس تفاعلية" },
                { icon: <Headphones className="w-8 h-8" />, label: "تدريب استماع" },
                { icon: <GraduationCap className="w-8 h-8" />, label: "شهادات معتمدة" },
                { icon: <Trophy className="w-8 h-8" />, label: "تحديات ومكافآت" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981]/10 to-[#059669]/5 flex items-center justify-center text-[#10B981] group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    {item.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-[#F0FDF9]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#10B981]/10 px-4 py-2 rounded-full mb-4">
                <Star className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-bold text-[#047857]">لماذا نحن؟</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F2937] mb-4">
                طريقك نحو <span className="text-[#10B981]">الطلاقة</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                نوفر لك تجربة تعليمية متكاملة تجمع بين التفاعل الحي والتقنيات الحديثة
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                { 
                  title: "حصص تفاعلية مباشرة", 
                  desc: "تعلم مع معلمين محترفين في حصص حية تفاعلية مع طلاب من جميع أنحاء العالم.",
                  icon: <Video className="w-7 h-7" />,
                  color: "from-green-500 to-emerald-600"
                },
                { 
                  title: "محتوى تعليمي حصري", 
                  desc: "دروس وفيديوهات ومقالات تعليمية مصممة خصيصاً لتسريع رحلة تعلمك.",
                  icon: <BookOpen className="w-7 h-7" />,
                  color: "from-blue-500 to-cyan-600"
                },
                { 
                  title: "تدريب على الاستماع", 
                  desc: "تمارين استماع متنوعة لتحسين مهاراتك في فهم اللغة الإنجليزية.",
                  icon: <Headphones className="w-7 h-7" />,
                  color: "from-purple-500 to-violet-600"
                },
                { 
                  title: "اختبارات وتقييمات", 
                  desc: "اختبارات دورية لقياس تقدمك مع تقارير مفصلة عن نقاط القوة والضعف.",
                  icon: <Target className="w-7 h-7" />,
                  color: "from-orange-500 to-red-500"
                },
                { 
                  title: "مجتمع تفاعلي", 
                  desc: "انضم لآلاف الطلاب في مجتمعنا التفاعلي للتدريب والتحفيز المتبادل.",
                  icon: <Users className="w-7 h-7" />,
                  color: "from-pink-500 to-rose-600"
                },
                { 
                  title: "شهادات معتمدة", 
                  desc: "احصل على شهادات معتمدة عند إتمام المستويات تؤهلك للعمل والدراسة.",
                  icon: <Award className="w-7 h-7" />,
                  color: "from-yellow-500 to-amber-600"
                },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="group relative p-6 lg:p-8 bg-white rounded-3xl border border-gray-100 hover:border-[#10B981]/30 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="relative text-xl lg:text-2xl font-bold text-[#1F2937] mb-3">{feature.title}</h3>
                  <p className="relative text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Path to Fluency Section */}
        <section className="py-20 lg:py-28 bg-[#1F2937] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="lg:w-1/2 text-center lg:text-right" dir="rtl">
                <div className="inline-flex items-center gap-2 bg-[#10B981]/20 px-4 py-2 rounded-full mb-6">
                  <Zap className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm font-bold text-[#10B981]">رحلة التعلم</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                  خطواتك نحو <span className="text-[#10B981]">إتقان الإنجليزية</span>
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                  رحلة مدروسة بعناية تأخذك من البداية حتى الاحتراف مع دعم مستمر في كل خطوة
                </p>
                
                <div className="space-y-4">
                  {[
                    { step: "1", title: "التسجيل والاشتراك", desc: "سجل حسابك واختر الباقة المناسبة" },
                    { step: "2", title: "خطة تعلم مخصصة", desc: "منهج مصمم خصيصاً لمستواك" },
                    { step: "3", title: "حصص تفاعلية يومية", desc: "تعلم مع معلمين محترفين" },
                    { step: "4", title: "تقييم وتحسين مستمر", desc: "تتبع تقدمك وحسّن أداءك" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {item.step}
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-white text-lg">{item.title}</h4>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#10B981] text-white rounded-2xl text-lg font-bold hover:bg-[#059669] transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    <span>سجل الآن وابدأ التعلم</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/30 to-[#059669]/20 rounded-3xl blur-2xl"></div>
                  <div className="relative rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                    <Image 
                      src="/assets/hero-4.png" 
                      alt="Path to Fluency" 
                      width={600} 
                      height={450} 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-[#F0FDF9] to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#10B981]/10 px-4 py-2 rounded-full mb-4">
                <Globe className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-bold text-[#047857]">Investment in Your Future</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F2937] mb-4">
                اختر خطتك التعليمية
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                تجربة تعليمية متميزة بأسعار تنافسية تناسب الجميع
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {[
                { name: "الباقة الشهرية", price: "1500", lessons: "8", duration: "شهر واحد", popular: false },
                { name: "الباقة الفصلية", price: "3500", lessons: "24", duration: "3 أشهر", popular: true },
                { name: "الباقة النصف سنوية", price: "6000", lessons: "48", duration: "6 أشهر", popular: false },
              ].map((pkg, index) => (
                <div
                  key={index}
                  className={`relative rounded-3xl p-6 lg:p-8 text-center transition-all duration-500 ${
                    pkg.popular
                      ? 'bg-gradient-to-br from-[#1F2937] to-[#374151] text-white shadow-2xl scale-100 lg:scale-105 border-2 border-[#10B981]'
                      : 'bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl hover:border-[#10B981]/30 text-[#1F2937]'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        الأكثر طلباً
                      </div>
                    </div>
                  )}

                  <h3 className={`text-xl lg:text-2xl font-bold mb-4 ${pkg.popular ? 'text-white' : 'text-[#1F2937]'}`}>
                    {pkg.name}
                  </h3>

                  <div className="mb-6">
                    <div className="flex items-end justify-center gap-1">
                      <span className={`text-4xl lg:text-5xl font-black ${pkg.popular ? 'text-white' : 'text-[#10B981]'}`}>
                        {pkg.price}
                      </span>
                      <span className={`text-xl font-bold pb-1 ${pkg.popular ? 'text-white/70' : 'text-gray-500'}`}>
                        جنيه
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className={`flex items-center justify-center gap-2 ${pkg.popular ? 'text-white' : 'text-gray-600'}`}>
                      <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      <span className="font-medium">{pkg.lessons} حصة</span>
                    </div>
                    <div className={`flex items-center justify-center gap-2 ${pkg.popular ? 'text-white' : 'text-gray-600'}`}>
                      <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      <span className="font-medium">{pkg.duration}</span>
                    </div>
                    <div className={`flex items-center justify-center gap-2 ${pkg.popular ? 'text-white' : 'text-gray-600'}`}>
                      <CheckCircle className="w-5 h-5 text-[#10B981]" />
                      <span className="font-medium">دعم فني كامل</span>
                    </div>
                  </div>

                  <Link
                    href="/packages"
                    className={`block w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                      pkg.popular
                        ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                        : 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981] hover:text-white'
                    }`}
                  >
                    اشترك الآن
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 text-[#10B981] font-bold hover:underline"
              >
                <span>عرض جميع الباقات</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-r from-[#10B981] to-[#059669] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
              جاهز لبدء رحلتك؟
            </h2>
            <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              انضم لآلاف الطلاب الذين غيروا حياتهم مع Be Fluent واكتشف قدراتك الحقيقية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-10 py-4 bg-white text-[#10B981] rounded-2xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                سجل مجاناً الآن
              </Link>
              <Link
                href="/packages"
                className="px-10 py-4 bg-white/20 border-2 border-white text-white rounded-2xl text-lg font-bold hover:bg-white hover:text-[#10B981] transition-all duration-300"
              >
                تصفح الباقات
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-[#1F2937] text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#10B981]/30">
                  <Image src="/logo.png" alt="Be Fluent" width={48} height={48} className="object-contain" />
                </div>
                <div>
                  <span className="text-xl font-black">Be Fluent</span>
                  <p className="text-xs text-gray-400">Fluency Comes First</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/packages" className="text-gray-400 hover:text-white transition-colors">الباقات</Link>
                <Link href="/grammar" className="text-gray-400 hover:text-white transition-colors">القواعد</Link>
                <Link href="/listening" className="text-gray-400 hover:text-white transition-colors">الاستماع</Link>
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">تسجيل الدخول</Link>
              </div>
              <p className="text-gray-500 text-sm">
                © 2025 Be Fluent. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </footer>

        <FloatingContactButtons />
      </main>
    </div>
  );
}
