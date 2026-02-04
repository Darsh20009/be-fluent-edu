'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import { BookOpen, Video, Users, Award, Globe, Sparkles, MessageCircle, Target, ArrowRight, CheckCircle, Star, Zap, ChevronLeft, ChevronRight, Headphones, GraduationCap, Trophy, Menu, X, Play, ArrowDown, Map as MapIcon } from "lucide-react";

const heroImages = [
  { src: "/assets/hero-1.png", alt: "Why Us - Be Fluent" },
  { src: "/assets/hero-2.png", alt: "Live Sessions - Be Fluent" },
  { src: "/assets/hero-3.png", alt: "Interactive Learning - Be Fluent" },
  { src: "/assets/hero-4.png", alt: "Unlock Your Potential - Be Fluent" },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <div className="min-h-screen bg-white text-[#1F2937] overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#10B981]/8 via-emerald-100/20 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/10 via-teal-50/30 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-radial from-emerald-50/40 to-transparent rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrollY > 20 
          ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-emerald-500/5 py-2" 
          : "bg-transparent py-4 md:py-6"
      )}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group relative z-10">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden shadow-md group-hover:shadow-emerald-200/50 transition-all duration-500 transform group-hover:scale-105">
                <Image src="/logo.png" alt="Be Fluent" fill className="object-contain" sizes="48px" />
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-lg md:text-2xl font-black tracking-tight leading-none transition-colors duration-300",
                  scrollY > 20 ? "text-[#1F2937]" : "text-[#1F2937]"
                )}>Be Fluent</span>
                <span className="text-[9px] md:text-[10px] text-[#10B981] font-bold tracking-[0.2em] uppercase">Fluency Comes First</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center bg-gray-100/50 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-gray-200/50">
              {[
                { label: "الرئيسية", href: "/" },
                { label: "باقاتنا", href: "/packages" },
                { label: "القواعد", href: "/grammar" },
                { label: "اعرف طريقك", href: "/about-path" },
              ].map((item, i) => (
                <Link 
                  key={i} 
                  href={item.href} 
                  className="px-5 py-2 text-sm font-bold text-gray-700 hover:text-[#10B981] transition-all duration-300 rounded-xl hover:bg-white hover:shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-[#10B981] transition-colors rounded-xl hover:bg-gray-100">
                تسجيل الدخول
              </Link>
              <Link href="/auth/register" className="px-6 py-2.5 text-sm font-bold rounded-xl bg-[#10B981] text-white shadow-lg shadow-emerald-200/50 hover:bg-[#059669] hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                انضم إلينا
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/auth/login" className="p-2.5 text-gray-700 hover:text-[#10B981] transition-colors">
                <Users className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2.5 rounded-xl bg-gray-100 text-[#1F2937] hover:bg-gray-200 transition-all duration-300 relative z-50"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <div className={cn(
            "fixed inset-0 bg-white/95 backdrop-blur-2xl z-40 md:hidden transition-all duration-500 ease-in-out",
            mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}>
            <div className="flex flex-col h-full pt-24 px-6 pb-10">
              <nav className="flex flex-col gap-4">
                {[
                  { label: "الرئيسية", href: "/", icon: <BookOpen className="w-5 h-5" /> },
                  { label: "باقاتنا", href: "/packages", icon: <Target className="w-5 h-5" /> },
                  { label: "القواعد", href: "/grammar", icon: <Globe className="w-5 h-5" /> },
                  { label: "اعرف طريقك", href: "/about-path", icon: <MapIcon className="w-5 h-5" /> },
                ].map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.href} 
                    className="flex items-center gap-4 p-4 text-xl font-bold text-gray-800 bg-gray-50 rounded-2xl active:scale-95 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#10B981]">
                      {item.icon}
                    </div>
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3">
                <Link 
                  href="/auth/login" 
                  className="w-full py-4 text-center text-gray-800 font-bold bg-gray-100 rounded-2xl active:scale-95 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/auth/register" 
                  className="w-full py-4 text-center bg-[#10B981] text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  انضم إلينا الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 pb-16 lg:pt-0 lg:pb-0 overflow-hidden">
          {/* Floating Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[15%] left-[5%] w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-300/10 animate-float" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-[60%] left-[8%] w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981]/30 to-emerald-200/20 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[25%] right-[8%] w-16 h-16 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-300/10 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-[20%] right-[12%] w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-200/15 animate-float" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Text Content */}
              <div className={`lg:w-1/2 text-center lg:text-right order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} dir="rtl">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10B981]/15 to-emerald-100/50 px-5 py-2.5 rounded-full mb-6 border border-[#10B981]/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-[#10B981] animate-pulse" />
                  <span className="text-sm font-bold text-[#047857]">مستقبلك يبدأ هنا</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#1F2937] mb-6 leading-[1.1]">
                  تعلم{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-emerald-500 to-teal-500">الإنجليزية</span>
                    <span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-[#10B981]/20 to-emerald-200/30 rounded-full blur-sm"></span>
                  </span>
                  <br />
                  <span className="text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">بأسلوب احترافي ومبتكر</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                  Be Fluent هي المنصة المتكاملة لتعلم اللغة الإنجليزية بأساليب حديثة تفاعلية مع معلمين محترفين ومجتمع داعم
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                  <Link href="/auth/register" className="group relative px-8 py-4 bg-gradient-to-r from-[#10B981] to-emerald-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:shadow-emerald-300/60 transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative">ابدأ رحلتك الآن</span>
                    <ArrowRight className="relative w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link href="/about-path" className="group px-8 py-4 bg-white border-2 border-gray-200 text-[#1F2937] rounded-2xl text-lg font-bold hover:border-[#10B981] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3">
                    <MapIcon className="w-5 h-5 text-[#10B981] group-hover:scale-110 transition-transform" />
                    <span>اعرف طريقك</span>
                  </Link>
                  <a href="https://api.whatsapp.com/send/?phone=201091515594" target="_blank" rel="noopener noreferrer" className="group px-8 py-4 bg-white border-2 border-gray-200 text-[#1F2937] rounded-2xl text-lg font-bold hover:border-[#10B981] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#10B981] group-hover:scale-110 transition-transform" />
                    <span>تواصل معنا</span>
                  </a>
                </div>

                {/* Animated Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                  {[
                    { number: "500+", label: "طالب نشط", icon: <Users className="w-5 h-5" /> },
                    { number: "50+", label: "معلم محترف", icon: <GraduationCap className="w-5 h-5" /> },
                    { number: "98%", label: "نسبة الرضا", icon: <Star className="w-5 h-5" /> },
                  ].map((stat, i) => (
                    <div key={i} className="group text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100 hover:border-[#10B981]/30 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-[#10B981]/10 to-emerald-50 flex items-center justify-center text-[#10B981] group-hover:scale-110 transition-transform">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-black text-[#10B981]">{stat.number}</div>
                      <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Innovative Image Section */}
              <div className={`lg:w-1/2 order-1 lg:order-2 w-full max-w-2xl mx-auto lg:max-w-none transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                <div className="relative">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/20 via-emerald-200/30 to-teal-100/20 rounded-[3rem] blur-3xl scale-110"></div>
                  
                  {/* Main Image Container */}
                  <div className="relative">
                    {/* Decorative Frame */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-[#10B981]/20 to-emerald-100/30 rounded-[3rem] transform rotate-3"></div>
                    <div className="absolute -inset-4 bg-gradient-to-tl from-teal-200/20 to-emerald-50/30 rounded-[3rem] transform -rotate-2"></div>
                    
                    {/* Image Carousel */}
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-200/40 border-4 border-white bg-white aspect-[4/3]">
                      {heroImages.map((image, index) => (
                        <div key={index} className={`absolute inset-0 transition-all duration-700 ease-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                          <Image 
                            src={image.src} 
                            alt={image.alt} 
                            fill 
                            className="object-contain" 
                            priority={index === 0} 
                            sizes="(max-width: 768px) 100vw, 50vw" 
                            quality={100}
                            loading={index === 0 ? "eager" : "lazy"} 
                          />
                        </div>
                      ))}

                      {/* Navigation */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent">
                        <div className="flex items-center justify-center gap-2">
                          {heroImages.map((_, index) => (
                            <button key={index} onClick={() => goToSlide(index)} className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'w-10 h-3 bg-white shadow-lg' : 'w-3 h-3 bg-white/50 hover:bg-white/70'}`} />
                          ))}
                        </div>
                      </div>

                      {/* Arrow Buttons */}
                      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center hover:bg-[#10B981] hover:text-white transition-all duration-300">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center hover:bg-[#10B981] hover:text-white transition-all duration-300">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Floating Cards */}
                    <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '0.5s' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-emerald-500 flex items-center justify-center text-white">
                          <Video className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-800">حصص مباشرة</div>
                          <div className="text-xs text-gray-500">يومياً</div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-800">شهادات معتمدة</div>
                          <div className="text-xs text-gray-500">عند الإتمام</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-bounce">
            <span className="text-sm text-gray-400 font-medium">اكتشف المزيد</span>
            <ArrowDown className="w-5 h-5 text-[#10B981]" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-white via-gray-50/50 to-white border-y border-gray-100">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {[
                { icon: <Video className="w-8 h-8" />, label: "حصص مباشرة", desc: "مع معلمين محترفين", color: "from-[#10B981] to-emerald-500" },
                { icon: <BookOpen className="w-8 h-8" />, label: "دروس تفاعلية", desc: "محتوى حصري", color: "from-blue-500 to-cyan-500" },
                { icon: <GraduationCap className="w-8 h-8" />, label: "شهادات معتمدة", desc: "عند الإتمام", color: "from-amber-500 to-orange-500" },
                { icon: <Trophy className="w-8 h-8" />, label: "تحديات ومكافآت", desc: "للتحفيز", color: "from-pink-500 to-rose-500" },
              ].map((item, i) => (
                <div key={i} className="group relative p-6 rounded-3xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="relative text-lg font-bold text-gray-800 mb-1">{item.label}</h3>
                  <p className="relative text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#10B981]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-50/50 to-transparent rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10B981]/10 to-emerald-50 px-5 py-2.5 rounded-full mb-4 border border-[#10B981]/20">
                <Star className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-bold text-[#047857]">لماذا نحن؟</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F2937] mb-4">
                طريقك نحو <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-emerald-500">الطلاقة</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                نوفر لك تجربة تعليمية متكاملة تجمع بين التفاعل الحي والتقنيات الحديثة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                { title: "حصص تفاعلية مباشرة", desc: "تعلم مع معلمين محترفين في حصص حية تفاعلية مع طلاب من جميع أنحاء العالم.", icon: <Video className="w-7 h-7" />, gradient: "from-emerald-500 to-teal-600", bg: "from-emerald-50 to-teal-50" },
                { title: "محتوى تعليمي حصري", desc: "دروس وفيديوهات ومقالات تعليمية مصممة خصيصاً لتسريع رحلة تعلمك.", icon: <BookOpen className="w-7 h-7" />, gradient: "from-blue-500 to-indigo-600", bg: "from-blue-50 to-indigo-50" },
                { title: "اختبارات وتقييمات", desc: "اختبارات دورية لقياس تقدمك مع تقارير مفصلة عن نقاط القوة والضعف.", icon: <Target className="w-7 h-7" />, gradient: "from-orange-500 to-red-500", bg: "from-orange-50 to-red-50" },
                { title: "مجتمع تفاعلي", desc: "انضم لآلاف الطلاب في مجتمعنا التفاعلي للتدريب والتحفيز المتبادل.", icon: <Users className="w-7 h-7" />, gradient: "from-pink-500 to-rose-600", bg: "from-pink-50 to-rose-50" },
                { title: "شهادات معتمدة", desc: "احصل على شهادات معتمدة عند إتمام المستويات تؤهلك للعمل والدراسة.", icon: <Award className="w-7 h-7" />, gradient: "from-amber-500 to-yellow-500", bg: "from-amber-50 to-yellow-50" },
                { title: "دعم على مدار الساعة", desc: "فريق دعم متخصص لمساعدتك في أي وقت والإجابة على جميع استفساراتك.", icon: <MessageCircle className="w-7 h-7" />, gradient: "from-violet-500 to-purple-600", bg: "from-violet-50 to-purple-50" },
              ].map((feature, i) => (
                <div key={i} className="group relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-transparent shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="relative text-xl font-bold text-[#1F2937] mb-3">{feature.title}</h3>
                  <p className="relative text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Image Showcase Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#10B981]/20 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]"></div>
          </div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Images Grid */}
              <div className="lg:w-1/2 w-full">
                <div className="relative grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  <div className="space-y-4">
                    <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 border-2 border-white/10">
                      <Image src="/assets/hero-1.png" alt="Learning" width={300} height={250} className="w-full h-auto object-cover" />
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 translate-x-6 border-2 border-white/10">
                      <Image src="/assets/hero-3.png" alt="Interactive" width={300} height={200} className="w-full h-auto object-cover" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 border-2 border-white/10">
                      <Image src="/assets/hero-2.png" alt="Sessions" width={300} height={200} className="w-full h-auto object-cover" />
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 -translate-x-4 border-2 border-white/10">
                      <Image src="/assets/hero-4.png" alt="Success" width={300} height={250} className="w-full h-auto object-cover" />
                    </div>
                  </div>

                  {/* Center Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-emerald-600 flex items-center justify-center shadow-2xl border-4 border-white/20 z-10">
                    <div className="text-center">
                      <div className="text-2xl font-black">4+</div>
                      <div className="text-xs font-medium opacity-80">مستويات</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-1/2 text-center lg:text-right" dir="rtl">
                <div className="inline-flex items-center gap-2 bg-[#10B981]/20 px-5 py-2.5 rounded-full mb-6 border border-[#10B981]/30">
                  <Zap className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm font-bold text-[#10B981]">رحلة التعلم</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                  خطواتك نحو <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-emerald-400">إتقان الإنجليزية</span>
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                  رحلة مدروسة بعناية تأخذك من البداية حتى الاحتراف مع دعم مستمر في كل خطوة
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { step: "1", title: "التسجيل والاشتراك", desc: "سجل حسابك واختر الباقة المناسبة" },
                    { step: "2", title: "خطة تعلم مخصصة", desc: "منهج مصمم خصيصاً لمستواك" },
                    { step: "3", title: "حصص تفاعلية يومية", desc: "تعلم مع معلمين محترفين" },
                    { step: "4", title: "تقييم وتحسين مستمر", desc: "تتبع تقدمك وحسّن أداءك" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-[#10B981]/30 transition-all duration-300 backdrop-blur-sm">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#10B981] to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {item.step}
                      </div>
                      <div className="text-right flex-1">
                        <h4 className="font-bold text-white text-lg">{item.title}</h4>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/auth/register" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#10B981] to-emerald-500 text-white rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300">
                  <span>سجل الآن وابدأ التعلم</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#10B981]/10 px-5 py-2.5 rounded-full mb-4 border border-[#10B981]/20">
                <Globe className="w-4 h-4 text-[#10B981]" />
                <span className="text-sm font-bold text-[#047857]">استثمر في مستقبلك</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F2937] mb-4">
                اختر خطتك التعليمية
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                تجربة تعليمية متميزة بأسعار تنافسية تناسب الجميع
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {[
                { name: "الباقة الشهرية", price: "1500", lessons: "8", duration: "شهر واحد", popular: false },
                { name: "الباقة الفصلية", price: "3500", lessons: "24", duration: "3 أشهر", popular: true },
                { name: "الباقة النصف سنوية", price: "6000", lessons: "48", duration: "6 أشهر", popular: false },
              ].map((pkg, index) => (
                <div key={index} className={`relative rounded-3xl p-8 text-center transition-all duration-500 ${pkg.popular ? 'bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white shadow-2xl scale-100 lg:scale-105 border-2 border-[#10B981]' : 'bg-white border-2 border-gray-100 shadow-xl hover:shadow-2xl hover:border-[#10B981]/30'}`}>
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-[#10B981] to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                        <Star className="w-4 h-4 fill-white" />
                        الأكثر طلباً
                      </div>
                    </div>
                  )}

                  <h3 className={`text-2xl font-bold mb-6 ${pkg.popular ? 'text-white' : 'text-[#1F2937]'}`}>{pkg.name}</h3>

                  <div className="mb-8">
                    <div className="flex items-end justify-center gap-1">
                      <span className={`text-5xl font-black ${pkg.popular ? 'text-white' : 'text-[#10B981]'}`}>{pkg.price}</span>
                      <span className={`text-xl font-bold pb-2 ${pkg.popular ? 'text-white/70' : 'text-gray-400'}`}>جنيه</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      `${pkg.lessons} حصة`,
                      pkg.duration,
                      "دعم فني كامل"
                    ].map((feature, i) => (
                      <div key={i} className={`flex items-center justify-center gap-3 ${pkg.popular ? 'text-white' : 'text-gray-600'}`}>
                        <CheckCircle className="w-5 h-5 text-[#10B981]" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/packages" className={`block w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${pkg.popular ? 'bg-gradient-to-r from-[#10B981] to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/30' : 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981] hover:text-white'}`}>
                    اشترك الآن
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/packages" className="inline-flex items-center gap-2 text-[#10B981] font-bold text-lg hover:gap-4 transition-all duration-300">
                <span>عرض جميع الباقات</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-24 bg-gradient-to-r from-[#10B981] via-emerald-500 to-teal-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
          
          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
              جاهز لبدء رحلتك؟
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              انضم لآلاف الطلاب الذين غيروا حياتهم مع Be Fluent واكتشف قدراتك الحقيقية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="px-10 py-4 bg-white text-[#10B981] rounded-2xl text-lg font-bold hover:bg-gray-100 hover:shadow-xl transition-all duration-300 shadow-lg">
                سجل مجاناً الآن
              </Link>
              <Link href="/packages" className="px-10 py-4 bg-white/20 border-2 border-white text-white rounded-2xl text-lg font-bold hover:bg-white hover:text-[#10B981] transition-all duration-300 backdrop-blur-sm">
                تصفح الباقات
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-[#0f172a] text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#10B981]/30 shadow-lg">
                  <Image src="/logo.png" alt="Be Fluent" width={56} height={56} className="object-contain" />
                </div>
                <div>
                  <span className="text-2xl font-black">Be Fluent</span>
                  <p className="text-sm text-gray-400">Fluency Comes First</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <Link href="/packages" className="text-gray-400 hover:text-[#10B981] transition-colors font-medium">الباقات</Link>
                <Link href="/grammar" className="text-gray-400 hover:text-[#10B981] transition-colors font-medium">القواعد</Link>
                <Link href="/listening" className="text-gray-400 hover:text-[#10B981] transition-colors font-medium">الاستماع</Link>
                <Link href="/auth/login" className="text-gray-400 hover:text-[#10B981] transition-colors font-medium">تسجيل الدخول</Link>
              </div>
              <p className="text-gray-500 text-sm">
                © 2025 Be Fluent. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </footer>

        <FloatingContactButtons />
      </main>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
