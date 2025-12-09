'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Home, BookOpen, Calendar, MessageCircle, Trophy, 
  CreditCard, LogOut, CheckCircle, XCircle, Bell, Sparkles, Settings, Brain, FileText, ShoppingCart, Receipt, Layers, Mic, Flame, Award, Medal, TrendingUp, Target, Bot, Video
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'
import Badge from '@/components/ui/Badge'
import FloatingContactButtons from '@/components/FloatingContactButtons'
import ChatBox from '@/components/ChatBox'
import ConversationsList from '@/components/ConversationsList'
import HomeTab from './components/HomeTab'
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

  const menuItems = [
    // 🏠 الرئيسية والملف الشخصي
    { id: 'home', label: 'Home / الرئيسية', icon: Home },
    { id: 'level-progress', label: 'Level Progress / تقدم المستوى', icon: TrendingUp, isLink: '/dashboard/student/level-progress', badge: '📊' },
    
    // 🎯 الاختبارات والتقييم
    { id: 'placement-test', label: 'Placement Test / اختبار تحديد المستوى', icon: Target, isLink: '/placement-test', badge: '🎯' },
    { id: 'test', label: 'Test Yourself / اختبر نفسك', icon: Trophy, badge: 'جديد', disabled: false },
    
    // 📚 التعلم والدروس
    { id: 'lessons', label: 'Lessons / الدروس', icon: BookOpen, isLink: '/dashboard/student/lessons', badge: 'جديد' },
    { id: 'video-learning', label: 'Video Learning / تعلم بالفيديو', icon: Video, isLink: '/dashboard/student/video-learning', badge: '🎬' },
    { id: 'grammar', label: 'Grammar Rules / قواعد اللغة', icon: Brain, isLink: '/grammar' },
    
    // 📖 المفردات والكلمات
    { id: 'vocabulary', label: 'Vocabulary / المفردات', icon: Layers, isLink: '/dashboard/student/vocabulary', badge: 'NEW' },
    { id: 'mylearn', label: 'MyLearn / كلماتي', icon: BookOpen },
    { id: 'discover', label: 'Discover Words / اكتشف الكلمات', icon: Sparkles, badge: 'جديد', disabled: false },
    
    // 🎤 المهارات التفاعلية
    { id: 'conversation', label: 'Conversation Practice / تدريب المحادثة', icon: Mic, isLink: '/dashboard/student/conversation-practice', badge: 'NEW' },
    { id: 'writings', label: 'Writing Tests / اختبارات الكتابة', icon: FileText, disabled: !hasSubscription, premium: true },
    { id: 'free-writing', label: 'Free Writing / كتابة حرة', icon: FileText, isLink: '/dashboard/student/free-writing', badge: 'NEW', disabled: !hasSubscription, premium: true },
    
    // 👨‍🏫 الحصص والواجبات (Premium)
    { id: 'sessions', label: 'Sessions / الحصص', icon: Calendar, disabled: !hasSubscription, premium: true },
    { id: 'homework', label: 'Homework / الواجبات', icon: Trophy, disabled: !hasSubscription, premium: true },
    { id: 'chat', label: 'Chat / الدردشة', icon: MessageCircle, disabled: !hasSubscription, premium: true },
    
    // 🏆 الإنجازات والتحديات
    { id: 'achievements', label: 'Achievements / الإنجازات', icon: Award, isLink: '/dashboard/student/achievements', badge: '🏆' },
    { id: 'leaderboard', label: 'Leaderboard / المتصدرين', icon: Medal, isLink: '/dashboard/student/leaderboard', badge: '🔥' },
    
    // 💳 الباقات والطلبات
    { id: 'packages', label: 'Packages / الباقات', icon: CreditCard },
    { id: 'orders', label: 'My Orders / طلباتي', icon: Receipt, isLink: '/dashboard/student/my-orders' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5DC] to-white">
      {/* Header */}
      <header className="bg-[#004E89] text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image src="/logo.png" alt="Youspeak Logo" width={40} height={40} className="rounded-lg" style={{ mixBlendMode: 'multiply' }} />
                <h1 className="text-xl sm:text-2xl font-bold">Youspeak</h1>
              </Link>
              <Badge variant={isActive ? 'success' : 'warning'} className="hidden sm:flex">
                {isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active / نشط
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Pending / قيد التفعيل
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm hidden sm:block">{user.name}</span>
              <Link href="/dashboard/student/cart">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-black border-black hover:bg-black hover:text-white text-xs sm:text-sm px-2 sm:px-2 relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-black border-black hover:bg-black hover:text-white text-xs sm:text-sm px-2 sm:px-2"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-white border-white hover:bg-white hover:text-[#004E89] text-xs sm:text-sm px-2 sm:px-4"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout / خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Warning for inactive accounts */}
      {!isActive && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="warning">
            <Bell className="h-5 w-5" />
            <div>
              <p className="font-semibold">Account Pending Activation / الحساب قيد التفعيل</p>
              <p className="text-sm mt-1">
                Your account is being reviewed. You will be contacted via WhatsApp at{' '}
                <strong>+201091515594</strong> for payment confirmation and activation.
              </p>
              <p className="text-sm mt-1">
                حسابك قيد المراجعة. سيتم التواصل معك عبر الواتساب على{' '}
                <strong>+201091515594</strong> لتأكيد الدفع والتفعيل.
              </p>
            </div>
          </Alert>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            w-64 lg:w-auto lg:flex-none
            transform lg:transform-none transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <Card variant="elevated" padding="none" className="h-full lg:h-auto max-h-screen lg:max-h-[calc(100vh-120px)] overflow-y-auto bg-[#F5F1E8] border border-[#d4c9b8]">
              <div className="p-4 border-b border-[#d4c9b8] sticky top-0 bg-[#F5F1E8] z-10">
                <div className="flex items-center justify-between lg:justify-start gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#004E89] rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">{user.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Student / طالب</p>
                    </div>
                  </div>
                  <button 
                    className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <nav className="p-2">
                {menuItems.map((item: any, index: number) => {
                  const Icon = item.icon
                  const isDisabled = item.disabled
                  const isLink = item.isLink
                  
                  // Add dividers between sections
                  const showDivider = index === 2 || index === 4 || index === 7 || index === 10 || index === 13 || index === 15 || index === 17
                  
                  const menuElement = isLink ? (
                    <Link
                      key={item.id}
                      href={isLink}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors mb-1 ${
                        isDisabled
                          ? 'text-gray-400 cursor-not-allowed pointer-events-none'
                          : 'text-[#004E89] hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-[#004E89]" />
                      <span className="text-xs sm:text-sm font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.premium ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (!isDisabled) {
                          setActiveTab(item.id)
                          setSidebarOpen(false)
                        }
                      }}
                      disabled={isDisabled}
                      className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors mb-1 ${
                        activeTab === item.id
                          ? 'bg-[#004E89] text-white font-bold'
                          : isDisabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-[#004E89] hover:bg-gray-200'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-[#004E89]'}`} />
                      <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                    </button>
                  )
                  
                  return (
                    <div key={item.id}>
                      {menuElement}
                      {showDivider && <div className="h-px bg-gray-300 my-2 mx-2" />}
                    </div>
                  )
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'home' && <HomeTab isActive={isActive} />}
            {activeTab === 'mylearn' && <MyLearnTab isActive={isActive} />}
            {activeTab === 'discover' && <DiscoverWordsTab isActive={isActive} />}
            {activeTab === 'test' && <TestWordsTab isActive={isActive} />}
            {activeTab === 'sessions' && <SessionsTab isActive={isActive} />}
            {activeTab === 'homework' && <HomeworkTab isActive={isActive} />}
            {activeTab === 'packages' && <PackagesTab isActive={isActive} onCartUpdate={fetchCartCount} />}
            {activeTab === 'chat' && isActive && <ChatTab />}
          </div>
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
      <h2 className="text-2xl sm:text-3xl font-bold text-[#004E89] mb-4 sm:mb-6">
        Chat / الدردشة
      </h2>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-250px)] sm:h-[calc(100vh-300px)]">
        <div className={`lg:flex-none lg:w-1/3 ${selectedUser && !showConversations ? 'hidden lg:block' : 'block'}`}>
          <Card variant="elevated" padding="none" className="h-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#004E89] to-[#1A5F7A] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">المحادثات</h3>
              <button
                onClick={handleNewChat}
                className="bg-white text-[#004E89] px-3 py-1 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
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
                className="mt-4 bg-[#004E89] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#003d6e] transition-colors"
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
            <div className="bg-[#004E89] text-white p-4 flex justify-between items-center">
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
                  <div className="animate-spin w-8 h-8 border-4 border-[#004E89] border-t-transparent rounded-full"></div>
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
                        <div className="w-12 h-12 bg-gradient-to-br from-[#004E89] to-[#1A5F7A] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
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
