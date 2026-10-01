'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Home, Users, Calendar, BookOpen, MessageCircle, LogOut, Shield, FileText, Menu, X } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ThemeToggle from '@/components/ThemeToggle'
import ChatBox from '@/components/ChatBox'
import ConversationsList from '@/components/ConversationsList'
import HomeTab from './components/HomeTab'
import StudentsTab from './components/StudentsTab'
import SessionsTab from './components/SessionsTab'
import AssignmentsTab from './components/AssignmentsTab'
import WritingTestsTab from './components/WritingTestsTab'
import ManuscriptsTab from './components/ManuscriptsTab'

interface TeacherDashboardClientProps {
  user: {
    name: string
    email: string
    teacherProfileId?: string
  }
}

export default function TeacherDashboardClient({ user: initialUser }: TeacherDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(!initialUser.teacherProfileId)
  const [setupFailed, setSetupFailed] = useState(false)

  const setupTeacherProfile = useCallback(async () => {
    setLoading(true)
    setSetupFailed(false)
    try {
      const response = await fetch('/api/teacher/setup', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        if (typeof data?.teacherProfileId === 'string' && data.teacherProfileId) {
          setUser(current => ({ ...current, teacherProfileId: data.teacherProfileId }))
        } else {
          setSetupFailed(true)
        }
      } else {
        setSetupFailed(true)
      }
    } catch {
      setSetupFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user.teacherProfileId) {
      void setupTeacherProfile()
    }
  }, [user.teacherProfileId, setupTeacherProfile])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const menuItems = [
    { id: 'home', label: 'Home / الرئيسية', icon: Home },
    { id: 'students', label: 'Students / الطلاب', icon: Users },
    { id: 'sessions', label: 'Sessions / الحصص', icon: Calendar },
    { id: 'assignments', label: 'Assignments / الواجبات', icon: BookOpen },
    { id: 'writing-tests', label: 'Writing Tests / اختبارات الكتابة', icon: FileText },
    { id: 'manuscripts', label: 'Manuscripts / المخطوطات', icon: BookOpen },
    { id: 'chat', label: 'Chat / الدردشة', icon: MessageCircle },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#f5f7f4] text-[#26332e]" dir="rtl">
      <header className="sticky top-0 z-30 border-b border-[#e0e6e1] bg-white/95">
        <div className="mx-auto flex min-h-[68px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              aria-label="فتح القائمة"
              aria-expanded={sidebarOpen}
              className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[#e0e6e1] text-[#315f49] hover:bg-[#f2f7f2] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#247456] text-sm font-black text-white">ب</span>
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-[#26332e]">Be Fluent</p>
                <p className="mt-1 text-[10px] font-semibold text-[#718078]">مساحة المعلم</p>
              </div>
            </div>
            <Link href="/dashboard/admin" className="hidden min-h-10 items-center gap-2 rounded-lg border border-[#e0e6e1] px-3 text-xs font-bold text-[#42634f] hover:bg-[#f3f7f3] sm:flex">
              <Shield className="h-4 w-4" aria-hidden="true" />
              لوحة الإدارة
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-left sm:block">
              <span className="block text-xs font-bold text-[#26332e]">{user.name}</span>
              <span className="text-[11px] text-[#718078]">المساحة التعليمية</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="!min-h-11 !rounded-lg !border-[#dce5de] !px-3 !text-[#465a4e] hover:!bg-[#f5f8f5] sm:!px-4"
            >
              <LogOut className="h-4 w-4 sm:ml-2" aria-hidden="true" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-3 py-4 sm:px-6 sm:py-7">
        <div className="flex gap-5 lg:gap-7">
          {sidebarOpen && (
            <button
              type="button"
              aria-label="إغلاق القائمة"
              className="fixed inset-0 z-40 bg-[#172b21]/35 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside
            className={`fixed inset-y-0 right-0 z-50 w-[min(330px,88vw)] overflow-y-auto bg-white p-4 transition-transform duration-200 lg:sticky lg:top-[88px] lg:z-0 lg:h-[calc(100dvh-112px)] lg:w-[258px] lg:shrink-0 lg:translate-x-0 lg:rounded-xl lg:border lg:border-[#e0e6e1] lg:p-0 ${
              sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="flex min-h-[94px] items-center justify-between border-b border-[#e8ece8] px-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8f1e9] text-base font-extrabold text-[#286547]">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#29362f]">{user.name}</p>
                  <p className="mt-1 text-xs text-[#718078]">مدرس</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="إغلاق القائمة"
                className="grid min-h-11 min-w-11 place-items-center rounded-lg text-[#68756e] hover:bg-[#f3f6f3] lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="space-y-1 p-3" aria-label="التنقل الرئيسي للمعلم">
              <p className="px-3 pb-2 pt-3 text-[11px] font-bold text-[#849087]">مساحة العمل</p>
              {menuItems.map((item) => {
                const Icon = item.icon
                const selected = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-right text-sm transition-colors ${
                      selected
                        ? 'bg-[#edf5ef] font-bold text-[#225d41]'
                        : 'text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              <Link
                href="/dashboard/teacher/feedback"
                onClick={() => setSidebarOpen(false)}
                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-right text-sm text-[#5c6961] transition-colors hover:bg-[#f5f7f5] hover:text-[#225d41]"
              >
                <FileText className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>Feedback / ملاحظات الحصص</span>
              </Link>
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            {loading && !user.teacherProfileId ? (
              <div className="space-y-4" aria-busy="true" aria-label="جارٍ تجهيز مساحة المعلم">
                <div className="h-8 w-52 animate-pulse rounded bg-[#e6ece7]" />
                <div className="h-28 rounded-xl border border-[#e3e9e4] bg-white" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-40 rounded-xl border border-[#e3e9e4] bg-white" />
                  <div className="h-40 rounded-xl border border-[#e3e9e4] bg-white" />
                </div>
              </div>
            ) : !user.teacherProfileId && setupFailed ? (
              <section className="rounded-xl border border-[#ead9d5] bg-white p-6 sm:p-8" role="alert">
                <h1 className="text-lg font-bold text-[#26332e]">تعذر تجهيز مساحة المعلم</h1>
                <p className="mt-1 text-sm leading-6 text-[#68756e]">لم نتمكن من تجهيز ملف المعلم الآن. حاول مرة أخرى.</p>
                <button
                  type="button"
                  onClick={() => void setupTeacherProfile()}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#247456] px-4 text-sm font-bold text-white hover:bg-[#19583f]"
                >
                  إعادة المحاولة
                </button>
              </section>
            ) : (
              <>
                {activeTab === 'home' && user.teacherProfileId && <HomeTab teacherProfileId={user.teacherProfileId} setActiveTab={setActiveTab} />}
                {activeTab === 'students' && user.teacherProfileId && <StudentsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'sessions' && user.teacherProfileId && <SessionsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'assignments' && user.teacherProfileId && <AssignmentsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'writing-tests' && user.teacherProfileId && <WritingTestsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'manuscripts' && user.teacherProfileId && <ManuscriptsTab teacherProfileId={user.teacherProfileId} />}
                {activeTab === 'chat' && <ChatTab />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

type ChatContact = {
  id: string
  role: string
  name: string
  profilePhoto?: string | null
}

function ChatTab() {
  const [selectedUser, setSelectedUser] = useState<ChatContact | null>(null)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [availableContacts, setAvailableContacts] = useState<ChatContact[]>([])
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

  const handleSelectContact = (contact: ChatContact) => {
    setSelectedUser(contact)
    setShowNewChatModal(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'STUDENT': return { text: 'طالب', color: 'bg-blue-100 text-blue-700' }
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
        <div className="lg:flex-none lg:w-1/3">
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
                  <X className="h-5 w-5" />
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
                  <p className="text-sm mt-2">لا يوجد طلاب مسجلين لديك حالياً</p>
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
                        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f1e9] font-bold text-[#286547]">
                          {contact.profilePhoto ? (
                            <Image src={contact.profilePhoto} alt="" fill sizes="48px" unoptimized className="rounded-full object-cover" />
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