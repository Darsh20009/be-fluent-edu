'use client'

import { useState } from 'react'
import { Mail, Phone, Send, MessageCircle, Loader2, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { toast } from 'react-hot-toast'
import { MarketingFrame } from '@/components/marketing/MarketingFrame'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

export default function ContactPage() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        toast.success(t('تم إرسال رسالتك بنجاح! سنرد عليك قريباً.', 'Your message was sent successfully. We will reply soon.'))
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error(data.error || t('فشل إرسال الرسالة', 'Failed to send message'))
      }
    } catch {
      toast.error(t('حدث خطأ في الإرسال، يرجى المحاولة مرة أخرى', 'A sending error occurred. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MarketingFrame>
      <main dir={language === 'ar' ? 'rtl' : 'ltr'} className="mx-auto max-w-[1130px] px-5 py-14 sm:py-16">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold tracking-[.2em] text-[#147050]">{t('تواصل معنا', 'CONTACT')}</p>
          <h1 className="mt-3 text-3xl font-extrabold text-[#1e2b29] md:text-4xl">{t('تواصل معنا', 'Contact us')}</h1>
          <p className="mt-3 text-sm text-[#68756f]">
            {t('نحن هنا لمساعدتك في رحلة تعلم اللغة الإنجليزية', 'We are here to help you on your English-learning journey.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card variant="elevated" className="border border-[#dbe3dc] bg-[#fffefa] p-6 shadow-none">
              <h2 className="mb-6 border-b border-[#dfe5dd] pb-3 text-xl font-bold text-[#1e2b29]">{t('معلومات التواصل', 'Contact information')}</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#edf6ef] text-[#147050]">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e2b29]">{t('البريد الإلكتروني', 'Email')}</h3>
                    <a href="mailto:support@befluent-edu.online" className="text-[#68756f] hover:text-[#147050] transition-colors">
                      support@befluent-edu.online
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#edf6ef] text-[#147050]">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e2b29]">{t('الهاتف', 'Phone')}</h3>
                    <p className="text-[#68756f]" dir="ltr">+20 109 151 5594</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#edf6ef] text-[#147050]">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t('واتساب', 'WhatsApp')}</h3>
                    <a
                      href="https://wa.me/201091515594"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#147050] hover:underline"
                    >
                      {t('تحدث معنا الآن', 'Chat with us now')}
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="border border-[#bfd9ca] bg-[#edf6ef] p-6 shadow-none">
              <h3 className="mb-2 font-bold text-[#1e2b29]">{t('أوقات الدعم', 'Support hours')}</h3>
              <p className="text-sm leading-relaxed text-[#53615c]">
                {t('فريق الدعم متاح من الأحد إلى الجمعة، من الساعة 9 صباحاً حتى 10 مساءً بتوقيت القاهرة. سنرد على استفسارك خلال 24 ساعة.', 'Our support team is available Sunday through Friday, 9 a.m. to 10 p.m. Cairo time. We will respond within 24 hours.')}
              </p>
            </Card>
          </div>

          {/* Contact Form */}
          <Card variant="elevated" className="border border-[#dbe3dc] bg-[#fffefa] p-6 shadow-none sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center bg-[#edf6ef]">
                  <CheckCircle className="h-8 w-8 text-[#147050]" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-[#1e2b29]">{t('تم إرسال رسالتك!', 'Your message has been sent!')}</h3>
                <p className="mb-6 text-[#68756f]">{t('شكراً لتواصلك، سنرد عليك قريباً على بريدك الإلكتروني.', 'Thanks for getting in touch. We will reply to your email soon.')}</p>
                <button
                  onClick={() => setSent(false)}
                  className="font-medium text-[#147050] hover:underline"
                >
                  {t('إرسال رسالة أخرى', 'Send another message')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="mb-4 text-xl font-bold text-[#1e2b29]">{t('أرسل لنا رسالة', 'Send us a message')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('الاسم', 'Name')} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder={t('اسمك الكامل', 'Your full name')}
                      className="w-full border border-[#cfd8d1] bg-[#fffefa] px-4 py-3 outline-none transition focus:border-[#147050]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('البريد الإلكتروني', 'Email')} <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      dir="ltr"
                      className="w-full border border-[#cfd8d1] bg-[#fffefa] px-4 py-3 outline-none transition focus:border-[#147050]"
                    />
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('الموضوع', 'Subject')} <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder={t('موضوع رسالتك', 'Message subject')}
                     className="w-full border border-[#cfd8d1] bg-[#fffefa] px-4 py-3 outline-none transition focus:border-[#147050]"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('الرسالة', 'Message')} <span className="text-red-500">*</span></label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    placeholder={t('اكتب رسالتك هنا...', 'Write your message here...')}
                     className="w-full resize-none border border-[#cfd8d1] bg-[#fffefa] px-4 py-3 outline-none transition focus:border-[#147050]"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full rounded-none bg-[#147050] hover:bg-[#0e5940]" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('جاري الإرسال...', 'Sending...')}</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> {t('إرسال الرسالة', 'Send message')}</>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
    </MarketingFrame>
  )
}
