'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, Phone, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import AppHeader from '@/components/layout/AppHeader'
import LanguageToggle from '@/components/LanguageToggle'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: formData.emailOrPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'User not found')
      }

      setUserData(data.user)
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match / كلمات المرور غير متطابقة')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters / كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          newPassword: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed')
      }

      setStep(3)
    } catch (err: any) {
      setError(err.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
      <AppHeader variant="marketing">
        <Link
          href="/auth/login"
          className="px-4 py-2 sm:px-6 sm:py-2 rounded-lg border-2 border-[#004E89] text-[#004E89] hover:bg-[#004E89] hover:text-white transition-colors text-sm sm:text-base"
        >
          تسجيل الدخول / Login
        </Link>
      </AppHeader>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md shadow-2xl bg-[#F5F1E8] border-2 border-[#d4c9b8]">
          <div className="flex justify-between items-center mb-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <LanguageToggle />
          </div>

          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Youspeak Logo"
                width={80}
                height={80}
                className="sm:w-[80px] sm:h-[80px]"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-black">
            {step === 1 && 'نسيت كلمة المرور / Forgot Password'}
            {step === 2 && 'تعيين كلمة مرور جديدة / Reset Password'}
            {step === 3 && 'تم بنجاح / Success'}
          </h1>

          {error && (
            <Alert
              variant="error"
              dismissible
              onDismiss={() => setError('')}
              className="mb-6 mt-4"
            >
              {error}
            </Alert>
          )}

          {/* Step 1: Verify User */}
          {step === 1 && (
            <form onSubmit={handleVerify} className="space-y-4 sm:space-y-6 mt-6">
              <p className="text-gray-600 text-sm mb-4">
                أدخل بريدك الإلكتروني أو رقم هاتفك للتحقق
              </p>
              <Input
                label="Email or Phone / البريد أو الهاتف"
                type="text"
                placeholder="your@email.com or +966..."
                value={formData.emailOrPhone}
                onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                required
                leftIcon={<Mail className="h-4 w-4 sm:h-5 sm:w-5" />}
                inputSize="md"
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="font-semibold bg-[#004E89] hover:bg-[#003A6B] text-white"
              >
                {loading ? 'جاري التحقق...' : 'التحقق / Verify'}
              </Button>
            </form>
          )}

          {/* Step 2: Choose Action */}
          {step === 2 && userData && (
            <div className="space-y-4 mt-6">
              <Alert variant="info">
                <p className="text-sm">
                  تم التحقق من حسابك بنجاح
                  <br />
                  Account verified successfully
                </p>
              </Alert>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-black">اختر الإجراء:</p>
                <p className="text-xs text-gray-600 mt-1">Choose an action:</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  label="كلمة مرور جديدة / New Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  leftIcon={<Phone className="h-4 w-4 sm:h-5 sm:w-5" />}
                  inputSize="md"
                />

                <Input
                  label="تأكيد كلمة المرور / Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  leftIcon={<Phone className="h-4 w-4 sm:h-5 sm:w-5" />}
                  inputSize="md"
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  className="font-semibold bg-[#004E89] hover:bg-[#003A6B] text-white"
                >
                  {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور / Update Password'}
                </Button>
              </form>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="space-y-4 mt-6 text-center">
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-lg font-bold text-green-700 mb-2">تم بنجاح!</p>
                <p className="text-sm text-green-600">
                  تم تحديث كلمة المرور الخاصة بك بنجاح
                </p>
              </div>

              <Link href="/auth/login" className="block">
                <Button
                  fullWidth
                  size="lg"
                  className="font-semibold bg-[#004E89] hover:bg-[#003A6B] text-white"
                >
                  العودة لتسجيل الدخول / Back to Login
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <footer className="w-full py-4 sm:py-6 text-center text-sm sm:text-base text-black bg-[#F5F1E8] border-t-2 border-[#d4c9b8] mt-auto">
        <p className="px-4">Made with ❤️ by MA3K Company</p>
      </footer>
    </div>
  )
}
