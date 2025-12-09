'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import AppHeader from '@/components/layout/AppHeader'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslation } from '@/lib/hooks/useTranslation'

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        redirect: false,
        rememberMe: rememberMe.toString(),
      })

      if (result?.error) {
        setError('Invalid email/phone or password / البريد الإلكتروني/رقم الهاتف أو كلمة المرور غير صحيحة')
        setLoading(false)
        return
      }

      if (!result?.ok) {
        setError('Login failed / فشل تسجيل الدخول')
        setLoading(false)
        return
      }

      // Check if embedded in iframe - check the query parameter first
      const isEmbedded = searchParams?.get('embedded') === 'true'
      
      if (isEmbedded) {
        console.log('✅ Login successful - sending message to parent iframe...')
        try {
          // Send message to parent window
          window.top?.postMessage({ type: 'LOGIN_SUCCESS' }, '*')
          console.log('Message sent to parent successfully')
        } catch (error) {
          console.error('Error sending message to parent:', error)
          // Fallback: try alternative method
          window.parent.postMessage({ type: 'LOGIN_SUCCESS' }, '*')
        }
      } else {
        // Normal redirect for non-embedded login
        console.log('✅ Login successful, Redirecting to dashboard...')
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('An error occurred during login / حدث خطأ أثناء تسجيل الدخول')
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E89]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
      <AppHeader variant="marketing">
        <Link
          href="/auth/register"
          className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg border-2 border-[#004E89] text-[#004E89] hover:bg-[#004E89] hover:text-white transition-colors text-sm sm:text-base"
        >
          {t('register')}
        </Link>
      </AppHeader>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md shadow-2xl bg-[#F5F1E8] border-2 border-[#d4c9b8]">
          <div className="flex justify-between items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <LanguageToggle />
          </div>

          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Youspeak Logo"
                width={80}
                height={80}
                className="w-14 sm:w-20 h-14 sm:h-20"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 sm:mb-3 bg-gradient-to-r from-[#004E89] to-[#0066CC] bg-clip-text text-transparent">
            {t('welcomeBack')}
          </h1>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            {t('signIn')}
          </p>

          {error && (
            <Alert
              variant="error"
              dismissible
              onDismiss={() => setError('')}
              className="mb-6"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <Input
              label="Email or Phone / البريد الإلكتروني أو الهاتف"
              type="text"
              placeholder="your@email.com or +966..."
              value={formData.emailOrPhone}
              onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
              required
              leftIcon={<Mail className="h-4 w-4 sm:h-5 sm:w-5" />}
              inputSize="md"
              disabled={loading}
            />

            <Input
              label={t('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              leftIcon={<Lock className="h-4 w-4 sm:h-5 sm:w-5" />}
              inputSize="md"
              disabled={loading}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded cursor-pointer accent-[#004E89]"
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
                Keep me logged in for 90 days / أبقني مسجلاً في الدخول لمدة 90 يوماً
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
              className="font-semibold bg-[#004E89] hover:bg-[#003A6B] text-white text-base sm:text-lg py-3 sm:py-4"
            >
              {loading ? t('loading') : t('login')}
            </Button>

            <p className="text-center text-gray-600 mt-4 text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-[#004E89] hover:text-[#003A6A] font-semibold">
                {t('register')}
              </Link>
            </p>

            <p className="text-center text-gray-600 mt-2 text-xs sm:text-sm">
              <Link href="/auth/forgot-password" className="text-[#004E89] hover:text-[#003A6A] font-semibold">
                نسيت كلمة المرور / Forgot Password?
              </Link>
            </p>
          </form>
        </Card>
      </div>

      <footer className="w-full py-4 sm:py-6 text-center text-sm sm:text-base text-black bg-[#F5F1E8] border-t-2 border-[#d4c9b8] mt-auto">
        <p className="px-4">Made with ❤️ by MA3K Company</p>
      </footer>
    </div>
  )
}
