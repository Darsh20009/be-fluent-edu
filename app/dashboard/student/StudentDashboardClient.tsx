'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Home, BookOpen, Calendar, MessageCircle, Trophy, Menu,
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

  const primaryMenuItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
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
    <div className="min-h-screen bg-[#1F2937] text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#10B981]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#10B981]/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6 text-[#10B981]" />
              </button>
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                  <Image src="/logo.png" alt="Be Fluent" width={38} height={38} className="relative rounded-lg shadow-lg" />
                </div>
                <h1 className="text-2xl font-[1000] tracking-tighter text-white">Be Fluent</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-[#10B981]/10 rounded-full border border-[#10B981]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                </span>
                <span className="text-xs font-black text-[#10B981] uppercase tracking-widest">{user.isActive ? 'Active' : 'Pending'}</span>
              </div>
              
              <Link href="/dashboard/student/cart" className="group relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <ShoppingCart className="h-6 w-6 text-gray-300 group-hover:text-[#10B981] transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#10B981] to-[#059669] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-[#1F2937]">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:flex border-white/10 text-white hover:bg-white/5 hover:border-[#10B981]/50 rounded-xl font-bold px-5"
              >
                <LogOut className="h-4 w-4 ml-2" />
                <span>خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 right-0 z-50 lg:z-auto
            w-80 lg:w-72 transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            bg-[#1F2937]/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none
            ${sidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100'}
          `}>
            <div className="p-6 lg:p-0 space-y-8">
              {/* Profile Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#10B981]/20 to-[#34D399]/20 rounded-3xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-[#10B981]/20 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg leading-tight tracking-tight">{user.name}</p>
                      <p className="text-xs text-[#10B981] font-black uppercase tracking-widest mt-1">طالب متميز</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Sections */}
              <nav className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-1.5 h-4 bg-[#10B981] rounded-full"></div>
                    <p className="text-[11px] font-[1000] text-gray-400 uppercase tracking-[0.2em]">الأساسية</p>
                  </div>
                  <div className="space-y-2">
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
                          className={`w-full group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                            isActiveTab 
                              ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-2xl shadow-[#10B981]/20 font-black' 
                              : item.disabled ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Icon className={`h-5 w-5 transition-transform duration-500 ${isActiveTab ? 'text-white' : 'group-hover:scale-110 group-hover:text-[#10B981]'}`} />
                            <span className="text-sm tracking-tight">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] px-2 py-0.5 rounded-lg bg-white/10 text-white font-[1000] uppercase tracking-tighter">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-1.5 h-4 bg-white/20 rounded-full"></div>
                    <p className="text-[11px] font-[1000] text-gray-400 uppercase tracking-[0.2em]">إضافات أخرى</p>
                  </div>
                  <div className="px-1">
                    <div className="relative group">
                      <select 
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white font-black focus:ring-2 focus:ring-[#10B981]/40 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all shadow-inner"
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
                        <option value="" disabled className="bg-[#1F2937] text-gray-400 font-bold">اختر صفحة أخرى...</option>
                        {extraMenuItems.map(item => (
                          <option key={item.id} value={item.id} disabled={item.disabled} className="bg-[#1F2937] text-white font-medium py-4">{item.label}</option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight className="w-4 h-4 text-gray-500 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="relative group h-full">
              <div className="absolute -inset-1 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-75 transition-all duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-2xl min-h-[700px] border border-white/10 shadow-2xl rounded-[2.5rem] p-6 sm:p-10 overflow-hidden">
                {/* Content Fade Effect */}
                <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
                  {activeTab === 'home' && <HomeTab isActive={isActive} />}
                  {activeTab === 'sessions' && <SessionsTab isActive={isActive} />}
                  {activeTab === 'mylearn' && <MyLearnTab isActive={isActive} />}
                  {activeTab === 'discover' && <DiscoverWordsTab isActive={isActive} />}
                  {activeTab === 'test' && <TestWordsTab isActive={isActive} />}
                  {activeTab === 'homework' && <HomeworkTab isActive={isActive} />}
                  {activeTab === 'packages' && <PackagesTab isActive={isActive} onCartUpdate={fetchCartCount} />}
                  {activeTab === 'chat' && isActive && <ChatTab />}
                  
                  {/* Modern Empty State */}
                  {!['home', 'sessions', 'mylearn', 'discover', 'test', 'homework', 'packages', 'chat'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                      <div className="relative group cursor-default">
                        <div className="absolute -inset-4 bg-[#10B981]/20 rounded-full blur-2xl group-hover:bg-[#10B981]/40 transition-all duration-700 animate-pulse"></div>
                        <div className="relative w-28 h-28 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-all duration-700 group-hover:scale-110">
                          <Layers className="w-14 h-14 text-[#10B981]" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-[1000] text-white mb-4 tracking-tight">قريباً في عالمنا</h3>
                      <p className="text-gray-400 max-w-sm font-medium text-lg leading-relaxed">
                        نحن نعمل على بناء هذه الميزة لتكون تجربة لا تُنسى في رحلتك مع Be Fluent.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <FloatingContactButtons />
    </div>
  )
}

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
