'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import AppHeader from '@/components/layout/AppHeader'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslation } from '@/lib/hooks/useTranslation'
import BrandLockup from '@/components/brand/BrandLockup'

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
      <div className="min-h-[100dvh] bg-[#f4f6f0] flex flex-col items-center justify-center">
        <div className="h-12 w-48 animate-pulse border border-[#cfd8d1] bg-[#fffefa]"></div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-[100dvh] bg-[#f4f6f0] flex flex-col">
      <AppHeader variant="marketing">
        <Link
          href="/auth/register"
          className="border border-[#147050] px-4 py-2 text-[11px] font-bold text-[#147050] hover:bg-[#147050] hover:text-white transition-colors"
        >
          {t('register')}
        </Link>
      </AppHeader>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md border border-[#dbe3dc] bg-[#fffefa] p-6 shadow-none sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <LanguageToggle />
          </div>

          <div className="mb-6 flex justify-center sm:mb-8">
            <BrandLockup size="md" />
          </div>

            <h1 className="mb-2 text-center text-2xl font-bold text-[#1e2b29] sm:text-3xl">
            {t('welcomeBack')}
          </h1>
            <p className="mb-6 text-center text-sm text-[#68756f] sm:mb-8">
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
              autoComplete="current-password"
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
                className="w-5 h-5 rounded cursor-pointer accent-[#10B981]"
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
               className="bg-[#147050] py-3 text-base font-semibold text-white hover:bg-[#0e5940] sm:py-4"
            >
              {loading ? t('loading') : t('login')}
            </Button>

            <p className="text-center text-gray-600 mt-4 text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-[#147050] hover:text-[#0e5940]">
                {t('register')}
              </Link>
            </p>

            <p className="text-center text-gray-600 mt-2 text-xs sm:text-sm">
              <Link href="/auth/forgot-password" className="font-semibold text-[#147050] hover:text-[#0e5940]">
                نسيت كلمة المرور / Forgot Password?
              </Link>
            </p>
          </form>
        </Card>
      </div>

      <footer className="mt-auto w-full border-t border-[#dfe5dd] bg-[#fdfcf8] py-4 text-center text-[10px] text-[#68756f]">
        <p className="px-4">Be Fluent Academy</p>
      </footer>
    </div>
  )
}
