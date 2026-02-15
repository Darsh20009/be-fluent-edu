'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import FloatingContactButtons from "@/components/FloatingContactButtons";
import CouponBanner from "@/components/CouponBanner";
import LatestCouponPopup from "@/components/LatestCouponPopup";
import { BookOpen, Users, Globe, Sparkles, MessageCircle, Target, ArrowRight, Star, Zap, ChevronLeft, ChevronRight, GraduationCap, Menu, X, ArrowDown, Map as MapIcon, Tag } from "lucide-react";

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
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    fetch('/api/coupons/active')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setActiveCoupons(data);
      })
      .catch(err => console.error('Failed to fetch coupons:', err));

    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSiteSettings(data);
      })
      .catch(err => console.error('Failed to fetch settings:', err));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalSlides = heroImages.length + activeCoupons.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying || totalSlides === 0) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, totalSlides]);

  return (
    <div className="min-h-screen bg-white text-[#1F2937] overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#10B981]/8 via-emerald-100/20 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/10 via-teal-50/30 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4"></div>
      </div>

      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrollY > 20 ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-emerald-500/5 py-2" : "bg-transparent py-4 md:py-6"
      )}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group relative z-10">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden shadow-md transform group-hover:scale-105 transition-all">
                <Image src="/logo.png" alt="Be Fluent" fill className="object-contain" sizes="48px" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-2xl font-black tracking-tight leading-none text-[#1F2937]">Be Fluent</span>
                <span className="text-[9px] md:text-[10px] text-[#10B981] font-bold tracking-[0.2em] uppercase">Fluency Comes First</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center bg-gray-100/50 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-gray-200/50">
              {[
                { label: "الرئيسية", href: "/" },
                { label: "باقاتنا", href: "/packages" },
                { label: "القواعد", href: "/grammar" },
                { label: "اعرف طريقك", href: "/about-path" },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="px-5 py-2 text-sm font-bold text-gray-700 hover:text-[#10B981] transition-all rounded-xl hover:bg-white">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-[#10B981] transition-colors rounded-xl">تسجيل الدخول</Link>
              <Link href="/auth/register" className="px-6 py-2.5 text-sm font-bold rounded-xl bg-[#10B981] text-white shadow-lg hover:bg-[#059669] transition-all">انضم إلينا</Link>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 rounded-xl bg-gray-100 text-[#1F2937] relative z-50">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative min-h-screen flex items-center pt-20 pb-16 lg:pt-0 lg:pb-0 overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className={`lg:w-1/2 text-center lg:text-right order-2 lg:order-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} dir="rtl">
                <div className="inline-flex items-center gap-2 bg-[#10B981]/15 px-5 py-2.5 rounded-full mb-6 border border-[#10B981]/20">
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm font-bold text-[#047857]">مستقبلك يبدأ هنا</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-[#1F2937] mb-6 leading-[1.1]">
                  {siteSettings?.heroTitleAr || 'تعلم'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-teal-500">{siteSettings?.heroTitleAr ? '' : 'الإنجليزية'}</span>
                  <br />
                  <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-600">{siteSettings?.heroSubtitleAr || 'بأسلوب احترافي ومبتكر'}</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 font-medium">
                  {siteSettings?.heroSubtitleAr || 'Be Fluent هي المنصة المتكاملة لتعلم اللغة الإنجليزية بأساليب حديثة تفاعلية مع معلمين محترفين ومجتمع داعم'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                  <Link href="/auth/register" className="px-8 py-4 bg-[#10B981] text-white rounded-2xl text-lg font-bold shadow-xl hover:bg-[#059669] transition-all flex items-center justify-center gap-3">
                    <span>ابدأ رحلتك الآن</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a href={`https://api.whatsapp.com/send/?phone=${siteSettings?.whatsappNumber || '201091515594'}`} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white border-2 border-gray-200 text-[#1F2937] rounded-2xl text-lg font-bold hover:border-[#10B981] transition-all flex items-center justify-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#10B981]" />
                    <span>تواصل معنا</span>
                  </a>
                </div>
              </div>

              <div className={`lg:w-1/2 order-1 lg:order-2 w-full max-w-2xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-white">
                  {heroImages.map((image, index) => (
                    <div key={index} className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                      <Image src={image.src} alt={image.alt} fill className="object-contain" />
                    </div>
                  ))}
                  {activeCoupons.map((coupon, index) => (
                    <div key={coupon.id} className={`absolute inset-0 transition-opacity duration-700 bg-[#10B981] text-white flex flex-col items-center justify-center p-8 text-center ${heroImages.length + index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                      <Tag className="w-12 h-12 mb-4" />
                      <h3 className="text-2xl font-black mb-4">خصم {coupon.discount}%</h3>
                      <div className="bg-white text-[#10B981] px-6 py-2 rounded-xl text-2xl font-black mb-4">{coupon.code}</div>
                      <Link href="/auth/register" className="px-6 py-2 bg-white text-[#10B981] rounded-lg font-bold">اشترك الآن</Link>
                    </div>
                  ))}
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                      <button key={i} onClick={() => goToSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-b from-white to-emerald-50/30 overflow-hidden" id="learning-path">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2" dir="rtl">
                <div className="inline-flex items-center gap-2 bg-[#10B981]/10 px-4 py-2 rounded-full mb-6 border border-[#10B981]/20">
                  <MapIcon className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm font-bold text-[#047857]">رحلتك تبدأ بخطوة</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8 leading-tight">خطة التعلم والنجاح</h2>
                <div className="space-y-8">
                  {(() => {
                    try {
                      const path = JSON.parse(siteSettings?.learningPath || '[]');
                      if (path.length > 0) {
                        return path.map((item: any, i: number) => (
                          <div key={i} className="flex gap-4 group">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-all">
                              <Target className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 mb-1">{item.title}</h3>
                              <p className="text-gray-600">{item.desc}</p>
                            </div>
                          </div>
                        ));
                      }
                    } catch (e) {}
                    return null;
                  })()}
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-black text-gray-900 mb-8 text-center" dir="rtl">لماذا نحن؟</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
                    {(() => {
                      try {
                        const why = JSON.parse(siteSettings?.whyUs || '[]');
                        return why.map((item: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <h4 className="font-bold text-[#10B981] mb-1">{item.title}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                          </div>
                        ));
                      } catch (e) { return null; }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FloatingContactButtons whatsappNumber={siteSettings?.whatsappNumber} />
      <CouponBanner />
      <LatestCouponPopup />
    </div>
  );
}
