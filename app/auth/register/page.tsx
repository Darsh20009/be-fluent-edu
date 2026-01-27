'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Calendar, 
  Target, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  BookOpen,
  Headphones,
  PenTool,
  Type,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  CreditCard,
  Upload
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { PLACEMENT_TEST_QUESTIONS, calculateLevel, getLevelDescription, getTotalPossibleScore } from '@/lib/placement-test-questions'

type Step = 'name' | 'email' | 'password' | 'details' | 'package' | 'payment' | 'result'

const STEPS: Step[] = ['name', 'email', 'password', 'details', 'package', 'payment', 'result']

const STEP_INFO = {
  name: { title: 'ما اسمك؟', titleEn: "What's your name?", icon: User },
  email: { title: 'ما بريدك الإلكتروني؟', titleEn: "What's your email?", icon: Mail },
  password: { title: 'أنشئ كلمة مرور', titleEn: 'Create a password', icon: Lock },
  details: { title: 'بعض التفاصيل', titleEn: 'Some details about you', icon: Target },
  package: { title: 'اختر الباقة المناسبة', titleEn: 'Choose your package', icon: CreditCard },
  payment: { title: 'الدفع', titleEn: 'Payment', icon: Upload },
  result: { title: 'تم التسجيل!', titleEn: 'Registration Complete!', icon: CheckCircle }
}

const SECTION_INFO = {
  LISTENING: { icon: Headphones, title: 'Listening', titleAr: 'الاستماع', color: 'from-blue-500 to-blue-600' },
  READING: { icon: BookOpen, title: 'Reading', titleAr: 'القراءة', color: 'from-green-500 to-green-600' },
  VOCABULARY: { icon: Type, title: 'Vocabulary', titleAr: 'المفردات', color: 'from-purple-500 to-purple-600' },
  GRAMMAR: { icon: PenTool, title: 'Grammar', titleAr: 'القواعد', color: 'from-orange-500 to-orange-600' }
}

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState<Step>('name')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    goal: '',
    preferredTime: '',
    packageId: '',
    receiptUrl: '',
  })
  const [packages, setPackages] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages')
        const data = await response.json()
        setPackages(data)
      } catch (err) {
        console.error('Failed to fetch packages:', err)
      }
    }
    fetchPackages()
  }, [])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [testQuestionIndex, setTestQuestionIndex] = useState(0)
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<{ level: string; score: number; percentage: number } | null>(null)

  const currentStepIndex = STEPS.indexOf(currentStep)
  const progress = ((currentStepIndex) / (STEPS.length - 1)) * 100

  const validateStep = (): boolean => {
    setError('')
    
    switch (currentStep) {
      case 'name':
        if (!formData.name.trim() || formData.name.trim().length < 2) {
          setError('الرجاء إدخال اسمك الكامل / Please enter your full name')
          return false
        }
        return true
      
      case 'email':
        if (!formData.email.trim() && !formData.phone.trim()) {
          setError('الرجاء إدخال البريد الإلكتروني أو رقم الهاتف / Please enter email or phone')
          return false
        }
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('البريد الإلكتروني غير صالح / Invalid email format')
          return false
        }
        if (formData.phone.trim()) {
          const phoneRegex = /^\+?[0-9]{10,15}$/
          if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            setError('رقم الهاتف غير صالح / Invalid phone number')
            return false
          }
        }
        return true
      
      case 'password':
        if (formData.password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل / Password must be at least 6 characters')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('كلمات المرور غير متطابقة / Passwords do not match')
          return false
        }
        return true
      
      case 'package':
        if (!formData.packageId) {
          setError('الرجاء اختيار باقة / Please select a package')
          return false
        }
        return true

      case 'payment':
        if (!formData.receiptUrl) {
          setError('الرجاء رفع صورة الإيصال / Please upload the receipt image')
          return false
        }
        return true
      
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep()) return
    
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      if (currentStep === 'payment') {
        handleSubmit()
      } else {
        setCurrentStep(STEPS[nextIndex])
      }
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex])
    }
  }

  const handleTestAnswer = (questionId: string, answer: string) => {
    setTestAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleTestNext = () => {
    if (testQuestionIndex < PLACEMENT_TEST_QUESTIONS.length - 1) {
      setTestQuestionIndex(testQuestionIndex + 1)
    }
  }

  const handleTestPrev = () => {
    if (testQuestionIndex > 0) {
      setTestQuestionIndex(testQuestionIndex - 1)
    }
  }

  const calculateTestResult = () => {
    let score = 0
    const totalPossible = getTotalPossibleScore()
    
    PLACEMENT_TEST_QUESTIONS.forEach(q => {
      if (testAnswers[q.id] === q.correctAnswer) {
        score += q.points
      }
    })
    
    const percentage = Math.round((score / totalPossible) * 100)
    const level = calculateLevel(score, totalPossible)
    
    setTestResult({ level, score, percentage })
    setCurrentStep('result')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase() || undefined,
        password: formData.password,
        phone: formData.phone.replace(/\s/g, '') || undefined,
        age: parseInt(formData.age),
        goal: formData.goal.trim(),
        preferredTime: formData.preferredTime,
        packageId: formData.packageId,
        receiptUrl: formData.receiptUrl,
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setCurrentStep('result')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentTestQuestion = PLACEMENT_TEST_QUESTIONS[testQuestionIndex]
  const testProgress = ((testQuestionIndex + 1) / PLACEMENT_TEST_QUESTIONS.length) * 100
  const answeredCount = Object.keys(testAnswers).length

  const renderStepContent = () => {
    switch (currentStep) {
      case 'name':
        return (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
              >
                <User className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">مرحباً بك! 👋</h2>
              <p className="text-gray-600">لنبدأ بالتعرف عليك</p>
            </div>
            
            <Input
              type="text"
              label="الاسم الكامل / Full Name"
              placeholder="أدخل اسمك الكامل"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              leftIcon={<User className="h-5 w-5" />}
              inputSize="lg"
              autoFocus
            />
          </motion.div>
        )

      case 'email':
        return (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center"
              >
                <Mail className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">أهلاً {formData.name.split(' ')[0]}! ✨</h2>
              <p className="text-gray-600">كيف يمكننا التواصل معك؟</p>
            </div>
            
            <Input
              type="email"
              label="البريد الإلكتروني / Email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="h-5 w-5" />}
              inputSize="lg"
              hint="اختياري إذا أدخلت رقم الهاتف"
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">أو / or</span>
              </div>
            </div>
            
            <Input
              type="tel"
              label="رقم الواتساب / WhatsApp"
              placeholder="+20... or +966..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={<Phone className="h-5 w-5" />}
              inputSize="lg"
              hint="اختياري إذا أدخلت البريد الإلكتروني"
            />
          </motion.div>
        )

      case 'password':
        return (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">حماية حسابك 🔐</h2>
              <p className="text-gray-600">أنشئ كلمة مرور قوية</p>
            </div>
            
            <Input
              type="password"
              label="كلمة المرور / Password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock className="h-5 w-5" />}
              inputSize="lg"
              hint="6 أحرف على الأقل"
            />
            
            <Input
              type="password"
              label="تأكيد كلمة المرور / Confirm Password"
              placeholder="••••••••"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              leftIcon={<Lock className="h-5 w-5" />}
              inputSize="lg"
            />
          </motion.div>
        )

      case 'details':
        return (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center"
              >
                <Target className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">أخبرنا المزيد عنك 📝</h2>
              <p className="text-gray-600">لتخصيص تجربة التعلم</p>
            </div>
            
            <Input
              type="number"
              label="العمر / Age"
              placeholder="18"
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              leftIcon={<Calendar className="h-5 w-5" />}
              inputSize="md"
              min="5"
              max="100"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                هدفك من تعلم الإنجليزية / Your Goal *
              </label>
              <textarea
                required
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="مثال: أريد تحسين محادثتي للعمل..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وقت الدراسة المفضل / Preferred Time *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'morning', label: 'صباحاً', emoji: '🌅' },
                  { value: 'afternoon', label: 'ظهراً', emoji: '☀️' },
                  { value: 'evening', label: 'مساءً', emoji: '🌆' },
                  { value: 'flexible', label: 'مرن', emoji: '🔄' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredTime: option.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.preferredTime === option.value
                        ? 'border-[#10B981] bg-blue-50 text-[#10B981]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{option.emoji}</span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )

      case 'package':
        return (
          <motion.div
            key="package"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">اختر باقتك 💎</h2>
              <p className="text-gray-600">اختر الخطة المناسبة لاحتياجاتك</p>
            </div>
            <div className="grid gap-4">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, packageId: pkg.id })}
                  className={`p-4 rounded-xl border-2 text-right transition-all flex justify-between items-center ${
                    formData.packageId === pkg.id
                      ? 'border-[#10B981] bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left font-bold text-emerald-600">
                    {pkg.price} EGP
                  </div>
                  <div>
                    <div className="font-bold">{pkg.titleAr}</div>
                    <div className="text-xs text-gray-500">{pkg.lessonsCount} درس</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 'payment':
        return (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">الدفع 💳</h2>
              <p className="text-gray-600">حول المبلغ إلى الرقم التالي: <span className="font-bold text-emerald-600">+20 10 91515594</span></p>
              <div className="flex justify-center gap-4 mt-4">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Vodafone Cash</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Etisalat Cash</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">InstaPay</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-sm">
              <p className="text-emerald-800 text-center">بمجرد التحويل، يرجى رفع صورة إيصال الدفع للتفعيل</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">إيصال الدفع / Payment Receipt</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-emerald-500 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setUploading(true)
                    try {
                      // Mock upload for now or implement real upload
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setFormData({ ...formData, receiptUrl: reader.result as string })
                        setUploading(false)
                      }
                      reader.readAsDataURL(file)
                    } catch (err) {
                      setError('فشل رفع الملف / Upload failed')
                      setUploading(false)
                    }
                  }}
                />
                {formData.receiptUrl ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <p className="text-emerald-600 font-medium">تم اختيار الملف</p>
                    <p className="text-xs text-gray-500 mt-1">انقر للتغيير</p>
                  </div>
                ) : (
                  <div className="text-center">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">انقر لرفع الإيصال</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {loading && (
              <div className="text-center text-sm text-emerald-600 animate-pulse">
                جاري معالجة الطلب...
              </div>
            )}
          </motion.div>
        )

      case 'result':
        return (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">تم التسجيل بنجاح!</h2>
            <p className="text-gray-600 max-w-sm mx-auto">
              شكراً لتسجيلك. يتم الآن مراجعة إيصال الدفع من قبل الإدارة. سنقوم بتفعيل حسابك خلال 24 ساعة.
            </p>
            <Link href="/auth/login" className="block w-full">
              <Button variant="primary" size="lg" fullWidth>
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-[#F3F4F6] to-[#F9FAFB] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            {currentStep !== 'name' && currentStep !== 'result' ? (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <Link href="/" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
            )}
            
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="Be Fluent" width={32} height={32} style={{ mixBlendMode: 'multiply' }} />
              <span className="font-bold text-gray-800">Be Fluent</span>
            </Link>
            
            <LanguageToggle />
          </div>

          {currentStep !== 'result' && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>الخطوة {currentStepIndex + 1} من {STEPS.length - 1}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-gradient-to-r from-[#10B981] to-[#059669] h-2 rounded-full"
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
            {error && currentStep !== 'result' && (
              <Alert
                variant="error"
                dismissible
                onDismiss={() => setError('')}
                className="mb-6"
              >
                {error}
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {currentStep !== 'result' && (
              <div className="mt-8">
                <Button
                  onClick={handleNext}
                  fullWidth
                  size="lg"
                  className="font-semibold bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#003A6B] hover:to-[#10B981] text-white"
                >
                  التالي
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-gray-600 text-sm">
            لديك حساب بالفعل؟{' '}
            <Link href="/auth/login" className="text-[#10B981] hover:text-[#003A6B] font-semibold">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>

      <footer className="py-4 text-center text-sm text-gray-600">
        <p>Made with ❤️ by MA3K Company</p>
      </footer>
    </div>
  )
}
