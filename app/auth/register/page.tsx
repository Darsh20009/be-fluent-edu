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
  ChevronRight as ChevronRightIcon
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslation } from '@/lib/hooks/useTranslation'
import { PLACEMENT_TEST_QUESTIONS, calculateLevel, getLevelDescription, getTotalPossibleScore } from '@/lib/placement-test-questions'

type Step = 'name' | 'email' | 'password' | 'details' | 'placement-test' | 'result'

const STEPS: Step[] = ['name', 'email', 'password', 'details', 'placement-test', 'result']

const STEP_INFO = {
  name: { title: 'ما اسمك؟', titleEn: "What's your name?", icon: User },
  email: { title: 'ما بريدك الإلكتروني؟', titleEn: "What's your email?", icon: Mail },
  password: { title: 'أنشئ كلمة مرور', titleEn: 'Create a password', icon: Lock },
  details: { title: 'بعض التفاصيل', titleEn: 'Some details about you', icon: Target },
  'placement-test': { title: 'اختبار تحديد المستوى', titleEn: 'Placement Test', icon: BookOpen },
  result: { title: 'تهانينا!', titleEn: 'Congratulations!', icon: Trophy }
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
  })
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
      
      case 'details':
        const age = parseInt(formData.age)
        if (isNaN(age) || age < 5 || age > 100) {
          setError('الرجاء إدخال عمر صالح / Please enter a valid age')
          return false
        }
        if (!formData.goal.trim()) {
          setError('الرجاء إدخال هدفك من التعلم / Please enter your learning goal')
          return false
        }
        if (!formData.preferredTime) {
          setError('الرجاء اختيار وقت الدراسة المفضل / Please select preferred study time')
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
      setCurrentStep(STEPS[nextIndex])
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
        levelInitial: testResult?.level || 'A1',
        goal: formData.goal.trim(),
        preferredTime: formData.preferredTime,
        placementTestScore: testResult?.score,
        placementTestPercentage: testResult?.percentage,
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

      router.push('/auth/login?registered=true')
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

      case 'placement-test':
        const sectionInfo = SECTION_INFO[currentTestQuestion.type]
        const SectionIcon = sectionInfo.icon
        
        return (
          <motion.div
            key="placement-test"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">اختبار تحديد المستوى</h2>
              <p className="text-sm text-gray-600">أجب على الأسئلة لتحديد مستواك</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>السؤال {testQuestionIndex + 1} من {PLACEMENT_TEST_QUESTIONS.length}</span>
              <span>{answeredCount} إجابة من {PLACEMENT_TEST_QUESTIONS.length}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${testProgress}%` }}
              />
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${sectionInfo.color} text-white text-sm`}>
              <SectionIcon className="w-4 h-4" />
              <span>{sectionInfo.titleAr}</span>
            </div>

            {currentTestQuestion.passage && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border">
                {currentTestQuestion.passage}
              </div>
            )}

            <div className="py-3">
              <p className="font-semibold text-gray-800 mb-1">{currentTestQuestion.question}</p>
              <p className="text-sm text-gray-500 text-right">{currentTestQuestion.questionAr}</p>
            </div>

            <div className="space-y-2">
              {currentTestQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleTestAnswer(currentTestQuestion.id, option)}
                  className={`w-full p-3 rounded-xl text-right transition-all border-2 ${
                    testAnswers[currentTestQuestion.id] === option
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="inline-block w-7 h-7 bg-gray-100 rounded-full text-center leading-7 ml-2 text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handleTestPrev}
                disabled={testQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
              >
                <ChevronRightIcon className="w-4 h-4" />
                <span>السابق</span>
              </button>

              {testQuestionIndex === PLACEMENT_TEST_QUESTIONS.length - 1 ? (
                <button
                  onClick={calculateTestResult}
                  disabled={answeredCount < PLACEMENT_TEST_QUESTIONS.length}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>إنهاء الاختبار</span>
                </button>
              ) : (
                <button
                  onClick={handleTestNext}
                  className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#003A6B] transition-all"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center pt-4 border-t">
              {PLACEMENT_TEST_QUESTIONS.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setTestQuestionIndex(idx)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition-all ${
                    idx === testQuestionIndex
                      ? 'bg-purple-500 text-white'
                      : testAnswers[q.id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 'result':
        const levelDescription = testResult ? getLevelDescription(testResult.level) : null
        
        return (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                تهانينا {formData.name.split(' ')[0]}! 🎉
              </motion.h2>
              <p className="text-gray-600">لقد أكملت اختبار تحديد المستوى بنجاح</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
            >
              <p className="text-sm uppercase tracking-wider mb-2 opacity-80">مستواك في اللغة الإنجليزية</p>
              <p className="text-5xl font-bold mb-2">{testResult?.level}</p>
              <div className="flex items-center justify-center gap-4 text-sm opacity-90">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {testResult?.score} نقطة
                </span>
                <span>•</span>
                <span>{testResult?.percentage}%</span>
              </div>
            </motion.div>

            {levelDescription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-50 rounded-xl p-4 text-right"
              >
                <p className="text-gray-700 mb-1">{levelDescription.ar}</p>
                <p className="text-sm text-gray-500">{levelDescription.en}</p>
              </motion.div>
            )}

            {error && (
              <Alert variant="error" dismissible onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={handleSubmit}
                fullWidth
                size="lg"
                loading={loading}
                className="font-semibold bg-gradient-to-r from-[#10B981] to-[#0066B3] hover:from-[#003A6B] hover:to-[#10B981] text-white text-lg py-4"
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب 🚀'}
              </Button>
            </motion.div>

            <p className="text-sm text-gray-500">
              سيتم تفعيل حسابك بعد مراجعة الإدارة
            </p>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#E8DCC8] to-[#F5F1E8] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-6">
            {currentStep !== 'name' && currentStep !== 'result' && currentStep !== 'placement-test' ? (
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
              <Image src="/logo.png" alt="Youspeak" width={32} height={32} style={{ mixBlendMode: 'multiply' }} />
              <span className="font-bold text-gray-800">Youspeak</span>
            </Link>
            
            <LanguageToggle />
          </div>

          {currentStep !== 'placement-test' && currentStep !== 'result' && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>الخطوة {currentStepIndex + 1} من {STEPS.length - 1}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-gradient-to-r from-[#10B981] to-[#0066B3] h-2 rounded-full"
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

            {currentStep !== 'placement-test' && currentStep !== 'result' && (
              <div className="mt-8">
                <Button
                  onClick={handleNext}
                  fullWidth
                  size="lg"
                  className="font-semibold bg-gradient-to-r from-[#10B981] to-[#0066B3] hover:from-[#003A6B] hover:to-[#10B981] text-white"
                >
                  {currentStep === 'details' ? (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      ابدأ اختبار تحديد المستوى
                    </>
                  ) : (
                    <>
                      التالي
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </>
                  )}
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
