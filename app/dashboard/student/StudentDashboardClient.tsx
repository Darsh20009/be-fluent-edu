'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Home, BookOpen, Calendar, MessageCircle, Trophy, Menu,
  CreditCard, LogOut, CheckCircle, XCircle, Bell, Sparkles, Settings, Brain, FileText, ShoppingCart, Receipt, Layers, Mic, Flame, Award, Medal, TrendingUp, Target, Bot, Video, AlertCircle
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import ChatBox from '@/components/ChatBox'
import ConversationsList from '@/components/ConversationsList'
import HomeTab from './components/HomeTab'
import CertificatesTab from './components/CertificatesTab'
import MyLearnTab from './components/MyLearnTab'
import SessionsTab from './components/SessionsTab'
import HomeworkTab from './components/HomeworkTab'
import PackagesTab from './components/PackagesTab'
import DiscoverWordsTab from './components/DiscoverWordsTab'
import TestWordsTab from './components/TestWordsTab'
import GamificationHeader from '@/components/gamification/GamificationHeader'

interface StudentDashboardClientProps {
  user: {
    name: string
    email: string
    isActive: boolean
  }
}

export default function StudentDashboardClient({ user }: StudentDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isActive = user.isActive
  const [hasSubscription, setHasSubscription] = useState(false)

  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (activeTab === 'writings' && isActive) {
      router.push('/dashboard/student/writing-tests')
    }
    
    fetchCartCount()
    checkSubscription()
  }, [activeTab, isActive, router])

  async function checkSubscription() {
    try {
      const response = await fetch('/api/student/subscription-status')
      if (response.ok) {
        const data = await response.json()
        setHasSubscription(data.hasApprovedSubscription)
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  async function fetchCartCount() {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setCartItemsCount(data.CartItem?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const primaryMenuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'certificates', label: 'شهاداتي', icon: Award },
    { id: 'sessions', label: 'الحصص المباشرة', icon: Video, disabled: !hasSubscription, premium: true },
    { id: 'lessons', label: 'الدروس التعليمية', icon: BookOpen, isLink: '/dashboard/student/lessons', badge: 'جديد' },
    { id: 'homework', label: 'الواجبات اليومية', icon: Trophy, disabled: !hasSubscription, premium: true },
  ]

  const extraMenuItems = [
    { id: 'level-progress', label: 'تقدم المستوى', icon: TrendingUp, isLink: '/dashboard/student/level-progress' },
    { id: 'vocabulary', label: 'المفردات', icon: Layers, isLink: '/dashboard/student/vocabulary' },
    { id: 'conversation', label: 'تدريب المحادثة', icon: Mic, isLink: '/dashboard/student/conversation-practice' },
    { id: 'writings', label: 'اختبارات الكتابة', icon: FileText, disabled: !hasSubscription, premium: true },
    { id: 'grammar', label: 'قواعد اللغة', icon: Brain, isLink: '/grammar' },
    { id: 'achievements', label: 'الإنجازات', icon: Award, isLink: '/dashboard/student/achievements' },
    { id: 'leaderboard', label: 'المتصدرين', icon: Medal, isLink: '/dashboard/student/leaderboard' },
    { id: 'packages', label: 'الباقات', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2937]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6 text-[#1F2937]" />
              </button>
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Be Fluent" width={38} height={38} className="rounded-lg shadow-sm" />
                <h1 className="text-2xl font-black tracking-tight text-[#1F2937]">Be Fluent</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-[#10B981]/10 rounded-full border border-[#10B981]/20">
                <span className="w-2 h-2 bg-[#10B981] rounded-full"></span>
                <span className="text-xs font-bold text-[#10B981] uppercase">{user.isActive ? 'Active' : 'Pending'}</span>
              </div>
              
              <Link href="/dashboard/student/cart" className="relative p-2 hover:bg-gray-50 rounded-xl transition-all">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#10B981] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-gray-200 text-[#1F2937] hover:bg-gray-50 rounded-xl font-bold px-5"
              >
                <LogOut className="h-4 w-4 ml-2" />
                <span>خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 right-0 z-50 lg:z-auto
            w-72 lg:w-64 transform transition-transform duration-300
            bg-white border-l border-gray-100 shadow-xl lg:shadow-none lg:bg-transparent
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-6 lg:p-0 space-y-8">
              {/* Profile Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#10B981]/20">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                        <Award className="w-3.5 h-3.5 text-[#10B981]" />
                      </div>
                    </div>
                    <div>
                      <p className="font-black text-[#1F2937] text-lg leading-tight">{user.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="success" className="text-[10px] px-2 py-0">Level 1</Badge>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">PRO STUDENT</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* XP Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-gray-400">XP Progress</span>
                      <span className="text-[#10B981]">450 / 1000</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#10B981] rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Sections */}
              <nav className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">الأساسية</p>
                  <div className="space-y-1">
                    {primaryMenuItems.map((item) => {
                      const Icon = item.icon
                      const isActiveTab = activeTab === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (!item.disabled) {
                              if (item.isLink) router.push(item.isLink)
                              else setActiveTab(item.id)
                              setSidebarOpen(false)
                            }
                          }}
                          disabled={item.disabled}
                          className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 group relative ${
                            isActiveTab 
                              ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20 font-bold' 
                              : item.disabled ? 'opacity-40 cursor-not-allowed text-gray-400' : 'text-gray-600 hover:bg-emerald-50 hover:text-[#10B981]'
                          }`}
                        >
                          {isActiveTab && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                          )}
                          <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActiveTab ? 'text-white' : 'text-gray-400 group-hover:text-[#10B981]'}`} />
                          <span className="text-sm font-bold">{item.label}</span>
                          {item.badge && (
                            <span className="mr-auto text-[10px] px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold uppercase animate-pulse">
                              {item.badge}
                            </span>
                          )}
                          {item.premium && (
                            <Sparkles className={`h-3 w-3 mr-auto ${isActiveTab ? 'text-white/70' : 'text-amber-400'}`} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">إضافات أخرى</p>
                  <div className="space-y-1">
                    {extraMenuItems.slice(0, 5).map((item) => {
                      const Icon = item.icon
                      const isActiveTab = activeTab === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (!item.disabled) {
                              if (item.isLink) router.push(item.isLink)
                              else setActiveTab(item.id)
                              setSidebarOpen(false)
                            }
                          }}
                          disabled={item.disabled}
                          className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all duration-200 group ${
                            isActiveTab 
                              ? 'bg-[#10B981]/10 text-[#10B981] font-bold' 
                              : item.disabled ? 'opacity-40 cursor-not-allowed text-gray-400' : 'text-gray-500 hover:bg-gray-50 hover:text-[#10B981]'
                          }`}
                        >
                          <Icon className={`h-4.5 w-4.5 ${isActiveTab ? 'text-[#10B981]' : 'text-gray-400 group-hover:text-[#10B981]'}`} />
                          <span className="text-sm font-bold">{item.label}</span>
                        </button>
                      )
                    })}
                    <div className="px-2 pt-2">
                      <select 
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 font-bold focus:ring-2 focus:ring-[#10B981]/20 outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-all"
                        onChange={(e) => {
                          const val = e.target.value
                          if (val) {
                            const item = extraMenuItems.find(m => m.id === val)
                            if (item?.isLink) router.push(item.isLink)
                            else setActiveTab(val)
                            setSidebarOpen(false)
                          }
                        }}
                        value={extraMenuItems.some(m => m.id === activeTab) ? activeTab : ""}
                      >
                        <option value="" disabled>المزيد من الصفحات...</option>
                        {extraMenuItems.slice(5).map(item => (
                          <option key={item.id} value={item.id} disabled={item.disabled}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {!isActive && subscription && subscription.status === 'PENDING' && (
              <Alert variant="info" className="mb-6">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5" />
                  <div>
                    <p className="font-bold">جاري مراجعة طلب اشتراكك</p>
                    <p className="text-sm">لقد استلمنا إيصال الدفع الخاص بك وجاري مراجعته من قبل الإدارة. سيتم تفعيل حسابك قريباً.</p>
                  </div>
                </div>
              </Alert>
            )}
            {!isActive && (!subscription || subscription.status !== 'PENDING') && (
              <Alert variant="warning" className="mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-bold">حسابك غير مفعل</p>
                    <p className="text-sm">يرجى اختيار باقة ورفع إيصال الدفع لتفعيل الحساب.</p>
                  </div>
                </div>
              </Alert>
            )}
            <div className="bg-white min-h-[700px] border border-gray-100 shadow-sm rounded-[2rem] p-6 sm:p-10">
              {activeTab === 'home' && <HomeTab isActive={isActive} />}
              {activeTab === 'sessions' && <SessionsTab isActive={isActive} />}
              {activeTab === 'certificates' && <CertificatesTab />}
              {activeTab === 'mylearn' && <MyLearnTab isActive={isActive} />}
              {activeTab === 'discover' && <DiscoverWordsTab isActive={isActive} />}
              {activeTab === 'test' && <TestWordsTab isActive={isActive} />}
              {activeTab === 'homework' && <HomeworkTab isActive={isActive} />}
              {activeTab === 'packages' && <PackagesTab isActive={isActive} onCartUpdate={fetchCartCount} />}
              {activeTab === 'chat' && isActive && <ChatTab />}
              
              {!['home', 'sessions', 'mylearn', 'discover', 'test', 'homework', 'packages', 'chat'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <Layers className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1F2937] mb-2">قريباً جداً</h3>
                  <p className="text-gray-500 max-w-xs font-medium">هذه الصفحة ستكون متاحة قريباً ضمن التحديثات الجديدة لـ Be Fluent.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <FloatingContactButtons />
    </div>
  )
}

function ChatTab() {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showConversations, setShowConversations] = useState(true)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [availableContacts, setAvailableContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  const fetchAvailableContacts = async () => {
    setLoadingContacts(true)
    try {
      const res = await fetch('/api/chat/available-contacts')
      if (res.ok) {
        const data = await res.json()
        setAvailableContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoadingContacts(false)
    }
  }

  const handleNewChat = () => {
    fetchAvailableContacts()
    setShowNewChatModal(true)
  }

  const handleSelectContact = (contact: any) => {
    setSelectedUser(contact)
    setShowNewChatModal(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'TEACHER': return { text: 'مدرس', color: 'bg-purple-100 text-purple-700' }
      case 'ADMIN': return { text: 'مدير', color: 'bg-red-100 text-red-700' }
      default: return { text: 'مستخدم', color: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#10B981] mb-4 sm:mb-6">
        Chat / الدردشة
      </h2>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-250px)] sm:h-[calc(100vh-300px)]">
        <div className={`lg:flex-none lg:w-1/3 ${selectedUser && !showConversations ? 'hidden lg:block' : 'block'}`}>
          <Card variant="elevated" padding="none" className="h-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">المحادثات</h3>
              <button
                onClick={handleNewChat}
                className="bg-white text-[#10B981] px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                + محادثة جديدة
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              <ConversationsList 
                onSelectConversation={setSelectedUser}
                selectedUserId={selectedUser?.id}
              />
            </div>
          </Card>
        </div>
        <div className="lg:flex-1 h-full">
          {selectedUser ? (
            <ChatBox 
              otherUser={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          ) : (
            <Card variant="elevated" className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageCircle className="w-24 h-24 mb-4" />
              <p className="text-xl font-medium">اختر محادثة للبدء</p>
              <p className="text-sm mt-2">حدد محادثة من القائمة لبدء الدردشة</p>
              <button
                onClick={handleNewChat}
                className="mt-4 bg-[#10B981] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#003d6e] transition-colors"
              >
                + ابدأ محادثة جديدة
              </button>
            </Card>
          )}
        </div>
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="bg-[#10B981] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">اختر جهة الاتصال</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
                </div>
              ) : availableContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">لا توجد جهات اتصال متاحة</p>
                  <p className="text-sm mt-2">يجب أن يكون لديك اشتراك معتمد للتواصل مع المدرسين</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableContacts.map((contact) => {
                    const badge = getRoleBadge(contact.role)
                    return (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className="w-full p-4 rounded-lg hover:bg-gray-100 transition-colors text-right border border-gray-200 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {contact.profilePhoto ? (
                            <img src={contact.profilePhoto} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            contact.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                            {badge.text}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
