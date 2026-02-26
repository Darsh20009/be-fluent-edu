'use client'

import { useState } from 'react'
import { Mail, Phone, Send, MessageCircle, Loader2, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { toast } from 'react-hot-toast'

export default function ContactPage() {
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
        toast.success('تم إرسال رسالتك بنجاح! سنرد عليك قريباً.')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error(data.error || 'فشل إرسال الرسالة')
      }
    } catch {
      toast.error('حدث خطأ في الإرسال، يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5DC] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#10B981] mb-4">
            تواصل معنا / Contact Us
          </h1>
          <p className="text-lg text-gray-600">
            نحن هنا لمساعدتك في رحلة تعلم اللغة الإنجليزية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card variant="elevated" className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">معلومات التواصل</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">البريد الإلكتروني</h3>
                    <a href="mailto:support@befluent-edu.online" className="text-gray-600 hover:text-[#10B981] transition-colors">
                      support@befluent-edu.online
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">الهاتف</h3>
                    <p className="text-gray-600" dir="ltr">+20 109 151 5594</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] shrink-0">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">واتساب</h3>
                    <a
                      href="https://wa.me/201091515594"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#10B981] hover:underline font-medium"
                    >
                      تحدث معنا الآن
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="p-6 bg-gradient-to-br from-[#10B981]/5 to-[#059669]/10">
              <h3 className="font-bold text-gray-800 mb-2">أوقات الدعم</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                فريق الدعم متاح من الأحد إلى الجمعة، من الساعة 9 صباحاً حتى 10 مساءً بتوقيت القاهرة. سنرد على استفسارك خلال 24 ساعة.
              </p>
            </Card>
          </div>

          {/* Contact Form */}
          <Card variant="elevated" className="p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-[#10B981]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">تم إرسال رسالتك!</h3>
                <p className="text-gray-500 mb-6">شكراً لتواصلك، سنرد عليك قريباً على بريدك الإلكتروني.</p>
                <button
                  onClick={() => setSent(false)}
                  className="text-[#10B981] font-medium hover:underline"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-gray-800 mb-4">أرسل لنا رسالة</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="اسمك الكامل"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      dir="ltr"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    placeholder="موضوع رسالتك"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة <span className="text-red-500">*</span></label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent outline-none transition resize-none"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري الإرسال...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> إرسال الرسالة</>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
